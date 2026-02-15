'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timestamp } from '@/components/shared/timestamp'

interface SubagentCardProps {
  sessionKey?: string
  story?: string
  status: 'active' | 'complete' | 'queued' | 'pending'
  startedAt?: string
  completedAt?: string
  duration?: string
  branch?: string
}

export function SubagentCard({
  sessionKey,
  story,
  status,
  startedAt,
  completedAt,
  duration,
  branch,
}: SubagentCardProps) {
  const router = useRouter()
  
  const normalizedStatus = status === 'pending' ? 'queued' : status
  const isClickable = !!sessionKey
  
  const handleClick = () => {
    if (isClickable) {
      router.push(`/subagent/${encodeURIComponent(sessionKey)}`)
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
          ? 'cursor-pointer hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
          : 'cursor-default opacity-75'
        }
      `}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-mono text-sm font-semibold text-terminal-text line-clamp-2 flex-1">
            {story || 'Unnamed Subagent'}
          </h3>
          <Badge 
            variant="outline"
            className={`text-xs font-mono shrink-0 ${config.className}`}
          >
            {config.label}
          </Badge>
        </div>
        
        <div className="space-y-1.5 text-xs font-mono">
          {normalizedStatus === 'active' && startedAt && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Started:</span>
              <Timestamp 
                date={startedAt} 
                className="text-terminal-green"
              />
            </div>
          )}
          
          {normalizedStatus === 'complete' && duration && (
            <div className="flex items-center gap-2 text-terminal-dim">
              <span>Duration:</span>
              <span className="text-terminal-green">{duration}</span>
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
      </CardContent>
    </Card>
  )
}
