import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENTS_ROOT = path.join(os.homedir(), ".openclaw", "agents");

type Message = {
  role: "user" | "assistant" | "system" | "tool";
  content?: string | Array<{ type: string; text?: string; [key: string]: any }>;
  toolCalls?: Array<{ id: string; function: { name: string; arguments: string } }>;
  name?: string;
  thinking?: string;
};

async function findTranscriptPath(sessionKey: string): Promise<string | null> {
  // Parse session key to find the transcript file
  // Formats:
  //   agent:{agentType}:subagent:{id}
  //   agent:{agentType}:{suffix}
  
  const subagentMatch = sessionKey.match(/^agent:([^:]+):subagent:(.+)$/);
  if (subagentMatch) {
    const agentType = subagentMatch[1];
    const subagentKeyId = subagentMatch[2];
    const sessionsDir = path.join(AGENTS_ROOT, agentType, "sessions");
    
    // Try sessions.json lookup first
    try {
      const indexPath = path.join(sessionsDir, "sessions.json");
      const indexData = JSON.parse(await fs.readFile(indexPath, "utf-8"));
      const entry = indexData[sessionKey];
      if (entry?.sessionId) {
        const p = path.join(sessionsDir, `${entry.sessionId}.jsonl`);
        await fs.access(p);
        return p;
      }
    } catch { /* fall through */ }
    
    // Direct ID match
    const directPath = path.join(sessionsDir, `${subagentKeyId}.jsonl`);
    try { await fs.access(directPath); return directPath; } catch { /* fall through */ }
    
    return null;
  }

  // Non-subagent agent session
  if (sessionKey.startsWith("agent:")) {
    const parts = sessionKey.split(":");
    const agentType = parts[1];
    const lastPart = parts[parts.length - 1];
    const sessionsDir = path.join(AGENTS_ROOT, agentType, "sessions");

    // Fast path: if last segment looks like a UUID, try direct file lookup first
    if (/^[0-9a-f-]{36}$/.test(lastPart)) {
      const directPath = path.join(sessionsDir, `${lastPart}.jsonl`);
      try { await fs.access(directPath); return directPath; } catch { /* fall through */ }
    }

    // Look up in sessions.json
    try {
      const indexPath = path.join(sessionsDir, "sessions.json");
      const indexData = JSON.parse(await fs.readFile(indexPath, "utf-8"));
      const entry = indexData[sessionKey];
      if (entry?.sessionId) {
        const p = path.join(sessionsDir, `${entry.sessionId}.jsonl`);
        await fs.access(p);
        return p;
      }
    } catch { /* fall through */ }

    // Try scanning for matching files
    try {
      const files = await fs.readdir(sessionsDir);
      const jsonlFiles = files.filter(f => f.endsWith(".jsonl") && !f.includes("deleted") && !f.includes("frozen"));
      // Check each file's first line for session key
      for (const file of jsonlFiles) {
        const filePath = path.join(sessionsDir, file);
        try {
          const fd = await fs.open(filePath, "r");
          const buf = Buffer.alloc(2048);
          await fd.read(buf, 0, 2048, 0);
          await fd.close();
          const head = buf.toString("utf8");
          if (head.includes(sessionKey)) {
            return filePath;
          }
        } catch { continue; }
      }
    } catch { /* fall through */ }

    return null;
  }

  return null;
}

function extractDisplayMessage(msg: any): { role: string; text: string; toolName?: string } | null {
  if (!msg?.message?.role) return null;
  
  const role = msg.message.role;
  const content = msg.message.content;
  
  if (!content) return null;
  
  // String content
  if (typeof content === "string") {
    return { role, text: content };
  }
  
  // Array content - extract text blocks
  if (Array.isArray(content)) {
    // Check for tool calls
    const toolCalls = content.filter((b: any) => b.type === "toolCall");
    if (toolCalls.length > 0) {
      const tc = toolCalls[0];
      const args = tc.input || tc.arguments || {};
      const summary = args.command || args.file_path || args.path || args.query || args.action || "";
      return { role, text: `${tc.name}(${typeof summary === "string" ? summary.slice(0, 100) : ""})`, toolName: tc.name };
    }
    
    // Check for tool results
    const toolResults = content.filter((b: any) => b.type === "toolResult");
    if (toolResults.length > 0) {
      const tr = toolResults[0];
      const resultText = typeof tr.content === "string" ? tr.content : JSON.stringify(tr.content);
      return { role: "tool", text: resultText.slice(0, 200) };
    }
    
    // Text blocks
    const textBlocks = content.filter((b: any) => b.type === "text" && b.text);
    if (textBlocks.length > 0) {
      return { role, text: textBlocks.map((b: any) => b.text).join("\n") };
    }
  }
  
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get("sessionKey");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 30;

  if (!sessionKey) {
    return NextResponse.json({ error: "sessionKey required" }, { status: 400 });
  }

  const transcriptPath = await findTranscriptPath(sessionKey);
  if (!transcriptPath) {
    return NextResponse.json({ messages: [], error: "Transcript not found" });
  }

  try {
    const content = await fs.readFile(transcriptPath, "utf-8");
    const allLines = content.split("\n").filter((l) => l.trim());
    const recentLines = allLines.slice(-limit);

    const messages: Array<{ role: string; text: string; toolName?: string; timestamp?: string }> = [];

    for (const line of recentLines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === "message" && parsed.message) {
          const display = extractDisplayMessage(parsed);
          if (display) {
            messages.push({
              ...display,
              timestamp: parsed.timestamp,
            });
          }
        }
      } catch { continue; }
    }

    return NextResponse.json({ messages, path: transcriptPath });
  } catch (error: any) {
    return NextResponse.json({ messages: [], error: error.message });
  }
}
