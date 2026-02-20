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
    'bmad-bmm-john': "John (PM)",
    'bmad-bmm-sally': "Sally (UX)",
    'bmad-bmm-winston': "Winston (Architect)",
    'bmad-bmm-bob': "Bob (Sprint Planner)",
    'bmad-bmm-mary': "Mary (Product)",
    'bmad-cis-carson': "Carson (CIS)",
    'bmad-cis-victor': "Victor (CIS)",
    'bmad-cis-maya': "Maya (CIS)",
    'bmad-cis-quinn': "Quinn (QA)",
    'bmad-tea-murat': "Murat (TEA)",
  };
  
  return personas[agentName] || agentName;
}

async function findActiveSubagentsForProject(projectId: string, _activeMinutes: number): Promise<ActiveSubagent[]> {
  const subagents: ActiveSubagent[] = [];
  
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
      
      try {
        // Find .lock files — ONLY sessions with active locks are truly running
        const files = await fs.readdir(sessionsDir);
        const lockFiles = files.filter(f => f.endsWith('.jsonl.lock'));
        
        for (const lockFile of lockFiles) {
          const jsonlFile = lockFile.replace('.lock', '');
          const sessionId = jsonlFile.replace('.jsonl', '');
          const jsonlPath = path.join(sessionsDir, jsonlFile);
          
          // Get creation time of the jsonl file (when session started)
          let startedAt: number | undefined;
          try {
            const stat = await fs.stat(jsonlPath);
            startedAt = stat.birthtimeMs;
          } catch { /* ignore */ }
          
          // Read first few lines to find story assignment and project match
          let story: string | undefined;
          let label: string | undefined;
          let matchesProject = false;
          
          try {
            const fd = await fs.open(jsonlPath, 'r');
            const buf = Buffer.alloc(4096);
            await fd.read(buf, 0, 4096, 0);
            await fd.close();
            const head = buf.toString('utf8');
            
            // Check if this session is for our project
            if (head.toLowerCase().includes(projectId.toLowerCase())) {
              matchesProject = true;
            }
            
            // Extract story number
            const storyMatch = head.match(/Story (\d+\.\d+)/);
            if (storyMatch) {
              story = storyMatch[1];
            }
            
            // Try to get label from session index
            const indexPath = path.join(sessionsDir, 'sessions.json');
            try {
              const indexContent = await fs.readFile(indexPath, 'utf8');
              const sessionIndex = JSON.parse(indexContent);
              for (const [key, data] of Object.entries(sessionIndex)) {
                if (key.includes(sessionId) || (data as any).sessionId === sessionId) {
                  label = (data as any).label;
                  if (label?.toLowerCase().includes(projectId.toLowerCase())) {
                    matchesProject = true;
                  }
                  if (!story) {
                    story = label ? extractStoryFromLabel(label) : undefined;
                  }
                  break;
                }
              }
            } catch { /* no index */ }
          } catch { /* can't read file */ }
          
          if (!matchesProject) continue;
          
          const storyTitle = story ? storyTitles.get(story) : undefined;
          const persona = extractPersonaFromAgentName(agentName);
          const runtime = startedAt ? calculateRuntime(startedAt) : undefined;
          
          subagents.push({
            sessionKey: `agent:${agentName}:${sessionId}`,
            sessionId,
            agentType: agentName,
            story,
            storyTitle,
            persona,
            status: 'active',
            startedAt: startedAt ? new Date(startedAt).toISOString() : undefined,
            lastActivity: new Date().toISOString(),
            label,
            runtime,
          });
        }
      } catch (error) {
        // Skip agents without sessions dir
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
