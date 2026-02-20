import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_PATH =
  process.env.PROJECT_REGISTRY_PATH ||
  "/Users/austenallred/clawd/projects/project-registry.json";

type FactoryStateResponse = {
  active: string[];
  queued: string[];
  completed: string[];
  shipped: string[];
};

const EMPTY_FACTORY_STATE: FactoryStateResponse = {
  active: [],
  queued: [],
  completed: [],
  shipped: [],
};

type RegistryProject = {
  id: string;
  name: string;
  state: "discovery" | "in-progress" | "pending-qa" | "shipped" | "followup";
  paused: boolean;
};

type ProjectRegistry = {
  version: string;
  projects: RegistryProject[];
};

function parseProjectRegistry(registry: ProjectRegistry): FactoryStateResponse {
  const parsed: FactoryStateResponse = {
    active: [],
    queued: [],
    completed: [],
    shipped: [],
  };

  for (const project of registry.projects) {
    if (project.paused) continue; // Skip paused projects

    switch (project.state) {
      case "discovery":
        parsed.queued.push(project.id);
        break;
      case "in-progress":
        parsed.active.push(project.id);
        break;
      case "pending-qa":
        // Awaiting operator human QA — still "active" on dashboard
        parsed.active.push(project.id);
        break;
      case "shipped":
        parsed.shipped.push(project.id);
        break;
      case "followup":
        // Followup is post-ship maintenance, show as active
        parsed.active.push(project.id);
        break;
    }
  }

  return parsed;
}

export async function GET() {
  try {
    const json = await fs.readFile(REGISTRY_PATH, "utf8");
    const registry: ProjectRegistry = JSON.parse(json);
    const parsed = parseProjectRegistry(registry);
    return NextResponse.json(parsed);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return NextResponse.json(EMPTY_FACTORY_STATE);
    }

    return NextResponse.json(
      { error: "Failed to read project registry.", ...EMPTY_FACTORY_STATE },
      { status: 500 },
    );
  }
}
