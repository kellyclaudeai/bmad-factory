import { NextResponse } from "next/server";
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ActiveSubagent = {
  sessionKey: string;
  sessionId: string;
  agentType: string;
  story?: string;
  storyTitle?: string;
  persona?: string;
  status: string;
  startedAt?: string;
  lastActivity: string;
  model?: string;
  label?: string;
  runtime?: string;
};

const AGENTS_ROOT = path.join(os.homedir(), '.openclaw', 'agents');
const PROJECTS_ROOT = '/Users/austenallred/clawd/projects';

async function loadStoryTitles(projectId: string): Promise<Map<string, string>> {
  const titles = new Map<string, string>();
  const sprintStatusPath = path.join(PROJECTS_ROOT, projectId, '_bmad-output', 'implementation-artifacts', 'sprint-status.yaml');
  
  try {
    const content = await fs.readFile(sprintStatusPath, 'utf8');
    // Parse YAML-like structure for story titles
    const storyRegex = /"(\d+\.\d+)":\s+(?:.*\n)*?\s+title:\s+"([^"]+)"/g;
    let match;
    while ((match = storyRegex.exec(content)) !== null) {
      titles.set(match[1], match[2]);
    }
  } catch (error) {
    // Sprint status file not found or parse error
  }
  
  return titles;
}

function calculateRuntime(updatedAt: number): string {
  const now = Date.now();
  const runtimeMs = now - updatedAt;
  const minutes = Math.floor(runtimeMs / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

function extractStoryFromLabel(label: string): string | undefined {
  const match = label.match(/(?:dev|review)-(\d+\.\d+)/);
  return match ? match[1] : undefined;
}

function extractPersonaFromAgentName(agentName: string): string | undefined {
  const personas: Record<string, string> = {
    'bmad-bmm-amelia': "Amelia (Dev)",
    'bmad-bmm-barry': "Barry (Fast Track)",
    'bmad-cim-john': "John (PM)",
    'bmad-cim-sally': "Sally (UX)",
    'bmad-cim-winston': "Winston (Architecture)",
    'bmad-cim-bob': "Bob (Stories)",
    'bmad-cis-mary': "Mary (Product)",
    'bmad-cis-carson': "Carson (CIS)",
    'bmad-cis-victor': "Victor (CIS)",
    'bmad-cis-maya': "Maya (CIS)",
    'bmad-cis-quinn': "Quinn (QA)",
    'bmad-tea-murat': "Murat (TEA)",
  };
  
  return personas[agentName] || agentName;
}

async function findActiveSubagentsForProject(projectId: string, activeMinutes: number): Promise<ActiveSubagent[]> {
  const subagents: ActiveSubagent[] = [];
  const now = Date.now();
  const cutoff = now - (activeMinutes * 60 * 1000);
  
  // Load story titles from sprint-status.yaml
  const storyTitles = await loadStoryTitles(projectId);
  
  try {
    const agentDirs = await fs.readdir(AGENTS_ROOT, { withFileTypes: true });
    
    // Only look in BMAD agent directories (subagents)
    const bmadAgents = agentDirs.filter(d => 
      d.isDirectory() && d.name.startsWith('bmad-')
    );
    
    for (const dir of bmadAgents) {
      const agentName = dir.name;
      const sessionsDir = path.join(AGENTS_ROOT, agentName, 'sessions');
      const indexPath = path.join(sessionsDir, 'sessions.json');
      
      try {
        // Read sessions.json index for labels and timestamps
        const indexContent = await fs.readFile(indexPath, 'utf8');
        const sessionIndex = JSON.parse(indexContent);
        
        // Find sessions with matching projectId in label
        for (const [sessionKey, sessionData] of Object.entries(sessionIndex)) {
          const data = sessionData as any;
          const label = data.label;
          const updatedAt = data.updatedAt;
          
          if (!label || !label.toLowerCase().includes(projectId.toLowerCase())) {
            continue;
          }
          
          // Check activity window using updatedAt from index
          if (updatedAt && updatedAt < cutoff) {
            continue;
          }
          
          // Extract session ID from sessionKey (format: agent:bmad-...:subagent:UUID)
          const sessionId = sessionKey.split(':').pop() || sessionKey;
          
          const story = extractStoryFromLabel(label);
          const storyTitle = story ? storyTitles.get(story) : undefined;
          const persona = extractPersonaFromAgentName(agentName);
          const runtime = updatedAt ? calculateRuntime(updatedAt) : undefined;
          
          subagents.push({
            sessionKey,
            sessionId,
            agentType: agentName,
            story,
            storyTitle,
            persona,
            status: 'active',
            startedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined,
            lastActivity: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
            label,
            runtime,
          });
        }
      } catch (error) {
        // Skip agents without sessions.json
        continue;
      }
    }
  } catch (error) {
    console.error('Error finding active subagents:', error);
  }
  
  return subagents;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId parameter required" },
        { status: 400 }
      );
    }
    
    const activeMinutes = parseInt(url.searchParams.get("activeMinutes") || "60", 10);
    
    const subagents = await findActiveSubagentsForProject(projectId, activeMinutes);
    
    return NextResponse.json({
      projectId,
      count: subagents.length,
      subagents,
    });
  } catch (error: any) {
    console.error('Active subagents API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active subagents', details: error?.message },
      { status: 500 }
    );
  }
}
