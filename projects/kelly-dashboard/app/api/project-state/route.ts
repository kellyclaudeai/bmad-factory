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
    // If there is no on-disk project-state.json, fall back to a synthesized view
    // using the project-lead registry + live sessions.
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      // Lazy import to avoid pulling gateway dependencies in module scope.
      const { getGatewayPort, getGatewayToken } = await import("@/lib/gateway-token");
      const { readProjectLeadRegistry } = await import("@/lib/project-lead-registry");

      const reg = readProjectLeadRegistry();
      const entry = reg?.projects?.[projectId];
      if (!entry?.sessionKey) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const token = getGatewayToken();
      if (!token) {
        return NextResponse.json(
          { error: "Gateway token missing" },
          { status: 500 },
        );
      }

      try {
        const port = getGatewayPort();
        const resp = await fetch(`http://127.0.0.1:${port}/tools/invoke`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool: "sessions_list",
            action: "json",
            args: { activeMinutes: 10080, limit: 200, messageLimit: 0 },
          }),
          cache: "no-store",
        });

        if (!resp.ok) {
          return NextResponse.json(
            { error: `Gateway sessions_list failed (${resp.status})` },
            { status: 500 },
          );
        }

        const payload = (await resp.json()) as { ok: boolean; result?: any };
        const result = payload?.result;
        const rawSessions = Array.isArray(result)
          ? result
          : Array.isArray(result?.details?.sessions)
            ? result.details.sessions
            : Array.isArray(result?.sessions)
              ? result.sessions
              : [];

        const leadKey = entry.sessionKey;
        const virtualPeer = entry.virtualPeer;

        const relevant = (rawSessions as any[]).filter((s) => {
          const key = s.key || s.sessionKey || s.sessionId;
          if (!key) return false;
          return (
            key === leadKey ||
            (virtualPeer && key.includes(virtualPeer)) ||
            key.includes(`project-${projectId}`)
          );
        });

        const lead = relevant.find((s) => (s.key || s.sessionKey) === leadKey);
        const updatedAt =
          typeof lead?.updatedAt === "number"
            ? new Date(lead.updatedAt).toISOString()
            : typeof lead?.updatedAt === "string"
              ? lead.updatedAt
              : new Date().toISOString();

        const subagents = relevant
          .filter((s) => (s.key || s.sessionKey) !== leadKey)
          .map((s) => ({
            story: s.label || s.displayName || (s.key || s.sessionKey || s.sessionId),
            status: s.status || "active",
            sessionKey: s.key || s.sessionKey || s.sessionId,
            startedAt: undefined,
            completedAt: undefined,
          }));

        return NextResponse.json({
          projectId,
          stage: lead?.status || "active",
          currentStage: lead?.status || "active",
          currentPhase: undefined,
          updatedAt,
          phases: undefined,
          subagents,
        });
      } catch {
        return NextResponse.json({ error: "Failed to read project state." }, { status: 500 });
      }
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in project-state.json" }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to read project state." }, { status: 500 });
  }
}

