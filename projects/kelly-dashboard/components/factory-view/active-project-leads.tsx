"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Session = {
  sessionKey: string;
  sessionId?: string;
  label: string;
  agentType: string;
  projectId?: string;
  projectTitle?: string;
  projectDescription?: string;
  status: string;
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  duration?: number;
  channel?: string;
  lastChannel?: string;
  displayName?: string;
};

function formatRelativeTime(isoTimestamp: string): string {
  const now = new Date();
  const then = new Date(isoTimestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-terminal-green/10 text-terminal-green border-terminal-green";
    case "awaiting-qa":
    case "awaiting_qa":
      return "bg-purple-500/10 text-purple-400 border-purple-500";
    case "idle":
    case "waiting":
      return "bg-terminal-amber/10 text-terminal-amber border-terminal-amber";
    case "completed":
      return "bg-terminal-dim/10 text-terminal-dim border-terminal-dim";
    case "failed":
      return "bg-terminal-red/10 text-terminal-red border-terminal-red";
    default:
      return "bg-terminal-text/10 text-terminal-text border-terminal-text";
  }
}

function humanizeProjectId(projectId: string): string {
  return projectId
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferProjectOneLiner(projectId: string): string {
  const id = projectId.toLowerCase();

  // Try a few common patterns (good enough for a dashboard scanline).
  if (id?.includes("meeting") && id?.includes("time")) return "Schedule + track meeting time";
  if (id?.includes("meeting")) return "Meeting scheduling";
  if (id?.includes("fasting")) return "Fasting timer + streak tracking";
  if (id?.includes("hydration")) return "Hydration tracking";
  if (id?.includes("bug") && id?.includes("dictionary")) return "Bug dictionary / lookup";
  if (id?.includes("dictionary")) return "Reference / lookup tool";
  if (id?.includes("dashboard")) return "Factory dashboard / monitoring UI";
  if (id?.includes("tracker")) return "A lightweight tracking app";
  if (id?.includes("timer")) return "A simple timer utility";

  return "Project";
}

function getSessionShortName(sessionKey: string): string {
  const parts = sessionKey.split(":");
  const subagentIdx = parts.indexOf("subagent");
  if (subagentIdx >= 0) {
    const id = parts[subagentIdx + 1];
    return id ? `subagent:${id.slice(0, 8)}` : "subagent";
  }
  return parts[2] || sessionKey;
}

function getPlatformLabel(session: Session): string {
  const dn = (session.displayName || "").trim();
  if (dn && (dn === "openclaw-tui" || dn === "heartbeat")) return dn;

  const ch = (session.lastChannel || session.channel || "").trim();
  if (ch) return ch;

  if (dn) return dn;

  return "unknown";
}

function ProjectLeadCard({ session }: { session: Session }) {
  const projectId = session.projectId || session.sessionId?.slice(0, 8) || session.sessionKey?.split(':').pop()?.slice(0, 8) || 'unknown';
  const title = session.projectTitle || (session.projectId ? humanizeProjectId(session.projectId) : "Unknown Project");
  const oneLiner = session.projectDescription || (session.projectId ? inferProjectOneLiner(session.projectId) : "Project session (no registry entry)");
  const status = session.status || "active";
  const relativeTime = formatRelativeTime(session.lastActivity);
  const sessionName = getSessionShortName(session.sessionKey);
  const platform = getPlatformLabel(session);

  return (
    <Link
      href={`/project/${projectId}`}
      className="block"
      aria-label={`View details for ${title} project`}
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:border-terminal-green hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] focus:ring-2 focus:ring-terminal-green"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = `/project/${projectId}`;
          }
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg font-mono text-terminal-green truncate">
                {title}
              </CardTitle>
              <div className="mt-1 text-xs font-mono text-terminal-dim truncate" title={projectId}>
                {oneLiner}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-mono ${getStatusColor(status)}`}
            >
              {status === "awaiting-qa" ? "⏳ AWAITING QA" : status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-terminal-dim font-mono">Model</span>
            <span className="text-terminal-text font-mono">{session.model || "unknown"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-terminal-dim font-mono">Last Activity</span>
            <span
              className="text-terminal-text font-mono"
              title={new Date(session.lastActivity).toLocaleString()}
            >
              {relativeTime}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-terminal-dim font-mono">Session</span>
            <span className="text-terminal-text font-mono">{sessionName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-terminal-dim font-mono">Platform</span>
            <span className="text-terminal-text font-mono">{platform}</span>
          </div>
          {session.tokens && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim font-mono">Tokens</span>
              <span className="text-terminal-text font-mono">
                {(session.tokens.input + session.tokens.output).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ActiveProjectLeads() {
  const { data: sessions, isLoading, error } = useAutoRefresh<Session[]>(
    "/api/sessions",
    10000
  );

  if (isLoading && !sessions) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-terminal-red/30 bg-terminal-red/5">
        <CardContent className="pt-6">
          <p className="text-terminal-red font-mono text-sm">
            ⚠️ Failed to load active projects
          </p>
          <p className="text-terminal-dim font-mono text-xs mt-2">
            Check that the OpenClaw Gateway is reachable (default port 18789)
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filter for project-lead sessions (show even without projectId)
  const projectLeads = sessions?.filter(
    (s) => s.agentType === "project-lead" || s.sessionKey?.includes("project-lead"),
  ) || [];

  // Sort by most recent activity
  projectLeads.sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  if (projectLeads.length === 0) {
    return (
      <Card className="border-terminal-amber/30 bg-terminal-amber/5">
        <CardContent className="pt-6 text-center">
          <p className="text-terminal-amber font-mono text-sm">
            No active project leads
          </p>
          <p className="text-terminal-dim font-mono text-xs mt-2">
            Projects will appear here when they start
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projectLeads.map((session) => (
        <ProjectLeadCard key={session.sessionKey} session={session} />
      ))}
    </div>
  );
}
