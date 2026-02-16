import { Card, CardContent } from "@/components/ui/card"
import { SessionMetadata } from "@/components/subagent-view/session-metadata"
import { ArtifactsList } from "@/components/subagent-view/artifacts-list"
import { LogsSection } from "@/components/subagent-view/logs-section"
import Link from "next/link"
import { promises as fs } from "node:fs"
import path from "node:path"

interface SessionDetailProps {
  params: Promise<{ sessionKey: string }>
}

interface SessionData {
  sessionKey: string
  story?: string
  status: "active" | "completed" | "failed" | "idle" | "waiting" | "pending"
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
  persona?: string
  role?: string
}

function getSessionType(decodedKey: string): "subagent" | "project-lead" | "session" {
  if (decodedKey.includes(":subagent:")) return "subagent"
  if (decodedKey.startsWith("agent:project-lead:")) return "project-lead"
  return "session"
}

function getSessionTypeLabel(t: ReturnType<typeof getSessionType>): string {
  if (t === "subagent") return "SUBAGENT"
  if (t === "project-lead") return "PROJECT LEAD (FULL SESSION)"
  return "SESSION"
}

async function getSessionData(sessionKey: string): Promise<SessionData | null> {
  // Try to find this session in project-state.json files.
  // For non-subagent sessions, this is best-effort only.
  const PROJECTS_ROOT = "/Users/austenallred/clawd/projects"

  try {
    let projectId: string | undefined

    // Project lead session key conventions:
    // - agent:project-lead:<projectId>
    // - agent:project-lead:project-<projectId> (legacy)
    const projectLeadMatch = sessionKey.match(/agent:project-lead:(?:project-)?(.+)/)
    if (projectLeadMatch) {
      projectId = projectLeadMatch[1]
      return { sessionKey, status: "active", projectId }
    }

    // For subagents, we need to scan all projects to find which one contains this session
    const projectDirs = await fs.readdir(PROJECTS_ROOT)

    for (const dir of projectDirs) {
      const projectStatePath = path.join(PROJECTS_ROOT, dir, "project-state.json")
      try {
        const contents = await fs.readFile(projectStatePath, "utf8")
        const projectState = JSON.parse(contents)

        if (projectState.subagents && Array.isArray(projectState.subagents)) {
          const subagent = projectState.subagents.find((s: any) => s.sessionKey === sessionKey)

          if (subagent) {
            projectId = projectState.projectId || dir
            return {
              sessionKey,
              story: subagent.story,
              status: subagent.status || "pending",
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
              persona: subagent.persona,
              role: subagent.role,
            }
          }
        }
      } catch {
        continue
      }
    }

    return { sessionKey, status: "pending", projectId }
  } catch (error) {
    console.error("Error fetching session data:", error)
    return null
  }
}

export default async function SessionDetail({ params }: SessionDetailProps) {
  const { sessionKey } = await params
  const decodedKey = decodeURIComponent(sessionKey)

  const type = getSessionType(decodedKey)
  const typeLabel = getSessionTypeLabel(type)

  const sessionData = await getSessionData(decodedKey)

  if (!sessionData) {
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
                Could not find session data for session key: <br />
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

  const personaDisplay = sessionData.persona?.trim() || (type === "subagent" ? "Subagent" : "Unknown")
  const roleDisplay = sessionData.role?.trim() || "Unknown"
  const showPersonaRole = type === "subagent" || Boolean(sessionData.persona) || Boolean(sessionData.role)

  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <header className="mb-8">
        <nav className="text-terminal-dim font-mono text-sm mb-4">
          <Link href="/" className="hover:text-terminal-green transition-colors">
            Factory View
          </Link>
          {sessionData.projectId && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/project/${sessionData.projectId}`}
                className="hover:text-terminal-green transition-colors"
              >
                {sessionData.projectId}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-terminal-green">Session</span>
        </nav>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-mono font-bold text-terminal-green mb-2">
              {sessionData.story || (type === "subagent" ? "Subagent Session" : type === "project-lead" ? "Project Lead" : "Session")}
            </h1>
            <div className="text-xs font-mono text-terminal-dim break-all">
              Type: {typeLabel}
              <span className="text-terminal-dim"> • </span>
              <span className="text-terminal-text">{decodedKey}</span>
            </div>
            {showPersonaRole && (
              <div className="text-sm font-mono mt-1">
                <span className="text-terminal-green">{personaDisplay}</span>
                <span className="text-terminal-dim"> • </span>
                <span className="text-terminal-text">{roleDisplay}</span>
              </div>
            )}
            {sessionData.branch && (
              <div className="text-sm text-terminal-dim font-mono">
                Branch: <span className="text-terminal-text">{sessionData.branch}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <SessionMetadata
          sessionKey={decodedKey}
          status={sessionData.status}
          model={sessionData.model}
          tokens={sessionData.tokens}
          duration={sessionData.duration}
          startedAt={sessionData.startedAt}
          completedAt={sessionData.completedAt}
          lastActivity={sessionData.lastActivity}
        />

        <ArtifactsList artifacts={sessionData.artifacts} projectId={sessionData.projectId} />

        <LogsSection sessionKey={decodedKey} />

        {sessionData.phase && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm">
                <span className="text-terminal-dim font-mono">Phase:</span>{" "}
                <span className="text-terminal-text font-mono">{sessionData.phase}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
