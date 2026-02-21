import Link from 'next/link'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ProjectHeader } from '@/components/project-view/project-header'
import { SubagentGrid } from '@/components/project-view/subagent-grid'
import { QueuedStories } from '@/components/project-view/queued-stories'
import { LogsSection } from '@/components/subagent-view/logs-section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timestamp } from '@/components/shared/timestamp'
import { phaseColor, displayPhase } from '@/lib/phase-colors'

interface ProjectDetailProps {
  params: Promise<{ id: string }>
}

type ProjectState = {
  projectId: string
  stage: string
  currentStage?: string
  currentPhase?: string
  lifecycle?: string | null
  createdAt?: string
  updatedAt?: string
  startedAt?: string
  completedAt?: string
  implementationCompletedAt?: string
  devServerUrl?: string | null
  qaUrl?: string | null
  deployedUrl?: string | null
  designAssets?: {
    figma_file_url?: string
    color_system?: string
    typography?: string
    /** values are relative image paths within _bmad-output/design-assets/images/ */
    components?: Record<string, string> | string[]
    /** values are relative image paths within _bmad-output/design-assets/images/ */
    screens?: Record<string, string> | string[]
    /** 'mobile-only' → skip desktop/mobile split, show single "Designs" section */
    viewports?: string
  } | null
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
      lifecycle: data.lifecycle || null,
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
      subagents: data.subagents || [], // Populated from API (synthetic for Phase 1, real for Phase 2+)
      devServerUrl: data.devServerUrl ?? null,
      qaUrl: data.qaUrl ?? null,
      deployedUrl: data.deployedUrl ?? null,
      designAssets: data.designAssets ?? null,
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
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      })
    : null

  // ── Design screen partitions ─────────────────────────────────────────────
  // New convention (as of 2026-02-20): Sally produces keys ending in
  // `-desktop` and `-mobile` for every screen. Legacy keys (no suffix) are
  // treated as desktop.
  const _rawScreens = projectState?.designAssets?.screens
  const mobileOnlyDesigns =
    (projectState?.designAssets as any)?.viewports === 'mobile-only'
  const screenEntries: [string, string][] =
    _rawScreens && !Array.isArray(_rawScreens)
      ? Object.entries(_rawScreens as Record<string, string>)
      : []
  const desktopScreenEntries = screenEntries.filter(
    ([k]) => k.endsWith('-desktop') || !k.endsWith('-mobile'),
  )
  const mobileScreenEntries = screenEntries.filter(([k]) => k.endsWith('-mobile'))
  const hasBothViewports =
    desktopScreenEntries.length > 0 && mobileScreenEntries.length > 0

  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <ProjectHeader 
        projectId={id}
        projectName={projectName}
        stage={stage}
        lifecycle={projectState?.lifecycle}
      />

      {/* no registry-backed project description */}

      <main className="space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {startTimeDisplay && (
              <Card className="bg-terminal-card border-terminal-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-terminal-dim">Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-mono font-bold text-terminal-green">
                    {startTimeDisplay}
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Test Links ─────────────────────────────────────────────────── */}
        {projectState && (projectState.devServerUrl || projectState.qaUrl || projectState.deployedUrl) && (
          <section>
            <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
              {projectState.currentPhase === 'shipped' ? 'Links' : 'Test Links'}
            </h2>
            <div className="flex flex-col gap-3">
              {/* Local dev server — show only when not shipped */}
              {projectState.currentPhase !== 'shipped' && (() => {
                const localUrl = projectState.devServerUrl ||
                  (projectState.qaUrl?.startsWith('http://localhost') ? projectState.qaUrl : null)
                return localUrl ? (
                  <a
                    href={localUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-md border border-terminal-border bg-terminal-card hover:border-terminal-green transition-colors group"
                  >
                    <span className="font-mono text-xs text-terminal-dim w-24 shrink-0">Local Dev</span>
                    <span className="font-mono text-sm text-terminal-green group-hover:underline truncate">
                      {localUrl}
                    </span>
                  </a>
                ) : null
              })()}

              {/* Deployed / QA preview — always show when available; persists after ship */}
              {(() => {
                const extUrl = projectState.deployedUrl ||
                  (!projectState.qaUrl?.startsWith('http://localhost') ? projectState.qaUrl : null)
                return extUrl ? (
                  <a
                    href={extUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-md border border-terminal-border bg-terminal-card hover:border-blue-400 transition-colors group"
                  >
                    <span className="font-mono text-xs text-terminal-dim w-24 shrink-0">
                      {projectState.currentPhase === 'shipped' ? 'Deployed' : 'QA Preview'}
                    </span>
                    <span className="font-mono text-sm text-blue-400 group-hover:underline truncate">
                      {extUrl}
                    </span>
                  </a>
                ) : null
              })()}
            </div>
          </section>
        )}

        {projectState?.designAssets && (
          <section>
            <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
              Design Mockups
            </h2>
            <div className="space-y-6">
              {/* Screens — Desktop / Mobile split (new convention) or flat fallback */}
              {projectState.designAssets.screens && (Array.isArray(projectState.designAssets.screens) ? projectState.designAssets.screens.length > 0 : Object.keys(projectState.designAssets.screens).length > 0) && (
                mobileOnlyDesigns || Array.isArray(projectState.designAssets.screens) ? (
                  /* ── Flat section: mobile-only flag or legacy array form ── */
                  <div>
                    <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">
                      {mobileOnlyDesigns ? 'Designs' : 'Screens'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {Array.isArray(projectState.designAssets.screens)
                        ? projectState.designAssets.screens.map((name) => (
                            <div key={String(name)} className="space-y-2">
                              <p className="text-xs font-mono text-terminal-dim capitalize">{String(name).replace(/-/g, ' ').replace(/_/g, ' ')}</p>
                              <div className="rounded-lg border border-dashed border-terminal-border bg-terminal-card flex items-center justify-center h-40">
                                <div className="text-center space-y-1">
                                  <p className="text-sm font-mono text-terminal-text capitalize font-medium">{String(name).replace(/-/g, ' ').replace(/_/g, ' ')}</p>
                                  <p className="text-xs font-mono text-terminal-dim opacity-60">mockup pending</p>
                                </div>
                              </div>
                            </div>
                          ))
                        : screenEntries.map(([name, file]) => (
                            <div key={name} className="flex flex-col gap-1.5 w-28 shrink-0">
                              <p className="text-xs font-mono text-terminal-dim capitalize truncate">{name.replace(/_/g, ' ').replace(/-/g, ' ')}</p>
                              <a
                                href={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg border border-terminal-border bg-terminal-card overflow-hidden hover:border-terminal-green transition-colors"
                              >
                                <img
                                  src={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                  alt={name.replace(/_/g, ' ')}
                                  className="w-full h-auto block"
                                />
                              </a>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                ) : (
                  /* ── Split: Desktop Designs (top) / Mobile Designs (below) ── */
                  <>
                    {desktopScreenEntries.length > 0 && (
                      <div>
                        <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">
                          {hasBothViewports ? 'Desktop Designs' : 'Screens'}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {desktopScreenEntries.map(([name, file]) => (
                            <div key={name} className="flex flex-col gap-1.5 w-28 shrink-0">
                              <p className="text-xs font-mono text-terminal-dim capitalize truncate">
                                {name.replace(/-desktop$/, '').replace(/_/g, ' ').replace(/-/g, ' ')}
                              </p>
                              <a
                                href={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg border border-terminal-border bg-terminal-card overflow-hidden hover:border-terminal-green transition-colors"
                              >
                                <img
                                  src={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                  alt={name.replace(/_/g, ' ')}
                                  className="w-full h-auto block"
                                />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {mobileScreenEntries.length > 0 && (
                      <div className={hasBothViewports ? 'mt-6' : ''}>
                        <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">
                          {hasBothViewports ? 'Mobile Designs' : 'Screens'}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {mobileScreenEntries.map(([name, file]) => (
                            <div key={name} className="flex flex-col gap-1.5 w-28 shrink-0">
                              <p className="text-xs font-mono text-terminal-dim capitalize truncate">
                                {name.replace(/-mobile$/, '').replace(/_/g, ' ').replace(/-/g, ' ')}
                              </p>
                              <a
                                href={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg border border-terminal-border bg-terminal-card overflow-hidden hover:border-terminal-green transition-colors"
                              >
                                <img
                                  src={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                                  alt={name.replace(/_/g, ' ')}
                                  className="w-full h-auto block"
                                />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              )}

              {/* Components — exported PNG images or component name list */}
              {(() => {
                const comps = projectState.designAssets.components
                if (!comps) return null
                // Detect if it's a true image map (all values are strings) vs a component catalogue
                const isImageMap = !Array.isArray(comps) && typeof comps === 'object'
                  && Object.values(comps).every(v => typeof v === 'string')
                const isArray = Array.isArray(comps)
                const isCatalogue = !Array.isArray(comps) && typeof comps === 'object'
                  && Object.values(comps).some(v => Array.isArray(v))

                if (isImageMap) {
                  const entries = Object.entries(comps as Record<string, string>)
                  return entries.length === 0 ? null : (
                    <div>
                      <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">Components</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {entries.map(([name, file]) => (
                          <div key={name} className="rounded-lg overflow-hidden border border-terminal-border bg-terminal-card">
                            <img
                              src={`/api/design-image?projectId=${id}&file=${encodeURIComponent(file)}`}
                              alt={name.replace(/_/g, ' ')}
                              className="w-full h-40 object-cover object-top"
                            />
                            <p className="text-xs font-mono text-terminal-dim capitalize px-2 py-1.5">
                              {name.replace(/_/g, ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (isArray) {
                  const names = comps as string[]
                  return names.length === 0 ? null : (
                    <div>
                      <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">Components</h3>
                      <div className="flex flex-wrap gap-2">
                        {names.map((name) => (
                          <span key={name} className="text-xs font-mono text-terminal-dim bg-terminal-card border border-terminal-border rounded px-2 py-1 capitalize">
                            {String(name).replace(/-/g, ' ').replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                }

                if (isCatalogue) {
                  // Component catalogue: { shadcn: [...], custom: [...] }
                  const catalogue = comps as unknown as Record<string, string[]>
                  const allNames = Object.entries(catalogue).flatMap(([group, names]) =>
                    (names as string[]).map(n => ({ group, name: n }))
                  )
                  return allNames.length === 0 ? null : (
                    <div>
                      <h3 className="text-sm font-mono text-terminal-dim uppercase tracking-wider mb-3">Components</h3>
                      {Object.entries(catalogue).map(([group, names]) => (
                        <div key={group} className="mb-3">
                          <p className="text-xs font-mono text-terminal-muted uppercase mb-2">{group}</p>
                          <div className="flex flex-wrap gap-2">
                            {(names as string[]).map(name => (
                              <span key={name} className="text-xs font-mono text-terminal-dim bg-terminal-card border border-terminal-border rounded px-2 py-1">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }

                return null
              })()}

              {/* Design system links */}
              {(projectState.designAssets.color_system || projectState.designAssets.typography || projectState.designAssets.figma_file_url) && (
                <div className="flex flex-wrap gap-3">
                  {projectState.designAssets.figma_file_url && (
                    <a href={projectState.designAssets.figma_file_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-mono text-blue-400 hover:underline">
                      ↗ Open Figma File
                    </a>
                  )}
                  {projectState.designAssets.color_system && (
                    <a href={projectState.designAssets.color_system} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-mono text-terminal-dim hover:text-terminal-text">
                      🎨 Color System
                    </a>
                  )}
                  {projectState.designAssets.typography && (
                    <a href={projectState.designAssets.typography} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-mono text-terminal-dim hover:text-terminal-text">
                      🔤 Typography
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

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
                        <Badge variant="outline" className={`text-xs font-mono shrink-0 ${phaseColor(s.status || 'active')}`}>
                          {displayPhase(s.status || 'active')}
                        </Badge>
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
                Subagents (from project-state.json)
              </h2>
              <SubagentGrid subagents={projectState.subagents} projectId={id} />
            </section>

{/* Queued Stories section removed */}
          </>
        )}
      </main>
    </div>
  )
}
