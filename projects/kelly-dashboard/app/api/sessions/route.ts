import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENTS_ROOT = '/Users/austenallred/.openclaw/agents';
const PROJECTS_ROOT = '/Users/austenallred/clawd/projects';
const REGISTRY_PATH = path.join(PROJECTS_ROOT, 'projects-registry.json');

type FrontendSession = {
  sessionKey: string;
  sessionId: string;
  label: string;
  agentType: string;
  projectId?: string;
  status: string; // 'active' | 'waiting' | 'awaiting-qa' | 'paused'
  phase?: string; // planning | implementation | qa | shipped — matches detail page badge
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  channel?: string;
  displayName?: string;
};

// New thin index schema (projects-registry.json v2.0)
type RegistryProject = {
  id: string;
  name?: string;
  path?: string;
  plSession?: string;
  phase?: string; // planning | implementation | qa | shipped | paused
  createdAt?: string;
};

// Cache for agent sessions.json reverse maps
const agentSessionsCache = new Map<string, { uuidToSessionKey: Map<string, string>; timestamp: number }>();
const AGENT_SESSIONS_CACHE_TTL = 15000;

let registryCache: { projects: RegistryProject[]; timestamp: number } | null = null;
const REGISTRY_CACHE_TTL = 10000;

async function loadRegistry(): Promise<RegistryProject[]> {
  if (registryCache && Date.now() - registryCache.timestamp < REGISTRY_CACHE_TTL) {
    return registryCache.projects;
  }
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf8');
    const reg: { projects: RegistryProject[] } = JSON.parse(content);
    registryCache = { projects: reg.projects, timestamp: Date.now() };
    return reg.projects;
  } catch {
    return [];
  }
}

async function loadAgentSessionsJson(agentName: string): Promise<Map<string, string>> {
  const cached = agentSessionsCache.get(agentName);
  if (cached && Date.now() - cached.timestamp < AGENT_SESSIONS_CACHE_TTL) {
    return cached.uuidToSessionKey;
  }
  const uuidToSessionKey = new Map<string, string>();
  try {
    const sessionsJsonPath = path.join(AGENTS_ROOT, agentName, 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsJsonPath, 'utf8');
    const sessionsMap: Record<string, { sessionId: string }> = JSON.parse(content);
    for (const [sessionKey, entry] of Object.entries(sessionsMap)) {
      if (entry?.sessionId) {
        uuidToSessionKey.set(entry.sessionId, sessionKey);
      }
    }
  } catch {
    // sessions.json might not exist
  }
  agentSessionsCache.set(agentName, { uuidToSessionKey, timestamp: Date.now() });
  return uuidToSessionKey;
}

async function hasLockFile(sessionFilePath: string): Promise<boolean> {
  try {
    await fs.access(sessionFilePath + '.lock');
    return true;
  } catch {
    return false;
  }
}

async function getSessionFileInfo(agentName: string, sessionId: string): Promise<{
  mtime: number;
  hasLock: boolean;
} | null> {
  const filePath = path.join(AGENTS_ROOT, agentName, 'sessions', `${sessionId}.jsonl`);
  try {
    const stats = await fs.stat(filePath);
    const lock = await hasLockFile(filePath);
    return { mtime: stats.mtimeMs, hasLock: lock };
  } catch {
    return null;
  }
}

/**
 * PRIMARY: Build project-lead cards from registry.
 * Registry is the source of truth for project state.
 * Lock file is a secondary indicator (active vs waiting).
 */
async function buildProjectLeadSessions(): Promise<FrontendSession[]> {
  const projects = await loadRegistry();
  const plSessionsMap = await loadAgentSessionsJson('project-lead');

  // Reverse: sessionKey -> sessionId
  const sessionKeyToId = new Map<string, string>();
  for (const [id, key] of plSessionsMap.entries()) {
    sessionKeyToId.set(key, id);
  }

  const sessions: FrontendSession[] = [];

  // Show only projects being actively worked on (exclude discovery queue and shipped)
  const activeProjects = projects.filter(
    p => p.phase && p.phase !== 'shipped' && p.phase !== 'discovery'
  );

  for (const project of activeProjects) {
    const sessionKey =
      project.plSession ||
      `agent:project-lead:project-${project.id}`;

    // Determine status from registry phase + lock file
    let status: string;
    let lastActivity = project.createdAt || new Date().toISOString();

    const sessionId = sessionKeyToId.get(sessionKey);
    let hasLock = false;

    if (sessionId) {
      const fileInfo = await getSessionFileInfo('project-lead', sessionId);
      if (fileInfo) {
        hasLock = fileInfo.hasLock;
        lastActivity = new Date(fileInfo.mtime).toISOString();
      }
    }

    if (project.phase === 'qa') {
      status = hasLock ? 'active' : 'awaiting-qa';
    } else if (project.phase === 'paused') {
      status = 'paused';
    } else if (hasLock) {
      status = 'active'; // Mid-LLM-turn right now
    } else {
      status = 'waiting'; // PL idle between turns (subagent running)
    }

    sessions.push({
      sessionKey,
      sessionId: sessionId || `registry-${project.id}`,
      label: project.name || project.id,
      agentType: 'project-lead',
      projectId: project.id,
      status,
      phase: project.phase,
      lastActivity,
      displayName: project.name || project.id,
    });
  }

  return sessions;
}

/**
 * SECONDARY: Scan lock files for non-PL agents (Murat, Amelia, Bob, etc.)
 * These are shown as sub-agent activity cards, not project cards.
 * Lock file IS the right signal here — sub-agents are ephemeral.
 */
async function buildSubAgentSessions(): Promise<FrontendSession[]> {
  const sessions: FrontendSession[] = [];
  const PL_AGENT = 'project-lead'; // handled separately above

  try {
    const agentDirs = await fs.readdir(AGENTS_ROOT, { withFileTypes: true });

    for (const dir of agentDirs) {
      if (!dir.isDirectory()) continue;
      const agentName = dir.name;
      if (agentName === PL_AGENT) continue; // Skip — handled by registry

      const sessionsDir = path.join(AGENTS_ROOT, agentName, 'sessions');

      try {
        const files = await fs.readdir(sessionsDir);

        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;
          if (file.includes('deleted') || file.includes('closed') || file.includes('frozen')) continue;

          const filePath = path.join(sessionsDir, file);
          const lockPath = filePath + '.lock';

          // Sub-agents: lock file = the right signal (ephemeral workers)
          let hasLock = false;
          try {
            await fs.access(lockPath);
            hasLock = true;
          } catch {
            continue; // Sub-agent not running = don't show
          }

          if (!hasLock) continue;

          const stats = await fs.stat(filePath);
          const sessionId = file.replace('.jsonl', '');

          // Get real session key from sessions.json
          const uuidToSessionKey = await loadAgentSessionsJson(agentName);
          const sessionKey = uuidToSessionKey.get(sessionId) || `agent:${agentName}:${sessionId.slice(0, 8)}`;

          sessions.push({
            sessionKey,
            sessionId,
            label: sessionKey,
            agentType: agentName,
            status: 'active',
            lastActivity: new Date(stats.mtimeMs).toISOString(),
            displayName: sessionKey,
          });
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error('Error scanning sub-agent sessions:', error);
  }

  return sessions;
}

export async function GET(request: Request) {
  try {
    const [plSessions, subAgentSessions] = await Promise.all([
      buildProjectLeadSessions(),
      buildSubAgentSessions(),
    ]);

    return NextResponse.json([...plSessions, ...subAgentSessions]);
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error?.message },
      { status: 500 }
    );
  }
}
