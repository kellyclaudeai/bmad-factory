import { NextResponse } from "next/server";
import { getGatewayPort, getGatewayToken } from "@/lib/gateway-token";
import { lookupProjectIdBySessionKey, lookupProjectMetaByProjectId } from "@/lib/project-lead-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FrontendSession = {
  sessionKey: string;
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

function extractProjectId(sessionKey: string, label?: string): string | undefined {
  // Try to extract project ID from session key
  // e.g., "agent:project-lead:project-calc-basic" -> "calc-basic"
  if (sessionKey.includes(":project-")) {
    const match = sessionKey.match(/:project-([^:]+)/);
    if (match) return match[1];
  }

  const raw = (label || "").trim();
  if (!raw) return undefined;

  // Accept common label conventions we use for ephemeral project-lead runs
  // - project:calc-basic
  // - pl-calc-basic
  // - pl:calc-basic
  // - project-lead:calc-basic
  if (raw.startsWith("project:")) return raw.slice("project:".length);

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
    const response = await fetch(`http://127.0.0.1:${port}/tools/invoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "sessions_list",
        action: "json",
        // Return recent sessions for audit + cleanup.
        // We intentionally keep a long window so stale project-lead sessions stay visible until you close them.
        args: { activeMinutes: 10080, limit: 200, messageLimit: 0 },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Gateway API returned ${response.status}`);
    }

    const payload = (await response.json()) as { ok: boolean; result?: any; error?: any };
    const result = payload?.result;

    // tools/invoke returns { ok: true, result } where result shape can vary.
    // Common shapes:
    // - result = { sessions: [...] }
    // - result = { details: { sessions: [...] } }
    // - result = [ ...sessions ]
    const rawSessions = Array.isArray(result)
      ? result
      : Array.isArray(result?.details?.sessions)
        ? result.details.sessions
        : Array.isArray(result?.sessions)
          ? result.sessions
          : [];

    const gatewaySessions = rawSessions as GatewaySession[];
    
    // Transform to frontend format
    const sessions: FrontendSession[] = gatewaySessions
      .filter((s) => s.key || s.sessionKey) // Only sessions with keys
      .map((session) => {
        const sessionKey = session.key || session.sessionKey || session.sessionId;
        const agentType = extractAgentType(sessionKey);
        const projectId =
          extractProjectId(sessionKey, session.label) || lookupProjectIdBySessionKey(sessionKey);
        const meta = projectId ? lookupProjectMetaByProjectId(projectId) : undefined;
        const label = session.label || session.displayName || extractLabel(sessionKey);

        return {
          sessionKey,
          label,
          agentType,
          projectId,
          projectTitle: meta?.title,
          projectDescription: meta?.description,
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
          channel: (session as any).channel,
          lastChannel: (session as any).lastChannel,
          displayName: session.displayName,
        };
      });

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
