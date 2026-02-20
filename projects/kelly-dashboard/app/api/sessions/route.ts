import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENTS_ROOT = '/Users/austenallred/.openclaw/agents';
const PROJECTS_ROOT = '/Users/austenallred/clawd/projects';
const REGISTRY_PATH = path.join(PROJECTS_ROOT, 'project-registry.json');

type FrontendSession = {
  sessionKey: string;
  sessionId: string;
  label: string;
  agentType: string;
  projectId?: string;
  status: string;
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  channel?: string;
  displayName?: string;
};

type ProjectRegistryEntry = {
  id: string;
  name?: string;
  implementation?: {
    plSession?: string;
  };
};

let registryCache: { sessionToProjectId: Map<string, string>; timestamp: number } | null = null;
const REGISTRY_CACHE_TTL = 30000;

// Per-agent cache: agentName -> { uuidToSessionKey: Map, timestamp }
const agentSessionsCache = new Map<string, { uuidToSessionKey: Map<string, string>; timestamp: number }>();
const AGENT_SESSIONS_CACHE_TTL = 15000;

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
    // sessions.json might not exist; just return empty map
  }

  agentSessionsCache.set(agentName, { uuidToSessionKey, timestamp: Date.now() });
  return uuidToSessionKey;
}

type RegistryProjectFull = {
  id: string;
  name?: string;
  state?: string;
  paused?: boolean;
  timeline?: { lastUpdated?: string; startedAt?: string };
  implementation?: {
    plSession?: string;
    projectDir?: string;
    qaUrl?: string;
    deployedUrl?: string;
  };
};

async function loadPendingQaProjects(): Promise<RegistryProjectFull[]> {
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf8');
    const registry: { projects: RegistryProjectFull[] } = JSON.parse(content);
    return registry.projects.filter(p => p.state === 'pending-qa' && !p.paused);
  } catch {
    return [];
  }
}

async function loadRegistryMapping(): Promise<Map<string, string>> {
  if (registryCache && Date.now() - registryCache.timestamp < REGISTRY_CACHE_TTL) {
    return registryCache.sessionToProjectId;
  }

  const mapping = new Map<string, string>();

  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf8');
    const registry: { projects: ProjectRegistryEntry[] } = JSON.parse(content);

    for (const project of registry.projects) {
      if (project.implementation?.plSession) {
        mapping.set(project.implementation.plSession, project.id);
      }
    }

    registryCache = {
      sessionToProjectId: mapping,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn('Failed to load project registry:', error);
  }

  return mapping;
}

function extractAgentType(agentName: string): string {
  return agentName;
}

function buildSessionKey(agentName: string, sessionId: string): string {
  // Try to reconstruct the session key from agent name + session ID
  // This is imperfect but better than nothing
  return `agent:${agentName}:${sessionId.slice(0, 8)}`;
}

async function extractProjectId(
  sessionKey: string,
  registryMapping: Map<string, string>
): Promise<string | undefined> {
  // Direct match first
  if (registryMapping.has(sessionKey)) {
    return registryMapping.get(sessionKey);
  }
  
  // Try to extract from session key pattern
  if (sessionKey.includes(':project-lead:project-')) {
    const match = sessionKey.match(/:project-lead:project-([^:]+)/);
    return match?.[1];
  }
  
  if (sessionKey.includes(':project-')) {
    const match = sessionKey.match(/:project-([^:]+)/);
    if (match?.[1] && match[1] !== 'lead') {
      return match[1];
    }
  }
  
  return undefined;
}

