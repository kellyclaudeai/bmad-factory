import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_PATH = "/Users/austenallred/clawd/projects/project-registry.json";
const WORKSPACES_ROOT = "/Users/austenallred/clawd/workspaces";

type RegistryProject = {
  id: string;
  name: string;
  state: "discovery" | "in-progress" | "shipped" | "followup";
  paused: boolean;
  timeline: {
    discoveredAt?: string;
    startedAt?: string;
  };
  intake?: {
    problem: string;
    solution: string;
    targetAudience: string;
    keyFeatures: string[];
  };
  researchPhase?: "ideation" | "validation" | "complete";
  painPoint?: string;
};

type ProjectRegistry = {
  version: string;
  projects: RegistryProject[];
};

type ResearchState = {
  researchId: string;
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt?: string;
  completedAt?: string;
  findings?: string[];
  outputPath?: string;
  lastHeartbeat?: string;
  subagents?: Array<{
    persona?: string;
    role?: string;
    task?: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    duration?: string;
    sessionKey?: string;
    tokens?: {
      input?: number;
      output?: number;
    };
  }>;
};

async function getResearchStateFromWorkspace(sessionKey: string): Promise<ResearchState | null> {
  // Try to find research-state.json in agent workspace
  // Session key format: agent:research-lead:{id}
  // Workspace format: research-lead/
  
  try {
    const researchLeadWorkspace = path.join(WORKSPACES_ROOT, "research-lead");
    const researchStatePath = path.join(researchLeadWorkspace, "research-state.json");
    
    const contents = await fs.readFile(researchStatePath, "utf8");
    const allStates = JSON.parse(contents);
    
    // If it's an array, find by sessionKey
    if (Array.isArray(allStates)) {
      return allStates.find((s: any) => s.sessionKey === sessionKey) || null;
    }
    
    // If it's a single object, check if it matches
    if (allStates.sessionKey === sessionKey) {
      return allStates;
    }
    
    return null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }
    console.error("Error reading research-state.json:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get("sessionKey");

    if (!sessionKey) {
      return NextResponse.json(
        { error: "sessionKey query parameter is required" },
        { status: 400 }
      );
    }

    // Try to get research state from workspace first
    const researchState = await getResearchStateFromWorkspace(sessionKey);
    
    if (researchState) {
      return NextResponse.json(researchState);
    }

    // Fallback: Read registry to find discovery projects (legacy behavior)
    try {
      const registryJson = await fs.readFile(REGISTRY_PATH, "utf8");
      const registry: ProjectRegistry = JSON.parse(registryJson);
      
      // Filter for discovery (research) projects
      const researchProjects = registry.projects.filter(p => p.state === "discovery");
      
      // Return all research projects (dashboard can filter by sessionKey if needed)
      return NextResponse.json({
        projects: researchProjects.map(p => ({
          id: p.id,
          name: p.name,
          status: p.researchPhase === "complete" ? "complete" : "active",
          discoveredAt: p.timeline.discoveredAt,
          problem: p.intake?.problem,
          solution: p.intake?.solution,
          targetAudience: p.intake?.targetAudience,
          keyFeatures: p.intake?.keyFeatures,
          painPoint: p.painPoint
        }))
      });
    } catch {
      return NextResponse.json(
        { projects: [] },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Error in /api/research-state:", error);
    return NextResponse.json(
      { error: "Failed to fetch research state" },
      { status: 500 }
    );
  }
}
