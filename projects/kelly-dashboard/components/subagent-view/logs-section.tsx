import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

interface LogsSectionProps {
  sessionKey: string
}

interface TranscriptPreviewResult {
  lines: string[]
  error?: string
  path: string
  missingSubagentTranscript?: boolean
}

async function readTranscriptLines(transcriptPath: string): Promise<string[]> {
  const content = await fs.readFile(transcriptPath, 'utf-8')
  const allLines = content.split('\n').filter(line => line.trim())
  return allLines.slice(-10)
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
    const sessionId = subagentMatch[2]
    sessionsDir = path.join(homeDir, '.openclaw', 'agents', agentType, 'sessions')
    transcriptPathDisplay = `~/.openclaw/agents/${agentType}/sessions/${sessionId}.jsonl`
    transcriptPath = path.join(sessionsDir, `${sessionId}.jsonl`)
    archiveSessionId = sessionId
  } else {
    // Fallback for other session key formats
    sessionsDir = path.join(homeDir, '.openclaw', 'sessions', sessionKey)
    transcriptPathDisplay = `~/.openclaw/sessions/${sessionKey}/transcript.jsonl`
    transcriptPath = path.join(sessionsDir, 'transcript.jsonl')
    archiveSessionId = sessionKey
  }

  try {
    const lastLines = await readTranscriptLines(transcriptPath)

    return {
      lines: lastLines,
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
          const archivedLines = await readTranscriptLines(archivedTranscriptPath)
          return {
            lines: archivedLines,
            path: toDisplayPath(archivedTranscriptPath, homeDir),
          }
        } catch {
          // Fall through to standard ENOENT handling below.
        }
      }

      if (isSubagentSession) {
        return {
          lines: [],
          missingSubagentTranscript: true,
          path: transcriptPathDisplay,
        }
      }

      return {
        lines: [],
        error: 'Transcript file not found',
        path: transcriptPathDisplay,
      }
    } else if (errorCode === 'EACCES') {
      return {
        lines: [],
        error: 'Permission denied reading transcript',
        path: transcriptPathDisplay,
      }
    } else {
      return {
        lines: [],
        error: `Error reading transcript: ${errorMessage}`,
        path: transcriptPathDisplay,
      }
    }
  }
}

export async function LogsSection({ sessionKey }: LogsSectionProps) {
  const {
    lines,
    error,
    path: transcriptPath,
    missingSubagentTranscript,
  } = await readTranscriptPreview(sessionKey)

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
            <span>Preview (last 10 lines)</span>
            {!error && !missingSubagentTranscript && lines.length > 0 && (
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
          ) : lines.length === 0 ? (
            <div className="text-sm font-mono text-terminal-dim bg-terminal-card p-4 rounded border border-terminal-border">
              No transcript entries found (session may not have started yet)
            </div>
          ) : (
            <div className="text-xs font-mono text-terminal-text bg-black p-4 rounded border border-terminal-border overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">
                {lines.map((line, idx) => {
                  try {
                    // Try to parse and pretty-print JSON
                    const parsed = JSON.parse(line)
                    return (
                      <div key={idx} className="mb-2 last:mb-0">
                        <span className="text-terminal-green">{JSON.stringify(parsed, null, 2)}</span>
                      </div>
                    )
                  } catch {
                    // If not valid JSON, display as-is
                    return (
                      <div key={idx} className="mb-2 last:mb-0 text-terminal-text">
                        {line}
                      </div>
                    )
                  }
                })}
              </pre>
            </div>
          )}
        </div>

        {/* Hint */}
        {!error && !missingSubagentTranscript && lines.length > 0 && (
          <div className="text-xs font-mono text-terminal-dim pt-2 border-t border-terminal-border">
            💡 Tip: Use <code className="bg-terminal-card px-1 py-0.5 rounded">tail -f {transcriptPath}</code> to follow logs in real-time
          </div>
        )}
      </CardContent>
    </Card>
  )
}
