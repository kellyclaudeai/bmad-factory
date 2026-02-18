import { NextResponse } from "next/server";
import { getGatewayPort, getGatewayToken } from "@/lib/gateway-token";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ResearchSession = {
  sessionKey: string;
  sessionId: string;
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  duration?: number;
  outputPath?: string;
  lastActivity: string;
  model?: string;
};

type GatewaySession = {
  sessionId: string;
  key?: string;
  sessionKey?: string;
  label?: string;
  status?: string;
  updatedAt?: number | string;
  lastActivity?: string;
  model?: string;
  [key: string]: any;
};

type ResearchState = {
  researchId: string;
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  findings?: string[];
  outputPath?: string;
  lastHeartbeat?: string;
};

async function readResearchState(): Promise<ResearchState | null> {
  try {
    const homeDir = os.homedir();
    const statePath = path.join(
      homeDir,
      ".openclaw",
      "agents",
      "research-lead",
      "workspace",
      "research-state.json"
    );
    const contents = await fs.readFile(statePath, "utf-8");
    return JSON.parse(contents) as ResearchState;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}

async function fetchResearchSessions(): Promise<ResearchSession[]> {
  const token = getGatewayToken();

  if (!token) {
    console.warn("No Gateway token found - falling back to empty research sessions");
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
        // Last 7 days = 10080 minutes
        args: { activeMinutes: 10080, limit: 200, messageLimit: 0 },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Gateway API returned ${response.status}`);
    }

    const payload = (await response.json()) as { ok: boolean; result?: any };
    const result = payload?.result;

    const rawSessions = Array.isArray(result)
      ? result
      : Array.isArray(result?.details?.sessions)
        ? result.details.sessions
        : Array.isArray(result?.sessions)
          ? result.sessions
          : [];

    const gatewaySessions = rawSessions as GatewaySession[];

    // Read research-state.json once for all sessions
    const researchState = await readResearchState();

    // Filter for research-lead sessions
    const researchSessions: ResearchSession[] = gatewaySessions
      .filter((s) => {
        const sessionKey = s.key || s.sessionKey || s.sessionId;
        return sessionKey.includes("research-lead");
      })
      .map((session) => {
        const sessionKey = session.key || session.sessionKey || session.sessionId;
        const lastActivity =
          session.lastActivity ||
          (typeof session.updatedAt === "number"
            ? new Date(session.updatedAt).toISOString()
            : typeof session.updatedAt === "string"
              ? session.updatedAt
              : new Date().toISOString());

        // Try to get data from research-state.json first
        let topic = researchState?.topic || session.label || "Research Session";
        let status: "active" | "complete" | "failed" = "active";
        let startedAt = researchState?.startedAt || lastActivity;
        let completedAt = researchState?.completedAt;
        let outputPath = researchState?.outputPath;

        // Override with state file data if available
        if (researchState) {
          status = researchState.status;
          if (researchState.completedAt) {
            completedAt = researchState.completedAt;
          }
        } else {
          // Fallback: infer status from session status
          const sessionStatus = (session.status || "active").toLowerCase();
          if (sessionStatus === "completed" || sessionStatus === "complete") {
            status = "complete";
          } else if (sessionStatus === "failed") {
            status = "failed";
          }
        }

        // Calculate duration if we have start and end times
        let duration: number | undefined;
        if (completedAt && startedAt) {
          duration = Math.floor(
            (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
          );
        }

        return {
          sessionKey,
          sessionId: session.sessionId,
          topic,
          status,
          startedAt,
          completedAt,
          duration,
          outputPath,
          lastActivity,
          model: session.model,
        };
      });

    // Sort by lastActivity (most recent first)
    researchSessions.sort((a, b) => {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return researchSessions;
  } catch (error) {
    console.error("Error fetching research sessions:", error);
    return [];
  }
}

export async function GET() {
  try {
    const sessions = await fetchResearchSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error in /api/research-sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch research sessions" },
      { status: 500 }
    );
  }
}
