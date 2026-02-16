'use client'

import { useAutoRefresh } from '@/components/shared/auto-refresh'
import { Timestamp } from '@/components/shared/timestamp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface Session {
  sessionKey: string
  label: string
  agentType: string
  projectId?: string
  status: string
  lastActivity: string
  model: string
  tokens?: { input: number; output: number }
  duration?: number
  channel?: string
  lastChannel?: string
  displayName?: string
}

interface GroupedSessions {
  projectLeads: Session[]
  barry: Session[]
  mary: Session[]
  independent: Session[]
}

function groupSessions(sessions: Session[]): GroupedSessions {
  const groups: GroupedSessions = {
    projectLeads: [],
    barry: [],
    mary: [],
    independent: [],
  }
  
  sessions.forEach((session) => {
    if (session.agentType.includes('project-lead')) {
      groups.projectLeads.push(session)
    } else if (session.agentType.includes('barry')) {
      groups.barry.push(session)
    } else if (session.agentType.includes('mary')) {
      groups.mary.push(session)
    } else {
      groups.independent.push(session)
    }
  })
  
  return groups
}

function AgentCard({ session }: { session: Session }) {
  const router = useRouter()
  
  const handleClick = () => {
    if (session.projectId) {
      router.push(`/project/${session.projectId}`)
    } else {
      router.push(`/subagent/${encodeURIComponent(session.sessionKey)}`)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)] focus-within:ring-2 focus-within:ring-terminal-green focus-within:outline-none"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${session.label} agent`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="font-mono text-terminal-green">
            {session.label}
          </span>
          <Badge 
            variant={session.status === 'active' ? 'default' : 'outline'}
            className={session.status === 'active' ? 'bg-terminal-green text-terminal-bg animate-pulse-status' : ''}
          >
            {session.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between text-terminal-dim">
          <span>Agent:</span>
          <span className="font-mono">{session.agentType}</span>
        </div>
        {(session.lastChannel || session.channel) && (
          <div className="flex justify-between text-terminal-dim">
            <span>Channel:</span>
            <span className="font-mono">{session.lastChannel || session.channel}</span>
          </div>
        )}
        {session.projectId && (
          <div className="flex justify-between text-terminal-dim">
            <span>Project:</span>
            <span className="font-mono">{session.projectId}</span>
          </div>
        )}
        <div className="flex justify-between text-terminal-dim">
          <span>Last active:</span>
          <Timestamp date={session.lastActivity} className="font-mono" />
        </div>
        {session.tokens && (
          <div className="flex justify-between text-terminal-dim">
            <span>Tokens:</span>
            <span className="font-mono">
              {(session.tokens.input + session.tokens.output).toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AgentList() {
  const { data: sessions, error, isLoading } = useAutoRefresh<Session[]>(
    '/api/sessions',
    10000
  )
  
  if (error) {
    return (
      <Card className="border-terminal-red">
        <CardHeader>
          <CardTitle className="text-terminal-red">
            Failed to load sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-terminal-dim">
          <p>{error.message || 'An error occurred while fetching session data.'}</p>
          <p className="mt-2 text-xs">
            Make sure the OpenClaw Gateway is running on localhost:3000
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (isLoading || !sessions) {
    return <LoadingSkeleton />
  }
  
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-terminal-amber">No active agents</CardTitle>
        </CardHeader>
        <CardContent className="text-terminal-dim">
          <p>No active sessions found. The factory is idle.</p>
        </CardContent>
      </Card>
    )
  }
  
  const groups = groupSessions(sessions)
  
  return (
    <div className="space-y-8">
      {groups.projectLeads.length > 0 && (
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Project Leads ({groups.projectLeads.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.projectLeads.map((session) => (
              <AgentCard key={session.sessionKey} session={session} />
            ))}
          </div>
        </section>
      )}
      
      {groups.barry.length > 0 && (
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Barry Agents ({groups.barry.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.barry.map((session) => (
              <AgentCard key={session.sessionKey} session={session} />
            ))}
          </div>
        </section>
      )}
      
      {groups.mary.length > 0 && (
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Mary Agents ({groups.mary.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.mary.map((session) => (
              <AgentCard key={session.sessionKey} session={session} />
            ))}
          </div>
        </section>
      )}
      
      {groups.independent.length > 0 && (
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Independent Agents ({groups.independent.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.independent.map((session) => (
              <AgentCard key={session.sessionKey} session={session} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
