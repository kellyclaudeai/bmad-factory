import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sessions API Route (v1 Stub)
 * 
 * TODO v2: Integrate with OpenClaw Gateway sessions_list API
 * The localhost:3000/api/sessions_list endpoint is not a public HTTP endpoint.
 * For v1, we return an empty array to allow the frontend to work without
 * active session data. Future versions will implement proper sessions integration.
 */

type FrontendSession = {
  sessionKey: string;
  label: string;
  agentType: string;
  projectId?: string;
  status: string;
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  duration?: number;
};

export async function GET() {
  // v1: Return empty array (stub)
  // This allows the dashboard to function without real-time session data
  const sessions: FrontendSession[] = [];
  
  return NextResponse.json(sessions);
}
