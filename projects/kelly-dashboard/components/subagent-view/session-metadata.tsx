import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timestamp } from '@/components/shared/timestamp'
import { StatusIndicator } from './status-indicator'

interface SessionMetadataProps {
  sessionKey: string
  status: 'active' | 'completed' | 'failed' | 'idle' | 'waiting' | 'pending'
  model?: string
  tokens?: {
    input: number
    output: number
  }
  duration?: string | number
  startedAt?: string
  completedAt?: string
  lastActivity?: string
}

function formatDuration(duration?: string | number): string {
  if (!duration) return 'N/A'
  
  // If already formatted string (e.g., "8m14s"), return as-is
  if (typeof duration === 'string') {
    return duration
  }
  
  // If milliseconds, convert to readable format
  const totalSeconds = Math.floor(duration / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

function formatTokens(tokens?: { input: number; output: number }): string {
  if (!tokens) return 'N/A'
  const total = tokens.input + tokens.output
  return `${total.toLocaleString()} (${tokens.input.toLocaleString()} in / ${tokens.output.toLocaleString()} out)`
}

export function SessionMetadata({
  sessionKey,
  status,
  model,
  tokens,
  duration,
  startedAt,
  completedAt,
  lastActivity,
}: SessionMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="font-mono text-lg">Session Metadata</span>
          <StatusIndicator status={status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model */}
          <div>
            <div className="text-xs font-mono text-terminal-dim mb-1">Model</div>
            <div className="text-sm font-mono text-terminal-text">
              {model || 'N/A'}
            </div>
          </div>

          {/* Tokens */}
          <div>
            <div className="text-xs font-mono text-terminal-dim mb-1">Tokens</div>
            <div className="text-sm font-mono text-terminal-text">
              {formatTokens(tokens)}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="text-xs font-mono text-terminal-dim mb-1">Duration</div>
            <div className="text-sm font-mono text-terminal-text">
              {formatDuration(duration)}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-xs font-mono text-terminal-dim mb-1">Status</div>
            <div className="text-sm font-mono text-terminal-text capitalize">
              {status}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="border-t border-terminal-border pt-4 space-y-2">
          <div className="text-xs font-mono text-terminal-dim mb-2">Timeline</div>
          
          {startedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim">Started</span>
              <Timestamp date={startedAt} className="font-mono text-terminal-text" />
            </div>
          )}

          {lastActivity && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim">Last Activity</span>
              <Timestamp date={lastActivity} className="font-mono text-terminal-text" />
            </div>
          )}

          {completedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim">Completed</span>
              <Timestamp date={completedAt} className="font-mono text-terminal-text" />
            </div>
          )}
        </div>

        {/* Session Key */}
        <div className="border-t border-terminal-border pt-4">
          <div className="text-xs font-mono text-terminal-dim mb-1">Session Key</div>
          <div className="text-xs font-mono text-terminal-text break-all bg-terminal-card p-2 rounded border border-terminal-border">
            {sessionKey}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
