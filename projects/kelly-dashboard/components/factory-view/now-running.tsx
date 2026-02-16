"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Session = {
  sessionKey: string;
  label: string;
  agentType: string;
  projectId?: string;
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
    case "idle":
    case "waiting":
      return "bg-terminal-amber/10 text-terminal-amber border-terminal-amber";
    default:
      return "bg-terminal-text/10 text-terminal-text border-terminal-text";
  }
}

function getAgentDisplayName(agentType: string): string {
  if (agentType === "bmad-bmm-barry") return "Barry";
  if (agentType === "bmad-bmm-mary") return "Mary";
  return agentType;
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
  // Prefer a human-friendly displayName when it looks like a local UI label.
  const dn = (session.displayName || "").trim();
  if (dn && (dn === "openclaw-tui" || dn === "heartbeat")) return dn;

  // Otherwise fall back to where the last interaction came from.
  const ch = (session.lastChannel || session.channel || "").trim();
  if (ch) return ch;

  // As a last resort, show the raw displayName.
  if (dn) return dn;

  return "unknown";
}

function AgentCard({ session }: { session: Session }) {
  const agentName = getAgentDisplayName(session.agentType);
  const sessionName = getSessionShortName(session.sessionKey);
  const platform = getPlatformLabel(session);
  const relativeTime = formatRelativeTime(session.lastActivity);
  const destination = session.projectId
    ? `/project/${session.projectId}`
    : `/session/${encodeURIComponent(session.sessionKey)}`;

  return (
    <Link
      href={destination}
      className="block h-full"
      aria-label={`View details for ${agentName} agent`}
    >
      <Card
        className="h-[176px] w-full cursor-pointer transition-all duration-200 hover:border-terminal-green hover:shadow-[0_0_10px_rgba(0,255,136,0.1)] focus:ring-2 focus:ring-terminal-green"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = destination;
          }
        }}
      >
        <CardContent className="pt-5 h-full flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 text-terminal-text font-mono font-semibold truncate whitespace-nowrap">
              {agentName}
            </span>
            <Badge
              variant="outline"
              className={`text-xs font-mono ${getStatusColor(session.status)}`}
            >
              {session.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm text-terminal-dim font-mono truncate">
            {session.label || "\u00A0"}
          </div>
          <div className="text-xs text-terminal-dim font-mono truncate">
            Session: <span className="text-terminal-text">{sessionName}</span>
            <span className="text-terminal-dim"> • </span>
            Platform: <span className="text-terminal-text">{platform}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-terminal-dim font-mono">Updated</span>
            <span
              className="text-terminal-text font-mono"
              title={new Date(session.lastActivity).toLocaleString()}
            >
              {relativeTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="h-[176px] w-full animate-pulse">
          <CardContent className="pt-5 h-full flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NowRunning() {
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
            ⚠️ Failed to load running agents
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filter for non-project-lead sessions (Barry, Mary, independent agents)
  const runningAgents = sessions?.filter((s) =>
    s.agentType !== "project-lead" && !s.sessionKey.includes("project-lead")
  ) || [];

  if (runningAgents.length === 0) {
    return (
      <Card className="border-terminal-dim/30 bg-terminal-card">
        <CardContent className="pt-6 text-center">
          <p className="text-terminal-dim font-mono text-sm">
            No other agents running
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {runningAgents.map((session) => (
        <AgentCard key={session.sessionKey} session={session} />
      ))}
    </div>
  );
}
