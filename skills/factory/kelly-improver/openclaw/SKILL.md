---
name: openclaw
description: Complete OpenClaw documentation for AI consumption. Use when working on factory architecture, gateway configuration, agent setup, or session management. Always reference this instead of assumptions.
---

# OpenClaw Documentation Reference

**Primary source:** https://docs.openclaw.ai/

**Local docs mirror:** `/opt/homebrew/lib/node_modules/openclaw/docs`

**When to use this skill:**
- Working on factory architecture (gateway, agents, sessions)
- Configuring OpenClaw (channels, permissions, routing)
- Understanding agent workspaces (AGENTS.md, SOUL.md, TOOLS.md structure)
- Debugging session management (reset policy, DM scope, isolation)
- Proposing factory improvements that touch OpenClaw primitives

**Critical:** Do NOT assume how OpenClaw works. Always check this documentation first.

---

## What is OpenClaw?

OpenClaw is a self-hosted gateway that connects chat apps (WhatsApp, Telegram, Discord, iMessage, etc.) to AI coding agents. You run a single Gateway process on your machine, and it becomes the bridge between messaging apps and an always-available AI assistant.

**Key capabilities:**
- Self-hosted (runs on your hardware, your rules)
- Multi-channel (one Gateway serves multiple chat apps simultaneously)
- Agent-native (tool use, sessions, memory, multi-agent routing)
- Open source (MIT licensed)

**Requirements:** Node 22+, API key (Anthropic/OpenAI), 5 minutes

---

## Gateway Architecture

### Overview

- **Single long-lived Gateway** owns all messaging surfaces (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, WebChat)
- **Control-plane clients** (macOS app, CLI, web UI, automations) connect over WebSocket (default `127.0.0.1:18789`)
- **Nodes** (macOS/iOS/Android/headless) also connect over WebSocket with `role: node` + caps/commands
- **One Gateway per host** — only place that opens WhatsApp session

### Components

**Gateway (daemon):**
- Maintains provider connections
- Exposes typed WS API (requests, responses, server-push events)
- Validates inbound frames against JSON Schema
- Emits events: agent, chat, presence, health, heartbeat, cron

**Clients (mac app / CLI / web admin):**
- One WS connection per client
- Send requests: health, status, send, agent, system-presence
- Subscribe to events: tick, agent, presence, shutdown

**Nodes (macOS / iOS / Android / headless):**
- Connect with `role: node`
- Provide device identity (pairing is device-based)
- Expose commands: canvas.*, camera.*, screen.record, location.get

### Wire Protocol

