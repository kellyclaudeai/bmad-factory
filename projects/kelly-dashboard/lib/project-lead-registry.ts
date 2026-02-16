import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export type ProjectLeadRegistry = {
  version: number;
  updatedAt?: string;
  projects: Record<
    string,
    {
      virtualPeer: string;
      sessionKey: string;
      createdAt?: string;
      status?: "active" | "closed";
    }
  >;
};

export function getProjectLeadRegistryPath(): string {
  const env = process.env.PROJECT_LEAD_REGISTRY_PATH;
  if (env && env.trim()) return env.trim();

  const home = process.env.HOME || homedir() || "/Users/austenallred";
  return path.join(home, ".openclaw", "workspace-kelly", "project-lead-registry.json");
}

export function readProjectLeadRegistry(): ProjectLeadRegistry | null {
  try {
    const registryPath = getProjectLeadRegistryPath();
    const raw = readFileSync(registryPath, "utf-8");
    return JSON.parse(raw) as ProjectLeadRegistry;
  } catch {
    return null;
  }
}

export function lookupProjectIdBySessionKey(sessionKey: string): string | undefined {
  const reg = readProjectLeadRegistry();
  if (!reg?.projects) return undefined;

  for (const [projectId, entry] of Object.entries(reg.projects)) {
    if (!entry) continue;
    if (entry.sessionKey === sessionKey) return projectId;
    if (sessionKey.includes(entry.virtualPeer)) return projectId;
  }

  return undefined;
}
