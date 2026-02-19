import { NextResponse } from "next/server";
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

async function findActiveSubagents(projectId: string): Promise<ActiveSubagent[]> {
  const homeDir = os.homedir();
  const agentsDir = path.join(homeDir, '.openclaw', 'agents');
  const subagents: ActiveSubagent[] = [];
  
  try {
    const agents = await fs.readdir(agentsDir);
    
    for (const agentName of agents) {
      const sessionsJsonPath = path.join(agentsDir, agentName, 'sessions', 'sessions.json');
      
      try {
        const sessionsData = await fs.readFile(sessionsJsonPath, 'utf-8');
        const sessions = JSON.parse(sessionsData);
        
        // Find subagents for this project
        for (const [sessionKey, sessionData] of Object.entries(sessions)) {
          // Must be a subagent session
          if (!sessionKey.includes(':subagent:')) continue;
          
          const data = sessionData as any;
          const label = data.label || '';
          
          // Check if this subagent belongs to our project
          // Match by label containing projectId
          if (!label.toLowerCase().includes(projectId.toLowerCase())) continue;
          
          // Check if session is truly active (has a lock file)
          const sessionId = data.sessionId;
          if (sessionId) {
            const lockPath = path.join(agentsDir, agentName, 'sessions', `${sessionId}.jsonl.lock`);
            const transcriptPath = path.join(agentsDir, agentName, 'sessions', `${sessionId}.jsonl`);
            
            try {
              // Check for lock file (indicates active session)
              await fs.access(lockPath);
              
              // Get transcript stats for timestamps
              const stats = await fs.stat(transcriptPath);
              
              subagents.push({
                sessionKey,
                agentType: agentName,
                story: extractStoryFromLabel(label),
                persona: extractPersonaFromLabel(label),
                status: 'active',
                startedAt: new Date(stats.birthtimeMs).toISOString(),
                lastActivity: new Date(stats.mtimeMs).toISOString(),
                model: data.model,
                label,
              });
            } catch {
              // No lock file = session completed or not started
            }
          }
        }
      } catch (err) {
        // No sessions.json for this agent or can't read it - skip
        continue;
      }
    }
  } catch (err) {
    console.error('Error scanning agent directories:', err);
  }
  
  return subagents;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId query param" }, { status: 400 });
  }

  try {
    const activeSubagents = await findActiveSubagents(projectId);

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
