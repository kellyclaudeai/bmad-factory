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
          const stats = await fs.stat(filePath);
          
          if (stats.mtimeMs < cutoff) continue;
          
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
          
          // Use real session key if found, otherwise use reconstructed one
          const finalSessionKey = realSessionKey || buildSessionKey(agentName, sessionId);
          const agentType = extractAgentType(agentName);
          const projectId = await extractProjectId(finalSessionKey, registryMapping);
          
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
