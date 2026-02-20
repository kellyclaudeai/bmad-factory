import Link from 'next/link'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ProjectHeader } from '@/components/project-view/project-header'
import { ProjectMetrics } from '@/components/project-view/project-metrics'
import { SubagentGrid } from '@/components/project-view/subagent-grid'
import { QueuedStories } from '@/components/project-view/queued-stories'
import { LogsSection } from '@/components/subagent-view/logs-section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timestamp } from '@/components/shared/timestamp'
import { phaseColor } from '@/lib/phase-colors'

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
  startedAt?: string
  completedAt?: string
  implementationCompletedAt?: string
  phases?: Record<string, { name: string; stories: number[]; status: string }>
  planningArtifacts?: {
    intake?: string
    prd?: string
    uxDesign?: string
    architecture?: string
    epics?: string
    storiesJson?: string
  }
  planningArtifactsRaw?: Record<string, {
    exists: boolean
    size?: number
    modified?: string
    ageMinutes?: number
    isRecent?: boolean
  }>
  implementationArtifacts?: {
    storiesStatus?: string | null
    completedStories?: string[]
    blockedStories?: string[]
    failedAttempts?: any[]
  }
  subagents: Array<{
    id?: string
    story?: string
    storyId?: string
    storyTitle?: string
    persona?: string
    role?: string
    task?: string
    source?: string
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
  stats?: {
    total: number
    done: number
    inProgress: number
    todo: number
  }
  stories?: Array<{
    id: string
    status: string
    title?: string
    epic?: string
  }>
}

