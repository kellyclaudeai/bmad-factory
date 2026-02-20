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
    let planningArtifacts: Record<string, { exists: boolean; size?: number; modified?: string; ageMinutes?: number; isRecent?: boolean }> = {};
    
    if (project.implementation?.projectDir) {
      // Handle both relative and absolute paths
      let projectPath = project.implementation.projectDir;
      if (path.isAbsolute(projectPath)) {
        projectPath = path.relative(PROJECTS_ROOT, projectPath);
      }

      // Check for sprint-status.yaml (implementation phase)
      try {
        const sprintStatusPath = path.join(
          PROJECTS_ROOT,
          projectPath,
          "_bmad-output/implementation-artifacts/sprint-status.yaml"
        );
        const sprintYaml = await fs.readFile(sprintStatusPath, "utf8");
        sprintStatus = yaml.parse(sprintYaml) as SprintStatus;
      } catch (error) {
        console.error('Sprint status read error:', error);
      }

      // Check for planning artifacts (Phase 1)
      const artifactNames = ["prd.md", "ux-design.md", "architecture.md", "epics.md"];
      for (const artifactName of artifactNames) {
        try {
          // Handle both relative and absolute paths
          let projectPath = project.implementation.projectDir;
          if (path.isAbsolute(projectPath)) {
            projectPath = path.relative(PROJECTS_ROOT, projectPath);
          }
          
          const artifactPath = path.join(
            PROJECTS_ROOT,
            projectPath,
            "_bmad-output/planning-artifacts",
            artifactName
          );
          const stats = await fs.stat(artifactPath);
          const now = Date.now();
          const modifiedMs = stats.mtime.getTime();
          const ageMinutes = Math.floor((now - modifiedMs) / 1000 / 60);
          
          planningArtifacts[artifactName] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            ageMinutes,
            isRecent: ageMinutes < 5 // Active if modified in last 5 minutes
          };
        } catch {
          planningArtifacts[artifactName] = { exists: false };
        }
      }
    }

    // Infer current phase from artifacts
    let currentPhase = "unknown";
    if (project.state === "in-progress") {
      if (sprintStatus) {
        currentPhase = "implementation"; // Phase 2+
      } else {
        currentPhase = "planning"; // Phase 1 — with or without artifacts
      }
    } else if (project.state === "pending-qa") {
      currentPhase = "awaiting-qa";
    } else if (project.state === "discovery") {
      currentPhase = "discovery";
    } else if (project.state === "shipped") {
      currentPhase = "shipped";
    }

    // Synthesize subagent entries from planning artifacts
    const syntheticSubagents: Array<{
      id: string;
      story: string;
      storyTitle: string;
      persona: string;
      task: string;
      status: string;
      startedAt?: string;
      completedAt?: string;
      duration?: string;
    }> = [];

    if (currentPhase === "planning") {
      const artifactAgents: Record<string, { persona: string; task: string; title: string }> = {
        "prd.md": { persona: "John (PM)", task: "create-prd", title: "Product Requirements Document" },
        "ux-design.md": { persona: "Sally (UX)", task: "create-ux-design", title: "UX Design Specification" },
        "architecture.md": { persona: "Winston (Architect)", task: "create-architecture", title: "Technical Architecture" },
        "epics.md": { persona: "John (PM)", task: "create-epics-and-stories", title: "Epics & Stories" },
      };

      for (const [fileName, agentInfo] of Object.entries(artifactAgents)) {
        const artifact = planningArtifacts[fileName];
        if (artifact?.exists && artifact.modified) {
          syntheticSubagents.push({
            id: `planning-${fileName}`,
            story: fileName.replace(".md", ""),
            storyTitle: agentInfo.title,
            persona: agentInfo.persona,
            task: agentInfo.task,
            status: artifact.isRecent ? "active" : "complete",
            completedAt: artifact.modified,
            startedAt: artifact.modified, // Approximation - we don't have true start time
          });
        }
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
      
      // Current phase inference
      currentPhase,
      
      // Planning artifacts (Phase 1)
      planningArtifacts,
      
      // Subagents: synthesized from planning artifacts + completed stories from sprint-status
      subagents: [
        ...syntheticSubagents,
        // Generate completed subagent entries from sprint-status done stories only
        ...(sprintStatus?.stories
          ? Object.entries(sprintStatus.stories)
              .filter(([, s]: [string, any]) => s?.status === "done")
              .map(([id, s]: [string, any]) => ({
                id: `story-${id}`,
                story: id,
                storyTitle: s?.title || `Story ${id}`,
                persona: s?.completed_by ? `${s.completed_by} (Dev)` : "Amelia (Dev)",
                task: `implement-story-${id}`,
                status: "complete" as const,
                startedAt: s?.started_at,
                completedAt: s?.completed_at || s?.reviewed_at,
              }))
          : []),
      ],
      
      // Story status from BMAD (Phase 2+)
      // sprint-status.yaml uses nested objects: stories: { "1.1": { status: "done", ... }, ... }
      stories: sprintStatus?.stories
        ? Object.entries(sprintStatus.stories).map(([id, s]: [string, any]) => ({
            id,
            status: s?.status || 'unknown',
            title: s?.title || '',
            epic: s?.epic,
          }))
        : [],
      
      // Computed stats from sprint-status stories (object format)
      stats: sprintStatus?.stories ? (() => {
        const entries = Object.values(sprintStatus.stories) as any[];
        return {
          total: entries.length,
          done: entries.filter(s => s?.status === "done").length,
          inProgress: entries.filter(s => s?.status === "in_progress" || s?.status === "in-progress").length,
          inReview: entries.filter(s => s?.status === "review").length,
          devComplete: entries.filter(s => s?.status === "dev-complete").length,
          todo: entries.filter(s => s?.status === "todo").length,
        };
      })() : null
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
