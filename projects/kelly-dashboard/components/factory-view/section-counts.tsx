"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";
import type { ResearchSession } from "@/app/api/research-sessions/route";

type Session = {
  sessionKey: string;
  agentType: string;
};

export function SessionsCount() {
  const { data: sessions } = useAutoRefresh<Session[]>("/api/sessions", 10000);
  const count = sessions?.length ?? 0;
  return <>{count}</>;
}

export function ActiveProjectsCount() {
  const { data: sessions } = useAutoRefresh<Session[]>("/api/sessions", 10000);
  // Only count project-lead sessions with a projectId (matches display logic)
  const projectLeads =
    sessions?.filter(
      (s) => s.projectId && (s.agentType === "project-lead" || s.sessionKey.includes("project-lead")),
    ) ?? [];
  return <>{projectLeads.length}</>;
}

export function ResearchCount() {
  const { data: sessions } = useAutoRefresh<ResearchSession[]>("/api/research-sessions", 10000);
  const count = sessions?.length ?? 0;
  return <>{count}</>;
}
