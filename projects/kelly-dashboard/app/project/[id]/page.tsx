import { ProjectHeader } from '@/components/project-view/project-header'
import { ProjectMetrics } from '@/components/project-view/project-metrics'
import { SubagentGrid } from '@/components/project-view/subagent-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { lookupProjectMetaByProjectId } from '@/lib/project-lead-registry'

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

export default async function ProjectDetail({ params }: ProjectDetailProps) {
  const { id } = await params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const [projectState, sessions] = await Promise.all([
    getProjectState(id),
    fetch(`${baseUrl}/api/sessions`, { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<Session[]>) : ([] as Session[])))
      .catch(() => [] as Session[]),
  ])

  const meta = lookupProjectMetaByProjectId(id)
  const projectName = meta?.title || formatProjectName(id)

  const relevantSessions = sessions.filter((s) => s.projectId === id)
  const active = relevantSessions.filter((s) => (s.status || '').toLowerCase() === 'active')
  const queued = relevantSessions.filter((s) => ['idle', 'waiting', 'queued'].includes((s.status || '').toLowerCase()))
  const completed = relevantSessions.filter((s) => ['complete', 'completed', 'closed'].includes((s.status || '').toLowerCase()))

  const stage = projectState?.currentStage || projectState?.stage || (active.length ? 'active' : 'unknown')

  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <ProjectHeader 
        projectId={id}
        projectName={projectName}
        stage={stage}
      />

      {meta?.description && (
        <p className="-mt-6 mb-8 text-terminal-dim font-mono text-sm max-w-3xl">
          {meta.description}
        </p>
      )}
      
      <main className="space-y-8">
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Active Subagents
          </h2>
          {active.length === 0 ? (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
                No active subagents for this project.
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 space-y-2">
                {active.map((s) => (
                  <div key={s.sessionKey} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-terminal-text font-mono truncate">{s.label}</div>
                      <div className="text-terminal-dim font-mono text-xs truncate">{s.sessionKey}</div>
                    </div>
                    <div className="text-terminal-green font-mono text-xs">ACTIVE</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Next / Queued Subagents
          </h2>
          {queued.length === 0 ? (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
                No queued subagents for this project.
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 space-y-2">
                {queued.map((s) => (
                  <div key={s.sessionKey} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-terminal-text font-mono truncate">{s.label}</div>
                      <div className="text-terminal-dim font-mono text-xs truncate">{s.sessionKey}</div>
                    </div>
                    <div className="text-terminal-amber font-mono text-xs">{(s.status || 'queued').toUpperCase()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Completed Steps / Subagents
          </h2>
          {completed.length === 0 ? (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 text-terminal-dim font-mono text-sm">
                No completed subagents recorded for this project.
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-terminal-card border-terminal-border">
              <CardContent className="pt-6 space-y-2">
                {completed.map((s) => (
                  <div key={s.sessionKey} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-terminal-text font-mono truncate">{s.label}</div>
                      <div className="text-terminal-dim font-mono text-xs truncate">{s.sessionKey}</div>
                    </div>
                    <div className="text-terminal-dim font-mono text-xs">COMPLETED</div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                Subagents (from project-state.json)
              </h2>
              <SubagentGrid subagents={projectState.subagents} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