- Transport: WebSocket, text frames with JSON payloads
- First frame must be `connect`
- Requests: `{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
- Events: `{type:"event", event, payload, seq?, stateVersion?}`
- Idempotency keys required for side-effecting methods (send, agent)

### Pairing + Local Trust

- All WS clients include device identity on connect
- New device IDs require pairing approval
- Local connects (loopback or gateway host's tailnet) can be auto-approved
- Non-local connects must sign challenge nonce + require explicit approval

### Remote Access

- **Preferred:** Tailscale or VPN
- **Alternative:** SSH tunnel  
  `ssh -N -L 18789:127.0.0.1:18789 user@host`
- Same handshake + auth token apply over tunnel

---

## Agent Runtime

### Workspace (required)

OpenClaw uses a single agent workspace directory (`agents.defaults.workspace`) as the agent's only working directory (cwd) for tools and context.

**Recommended:** Use `openclaw setup` to create `~/.openclaw/openclaw.json` and initialize workspace files.

### Bootstrap Files (injected)

Inside workspace, OpenClaw expects these user-editable files:

- `AGENTS.md` — operating instructions + "memory"
- `SOUL.md` — persona, boundaries, tone
- `TOOLS.md` — user-maintained tool notes (conventions, skill guidance)
- `BOOTSTRAP.md` — one-time first-run ritual (deleted after completion)
- `IDENTITY.md` — agent name/vibe/emoji
- `USER.md` — user profile + preferred address

**On first turn of new session:** OpenClaw injects these files into agent context.

**Blank files skipped.** Large files trimmed/truncated with marker. If missing, single "missing file" marker injected.

**BOOTSTRAP.md:** Only created for brand new workspace (no other bootstrap files present). Delete after completing ritual — won't be recreated.

**To disable bootstrap creation entirely:** Set `{ agent: { skipBootstrap: true } }`

### Built-in Tools

Core tools (`read`, `exec`, `edit`, `write`) always available, subject to tool policy.

**TOOLS.md does NOT control which tools exist** — it's guidance for how you want them used.

### Skills

OpenClaw loads skills from three locations (workspace wins on name conflict):

1. **Bundled** (shipped with install)
2. **Managed/local:** `~/.openclaw/skills`
3. **Workspace:** `<workspace>/skills`

Skills can be gated by config/env (see Gateway configuration).

### Model Refs

Model refs in config (e.g., `agents.defaults.model`) are parsed by splitting on first `/`.

- Use `provider/model` when configuring models
- If model ID contains `/` (OpenRouter-style), include provider prefix: `openrouter/moonshotai/kimi-k2`
- If you omit provider, OpenClaw treats input as alias or model for default provider

---

## Session Management

### Session Keys

OpenClaw treats one direct-chat session per agent as primary. Sessions follow this pattern:

**Direct chats:** `agent:<agentId>:<mainKey>` (default `main`)  
**Group chats:** `agent:<agentId>:<channel>:group:<groupId>`

### DM Scope (critical for multi-user setups)

**Security Warning:** If your agent receives DMs from multiple people, enable secure DM mode. Without it, all users share same conversation context (can leak private info).

**Example problem with default settings:**
- Alice DMs about private topic (medical appointment)
- Bob DMs "What were we talking about?"
- Because both share same session, model may answer Bob using Alice's context

**Fix:** Set `dmScope` to isolate sessions per user:

```json
{
  "session": {
    "dmScope": "per-channel-peer"  // Isolate DM context per channel + sender
  }
}
```

**Options:**
- `main` (default) — all DMs share main session (continuity, single-user only)
- `per-peer` — isolate by sender id across channels
- `per-channel-peer` — isolate by channel + sender (recommended for multi-user)
- `per-account-channel-peer` — isolate by account + channel + sender (multi-account inboxes)

**Identity Links:** Map provider-prefixed peer ids to canonical identity so same person shares DM session across channels:

```json
{
  "session": {
    "identityLinks": {
      "alice": ["telegram:123456789", "discord:987654321012345678"]
    }
  }
}
```

### Gateway is Source of Truth

All session state owned by gateway. UI clients must query gateway for session lists and token counts (not read local files).

**Where state lives:**
- Store file: `~/.openclaw/agents/<agentId>/sessions/sessions.json` (per agent)
- Transcripts: `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`
- Telegram topic sessions: `.../<sessionId>-topic-<topicId>.jsonl`

### Session Lifecycle

**Reset policy:** Sessions reused until they expire, evaluated on next inbound message.

- **Daily reset:** Defaults to 4:00 AM local time (gateway host). Session stale once last update earlier than most recent reset time.
- **Idle reset (optional):** `idleMinutes` adds sliding idle window. Whichever expires first wins.
- **Per-type overrides:** `resetByType` for direct, group, thread sessions
- **Per-channel overrides:** `resetByChannel` for specific channels

**Reset triggers:** `/new` or `/reset` start fresh session. `/new` accepts model alias, provider/model for new session model.

**Manual reset:** Delete keys from store or remove JSONL transcript.

### Session Pruning

OpenClaw trims old tool results from in-memory context right before LLM calls by default. Does NOT rewrite JSONL history.

### Pre-Compaction Memory Flush

When session nears auto-compaction, OpenClaw can run silent memory flush turn that reminds model to write durable notes to disk. Only runs when workspace is writable.

---

## Configuration

### Minimal Config

At minimum, set:
- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom` (strongly recommended)

