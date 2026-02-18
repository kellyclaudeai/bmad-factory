import { NextResponse } from "next/server";
import { getGatewayPort, getGatewayToken } from "@/lib/gateway-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionDetail = {
  sessionKey: string;
  sessionId: string;
  label?: string;
  displayName?: string;
  model?: string;
  tokens?: { input: number; output: number };
  status?: string;
  updatedAt?: number;
  transcriptPath?: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionKey: string }> }
) {
  const { sessionKey: encodedKey } = await context.params;
  const sessionKey = decodeURIComponent(encodedKey);

  const token = getGatewayToken();
  if (!token) {
    return NextResponse.json(
      { error: "No Gateway token found" },
      { status: 500 }
    );
  }

  try {
    const port = getGatewayPort();
    const response = await fetch(`http://127.0.0.1:${port}/tools/invoke`, {
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

    if (!response.ok) {
      throw new Error(`Gateway API returned ${response.status}`);
    }

    const payload = (await response.json()) as { ok: boolean; result?: any };
    const result = payload?.result;

    const rawSessions = Array.isArray(result)
      ? result
      : Array.isArray(result?.details?.sessions)
        ? result.details.sessions
        : Array.isArray(result?.sessions)
          ? result.sessions
          : [];

    // Find the matching session
    const session = rawSessions.find(
      (s: any) => (s.key || s.sessionKey) === sessionKey
    );

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const detail: SessionDetail = {
      sessionKey: session.key || session.sessionKey,
      sessionId: session.sessionId,
      label: session.label,
      displayName: session.displayName,
      model: session.model,
      tokens: session.tokens,
      status: session.status,
      updatedAt: session.updatedAt,
      transcriptPath: session.transcriptPath,
    };

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Error fetching session detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
