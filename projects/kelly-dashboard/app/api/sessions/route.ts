import { NextResponse } from "next/server";
import { getGatewayToken } from "@/lib/gateway-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FrontendSession = {
  sessionKey: string;
  label: string;
  agentType: string;
  projectId?: string;
  status: string;
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  duration?: number;
};

type GatewaySession = {
  sessionId: string;
  sessionKey?: string;
  label?: string;
  status?: string;
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
    if (match) {
      return match[1];
    }
  }
  
  // Try label if available
  if (label && label.startsWith("project:")) {
    return label.replace("project:", "");
  }
  
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
    const response = await fetch("http://localhost:3000/api/sessions_list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Gateway API returned ${response.status}`);
    }

    const gatewaySessions = (await response.json()) as GatewaySession[];
    
    // Transform to frontend format
    const sessions: FrontendSession[] = gatewaySessions
      .filter((s) => s.sessionKey) // Only sessions with keys
      .map((session) => {
        const sessionKey = session.sessionKey || session.sessionId;
        const agentType = extractAgentType(sessionKey);
        const projectId = extractProjectId(sessionKey, session.label);
        const label = session.label || extractLabel(sessionKey);

        return {
          sessionKey,
          label,
          agentType,
          projectId,
          status: session.status || "active",
          lastActivity: session.lastActivity || new Date().toISOString(),
          model: session.model,
          tokens: session.tokens,
          duration: undefined, // Could calculate if we had startedAt
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
