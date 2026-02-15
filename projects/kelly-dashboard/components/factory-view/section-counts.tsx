"use client";

import { useAutoRefresh } from "@/components/shared/auto-refresh";

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
  const projectLeads =
    sessions?.filter(
      (s) => s.agentType === "project-lead" || s.sessionKey.includes("project-lead"),
    ) ?? [];
  return <>{projectLeads.length}</>;
}
