---
name: session-recovery
description: Detect and recover frozen orchestrator sessions (Project Lead, Research Lead) that hit token limits or API errors. Use when heartbeat detects unresponsive sessions.
---

# Session Recovery - Frozen Session Detection & Restart

**Purpose:** Detect frozen orchestrator sessions (Project Lead, Research Lead) and restart them cleanly with context preservation.

**When to use:** Kelly's heartbeat detects a stalled project and Project Lead session doesn't respond to status checks.

---

## Architecture Context

### The Problem

Orchestrator sessions (Project Lead, Research Lead) can freeze when:
- Token count exceeds model context window (>200k for Claude Sonnet)
- Single tool result output is massive (e.g., git operations listing hundreds of files)
- Session hits 400 errors and can't recover
- Context jumps over compaction threshold in one turn

**Symptoms:**
- Project `lastUpdated` stale (>60 min)
- PL session doesn't respond to `sessions_send` messages
- Transcript shows repeated 400 errors
- Session exists in `openclaw sessions` but won't accept new turns

### Why Tools Can't Fix It

**Missing from OpenClaw core:** `sessions_restart(sessionKey, reason)` tool doesn't exist yet.

**Available tools:**
- `sessions_send` — sends message, but frozen session can't process it
- `sessions_list` — shows frozen session, can't restart it
- `sessions_history` — shows error messages, can't clear them

**This skill bridges the gap** until `sessions_restart` is added to OpenClaw core.

---

## Usage

### 1. Detect Frozen Session (Kelly Heartbeat)

```typescript
// In Kelly's heartbeat workflow:
// 1. Check project-registry.json for stalled projects
// 2. Send status ping to PL via sessions_send
// 3. If no response in 5 min:
//    - Check transcript file for 400 errors
//    - If frozen: call session-recovery skill
```

### 2. Recover Session

```bash
/Users/austenallred/clawd/skills/factory/session-recovery/bin/recover-session \
  --session-key "agent:project-lead:project-slacklite" \
  --reason "frozen-token-overflow" \
  --context-refresh "Priority: Deploy Vercel to ANY domain, fix RTDB security vulnerability"
```

**Parameters:**
- `--session-key` — Full session key (e.g., `agent:project-lead:project-{projectId}`)
- `--reason` — Why restart needed (frozen-token-overflow | unresponsive | error-loop)
- `--context-refresh` — Message to send to fresh session (state + priorities)

**What it does:**
1. Locates transcript file via OpenClaw config
2. Archives frozen transcript to `~/.openclaw/agents/{agent}/sessions/archive/`
3. Removes session state from Gateway session store
4. Sends context refresh message to create fresh session with same sessionKey
5. Logs recovery to `memory/YYYY-MM-DD.md`

---

## Implementation Notes

### Session File Locations

OpenClaw stores session state in:
- **Agent sessions:** `~/.openclaw/agents/{agentId}/sessions/`
- **Transcripts:** `~/.openclaw/agents/{agentId}/sessions/{sessionId}.jsonl`
- **Session metadata:** `~/.openclaw/agents/{agentId}/sessions/sessions.json`

### Recovery Process

**Step 1: Archive transcript**
```bash
# Find transcript path from sessions.json
SESSION_ID=$(jq -r '.sessions[] | select(.key=="agent:project-lead:project-slacklite") | .sessionId' sessions.json)
# Archive it
mv ${SESSION_ID}.jsonl archive/${SESSION_ID}-$(date +%s).jsonl
```

**Step 2: Clear session state**
```bash
# Remove session entry from sessions.json
jq 'del(.sessions[] | select(.key=="agent:project-lead:project-slacklite"))' sessions.json > sessions.tmp && mv sessions.tmp sessions.json
```

**Step 3: Send context refresh**
```bash
# Use openclaw gateway call to send message (creates new session with same key)
openclaw gateway call agent \
  --params "{\"message\":\"${CONTEXT_REFRESH}\",\"sessionKey\":\"${SESSION_KEY}\",\"idempotencyKey\":\"$(uuidgen)\"}" \
  --expect-final --timeout 120000
```

### Safety Constraints

**Pre-flight checks:**
- ✅ Verify session is actually frozen (check for 400 errors in transcript)
- ✅ Verify project exists in registry (don't restart orphan sessions)
- ✅ Confirm operator approval if not running in autonomous mode

**State preservation:**
- ✅ Archive transcript (don't delete work history)
- ✅ Include project state in context refresh (load from registry)
- ✅ Log recovery event to daily memory

**Idempotency:**
- ✅ Safe to run multiple times (won't corrupt if session already recovered)
- ✅ Archive uses timestamps to prevent overwriting

---

## Kelly Heartbeat Integration

**Update HEARTBEAT.md:**

```markdown
### Active Project Stall Check

**Task:** Check if any active projects have stalled without Project Lead escalation.

**Process:**
1. Read `projects/project-registry.json` to identify active projects
2. For each active (non-paused) project, check `timeline.lastUpdated`
3. If >60 minutes with no updates:
   - Send "Status check - any blockers?" to Project Lead
   - Wait 5 minutes for response
4. **If PL doesn't respond:**
   - Check transcript for 400 errors / token overflow
   - **If frozen: Run session recovery**
   - Alert operator: "🔧 Auto-recovering frozen PL session for {project}"
5. If PL responds but still blocked: escalate to operator

**Session Recovery Command:**
```bash
/Users/austenallred/clawd/skills/factory/session-recovery/bin/recover-session \
  --session-key "agent:project-lead:project-{projectId}" \
  --reason "unresponsive-to-status-check" \
  --context-refresh "Context refresh after recovery. Check sprint-status.yaml and continue from last checkpoint."
```
```

---

## Future: sessions_restart Tool

**Ideal architecture (OpenClaw core):**

```typescript
// Add to OpenClaw gateway tools
sessions_restart(sessionKey: string, reason: string, contextRefresh?: string): {
  ok: boolean;
  archivedTranscript: string;
  newSessionId: string;
}
```

**Benefits:**
- Built-in safety checks (verify session frozen before restart)
- Atomic operation (archive + clear + refresh in one transaction)
- Proper error handling (rollback if context refresh fails)
- Gateway-level logging (audit trail for all restarts)

**This skill is a workaround** until that tool exists.

---

## Related Docs

- `docs/core/kelly-router-flow.md` — Kelly's monitoring responsibilities
- `docs/core/project-lead-flow.md` — Project Lead workflow
- `docs/core/state-management.md` — State persistence during recovery
- `HEARTBEAT.md` — Kelly's heartbeat workflow (stall detection)

---

**Status:** Active workaround  
**Supersedes:** Manual session recovery via file deletion  
**Blocked on:** OpenClaw core `sessions_restart` tool (not yet implemented)