async function scanSessionFiles(activeMinutes: number): Promise<FrontendSession[]> {
  const now = Date.now();
  const cutoff = now - (activeMinutes * 60 * 1000);
  const sessions: FrontendSession[] = [];
  
  const registryMapping = await loadRegistryMapping();
  
  // For project-lead sessions: show ALL (ignore time filter)
  // For other agents: use time filter as normal

  try {
    const agentDirs = await fs.readdir(AGENTS_ROOT, { withFileTypes: true });
    console.log(`[DEBUG] Found ${agentDirs.length} agent directories`);
    
    for (const dir of agentDirs) {
      if (!dir.isDirectory()) continue;
      
      const agentName = dir.name;
      const sessionsDir = path.join(AGENTS_ROOT, agentName, 'sessions');
      
      try {
        const files = await fs.readdir(sessionsDir);
        
        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;
          if (file.includes('deleted') || file.includes('closed') || file.includes('frozen')) continue;
          
          const filePath = path.join(sessionsDir, file);
          const lockPath = filePath + '.lock';
          
          // CRITICAL: Only show sessions with active lock files
          // This prevents ghost sessions from appearing in the UI
          let hasLock = false;
          try {
            await fs.access(lockPath);
            hasLock = true;
          } catch {
            // No lock file = session not active
            continue;
          }
          
          if (!hasLock) continue;
          
          const stats = await fs.stat(filePath);
          
          console.log(`[DEBUG] Found active session in ${agentName}: ${file}`);
          const sessionId = file.replace('.jsonl', '');
          
          // Try to read first line for metadata and real session key
          let model: string | undefined;
          let channel: string | undefined;
          let realSessionKey: string | undefined;
          
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const firstLine = content.split('\n')[0];
            if (firstLine) {
              const data = JSON.parse(firstLine);
              model = data.model;
              channel = data.channel || data.deliveryContext?.channel;
              realSessionKey = data.sessionKey || data.key;
            }
          } catch {
            // Skip metadata if parse fails
          }

          // If JSONL first line doesn't have sessionKey, check sessions.json reverse map
          // This handles the common case where OpenClaw doesn't embed sessionKey in JSONL
          if (!realSessionKey) {
            const uuidToSessionKey = await loadAgentSessionsJson(agentName);
            realSessionKey = uuidToSessionKey.get(sessionId);
          }
          
          // Use real session key if found, otherwise fall back to UUID-derived key
          const finalSessionKey = realSessionKey || buildSessionKey(agentName, sessionId);
          const agentType = extractAgentType(agentName);
          const projectId = await extractProjectId(finalSessionKey, registryMapping);
          
          // For project-lead: only include if it has a projectId (matches registry)
          if (agentType === 'project-lead' && !projectId) {
            continue;
          }
          
          sessions.push({
            sessionKey: finalSessionKey,
            sessionId,
            label: finalSessionKey,
            agentType,
            projectId,
            status: 'active',
            lastActivity: new Date(stats.mtimeMs).toISOString(),
            model,
            channel,
            displayName: finalSessionKey,
          });
        }
      } catch (error) {
        // Skip agents without sessions directory
        continue;
      }
    }
  } catch (error) {
    console.error('Error scanning session files:', error);
  }

  // Inject synthetic sessions for pending-qa projects (no live session needed)
  const pendingQaProjects = await loadPendingQaProjects();
  const liveProjectIds = new Set(sessions.filter(s => s.projectId).map(s => s.projectId!));

  for (const project of pendingQaProjects) {
    if (liveProjectIds.has(project.id)) continue; // Already shown via live session
    sessions.push({
      sessionKey: project.implementation?.plSession || `agent:project-lead:project-${project.id}`,
      sessionId: `pending-qa-${project.id}`,
      label: project.name || project.id,
      agentType: 'project-lead',
      projectId: project.id,
      status: 'awaiting-qa',
      lastActivity: project.timeline?.lastUpdated || project.timeline?.startedAt || new Date().toISOString(),
      model: undefined,
      channel: undefined,
      displayName: project.name || project.id,
    });
  }

  return sessions;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const activeMinutes = parseInt(url.searchParams.get('activeMinutes') || '15', 10);
    
    const sessions = await scanSessionFiles(activeMinutes);
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error?.message },
      { status: 500 }
    );
  }
}
