import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResearchState = {
  researchId: string;
  topic: string;
  status: "active" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  findings?: string[];
  outputPath?: string;
  lastHeartbeat?: string;
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

    // Read research-state.json from Research Lead workspace
    const homeDir = os.homedir();
    const statePath = path.join(
      homeDir,
      ".openclaw",
      "agents",
      "research-lead",
      "workspace",
      "research-state.json"
    );

    try {
      const contents = await fs.readFile(statePath, "utf-8");
      const state = JSON.parse(contents) as ResearchState;
      return NextResponse.json(state);
    } catch (error) {
      const errorCode = (error as NodeJS.ErrnoException)?.code;
      
      if (errorCode === "ENOENT") {
        return NextResponse.json(
          { error: "Research state file not found" },
          { status: 404 }
        );
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error in /api/research-state:", error);
    return NextResponse.json(
      { error: "Failed to fetch research state" },
      { status: 500 }
    );
  }
}
