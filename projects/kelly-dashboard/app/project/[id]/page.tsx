'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ProjectHeader } from '@/components/project-view/project-header'
import { ProjectMetrics } from '@/components/project-view/project-metrics'
import { SubagentGrid } from '@/components/project-view/subagent-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectDetailProps {
  params: Promise<{ id: string }>
}

type ProjectState = {
  projectId: string
  stage: string
  currentStage?: string
  currentPhase?: string
  createdAt?: string
  updatedAt?: string
  phases?: Record<string, { name: string; stories: number[]; status: string }>
  subagents: Array<{
    story?: string
    persona?: string
    role?: string
    task?: string
    status: string
    duration?: string
    startedAt?: string
    completedAt?: string
    sessionKey?: string
    branch?: string
    tokens?: {
      input?: number
      output?: number
    }
  }>
}

type Session = {
  sessionKey: string
  label: string
  agentType: string
  projectId?: string
  projectTitle?: string
  projectDescription?: string
  status: string
  lastActivity: string
  model?: string
  channel?: string
  lastChannel?: string
}

async function getProjectState(projectId: string): Promise<ProjectState | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/project-state?id=${projectId}`, {
      cache: 'no-store', // Always fetch fresh data
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch project state:', error)
    return null
  }
}

function formatProjectName(projectId: string): string {
  // Convert kebab-case to Title Case
  return projectId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s'
  const s = Math.floor(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return remM ? `${h}h ${remM}m` : `${h}h`
}

function parseDurationToSeconds(duration?: string): number {
  if (!duration) return 0
  const minutesMatch = duration.match(/(\d+)m/)
  const secondsMatch = duration.match(/(\d+)s/)
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
  const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0
  return minutes * 60 + seconds
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return 'unknown'
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  return formatDuration(diffSeconds)
}

export default function ProjectDetail({ params }: ProjectDetailProps) {
  const router = useRouter()
  const [id, setId] = React.useState<string>('')
  const [projectState, setProjectState] = React.useState<ProjectState | null>(null)
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  React.useEffect(() => {
    if (!id) return
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    Promise.all([
      getProjectState(id),
      fetch(`${baseUrl}/api/sessions`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() as Promise<Session[]> : [] as Session[]))
        .catch(() => [] as Session[]),
    ]).then(([state, sess]) => {
      setProjectState(state)
      setSessions(sess)
      setLoading(false)
    })
  }, [id])

  if (loading || !id) {
    return <div className="min-h-screen bg-terminal-bg p-8">Loading...</div>
  }

  const projectName = formatProjectName(id)

  const relevantSessions = sessions.filter((s) => s.projectId === id)
  const projectLeadSessions = relevantSessions.filter((s) => s.agentType === 'project-lead')

  const stage =
    projectState?.currentStage ||
    projectState?.stage ||
    (projectLeadSessions.some((s) => (s.status || '').toLowerCase() === 'active') ? 'active' : 'unknown')

  // Runtime: best-effort approximation using oldest known session lastActivity.
  const runtimeSeconds = relevantSessions.length
    ? Math.max(
        0,
        (Date.now() - Math.min(...relevantSessions.map((s) => new Date(s.lastActivity).getTime()))) / 1000,
      )
    : 0

  // ETA: if we have project-state durations + planned stories, estimate remaining using avg completed duration.
  const completedDurations = (projectState?.subagents || [])
    .filter((s) => (s.status || '').toLowerCase() === 'complete' || (s.status || '').toLowerCase() === 'completed')
    .map((s) => parseDurationToSeconds(s.duration))
    .filter((n) => n > 0)

  const avgSeconds = completedDurations.length
    ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
    : 0

  const totalPlannedStories = projectState?.phases
    ? Object.values(projectState.phases).reduce((sum, p) => sum + (p.stories?.length || 0), 0)
    : 0

  const completedStories = projectState?.subagents
    ? projectState.subagents.filter((s) => (s.status || '').toLowerCase() === 'complete' || (s.status || '').toLowerCase() === 'completed').length
    : 0

  const remainingStories = totalPlannedStories ? Math.max(0, totalPlannedStories - completedStories) : 0
  const etaSeconds = avgSeconds && remainingStories ? avgSeconds * remainingStories : 0

  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <ProjectHeader 
        projectId={id}
        projectName={projectName}
        stage={stage}
      />

      {/* no registry-backed project description */}

      <main className="space-y-8">
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Runtime + ETA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-terminal-card border-terminal-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-terminal-dim">Runtime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-green">
                  {formatDuration(runtimeSeconds)}
                </div>
                <div className="text-xs font-mono text-terminal-dim mt-1">
                  (approx • based on oldest recorded activity)
                </div>
              </CardContent>
            </Card>

            <Card className="bg-terminal-card border-terminal-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-terminal-dim">ETA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-green">
                  {etaSeconds ? `~${formatDuration(etaSeconds)}` : '—'}
                </div>
                <div className="text-xs font-mono text-terminal-dim mt-1">
                  {etaSeconds ? `${remainingStories} remaining @ ~${Math.round(avgSeconds)}s/story` : 'Needs project-state durations to estimate'}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Project Lead Session
          </h2>
          {projectLeadSessions.length === 0 ? (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
                No Project Lead session found for this project.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {projectLeadSessions.map((s) => (
                <Card
                  key={s.sessionKey}
                  className="bg-terminal-card border-terminal-border cursor-pointer transition-all duration-200 hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)]"
                  onClick={() => router.push(`/session/${encodeURIComponent(s.sessionKey)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/session/${encodeURIComponent(s.sessionKey)}`)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View Project Lead session details, status: ${(s.status || 'active').toUpperCase()}`}
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="text-terminal-text font-mono truncate">
                          Project Lead
                          <span className="text-terminal-dim"> • </span>
                          <span className="text-terminal-text">FULL SESSION</span>
                        </div>
                        <div className="text-terminal-dim font-mono text-xs truncate">Task: {s.label}</div>
                        <div className="text-terminal-dim font-mono text-xs truncate">
                          Running: {formatRelativeTime(s.lastActivity)} (since last activity)
                          {s.model ? ` • Model: ${s.model}` : ''}
                        </div>
                        {(s.lastChannel || s.channel) && (
                          <div className="text-terminal-dim font-mono text-xs truncate">
                            Channel: {s.lastChannel || s.channel}
                          </div>
                        )}
                        <div className="text-terminal-dim font-mono text-xs truncate">{s.sessionKey}</div>
                      </div>
                      <div className="text-terminal-green font-mono text-xs">{(s.status || 'active').toUpperCase()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {projectState && (
          <>
            <section>
              <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
                Project Metrics
              </h2>
              <ProjectMetrics subagents={projectState.subagents} phases={projectState.phases} />
            </section>

            <section>
              <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
                Subagents
              </h2>
              <SubagentGrid subagents={projectState.subagents} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
