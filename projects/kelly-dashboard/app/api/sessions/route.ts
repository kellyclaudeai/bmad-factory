import { NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FrontendSession = {
  sessionKey: string;
  sessionId: string;
  label: string;
  agentType: string;
  projectId?: string;
  status: string;
  lastActivity: string;
  model?: string;
  tokens?: { input: number; output: number };
  channel?: string;
  displayName?: string;
};

function extractAgentType(key: string): string {
  const parts = key.split(':');
  if (parts.length >= 2) {
    return parts[1];
  }
  return 'unknown';
}

function extractProjectId(key: string): string | undefined {
  if (key.includes(':project-lead:project-')) {
    const match = key.match(/:project-lead:project-([^:]+)/);
    return match?.[1];
  }
  if (key.includes(':project-')) {
    const match = key.match(/:project-([^:]+)/);
    return match?.[1];
  }
  return undefined;
}

async function getSessionsViaCLI(activeMinutes: number): Promise<FrontendSession[]> {
  try {
    const { stdout } = await execAsync(`openclaw sessions --active ${activeMinutes} --json`);
    const data = JSON.parse(stdout);
    const cliSessions = data.sessions || [];
    
    return cliSessions.map((s: any) => {
      const sessionKey = s.key || '';
      const agentType = extractAgentType(sessionKey);
      const projectId = extractProjectId(sessionKey);
      
      return {
        sessionKey,
        sessionId: s.sessionId || '',
        label: sessionKey,
        agentType,
        projectId,
        status: 'active',
        lastActivity: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
        model: s.model,
        tokens: (s.inputTokens && s.outputTokens) ? {
          input: s.inputTokens,
          output: s.outputTokens,
        } : undefined,
        channel: s.lastChannel || s.channel,
        displayName: sessionKey,
      };
    });
  } catch (error) {
    console.error('Failed to get sessions via CLI:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const activeMinutes = parseInt(url.searchParams.get('activeMinutes') || '15', 10);
    
    const sessions = await getSessionsViaCLI(activeMinutes);
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error?.message },
      { status: 500 }
    );
  }
}
