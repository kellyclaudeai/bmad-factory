import { Card, CardContent } from "@/components/ui/card"
import { SessionMetadata } from "@/components/subagent-view/session-metadata"
import { ArtifactsList } from "@/components/subagent-view/artifacts-list"
import Link from "next/link"
import { promises as fs } from "node:fs"
import path from "node:path"

interface SubagentDetailProps {
  params: Promise<{ sessionKey: string }>
}

interface SubagentData {
  sessionKey: string
  story?: string
  status: 'active' | 'completed' | 'failed' | 'idle' | 'waiting' | 'pending'
  phase?: string
  startedAt?: string
  completedAt?: string
  lastActivity?: string
  duration?: string
  model?: string
  tokens?: {
    input: number
    output: number
  }
  branch?: string
  artifacts?: string[]
  projectId?: string
}

async function getSubagentData(sessionKey: string): Promise<SubagentData | null> {
  // Try to find this subagent in project-state.json files
  const PROJECTS_ROOT = "/Users/austenallred/clawd/projects"
  
  try {
    // First, try to extract project ID from session key
    // Session keys look like:
    // - agent:project-lead:<projectId>
    // - agent:project-lead:project-<projectId> (legacy)
    // - agent:bmad-bmm-barry:subagent:<uuid>
    let projectId: string | undefined

    // Check if it's a project lead session (canonical + legacy)
    const projectLeadMatch = sessionKey.match(/agent:project-lead:(?:project-)?(.+)/)
    if (projectLeadMatch) {
      projectId = projectLeadMatch[1]
    } else {
      // For subagents, we need to scan all projects to find which one contains this session
      const projectDirs = await fs.readdir(PROJECTS_ROOT)
      
      for (const dir of projectDirs) {
        const projectStatePath = path.join(PROJECTS_ROOT, dir, "project-state.json")
        try {
          const contents = await fs.readFile(projectStatePath, "utf8")
          const projectState = JSON.parse(contents)
          
          // Search in subagents array
          if (projectState.subagents && Array.isArray(projectState.subagents)) {
            const subagent = projectState.subagents.find(
              (s: any) => s.sessionKey === sessionKey
            )
            
            if (subagent) {
              projectId = projectState.projectId || dir
              // Return the found subagent data
              return {
                sessionKey,
                story: subagent.story,
                status: subagent.status || 'pending',
                phase: subagent.phase,
                startedAt: subagent.startedAt,
                completedAt: subagent.completedAt,
                lastActivity: subagent.lastActivity,
                duration: subagent.duration,
                model: subagent.model,
                tokens: subagent.tokens,
                branch: subagent.branch,
                artifacts: subagent.artifacts,
                projectId,
              }
            }
          }
        } catch {
          // Skip projects that don't have valid project-state.json
          continue
        }
      }
    }
    
    // If we found a project ID but didn't find the subagent in the loop above,
    // try to load that specific project
    if (projectId) {
      const projectStatePath = path.join(PROJECTS_ROOT, projectId, "project-state.json")
      try {
        const contents = await fs.readFile(projectStatePath, "utf8")
        const projectState = JSON.parse(contents)
        
        if (projectState.subagents && Array.isArray(projectState.subagents)) {
          const subagent = projectState.subagents.find(
            (s: any) => s.sessionKey === sessionKey
          )
          
          if (subagent) {
            return {
              sessionKey,
              story: subagent.story,
              status: subagent.status || 'pending',
              phase: subagent.phase,
              startedAt: subagent.startedAt,
              completedAt: subagent.completedAt,
              lastActivity: subagent.lastActivity,
              duration: subagent.duration,
              model: subagent.model,
              tokens: subagent.tokens,
              branch: subagent.branch,
              artifacts: subagent.artifacts,
              projectId,
            }
          }
        }
      } catch {
        // Fall through to return basic data
      }
    }
    
    // Return basic data if we couldn't find detailed info
    return {
      sessionKey,
      status: 'pending',
      projectId,
    }
  } catch (error) {
    console.error('Error fetching subagent data:', error)
    return null
  }
}

export default async function SubagentDetail({ params }: SubagentDetailProps) {
  const { sessionKey } = await params
  const decodedKey = decodeURIComponent(sessionKey)
  
  const subagentData = await getSubagentData(decodedKey)
  
  if (!subagentData) {
    return (
      <div className="min-h-screen bg-terminal-bg p-8">
        <header className="mb-8">
          <nav className="text-terminal-dim font-mono text-sm mb-4">
            <Link href="/" className="hover:text-terminal-green transition-colors">
              Factory View
            </Link>
            <span className="mx-2">/</span>
            <span className="text-terminal-green">Session Detail</span>
          </nav>
          <h1 className="text-2xl font-mono font-bold text-terminal-green mb-2">
            Session Not Found
          </h1>
        </header>
        <main>
          <Card>
            <CardContent className="pt-6">
              <p className="text-terminal-dim">
                Could not find subagent data for session key: <br />
                <span className="font-mono text-xs text-terminal-text break-all mt-2 block">
                  {decodedKey}
                </span>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <header className="mb-8">
        <nav className="text-terminal-dim font-mono text-sm mb-4">
          <Link href="/" className="hover:text-terminal-green transition-colors">
            Factory View
          </Link>
          {subagentData.projectId && (
            <>
              <span className="mx-2">/</span>
              <Link 
                href={`/project/${subagentData.projectId}`}
                className="hover:text-terminal-green transition-colors"
              >
                {subagentData.projectId}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-terminal-green">Session</span>
        </nav>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-mono font-bold text-terminal-green mb-2">
              {subagentData.story || (decodedKey.includes(':subagent:') ? 'Subagent Session' : 'Session')}
            </h1>
            <div className="text-xs font-mono text-terminal-dim break-all">
              {decodedKey.includes(':subagent:') ? 'Type: SUBAGENT' : decodedKey.includes('agent:project-lead:') ? 'Type: PROJECT LEAD (FULL SESSION)' : 'Type: SESSION'}
              <span className="text-terminal-dim"> • </span>
              <span className="text-terminal-text">{decodedKey}</span>
            </div>
            {subagentData.branch && (
              <div className="text-sm text-terminal-dim font-mono">
                Branch: <span className="text-terminal-text">{subagentData.branch}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {/* Session Metadata */}
        <SessionMetadata
          sessionKey={decodedKey}
          status={subagentData.status}
          model={subagentData.model}
          tokens={subagentData.tokens}
          duration={subagentData.duration}
          startedAt={subagentData.startedAt}
          completedAt={subagentData.completedAt}
          lastActivity={subagentData.lastActivity}
        />

        {/* Artifacts */}
        <ArtifactsList
          artifacts={subagentData.artifacts}
          projectId={subagentData.projectId}
        />

        {/* Additional Info */}
        {subagentData.phase && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm">
                <span className="text-terminal-dim font-mono">Phase:</span>{' '}
                <span className="text-terminal-text font-mono">{subagentData.phase}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
