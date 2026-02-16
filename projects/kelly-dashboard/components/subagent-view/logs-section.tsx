import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

interface LogsSectionProps {
  sessionKey: string
}

async function readTranscriptPreview(sessionKey: string): Promise<{
  lines: string[]
  error?: string
  path: string
}> {
  const homeDir = os.homedir()
  
  // Parse sessionKey to extract agent type and sessionId
  // Format: agent:{agent-type}:subagent:{sessionId}
  // Example: agent:bmad-bmm-amelia:subagent:abc123
  let transcriptPath: string
  let transcriptPathDisplay: string
  
  const subagentMatch = sessionKey.match(/^agent:([^:]+):subagent:(.+)$/)
  if (subagentMatch) {
    const agentType = subagentMatch[1]
    const sessionId = subagentMatch[2]
    transcriptPathDisplay = `~/.openclaw/agents/${agentType}/sessions/${sessionId}.jsonl`
    transcriptPath = path.join(homeDir, '.openclaw', 'agents', agentType, 'sessions', `${sessionId}.jsonl`)
  } else {
    // Fallback for other session key formats
    transcriptPathDisplay = `~/.openclaw/sessions/${sessionKey}/transcript.jsonl`
    transcriptPath = path.join(homeDir, '.openclaw', 'sessions', sessionKey, 'transcript.jsonl')
  }

  try {
    // Read the entire file
    const content = await fs.readFile(transcriptPath, 'utf-8')
    
    // Split into lines and filter empty lines
    const allLines = content.split('\n').filter(line => line.trim())
    
    // Get last 10 lines
    const lastLines = allLines.slice(-10)
    
    return {
      lines: lastLines,
      path: transcriptPathDisplay,
    }
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException)?.code
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Distinguish between different error types
    if (errorCode === 'ENOENT') {
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
  const { lines, error, path: transcriptPath } = await readTranscriptPreview(sessionKey)

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
            {!error && lines.length > 0 && (
              <span className="text-terminal-dim text-xs">
                💡 Full transcript available at path above
              </span>
            )}
          </div>

          {error ? (
            <div className="text-sm font-mono text-terminal-dim bg-terminal-card p-4 rounded border border-terminal-border">
              ⚠️ {error}
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
        {!error && lines.length > 0 && (
          <div className="text-xs font-mono text-terminal-dim pt-2 border-t border-terminal-border">
            💡 Tip: Use <code className="bg-terminal-card px-1 py-0.5 rounded">tail -f {transcriptPath}</code> to follow logs in real-time
          </div>
        )}
      </CardContent>
    </Card>
  )
}