### Example Configuration

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "model": "anthropic/claude-sonnet-4-5"
    }
  },
  "session": {
    "dmScope": "per-channel-peer",
    "reset": {
      "mode": "daily",
      "atHour": 4,
      "idleMinutes": 120
    }
  },
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

---

## CLI Commands

### Gateway Operations

```bash
openclaw gateway status      # Check gateway status
openclaw gateway start       # Start gateway (foreground)
openclaw gateway stop        # Stop gateway
openclaw gateway restart     # Restart gateway
```

### Session Management

```bash
openclaw status              # Show store path + recent sessions
openclaw sessions --json     # Dump every entry
openclaw sessions --active   # Filter active sessions
```

### In-Chat Commands

**Send as standalone messages:**

- `/status` — Check agent reachability, context usage, thinking/verbose toggles
- `/context list` — See what's in system prompt + injected files
- `/context detail` — See biggest context contributors
- `/stop` — Abort current run, clear queued followups, stop sub-agents
- `/compact [instructions]` — Summarize older context, free up window space
- `/new [model]` — Start fresh session (optionally with new model)
- `/reset` — Start fresh session (same as `/new`)
- `/send on` — Allow delivery for this session (runtime override)
- `/send off` — Deny delivery for this session
- `/send inherit` — Clear override, use config rules

---

## Multi-Agent Architecture

### Sessions and Sub-Agents

OpenClaw supports:
- **Main sessions** (agent-level, long-lived)
- **Sub-agent sessions** (spawned for specific tasks)
- **Session routing** (multi-agent coordination)

**Sub-agent spawning:**
```javascript
sessions_spawn({
  agentId: "bmad-bmm-john",
  label: "john-prd-project-id",
  task: "Execute create-prd workflow...",
  cleanup: "delete"  // Auto-cleanup after completion
})
```

**Session keys for sub-agents:**  
`agent:<agentId>:subagent:<uuid>`

### Presence

Agents can broadcast presence (thinking, typing, available) to connected clients.

---

## Common Pitfalls

1. **Assuming session isolation without configuring `dmScope`** → Privacy leaks in multi-user setups
2. **Not setting `allowFrom` on channels** → Open relay, security risk
3. **Editing OpenClaw source files instead of config** → Changes lost on update
4. **Assuming TOOLS.md controls tool availability** → It's guidance, not policy
5. **Reading local session files instead of querying gateway** → Stale data in remote setups

---

## For OpenClaw Factory Integration

**Key principles:**
- Gateway is single source of truth for sessions
- Agent workspaces are isolated (per-agent AGENTS.md, SOUL.md, TOOLS.md)
- Skills load from workspace > managed > bundled (workspace wins)
- Sessions follow DM scope rules (configure for multi-user security)
- Sub-agents spawn with `sessions_spawn`, auto-cleanup on completion

**Factory-specific:**
- Kelly Router = main agent (orchestrates projects)
- Project Lead = sub-agent per project (`agent:project-lead:project-<id>`)
- BMAD personas = sub-agents (`agent:bmad-bmm-<persona>:subagent:<uuid>`)
- Each agent has dedicated workspace with own AGENTS.md/SOUL.md/TOOLS.md

**Configuration for factory:**
- Set `dmScope: "per-channel-peer"` (multi-user safe)
- Configure `allowFrom` or pairing for operator access
- Use `identityLinks` if operator has multiple chat accounts
- Set appropriate `reset` policy (daily + idle recommended)

---

## Full Documentation

**Complete docs:** https://docs.openclaw.ai/

**Local mirror:** `/opt/homebrew/lib/node_modules/openclaw/docs`

**GitHub repo:** https://github.com/openclaw/openclaw

**Discord:** Community links in docs

---

**When working on factory improvements or OpenClaw configuration: READ THIS SKILL FIRST before making assumptions about how OpenClaw works.**
