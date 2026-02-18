import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResearchHeader } from "@/components/research-view/research-header";
import { LogsSection } from "@/components/subagent-view/logs-section";
import { ResearchSubagentGrid } from "@/components/research-view/research-subagent-grid";
import type { ResearchSession } from "@/app/api/research-sessions/route";

interface ResearchDetailProps {
  params: Promise<{ sessionKey: string }>;
}

type ResearchState = {
  researchId: string;
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  findings?: string[];
  outputPath?: string;
  lastHeartbeat?: string;
  subagents?: Array<{
    persona?: string;
    role?: string;
    task?: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    duration?: string;
    sessionKey?: string;
    tokens?: {
      input?: number;
      output?: number;
    };
  }>;
};

async function getResearchSession(sessionKey: string): Promise<ResearchSession | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/research-sessions`, {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const sessions = (await response.json()) as ResearchSession[];
    return sessions.find((s) => s.sessionKey === sessionKey) || null;
  } catch (error) {
    console.error("Error fetching research session:", error);
    return null;
  }
}

async function getResearchState(sessionKey: string): Promise<ResearchState | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/research-state?sessionKey=${encodeURIComponent(sessionKey)}`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Error fetching research state:", error);
    return null;
  }
}

export default async function ResearchDetail({ params }: ResearchDetailProps) {
  const { sessionKey } = await params;
  const decodedKey = decodeURIComponent(sessionKey);

  const [researchSession, researchState] = await Promise.all([
    getResearchSession(decodedKey),
    getResearchState(decodedKey),
  ]);

  if (!researchSession) {
    return (
      <div className="min-h-screen bg-terminal-bg p-8">
        <header className="mb-8">
          <nav className="text-terminal-dim font-mono text-sm mb-4">
            <Link href="/" className="hover:text-terminal-green transition-colors">
              Factory View
            </Link>
            <span className="mx-2">/</span>
            <span className="text-terminal-green">Research</span>
          </nav>
          <h1 className="text-2xl font-mono font-bold text-terminal-green mb-2">
            Research Session Not Found
          </h1>
        </header>
        <main>
          <Card>
            <CardContent className="pt-6">
              <p className="text-terminal-dim">
                Could not find research session for session key: <br />
                <span className="font-mono text-xs text-terminal-text break-all mt-2 block">
                  {decodedKey}
                </span>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const topic = researchState?.topic || researchSession.topic || "Research Session";
  const status = researchState?.status || researchSession.status || "active";
  const startedAt = researchState?.startedAt || researchSession.startedAt;
  const completedAt = researchState?.completedAt || researchSession.completedAt;
  const outputPath = researchState?.outputPath || researchSession.outputPath;
  const findings = researchState?.findings || [];

  // Calculate duration
  let duration: number | undefined;
  if (completedAt && startedAt) {
    duration = Math.floor(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );
  } else if (researchSession.duration) {
    duration = researchSession.duration;
  }

  return (
    <div className="min-h-screen bg-terminal-bg p-8">
      <nav className="text-terminal-dim font-mono text-sm mb-6">
        <Link href="/" className="hover:text-terminal-green transition-colors">
          Factory View
        </Link>
        <span className="mx-2">/</span>
        <span className="text-terminal-green">Research</span>
      </nav>

      <ResearchHeader
        topic={topic}
        status={status}
        startedAt={startedAt}
        duration={duration}
        model={researchSession.model}
      />

      <main className="space-y-6">
        {/* Research Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">Research Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim font-mono">Session Key</span>
              <span className="text-terminal-text font-mono text-xs break-all">
                {decodedKey}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim font-mono">Session ID</span>
              <span className="text-terminal-text font-mono text-xs">
                {researchSession.sessionId}
              </span>
            </div>
            {researchSession.model && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-terminal-dim font-mono">Model</span>
                <span className="text-terminal-text font-mono">
                  {researchSession.model}
                </span>
              </div>
            )}
            {topic && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-terminal-dim font-mono">Topic</span>
                <span className="text-terminal-text font-mono text-right max-w-md">
                  {topic}
                </span>
              </div>
            )}
            {outputPath && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-terminal-dim font-mono">Output</span>
                <span className="text-terminal-text font-mono text-xs text-right max-w-md break-all">
                  {outputPath}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Research Findings */}
        {findings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-lg">Research Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {findings.map((finding, idx) => (
                  <li key={idx} className="text-sm font-mono text-terminal-text">
                    <span className="text-terminal-green mr-2">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Subagents Section */}
        {researchState?.subagents && researchState.subagents.length > 0 && (
          <section>
            <h2 className="text-xl font-mono font-bold text-terminal-green mb-4">
              Research Subagents
            </h2>
            <ResearchSubagentGrid subagents={researchState.subagents} />
          </section>
        )}

        {/* Session Logs */}
        <LogsSection sessionKey={decodedKey} />
      </main>
    </div>
  );
}
