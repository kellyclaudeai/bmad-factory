import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FACTORY_STATE_PATH =
  process.env.FACTORY_STATE_PATH ||
  // Default for this repo: /Users/austenallred/clawd/factory-state.md
  "/Users/austenallred/clawd/factory-state.md";


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

function extractProjectIdFromHeading(rawHeading: string): string | null {
  const trimmed = rawHeading.trim();
  if (!trimmed) return null;

  const linkMatch = trimmed.match(/^\[([^\]]+)\]\([^)]+\)/);
  const heading = (linkMatch?.[1] ?? trimmed).trim();
  if (!heading) return null;

  const slugMatch = heading.match(/^([A-Za-z0-9][A-Za-z0-9-_]*)/);
  return (slugMatch?.[1] ?? heading).trim() || null;
}

function parseFactoryStateMarkdown(markdown: string): FactoryStateResponse {
  const parsed: FactoryStateResponse = {
    active: [],
    queued: [],
    completed: [],
    shipped: [],
  };

  const sectionToKey: Record<string, keyof FactoryStateResponse> = {
    "Active Projects": "active",
    "Queued Projects": "queued",
    "Completed Projects": "completed",
    "Shipped Projects": "shipped",
  };

  const seen: Record<keyof FactoryStateResponse, Set<string>> = {
    active: new Set(),
    queued: new Set(),
    completed: new Set(),
    shipped: new Set(),
  };

  let currentSection: keyof FactoryStateResponse | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const h2Match = line.match(/^##\s+(.*)\s*$/);
    if (h2Match) {
      currentSection = sectionToKey[h2Match[1].trim()] ?? null;
      continue;
    }

    if (!currentSection) continue;

    const h3Match = line.match(/^###\s+(.*)\s*$/);
    if (!h3Match) continue;

    const projectId = extractProjectIdFromHeading(h3Match[1]);
    if (!projectId) continue;
    if (seen[currentSection].has(projectId)) continue;

    parsed[currentSection].push(projectId);
    seen[currentSection].add(projectId);
  }

  return parsed;
}

export async function GET() {
  try {
    const markdown = await fs.readFile(FACTORY_STATE_PATH, "utf8");
    const parsed = parseFactoryStateMarkdown(markdown);
    return NextResponse.json(parsed);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return NextResponse.json(EMPTY_FACTORY_STATE);
    }

    return NextResponse.json(
      { error: "Failed to read factory state.", ...EMPTY_FACTORY_STATE },
      { status: 500 },
    );
  }
}

