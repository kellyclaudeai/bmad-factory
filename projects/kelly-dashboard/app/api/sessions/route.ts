import { NextResponse } from "next/server";
import { getGatewayPort, getGatewayToken } from "@/lib/gateway-token";
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FrontendSession = {
  sessionKey: string;
  sessionId: string;
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

type GatewaySession = {
  sessionId: string;
  key?: string; // gateway uses `key`
  sessionKey?: string; // some legacy shapes
  label?: string;
  displayName?: string;
  status?: string;
  updatedAt?: number | string;
  lastActivity?: string;
  model?: string;
  tokens?: { input: number; output: number };
  [key: string]: any;
};

let cache: { data: FrontendSession[]; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds

const PROJECTS_ROOT = '/Users/austenallred/clawd/projects';
const REGISTRY_PATH = path.join(PROJECTS_ROOT, 'project-registry.json');

type ProjectRegistryEntry = {
  id: string;
  name?: string;
  implementation?: {
    plSession?: string;
    projectDir?: string;
  };
};

type ProjectRegistry = {
  projects: ProjectRegistryEntry[];
};

// Cache registry lookups (refresh every 30 seconds)
let registryCache: { sessionToProjectId: Map<string, string>; timestamp: number } | null = null;
const REGISTRY_CACHE_TTL = 30000; // 30 seconds

async function loadRegistryMapping(): Promise<Map<string, string>> {
  // Check cache
  if (registryCache && Date.now() - registryCache.timestamp < REGISTRY_CACHE_TTL) {
    return registryCache.sessionToProjectId;
  }

  const mapping = new Map<string, string>();

  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf8');
    const registry: ProjectRegistry = JSON.parse(content);

    for (const project of registry.projects) {
      if (project.implementation?.plSession) {
        mapping.set(project.implementation.plSession, project.id);
      }
    }

    // Update cache
    registryCache = {
      sessionToProjectId: mapping,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.warn('Failed to load project registry for session mapping:', error);
    // Return empty map on error (graceful degradation)
  }

  return mapping;
}

function extractAgentType(sessionKey: string): string {
  // Extract agent type from session key
  // e.g., "agent:project-lead:project-calc-basic" -> "project-lead"
  // e.g., "agent:bmad-bmm-barry:subagent:..." -> "bmad-bmm-barry"
  const parts = sessionKey.split(":");
  if (parts.length >= 2) {
    return parts[1];
  }
  return "unknown";
}

async function extractProjectId(
  sessionKey: string,
  label?: string,
  registryMapping?: Map<string, string>
): Promise<string | undefined> {
  // FIRST: Check registry mapping for canonical project ID
  // This handles cases where session key != registry ID (e.g., "slacklite" vs "slack-lite-2026-02-18-2310")
  if (registryMapping?.has(sessionKey)) {
    return registryMapping.get(sessionKey);
  }

  // FALLBACK: Try to extract project ID from session key
  const parts = sessionKey.split(":");

  // Preferred canonical form:
  // - "agent:project-lead:project-<id>" -> "<id>"
  // (avoid matching the agent type "project-lead")
  if (parts.length >= 3 && parts[0] === "agent" && parts[1] === "project-lead") {
    const candidate = (parts[2] || "").trim();
    if (!candidate || candidate === "subagent" || candidate === "main" || candidate === "global") {
      return undefined;
    }
    if (candidate.startsWith("project-")) return candidate.slice("project-".length);
    return candidate;
  }

  // Fallback for other agent session key conventions (non project-lead sessions).
  // NOTE: do not use this on project-lead sessions or it will match ":project-lead".
  if (sessionKey.includes(":project-")) {
    const match = sessionKey.match(/:project-([^:]+)/);
    if (match?.[1] && match[1] !== "lead") return match[1];
  }

  const raw = (label || "").trim();
  if (!raw) return undefined;

  // Accept common label conventions we use for ephemeral project-lead runs
  // - project:calc-basic
  // - pl-calc-basic
  // - pl:calc-basic
  // - project-lead:calc-basic
  if (raw.startsWith("project:")) return raw.slice("project:".length);

  // Common shorthands
  if (raw.startsWith("pl-mtt")) return "meeting-time-tracker";

  const m = raw.match(/^(?:pl|project|project-lead)[-:](.+)$/i);
  if (m?.[1]) return m[1].trim();

  return undefined;
}

function extractLabel(sessionKey: string): string {
  // Extract a human-readable label from session key
  const parts = sessionKey.split(":");
  if (parts.length >= 3) {
    // Return the last meaningful part
    return parts.slice(2).join(":");
  }
  return sessionKey;
}

async function fetchFromGateway(): Promise<FrontendSession[]> {
  const token = getGatewayToken();
  
  if (!token) {
    console.warn("No Gateway token found - falling back to empty sessions");
    return [];
  }

  try {
    const port = getGatewayPort();
    
    // Load registry mapping for session key -> canonical project ID
    const registryMapping = await loadRegistryMapping();
    
    // Fetch recently active sessions (15 min window)
    const activeResponse = await fetch(`http://127.0.0.1:${port}/tools/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "sessions_list",
        action: "json",
        args: { activeMinutes: 15, limit: 200, messageLimit: 0 },
      }),
      cache: "no-store",
    });

    if (!activeResponse.ok) {
      throw new Error(`Gateway API returned ${activeResponse.status}`);
    }

    const activePayload = (await activeResponse.json()) as { ok: boolean; result?: any; error?: any };
    const activeResult = activePayload?.result;

    const activeRawSessions = Array.isArray(activeResult)
      ? activeResult
      : Array.isArray(activeResult?.details?.sessions)
        ? activeResult.details.sessions
        : Array.isArray(activeResult?.sessions)
          ? activeResult.sessions
          : [];

    // Fetch ALL project-lead sessions (no time filter)
    const plResponse = await fetch(`http://127.0.0.1:${port}/tools/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "sessions_list",
        action: "json",
        args: { activeMinutes: 10080, limit: 200, messageLimit: 0 }, // 7 days to catch all PL sessions
      }),
      cache: "no-store",
    });

    if (!plResponse.ok) {
      throw new Error(`Gateway API returned ${plResponse.status}`);
    }

    const plPayload = (await plResponse.json()) as { ok: boolean; result?: any; error?: any };
    const plResult = plPayload?.result;

    const plRawSessions = Array.isArray(plResult)
      ? plResult
      : Array.isArray(plResult?.details?.sessions)
        ? plResult.details.sessions
        : Array.isArray(plResult?.sessions)
          ? plResult.sessions
          : [];

    // Filter to only project-lead sessions
    const projectLeadSessions = (plRawSessions as GatewaySession[]).filter((s) => {
      const key = s.key || s.sessionKey || '';
      return key.includes('agent:project-lead:project-');
    });

    // Merge and dedupe (active sessions + all PL sessions)
    const sessionMap = new Map<string, GatewaySession>();
    
    // Add active sessions first
    for (const s of activeRawSessions as GatewaySession[]) {
      const key = s.key || s.sessionKey || s.sessionId;
      sessionMap.set(key, s);
    }
    
    // Add project-lead sessions (will overwrite if already in active)
    for (const s of projectLeadSessions) {
      const key = s.key || s.sessionKey || s.sessionId;
      sessionMap.set(key, s);
    }

    const gatewaySessions = Array.from(sessionMap.values());
    
    // Transform to frontend format (map with async extractProjectId)
    const sessionPromises = gatewaySessions
      .filter((s) => s.key || s.sessionKey) // Only sessions with keys
      .map(async (session) => {
        const sessionKey = session.key || session.sessionKey || session.sessionId;
        const agentType = extractAgentType(sessionKey);
        const projectId = await extractProjectId(sessionKey, session.label, registryMapping);
        const meta = undefined;
        const label = session.label || session.displayName || extractLabel(sessionKey);

        const rawChannel = (session as any).channel as string | undefined;
        const rawLastChannel = (session as any).lastChannel as string | undefined;

        // Normalize a few channel/displayName quirks so the UI reflects how you actually use it.
        // - The local UI is "openclaw-tui" but many sessions show up as channel=webchat.
        // - Some legacy sessions have displayName like "whatsapp:g-agent-main-main" even though they were effectively used via the local UI.
        const normalizedLastChannel = rawLastChannel === "webchat" ? "openclaw-tui" : rawLastChannel;
        const normalizedChannel = rawChannel === "webchat" ? "openclaw-tui" : rawChannel;

        const forceTuiPlatform =
          sessionKey === "agent:main:main" || sessionKey === "agent:kelly-improver:main";

        const normalizedDisplayName = forceTuiPlatform ? "openclaw-tui" : session.displayName;

        const finalLastChannel = forceTuiPlatform
          ? "openclaw-tui"
          : normalizedLastChannel;

        const finalChannel = forceTuiPlatform ? "openclaw-tui" : normalizedChannel;

        return {
          sessionKey,
          sessionId: session.sessionId,
          label,
          agentType,
          projectId,
          projectTitle: undefined,
          projectDescription: undefined,
          status: session.status || "active",
          lastActivity:
            session.lastActivity ||
            (typeof session.updatedAt === "number"
              ? new Date(session.updatedAt).toISOString()
              : typeof session.updatedAt === "string"
                ? session.updatedAt
                : new Date().toISOString()),
          model: session.model,
          tokens: session.tokens,
          duration: undefined, // Could calculate if we had startedAt
          channel: finalChannel,
          lastChannel: finalLastChannel,
          displayName: normalizedDisplayName,
        };
      });

    // Wait for all projectId extractions to complete
    const sessions = await Promise.all(sessionPromises);

    // Sort by lastActivity (most recent first)
    sessions.sort((a, b) => {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return sessions;
  } catch (error) {
    console.error("Error fetching from Gateway:", error);
    return [];
  }
}

export async function GET() {
  try {
    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }
    
    // Fetch from Gateway
    const sessions = await fetchFromGateway();
    
    // Update cache
    cache = {
      data: sessions,
      timestamp: Date.now(),
    };
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error in /api/sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
