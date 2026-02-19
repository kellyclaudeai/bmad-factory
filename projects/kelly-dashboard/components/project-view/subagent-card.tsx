'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timestamp } from '@/components/shared/timestamp'

interface SubagentCardProps {
  sessionKey?: string
  story?: string
  storyTitle?: string
  persona?: string
  role?: string
  task?: string
  status: 'active' | 'complete' | 'queued' | 'pending'
  startedAt?: string
  completedAt?: string
  duration?: string
  runtime?: string
  branch?: string
  label?: string
}

export function SubagentCard({
  sessionKey,
  story,
  storyTitle,
  persona,
  role,
  task,
  status,
  startedAt,
  completedAt,
  duration,
  runtime,
  branch,
  label,
}: SubagentCardProps) {
  const router = useRouter()
  
  const normalizedStatus = status === 'pending' ? 'queued' : status
  const isClickable = !!sessionKey
  
  // Format task for display (e.g., "create-prd" → "Create PRD")
  const formatTask = (t?: string) => {
    if (!t) return null
    return t
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  // Build display name: story ID + title + dev/review type
  const workType = label?.includes('-review-') ? 'Review' : label?.includes('-dev-') ? 'Dev' : ''
  const displayName = 
    (story && storyTitle && workType ? `${story} - ${storyTitle} - ${workType}` : null) ||
    (story && storyTitle ? `${story}: ${storyTitle}` : null) ||
    storyTitle ||
    story ||
    formatTask(task) ||
    persona ||
    (role ? role : 'Unnamed Subagent')
  
  const taskDisplay = formatTask(task)
  
  // Calculate runtime display
  const runtimeDisplay = runtime || (startedAt ? calculateElapsedTime(startedAt) : null)
  
  function calculateElapsedTime(start: string): string {
    const now = new Date()
    const startDate = new Date(start)
    const diffMs = now.getTime() - startDate.getTime()
    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }
  
  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the logs toggle
    if ((e.target as HTMLElement).closest('[data-logs-toggle]')) return
    if (isClickable) {
      router.push(`/subagent/${encodeURIComponent(sessionKey)}`)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      router.push(`/subagent/${encodeURIComponent(sessionKey!)}`)
    }
  }
  
  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-terminal-green/10 text-terminal-green border-terminal-green',
    },
    complete: {
      label: 'Complete',
      className: 'bg-terminal-green/5 text-terminal-green/70 border-terminal-green/50',
    },
    queued: {
      label: 'Queued',
      className: 'bg-terminal-amber/10 text-terminal-amber border-terminal-amber',
    },
  }
  
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig]
  
  return (
    <Card
      className={`
        transition-all duration-200
        ${isClickable 
          ? 'cursor-pointer hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)] focus:outline-none focus:ring-2 focus:ring-terminal-green' 
          : 'cursor-default opacity-75'
        }
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : -1}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `View details for ${displayName}, status: ${config.label}` : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-mono text-sm font-semibold text-terminal-text line-clamp-2 flex-1">
            {displayName}
          </h3>
          <Badge 
            variant="outline"
            className={`text-xs font-mono shrink-0 ${config.className} ${normalizedStatus === 'active' ? 'animate-pulse-status' : ''}`}
          >
            {config.label}
          </Badge>
        </div>
        
        <div className="space-y-1.5 text-xs font-mono">
          {persona && (
            <div className="flex items-center gap-2 text-terminal-text">
              <span className="text-terminal-dim">Agent:</span>
              <span className="text-terminal-green">{persona}</span>
            </div>
          )}
          
          {normalizedStatus === 'active' && startedAt && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Started:</span>
              <Timestamp 
                date={startedAt} 
                className="text-terminal-green"
              />
            </div>
          )}
          
          {normalizedStatus === 'active' && runtimeDisplay && (
            <div className="flex items-center gap-2 text-terminal-text">
              <span className="text-terminal-dim">Runtime:</span>
              <span className="text-terminal-green">{runtimeDisplay}</span>
            </div>
          )}
          
          {normalizedStatus === 'complete' && duration && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Duration:</span>
              <span className="text-terminal-green">{duration}</span>
            </div>
          )}
          
          {normalizedStatus === 'complete' && startedAt && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Started:</span>
              <Timestamp 
                date={startedAt} 
                className="text-terminal-green/70"
              />
            </div>
          )}
          
          {normalizedStatus === 'complete' && completedAt && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Completed:</span>
              <Timestamp 
                date={completedAt} 
                className="text-terminal-green/70"
              />
            </div>
          )}
          
          {normalizedStatus === 'queued' && (
            <div className="text-terminal-amber">
              Pending
            </div>
          )}
          
          {branch && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Branch:</span>
              <span className="text-terminal-green/50">{branch}</span>
            </div>
          )}
        </div>

        {/* Expandable Session Logs */}
        {sessionKey && (
          <SessionLogs sessionKey={sessionKey} />
        )}
      </CardContent>
    </Card>
  )
}

type LogMessage = {
  role: string
  text: string
  toolName?: string
  timestamp?: string
}

function SessionLogs({ sessionKey }: { sessionKey: string }) {
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<LogMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) return

    let cancelled = false
    setLoading(true)

    async function fetchLogs() {
      try {
        const res = await fetch(`/api/session-logs?sessionKey=${encodeURIComponent(sessionKey)}&limit=30`)
        if (!res.ok) throw new Error('Failed to fetch logs')
        const data = await res.json()
        if (!cancelled) {
          setMessages(data.messages || [])
          setError(data.error || null)
          setLoading(false)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchLogs()

    // Auto-refresh every 10s when expanded
    const interval = setInterval(fetchLogs, 10000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [expanded, sessionKey])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const roleIcon = (role: string) => {
    switch (role) {
      case 'user': return '👤'
      case 'assistant': return '🤖'
      case 'tool': return '🔧'
      case 'system': return '📋'
      default: return '❓'
    }
  }

  const roleColor = (role: string) => {
    switch (role) {
      case 'assistant': return 'text-terminal-green'
      case 'user': return 'text-blue-400'
      case 'tool': return 'text-terminal-amber'
      case 'system': return 'text-terminal-dim'
      default: return 'text-terminal-text'
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-terminal-border" data-logs-toggle>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        className="flex items-center gap-1.5 text-xs font-mono text-terminal-dim hover:text-terminal-green transition-colors w-full"
      >
        <span className="transform transition-transform duration-200" style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        <span>Session Logs</span>
        {messages.length > 0 && (
          <span className="text-terminal-dim/50">({messages.length})</span>
        )}
      </button>

      {expanded && (
        <div className="mt-2">
          {loading && messages.length === 0 ? (
            <div className="text-xs font-mono text-terminal-dim p-2 bg-black rounded border border-terminal-border">
              Loading logs...
            </div>
          ) : error && messages.length === 0 ? (
            <div className="text-xs font-mono text-terminal-dim p-2 bg-black rounded border border-terminal-border">
              ⚠️ {error}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="max-h-64 overflow-y-auto bg-black rounded border border-terminal-border p-2 space-y-1"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className="flex gap-1.5 text-xs font-mono">
                  <span className="shrink-0">{roleIcon(msg.role)}</span>
                  <span className={`${roleColor(msg.role)} break-words min-w-0`}>
                    {msg.toolName ? (
                      <span>
                        <span className="text-terminal-amber font-bold">{msg.toolName}</span>
                        <span className="text-terminal-dim"> {msg.text.replace(`${msg.toolName}(`, '(')}</span>
                      </span>
                    ) : (
                      msg.text.length > 200 ? msg.text.slice(0, 200) + '...' : msg.text
                    )}
                  </span>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-terminal-dim text-xs">No messages yet</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
