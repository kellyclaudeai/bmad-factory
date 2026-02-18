import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_PATH = "/Users/austenallred/clawd/projects/project-registry.json";

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

    // Read registry to find discovery projects
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

  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException)?.code;
    
    if (errorCode === "ENOENT") {
      return NextResponse.json(
        { projects: [] },
        { status: 200 }
      );
    }
    
    console.error("Error in /api/research-state:", error);
    return NextResponse.json(
      { error: "Failed to fetch research state" },
      { status: 500 }
    );
  }
}
