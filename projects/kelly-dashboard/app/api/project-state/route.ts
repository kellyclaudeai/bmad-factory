import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "yaml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_PATH = "/Users/austenallred/clawd/projects/project-registry.json";
const PROJECTS_ROOT = "/Users/austenallred/clawd/projects";

function isSafeProjectId(projectId: string) {
  return /^[A-Za-z0-9][A-Za-z0-9-_]*$/.test(projectId);
}

type RegistryProject = {
  id: string;
  name: string;
  state: "discovery" | "in-progress" | "shipped" | "followup";
  paused: boolean;
  pausedReason?: string;
  timeline: {
    discoveredAt?: string;
    startedAt?: string;
    shippedAt?: string;
    lastUpdated?: string;
  };
  intake?: {
    problem: string;
    solution: string;
    targetAudience: string;
    keyFeatures: string[];
  };
  implementation?: {
    projectDir?: string;
    deployedUrl?: string;
    qaUrl?: string;
    repo?: string;
  };
};

type ProjectRegistry = {
  version: string;
  projects: RegistryProject[];
};

type SprintStatus = {
  stories: Array<{
    id: string;
    status: "todo" | "in-progress" | "done";
  }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("id")?.trim();

  if (!projectId) {
    return NextResponse.json({ error: "Missing `id` query param." }, { status: 400 });
  }

  if (!isSafeProjectId(projectId)) {
    return NextResponse.json({ error: "Invalid `id` query param." }, { status: 400 });
  }

  try {
    // Read registry
    const registryJson = await fs.readFile(REGISTRY_PATH, "utf8");
    const registry: ProjectRegistry = JSON.parse(registryJson);
    
    // Find project in registry
    const project = registry.projects.find(p => p.id === projectId);
    
    if (!project) {
      return NextResponse.json({ error: "Project not found in registry" }, { status: 404 });
    }

    // If project has a projectDir, try to read BMAD artifacts
    let sprintStatus = null;
    if (project.implementation?.projectDir) {
      try {
        const sprintStatusPath = path.join(
          PROJECTS_ROOT,
          project.implementation.projectDir,
          "_bmad-output/implementation-artifacts/sprint-status.yaml"
        );
        const sprintYaml = await fs.readFile(sprintStatusPath, "utf8");
        sprintStatus = yaml.parse(sprintYaml) as SprintStatus;
      } catch (error) {
        // Sprint status doesn't exist yet (planning phase) - not an error
      }
    }

    // Combine registry data + BMAD data
    const response = {
      projectId: project.id,
      name: project.name,
      state: project.state,
      paused: project.paused,
      pausedReason: project.pausedReason,
      timeline: project.timeline,
      intake: project.intake,
      implementation: project.implementation,
      
      // Story status from BMAD
      stories: sprintStatus?.stories.map(s => ({
        id: s.id,
        status: s.status
      })) || [],
      
      // Computed stats
      stats: sprintStatus ? {
        total: sprintStatus.stories.length,
        done: sprintStatus.stories.filter(s => s.status === "done").length,
        inProgress: sprintStatus.stories.filter(s => s.status === "in-progress").length,
        todo: sprintStatus.stories.filter(s => s.status === "todo").length
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "Registry not found" }, { status: 404 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in registry" }, { status: 500 });
    }

    console.error("Error reading project state:", error);
    return NextResponse.json({ error: "Failed to read project state." }, { status: 500 });
  }
}
