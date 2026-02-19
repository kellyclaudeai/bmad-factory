import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type Session = {
  sessionKey: string;
  label?: string;
  agentType?: string;
  projectId?: string;
  status?: string;
  lastActivity?: string;
  model?: string;
  channel?: string;
  messages?: Array<{ role: string; timestamp?: number }>;
};

type ActiveSubagent = {
  sessionKey: string;
  agentType: string;
  story?: string;
  persona?: string;
  status: string;
  startedAt?: string;
  lastActivity: string;
  model?: string;
  label?: string;
};

function extractStoryFromLabel(label: string): string | undefined {
  // Extract story ID from labels like "amelia-dev-10.1-notelite" or "amelia-review-3.8-notelite"
  const match = label.match(/(?:dev|review)-(\d+\.\d+)/);
  return match ? match[1] : undefined;
}

function extractPersonaFromLabel(label: string): string | undefined {
  // Extract persona from labels like "amelia-dev-10.1-notelite"
  const personas: Record<string, string> = {
    amelia: "Amelia (Dev)",
    barry: "Barry (Fast Track)",
    john: "John (PM)",
    sally: "Sally (UX)",
    winston: "Winston (Architecture)",
    bob: "Bob (Stories)",
    mary: "Mary (Product)",
    carson: "Carson (CIS)",
    victor: "Victor (CIS)",
    maya: "Maya (CIS)",
    quinn: "Quinn (QA)",
    murat: "Murat (TEA)",
  };

  for (const [key, value] of Object.entries(personas)) {
    if (label.toLowerCase().includes(key)) {
      return value;
    }
  }

  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId query param" }, { status: 400 });
  }

  try {
    // Fetch all active sessions from OpenClaw
    const sessionsRes = await fetch(`${BASE_URL}/api/sessions`, { cache: "no-store" });

    if (!sessionsRes.ok) {
      throw new Error(`Sessions API returned ${sessionsRes.status}`);
    }

    const sessions: Session[] = await sessionsRes.json();

    // Filter for subagents related to this project
    // Subagents have sessionKeys like "agent:bmad-bmm-amelia:subagent:uuid"
    // and their labels often contain the projectId
    const projectSubagents = sessions.filter((s) => {
      const key = s.sessionKey || "";
      const label = s.label || "";
      
      // Must be a subagent session
      if (!key.includes(":subagent:")) return false;

      // Check if projectId appears in label or if explicit projectId match
      if (s.projectId === projectId) return true;
      if (label.toLowerCase().includes(projectId.toLowerCase())) return true;

      return false;
    });

    // Map to our ActiveSubagent format
    const activeSubagents: ActiveSubagent[] = projectSubagents.map((s) => {
      const label = s.label || s.sessionKey;
      
      return {
        sessionKey: s.sessionKey,
        agentType: s.agentType || "subagent",
        story: extractStoryFromLabel(label),
        persona: extractPersonaFromLabel(label),
        status: s.status || "active",
        startedAt: s.messages && s.messages.length > 0 
          ? new Date(s.messages[0].timestamp || Date.now()).toISOString()
          : undefined,
        lastActivity: s.lastActivity || new Date().toISOString(),
        model: s.model,
        label: label,
      };
    });

    return NextResponse.json({
      projectId,
      count: activeSubagents.length,
      subagents: activeSubagents,
    });
  } catch (error) {
    console.error("Error fetching active subagents:", error);
    return NextResponse.json(
      { error: "Failed to fetch active subagents", projectId, count: 0, subagents: [] },
      { status: 500 }
    );
  }
}
