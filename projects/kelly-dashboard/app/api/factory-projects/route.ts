import { NextResponse } from "next/server";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_PATH = "/Users/austenallred/clawd/projects/projects-registry.json";

type RegistryProject = {
  id: string;
  name?: string;
  path?: string;
  plSession?: string;
  phase?: string;
  createdAt?: string;
};

export async function GET() {
  try {
    const content = await fs.readFile(REGISTRY_PATH, "utf8");
    const { projects }: { projects: RegistryProject[] } = JSON.parse(content);

    const shipped = projects
      .filter((p) => p.phase === "shipped")
      .map((p) => ({ id: p.id, name: p.name || p.id, phase: p.phase, createdAt: p.createdAt }));

    const readyToStart = projects
      .filter((p) => p.phase === "discovery")
      .map((p) => ({ id: p.id, name: p.name || p.id, phase: p.phase, createdAt: p.createdAt }));

    return NextResponse.json({ shipped, readyToStart });
  } catch {
    return NextResponse.json({ shipped: [], readyToStart: [] });
  }
}
