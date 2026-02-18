import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { FormattedMessage, type Message } from './formatted-message'

interface LogsSectionProps {
  sessionKey: string
}

interface TranscriptPreviewResult {
  messages: Message[]
  error?: string
  path: string
  missingSubagentTranscript?: boolean
}

async function readTranscriptMessages(transcriptPath: string, limit: number = 50): Promise<Message[]> {
  const content = await fs.readFile(transcriptPath, 'utf-8')
  const allLines = content.split('\n').filter(line => line.trim())
  const recentLines = allLines.slice(-limit)
  
  const messages: Message[] = []
  for (const line of recentLines) {
    try {
      const parsed = JSON.parse(line)
      
      // OpenClaw transcript format: {type: "message", message: {role, content, ...}}
      if (parsed.type === 'message' && parsed.message) {
        messages.push(parsed.message as Message)
      }
      // Fallback: if line already has role field (legacy format)
      else if (parsed.role) {
        messages.push(parsed as Message)
      }
    } catch (error) {
      // Skip invalid JSON lines
      console.error('Failed to parse transcript line:', error)
    }
  }
  
  return messages
}

function toDisplayPath(filePath: string, homeDir: string): string {
  if (!filePath.startsWith(homeDir)) {
    return filePath
  }

  return `~${filePath.slice(homeDir.length)}`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findArchivedTranscriptPath(sessionsDir: string, sessionId: string): Promise<string | null> {
  try {
    const files = await fs.readdir(sessionsDir)
    const archivePattern = new RegExp(`\\.deleted\\.${escapeRegExp(sessionId)}\\.jsonl$`)
    const archivedFiles = files
      .filter(file => archivePattern.test(file))
      .sort((left, right) => right.localeCompare(left))

    if (archivedFiles.length === 0) {
      return null
    }

    return path.join(sessionsDir, archivedFiles[0])
  } catch {
    return null
  }
}

async function fetchSessionId(sessionKey: string): Promise<string | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/sessions/${encodeURIComponent(sessionKey)}`, {
      cache: 'no-store',
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.sessionId || null
  } catch {
    return null
  }
}

async function readTranscriptPreview(sessionKey: string): Promise<TranscriptPreviewResult> {
  const homeDir = os.homedir()
  const isSubagentSession = sessionKey.includes('subagent:')
  
  // Parse sessionKey to extract agent type and sessionId
  // Format: agent:{agent-type}:subagent:{sessionId}
  // Example: agent:bmad-bmm-amelia:subagent:abc123
  let transcriptPath: string
  let transcriptPathDisplay: string
  let sessionsDir: string
  let archiveSessionId: string
  
  const subagentMatch = sessionKey.match(/^agent:([^:]+):subagent:(.+)$/)
  if (subagentMatch) {
    const agentType = subagentMatch[1]
    const subagentKeyId = subagentMatch[2]
    sessionsDir = path.join(homeDir, '.openclaw', 'agents', agentType, 'sessions')
    
    // The UUID in the session key is NOT the transcript filename.
    // Look up the real sessionId from the agent's sessions.json.
    let realSessionId = subagentKeyId // fallback
    try {
      const sessionsJsonPath = path.join(sessionsDir, 'sessions.json')
      const sessionsData = JSON.parse(await fs.readFile(sessionsJsonPath, 'utf-8'))
      const entry = sessionsData[sessionKey]
      if (entry?.sessionId) {
        realSessionId = entry.sessionId
      }
    } catch {
      // sessions.json not found or parse error — fall back to key UUID
    }
    
    transcriptPathDisplay = `~/.openclaw/agents/${agentType}/sessions/${realSessionId}.jsonl`
    transcriptPath = path.join(sessionsDir, `${realSessionId}.jsonl`)
    archiveSessionId = realSessionId
  } else if (sessionKey.startsWith('agent:')) {
    // Handle other agent sessions (like project-lead)
    // Format: agent:{agent-type}:{project-id}
    // Example: agent:project-lead:project-kelly-dashboard
    const parts = sessionKey.split(':')
    const agentType = parts[1] // e.g., "project-lead"
    
    // Fetch sessionId from the gateway via API
    const sessionId = await fetchSessionId(sessionKey)
    
    if (sessionId) {
      sessionsDir = path.join(homeDir, '.openclaw', 'agents', agentType, 'sessions')
      transcriptPathDisplay = `~/.openclaw/agents/${agentType}/sessions/${sessionId}.jsonl`
      transcriptPath = path.join(sessionsDir, `${sessionId}.jsonl`)
      archiveSessionId = sessionId
    } else {
      // Fallback if we can't fetch sessionId
      sessionsDir = path.join(homeDir, '.openclaw', 'sessions', sessionKey)
      transcriptPathDisplay = `~/.openclaw/sessions/${sessionKey}/transcript.jsonl`
      transcriptPath = path.join(sessionsDir, 'transcript.jsonl')
      archiveSessionId = sessionKey
    }
  } else {
    // Fallback for other session key formats
    sessionsDir = path.join(homeDir, '.openclaw', 'sessions', sessionKey)
    transcriptPathDisplay = `~/.openclaw/sessions/${sessionKey}/transcript.jsonl`
    transcriptPath = path.join(sessionsDir, 'transcript.jsonl')
    archiveSessionId = sessionKey
  }

  try {
    const messages = await readTranscriptMessages(transcriptPath)

    return {
      messages,
      path: transcriptPathDisplay,
    }
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException)?.code
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Distinguish between different error types
    if (errorCode === 'ENOENT') {
      const archivedTranscriptPath = await findArchivedTranscriptPath(sessionsDir, archiveSessionId)
      if (archivedTranscriptPath) {
        try {
          const archivedMessages = await readTranscriptMessages(archivedTranscriptPath)
          return {
            messages: archivedMessages,
            path: toDisplayPath(archivedTranscriptPath, homeDir),
          }
        } catch {
          // Fall through to standard ENOENT handling below.
        }
      }

      if (isSubagentSession) {
        return {
          messages: [],
          missingSubagentTranscript: true,
          path: transcriptPathDisplay,
        }
      }

      return {
        messages: [],
        error: 'Transcript file not found',
        path: transcriptPathDisplay,
      }
    } else if (errorCode === 'EACCES') {
      return {
        messages: [],
        error: 'Permission denied reading transcript',
        path: transcriptPathDisplay,
      }
    } else {
      return {
        messages: [],
        error: `Error reading transcript: ${errorMessage}`,
        path: transcriptPathDisplay,
      }
    }
  }
}

export async function LogsSection({ sessionKey }: LogsSectionProps) {
  const {
    messages,
    error,
    path: transcriptPath,
    missingSubagentTranscript,
  } = await readTranscriptPreview(sessionKey)

  // Debug logging (server-side, visible in Next.js logs)
  console.log(`[LogsSection] SessionKey: ${sessionKey}`)
  console.log(`[LogsSection] Messages count: ${messages.length}`)
  console.log(`[LogsSection] Error: ${error || 'none'}`)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-lg">Session Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transcript Path */}
        <div>
          <div className="text-xs font-mono text-terminal-dim mb-1">Transcript Location</div>
          <div className="text-xs font-mono text-terminal-text break-all bg-terminal-card p-2 rounded border border-terminal-border">
            {transcriptPath}
          </div>
        </div>

        {/* Preview or Error */}
        <div>
          <div className="text-xs font-mono text-terminal-dim mb-1 flex items-center justify-between">
            <span>Preview (last 50 messages)</span>
            {!error && !missingSubagentTranscript && messages.length > 0 && (
              <span className="text-terminal-dim text-xs">
                💡 Full transcript available at path above
              </span>
            )}
          </div>

          {error ? (
            <div className="text-sm font-mono text-terminal-dim bg-terminal-card p-4 rounded border border-terminal-border">
              ⚠️ {error}
            </div>
          ) : missingSubagentTranscript ? (
            <div className="text-sm font-mono text-terminal-text bg-black p-4 rounded border border-terminal-border space-y-2">
              <div className="text-terminal-green">
                📝 Subagent transcripts are managed by the parent Project Lead session.
              </div>
              <div className="text-terminal-dim">To view this subagent&apos;s activity:</div>
              <ul className="list-disc pl-6 space-y-1">
                <li>View the Project Lead session for this project</li>
                <li>Or check project artifacts/commits for work output</li>
              </ul>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-sm font-mono text-terminal-dim bg-terminal-card p-4 rounded border border-terminal-border">
              No transcript entries found (session may not have started yet)
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto bg-black p-4 rounded border border-terminal-border space-y-2">
              {messages.map((message, idx) => (
                <div key={idx}>
                  <FormattedMessage message={message} />
                  {/* Fallback: show raw JSON if FormattedMessage returns nothing */}
                  <noscript>
                    <pre className="text-xs font-mono text-terminal-dim whitespace-pre-wrap break-words p-2 bg-terminal-card rounded">
                      {JSON.stringify(message, null, 2)}
                    </pre>
                  </noscript>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hint */}
        {!error && !missingSubagentTranscript && messages.length > 0 && (
          <div className="text-xs font-mono text-terminal-dim pt-2 border-t border-terminal-border">
            💡 Tip: Use <code className="bg-terminal-card px-1 py-0.5 rounded">tail -f {transcriptPath}</code> to follow logs in real-time
          </div>
        )}
      </CardContent>
    </Card>
  )
}
