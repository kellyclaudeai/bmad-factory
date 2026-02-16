import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROJECTS_ROOT = "/Users/austenallred/clawd/projects";

function isSafeProjectId(projectId: string) {
  return /^[A-Za-z0-9][A-Za-z0-9-_]*$/.test(projectId);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("id")?.trim();

  if (!projectId) {
    return NextResponse.json({ error: "Missing `id` query param." }, { status: 400 });
  }

  if (!isSafeProjectId(projectId)) {
    return NextResponse.json({ error: "Invalid `id` query param." }, { status: 400 });
  }

  const projectStatePath = path.join(PROJECTS_ROOT, projectId, "project-state.json");

  try {
    const contents = await fs.readFile(projectStatePath, "utf8");
    const json = JSON.parse(contents) as unknown;
    return NextResponse.json(json);
  } catch (error) {
    // If there is no on-disk project-state.json, return 404.
    // (We no longer synthesize state from a Project Lead registry.)
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in project-state.json" }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to read project state." }, { status: 500 });
  }
}

