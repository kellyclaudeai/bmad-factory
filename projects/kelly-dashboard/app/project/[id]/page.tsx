import { SubagentGrid } from '@/components/project-view/subagent-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

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
  const projectState = await getProjectState(id)
  
  if (!projectState) {
    return (
      <div className="min-h-screen bg-terminal-bg p-8">
        <header className="mb-8">
          <nav className="text-terminal-dim font-mono text-sm mb-4">
            <Link 
              href="/" 
              className="hover:text-terminal-green transition-colors"
            >
              Factory View
            </Link>
            <span className="mx-2">/</span>
            <span className="text-terminal-red">{id}</span>
          </nav>
          <h1 className="text-4xl font-mono font-bold text-terminal-red mb-2">
            Project Not Found
          </h1>
        </header>
        
        <Card className="bg-terminal-card border-terminal-border">
          <CardHeader>
            <CardTitle className="text-terminal-dim">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-terminal-dim">
            <p>Could not load project state for: <span className="font-mono text-terminal-red">{id}</span></p>
            <p className="mt-2 text-sm">
              Make sure the project exists at: 
              <code className="block mt-1 p-2 bg-terminal-bg rounded font-mono text-xs">
                /Users/austenallred/clawd/projects/{id}/project-state.json
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const projectName = formatProjectName(id)
  const stage = projectState.currentStage || projectState.stage || 'unknown'
  
  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      {/* Breadcrumb navigation */}
      <header className="mb-8">
        <nav className="text-terminal-dim font-mono text-sm mb-4">
          <Link 
            href="/" 
            className="hover:text-terminal-green transition-colors"
          >
            Factory View
          </Link>
          <span className="mx-2">/</span>
          <span className="text-terminal-green">{id}</span>
        </nav>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-mono font-bold text-terminal-green">
            Project: {projectName}
          </h1>
          <Badge 
            variant="outline" 
            className="text-terminal-green border-terminal-green font-mono"
          >
            {stage}
          </Badge>
        </div>
      </header>
      
      <main className="space-y-8">
        {/* Subagent Grid Section - Story 8 */}
        <section>
          <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
            Subagents
          </h2>
          <SubagentGrid subagents={projectState.subagents} />
        </section>
        
        {/* Phases Section (existing) */}
        {projectState.phases && (
          <section>
            <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
              Phases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(projectState.phases).map(([key, phase]) => (
                <Card 
                  key={key}
                  className="bg-terminal-card border-terminal-border"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono text-terminal-dim">
                      {phase.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-mono font-bold text-terminal-green">
                      {phase.status}
                    </div>
                    <div className="text-xs font-mono text-terminal-dim mt-1">
                      Stories: {phase.stories.join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