type Session = {
  sessionKey: string
  sessionId?: string
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

const PROJECTS_ROOT = '/Users/austenallred/clawd/projects'

async function getProjectState(projectId: string): Promise<ProjectState | null> {
  // NEW: Fetch from project-state API instead of reading file directly
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'
    const response = await fetch(`${baseUrl}/api/project-state?id=${projectId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error(`Project state API returned ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    // Transform new API format to match expected ProjectState structure
    return {
      projectId: data.projectId,
      stage: data.currentPhase || 'unknown',
      currentPhase: data.currentPhase,
      createdAt: data.timeline?.discoveredAt || data.timeline?.createdAt,
      updatedAt: data.timeline?.lastUpdated,
      startedAt: data.timeline?.startedAt || data.timeline?.createdAt,
      planningArtifacts: data.planningArtifacts ? {
        prd: data.planningArtifacts['prd.md']?.exists ? 'complete' : 'pending',
        uxDesign: data.planningArtifacts['ux-design.md']?.exists ? 'complete' : 'pending',
        architecture: data.planningArtifacts['architecture.md']?.exists ? 'complete' : 'pending',
        epics: data.planningArtifacts['epics.md']?.exists ? 'complete' : 'pending',
      } : undefined,
      // Keep raw planning artifacts data for detailed display
      planningArtifactsRaw: data.planningArtifacts,
      subagents: data.subagents || [] // Populated from API (synthetic for Phase 1, real for Phase 2+)
    }
  } catch (error) {
    console.error('Failed to fetch project state:', error)
    return null
  }
}

async function getStoryTitleMap(projectId: string): Promise<Record<string, string>> {
  const projectRoot = path.join(PROJECTS_ROOT, projectId)
  const titleMap: Record<string, string> = {}

  // Try dependency-graph.json first (has id + title for every story)
  try {
    const dgPath = path.join(projectRoot, '_bmad-output/implementation-artifacts/dependency-graph.json')
    const contents = await fs.readFile(dgPath, 'utf8')
    const data = JSON.parse(contents)
    const stories = data.stories || []
    if (Array.isArray(stories)) {
      for (const s of stories) {
        if (s.id && s.title) titleMap[s.id] = s.title
      }
    } else if (typeof stories === 'object') {
      for (const [id, s] of Object.entries(stories)) {
        if (s && typeof s === 'object' && 'title' in (s as any)) {
          titleMap[id] = (s as any).title
        }
      }
    }
  } catch {
    // Fall through — try parsing story markdown files
  }

  // If dependency-graph didn't yield titles, scan story files for "# Story X.X: Title"
  if (Object.keys(titleMap).length === 0) {
    try {
      const storiesDir = path.join(projectRoot, '_bmad-output/implementation-artifacts/stories')
      const files = await fs.readdir(storiesDir)
      for (const file of files) {
        if (!file.endsWith('.md')) continue
        try {
          const content = await fs.readFile(path.join(storiesDir, file), 'utf8')
          const match = content.match(/^#\s+Story\s+([\d.]+):\s*(.+)/m)
          if (match) {
            titleMap[match[1]] = match[2].trim()
          }
        } catch { /* skip unreadable files */ }
      }
    } catch { /* no stories dir */ }
  }

  return titleMap
}

async function getStoriesData(projectId: string, storiesPath?: string): Promise<any> {
  // Flat structure: projects/{projectId}/
  const projectRoot = path.join(PROJECTS_ROOT, projectId)

  try {
    // Try the path from planningArtifacts first
    if (storiesPath) {
      const fullPath = path.join(projectRoot, storiesPath)
      try {
        const contents = await fs.readFile(fullPath, 'utf8')
        return JSON.parse(contents)
      } catch {
        // Fall through to canonical location
      }
    }

    // Canonical: dependency-graph.json (Bob creates this in Phase 1)
    const dgPath = path.join(projectRoot, '_bmad-output/implementation-artifacts/dependency-graph.json')
    const contents = await fs.readFile(dgPath, 'utf8')
    return JSON.parse(contents)
  } catch (error) {
    console.error('Failed to read stories data:', error)
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

function inferPersona(session: Session): string {
  const key = session.sessionKey || ''
  const label = (session.label || '').toLowerCase()

  // BMAD-ish heuristics
  if (label.includes('sally')) return 'Sally (UX)'
  if (label.includes('winston')) return 'Winston (Architecture)'
  if (label.includes('mary')) return 'Mary (Product)'
  if (label.includes('john')) return 'John (PM)'
  if (label.includes('bob')) return 'Bob (Stories)'
  if (label.includes('quinn')) return 'Quinn (QA)'
  if (label.includes('amelia')) return 'Amelia (Dev)'

  if (key.includes('project-lead')) return 'Project Lead'

  const t = session.agentType || 'agent'
  return t
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return 'unknown'
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  return formatDuration(diffSeconds)
}

export default async function ProjectDetail({ params }: ProjectDetailProps) {
  const { id } = await params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const [projectState, sessions, liveSubagentsData] = await Promise.all([
    getProjectState(id),
    fetch(`${baseUrl}/api/sessions`, { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<Session[]>) : ([] as Session[])))
      .catch(() => [] as Session[]),
    fetch(`${baseUrl}/api/active-subagents?projectId=${id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { subagents: [] }))
      .catch(() => ({ subagents: [] })),
  ])

  // Merge live subagents with historical project-state subagents
  const liveSubagents = liveSubagentsData.subagents || []
  const historicalSubagents = projectState?.subagents || []
  
  // Combine: live subagents first (active), then historical (completed)
  // Filter out historical subagents that are now active (avoid duplicates)
  const activeSessionKeys = new Set(liveSubagents.map((s: any) => s.sessionKey))
  const nonActiveHistorical = historicalSubagents.filter(
    (s) => !s.sessionKey || !activeSessionKeys.has(s.sessionKey)
  )
  
  const allSubagents = [...liveSubagents, ...nonActiveHistorical]
  
  // Update projectState to include all subagents
  if (projectState) {
    projectState.subagents = allSubagents
  }

  // Fetch stories data for queued stories section
  const storiesData = projectState?.planningArtifacts?.storiesJson
    ? await getStoriesData(id, projectState.planningArtifacts.storiesJson)
    : await getStoriesData(id)

  // Build story title lookup and enrich subagent entries
  const storyTitleMap = await getStoryTitleMap(id)
  if (projectState?.subagents) {
    for (const sa of projectState.subagents) {
      if (!sa.storyTitle && sa.story && storyTitleMap[sa.story]) {
        sa.storyTitle = storyTitleMap[sa.story]
      }
      if (!sa.storyTitle && sa.storyId && storyTitleMap[sa.storyId]) {
        sa.storyTitle = storyTitleMap[sa.storyId]
      }
    }
  }

  // Also enrich storiesData entries if they lack titles
  if (storiesData?.stories) {
    if (Array.isArray(storiesData.stories)) {
      for (const s of storiesData.stories) {
        if (!s.title && s.id && storyTitleMap[s.id]) s.title = storyTitleMap[s.id]
      }
    } else if (typeof storiesData.stories === 'object') {
      for (const [storyId, s] of Object.entries(storiesData.stories)) {
        if (s && typeof s === 'object' && !(s as any).title && storyTitleMap[storyId]) {
          (s as any).title = storyTitleMap[storyId]
        }
      }
    }
  }

  // Extract completed and active story IDs from sprint-status (ground truth)
  const completedStoryIds = projectState?.stories
    ? projectState.stories
        .filter((s: any) => s.status === 'done' || s.status === 'review')
        .map((s: any) => s.id)
    : (projectState?.implementationArtifacts?.completedStories || [])
  
  const activeStoryIds = projectState?.stories
    ? projectState.stories
        .filter((s: any) => s.status === 'in_progress' || s.status === 'in-progress')
        .map((s: any) => s.id)
    : (projectState?.subagents || [])
        .filter((s) => s.status?.toLowerCase() === 'active')
        .map((s) => s.storyId || s.story)
        .filter(Boolean) as string[]

  const projectName = formatProjectName(id)

  const relevantSessions = sessions.filter((s) => s.projectId === id)
  const projectLeadSessions = relevantSessions.filter((s) => s.agentType === 'project-lead')

  const plStatus = projectLeadSessions[0]?.status?.toLowerCase() || 'unknown'
  const stage =
    projectState?.currentStage ||
    projectState?.stage ||
    (plStatus === 'active' ? 'active' : plStatus === 'waiting' ? 'waiting' : plStatus === 'awaiting-qa' ? 'awaiting-qa' : 'unknown')

  // Runtime: Calculate from project start time (startedAt or createdAt) to now (or completedAt if done)
  const projectStartTime = projectState?.startedAt || projectState?.createdAt
  const projectEndTime = projectState?.completedAt || projectState?.implementationCompletedAt
  
  const runtimeSeconds = projectStartTime
    ? Math.max(
        0,
        ((projectEndTime ? new Date(projectEndTime).getTime() : Date.now()) - new Date(projectStartTime).getTime()) / 1000,
      )
    : 0
  
  const startTimeDisplay = projectStartTime 
    ? new Date(projectStartTime).toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short', 
        timeZone: 'America/Chicago' 
      }) + ' CST'
    : null

  // ETA: if we have project-state durations + planned stories, estimate remaining using avg completed duration.
  const completedDurations = (projectState?.subagents || [])
    .filter((s) => (s.status || '').toLowerCase() === 'complete' || (s.status || '').toLowerCase() === 'completed')
    .map((s) => parseDurationToSeconds(s.duration))
    .filter((n) => n > 0)

  const avgSeconds = completedDurations.length
    ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
    : 0

  // Use sprint-status stats (ground truth) when available, fall back to subagent counting
  const totalPlannedStories = projectState?.stats?.total
    || (projectState?.phases
      ? Object.values(projectState.phases).reduce((sum, p) => sum + (p.stories?.length || 0), 0)
      : 0)

  const completedStories = projectState?.stats?.done
    || (projectState?.subagents
      ? projectState.subagents.filter((s) => (s.status || '').toLowerCase() === 'complete' || (s.status || '').toLowerCase() === 'completed').length
      : 0)

  const inProgressStories = projectState?.stats?.inProgress || liveSubagents.length

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {startTimeDisplay && (
              <Card className="bg-terminal-card border-terminal-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-terminal-dim">Start Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-mono font-bold text-terminal-green">
                    {startTimeDisplay}
                  </div>
                  <div className="text-xs font-mono text-terminal-dim mt-1">
                    {projectState?.startedAt ? 'Implementation started' : 'Project created'}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-terminal-card border-terminal-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-terminal-dim">
                  {projectEndTime ? 'Total Duration' : 'Runtime'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-green">
                  {formatDuration(runtimeSeconds)}
                </div>
                <div className="text-xs font-mono text-terminal-dim mt-1">
                  {projectEndTime ? 'Project completed' : 'Elapsed time from start'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-terminal-card border-terminal-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono text-terminal-dim">ETA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-terminal-green">
                  {projectEndTime ? '✓ Complete' : etaSeconds ? `~${formatDuration(etaSeconds)}` : 'N/A'}
                </div>
                <div className="text-xs font-mono text-terminal-dim mt-1">
                  {projectEndTime 
                    ? 'Implementation finished' 
                    : etaSeconds 
                      ? `${remainingStories} remaining @ ~${Math.round(avgSeconds)}s/story` 
                      : 'Insufficient data for estimate'}
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
            <div className="space-y-4">
              {projectLeadSessions.map((s) => (
                <div key={s.sessionKey} className="space-y-4">
                  <Card className="bg-terminal-card border-terminal-border">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="text-terminal-text font-mono truncate">
                            Project Lead
                            <span className="text-terminal-dim"> • </span>
                            <span className="text-terminal-text">{s.sessionKey}</span>
                          </div>
                          <div className="text-terminal-dim font-mono text-xs truncate">
                            Last activity: {formatRelativeTime(s.lastActivity)} ago
                            {s.model ? ` • Model: ${s.model}` : ''}
                          </div>
                        </div>
                        <div className={`font-mono text-xs ${
                          (s.status || 'active') === 'active' ? 'text-terminal-green' :
                          (s.status || 'active') === 'waiting' ? 'text-yellow-400' :
                          (s.status || 'active') === 'awaiting-qa' ? 'text-blue-400' :
                          'text-terminal-dim'
                        }`}>{(s.status || 'active').toUpperCase()}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <LogsSection sessionKey={s.sessionKey} />
                </div>
              ))}
            </div>
          )}
        </section>

        {projectState && (
          <>
            {projectState.currentPhase === 'planning' && projectState.planningArtifacts && (
              <section>
                <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
                  Phase 1: Planning Artifacts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {([
                    { label: 'PRD',              key: 'prd',          fileName: 'prd.md',          agent: 'John' },
                    { label: 'UX Design',        key: 'uxDesign',     fileName: 'ux-design.md',    agent: 'Sally' },
                    { label: 'Architecture',     key: 'architecture', fileName: 'architecture.md', agent: 'Winston' },
                    { label: 'Epics & Stories',  key: 'epics',        fileName: 'epics.md',        agent: 'John' },
                  ] as const).map(({ label, key, fileName, agent }) => {
                    const status = (projectState.planningArtifacts as any)?.[key] as string | undefined
                    const rawData = projectState.planningArtifactsRaw?.[fileName]
                    const isComplete = status === 'complete'
                    const isActive  = !!rawData?.isRecent && !isComplete
                    const badgeVal  = isActive ? 'active' : isComplete ? 'complete' : 'waiting'

                    return (
                      <Card
                        key={key}
                        className={`transition-all duration-200 ${isActive ? 'ring-2 ring-terminal-green/30' : ''}`}
                      >
                        <CardContent className="p-4">
                          {/* Header row — mirrors SubagentCard */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-mono text-sm font-semibold text-terminal-text flex-1">
                              {label}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs font-mono shrink-0 ${phaseColor(badgeVal)} ${isActive ? 'animate-pulse-status' : ''}`}
                            >
                              {isActive ? 'Active' : isComplete ? 'Complete' : 'Pending'}
                            </Badge>
                          </div>

                          {/* Body rows */}
                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-terminal-dim">Agent:</span>
                              <span className="text-terminal-green">{agent}</span>
                            </div>

                            {isComplete && rawData?.modified && (
                              <div className="flex items-center gap-2 text-terminal-dim">
                                <span>Completed:</span>
                                <Timestamp date={rawData.modified} className="text-terminal-green/70" />
                              </div>
                            )}

                            {isActive && (
                              <div className="flex items-center gap-2 text-terminal-dim">
                                <span>Last updated:</span>
                                <span className="text-terminal-green">
                                  {rawData?.ageMinutes === 0 ? 'Just now' :
                                   rawData?.ageMinutes === 1 ? '1 min ago' :
                                   `${rawData?.ageMinutes}m ago`}
                                </span>
                              </div>
                            )}

                            {!isComplete && !isActive && (
                              <div className="text-terminal-amber">Pending</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )}

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

{/* Queued Stories section removed */}
          </>
        )}
      </main>
    </div>
  )
}
