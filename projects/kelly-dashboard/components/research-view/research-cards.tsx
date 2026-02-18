"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { ResearchSession } from "@/app/api/research-sessions/route";

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

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const s = Math.floor(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM ? `${h}h ${remM}m` : `${h}h`;
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-terminal-green/10 text-terminal-green border-terminal-green";
    case "complete":
    case "completed":
      return "bg-terminal-dim/10 text-terminal-dim border-terminal-dim";
    case "failed":
      return "bg-terminal-red/10 text-terminal-red border-terminal-red";
    default:
      return "bg-terminal-text/10 text-terminal-text border-terminal-text";
  }
}

function ResearchCard({ session }: { session: ResearchSession }) {
  const topic = session.topic || "Research Session";
  const status = session.status || "active";
  const relativeTime = formatRelativeTime(session.lastActivity);

  // Calculate runtime: if active, show time since start; if complete, show duration
  let runtime = "0s";
  if (session.duration) {
    runtime = formatDuration(session.duration);
  } else if (session.startedAt) {
    const now = Date.now();
    const started = new Date(session.startedAt).getTime();
    const elapsed = Math.max(0, Math.floor((now - started) / 1000));
    runtime = formatDuration(elapsed);
  }

  const runtimeLabel = status === "active" ? "Running" : "Completed";

  return (
    <Link
      href={`/research/${encodeURIComponent(session.sessionKey)}`}
      className="block"
      aria-label={`View details for ${topic} research`}
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:border-terminal-green hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] focus:ring-2 focus:ring-terminal-green"
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = `/research/${encodeURIComponent(session.sessionKey)}`;
          }
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg font-mono text-terminal-green truncate">
                {topic}
              </CardTitle>
              <div className="mt-1 text-xs font-mono text-terminal-dim truncate">
                Research Session
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-mono ${getStatusColor(status)}`}
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-terminal-dim font-mono">{runtimeLabel}</span>
            <span className="text-terminal-text font-mono">{runtime}</span>
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
          {session.model && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim font-mono">Model</span>
              <span className="text-terminal-text font-mono">{session.model}</span>
            </div>
          )}
          {session.outputPath && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim font-mono">Output</span>
              <span className="text-terminal-text font-mono text-xs truncate">
                {session.outputPath}
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

export function ResearchCards() {
  const { data: sessions, isLoading, error } = useAutoRefresh<ResearchSession[]>(
    "/api/research-sessions",
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
            ⚠️ Failed to load active research
          </p>
          <p className="text-terminal-dim font-mono text-xs mt-2">
            Check that the OpenClaw Gateway is reachable (default port 18789)
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="border-terminal-amber/30 bg-terminal-amber/5">
        <CardContent className="pt-6 text-center">
          <p className="text-terminal-amber font-mono text-sm">
            No active research
          </p>
          <p className="text-terminal-dim font-mono text-xs mt-2">
            Research sessions appear here while generating project intakes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <ResearchCard key={session.sessionKey} session={session} />
      ))}
    </div>
  );
}
