# HEARTBEAT.md

## 1. Project Lead Session Heartbeat (Every 60 seconds)

**Task:** Distribute heartbeat messages to all active Project Lead sessions so they can poll their projects autonomously.

**Process:**
1. Read `~/.openclaw/agents/project-lead/sessions/sessions.json`
2. Filter for sessions matching `agent:project-lead:project-*`
3. Filter for recently active (updated in last 60 minutes)
4. For each active PL session, send heartbeat via `sessions_send`

**Implementation:**
```javascript
const fs = require('fs');
const sessionsPath = '/Users/austenallred/.openclaw/agents/project-lead/sessions/sessions.json';

try {
    const store = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    const now = Date.now();
    const activeThreshold = 60 * 60 * 1000; // 60 minutes
    
    for (const [sessionKey, entry] of Object.entries(store)) {
        // Filter: only project-lead project sessions
        if (!sessionKey.startsWith('agent:project-lead:project-')) continue;
        
        // Filter: only recently active sessions
        if (!entry?.updatedAt || (now - entry.updatedAt) > activeThreshold) continue;
        
        // Send heartbeat message
        await sessions_send({
            sessionKey: sessionKey,
            message: "HEARTBEAT_POLL"
        });
    }
} catch (err) {
    // Sessions file doesn't exist or empty - skip silently
}
```

**Why:** Gateway heartbeats only fire for `:main` sessions, not custom session keys like `project-slacklite`. This workaround makes Kelly distribute heartbeats to all active PL sessions every 60s, enabling their autonomous polling loops.

---

## 2. Project Health Check (Every 30-60 minutes)

### 2.1. Check for Projects Ready for User QA

**Task:** Surface projects that Project Lead has moved to QA.

**Process:**
1. Read `projects/project-registry.json`
2. Filter for projects with:
   - `state: "in-progress"` 
   - `implementation.qaUrl` present
   - `surfacedForQA: false`
3. For each match:
   - Alert operator: "🧪 **{name}** ready for user QA: {implementation.qaUrl}"
   - Update registry: set `surfacedForQA: true` for that project
4. If project `paused: true`, stop surfacing

**What NOT to surface:**
- Projects with `paused: true` (user explicitly paused QA)
- Projects with `surfacedForQA: true` (already announced)
- Projects without `implementation.qaUrl` (not ready yet)

### 2.2. Active Project Stall Check with Auto-Recovery

**Task:** Check if any active projects have stalled without Project Lead escalation. Auto-recover frozen sessions.

**Process:**
1. Read `projects/project-registry.json` to identify active projects (state: "in-progress")
2. **Skip projects with `paused: true`** (user explicitly paused them)
3. For each active (non-paused) project, check `timeline.lastUpdated`:
   - Compare with current time
   - Use registry's `timeline.lastUpdated` as source of truth
4. If a project has been in same state **>20 minutes** with no registry updates:
   - Send message to Project Lead: "Status check - any blockers? (Kelly safety net ping)"
   - Wait 5 minutes for response
5. **If Project Lead doesn't respond:**
   - Check if PL session is frozen (via `sessions_history` - look for 400 errors)
   - **If frozen (token overflow / 400 errors):**
     - **AUTO-RECOVER:** Run session recovery skill
     - Alert operator: "🔧 Auto-recovered frozen PL session for {projectName}"
   - **If not frozen but unresponsive:** Escalate to operator with diagnosis
6. If Project Lead responds "all good": note in daily memory, skip for 45 min
7. If Project Lead confirms blocker: escalate to operator

**Session Recovery Command:**
```bash
/Users/austenallred/clawd/skills/factory/session-recovery/bin/recover-session \
  --session-key "agent:project-lead:project-{projectId}" \
  --reason "unresponsive-to-status-check" \
  --context-refresh "Context refresh after recovery. Read sprint-status.yaml and project-registry.json. Continue from last checkpoint. Priority: {priorities from registry}."
```

**When to escalate to operator (without auto-recovery):**
- Project Lead confirms they're blocked after retry attempts
- Project has been stalled **>60 minutes** even with "all good" responses (sanity check)
- PL session is unresponsive but NOT frozen (may be in long operation)

**Note:** 20-minute threshold chosen because:
- Most subagent tasks complete in 5-15 minutes
- PL should spawn next wave within 5 minutes of completions
- 20 minutes means PL missed multiple 60-second polling cycles
- Catches stalls before they waste 45+ minutes of dev time

**Tracking:** Keep ephemeral notes in session memory (which project checked when). No persistent state needed—if Kelly restarts, it's fine to re-check projects. Document significant checks/escalations/recoveries in `memory/YYYY-MM-DD.md`.

---

## Pausing Projects

When operator says "pause {project}" or "pause QA for {project}":
1. Update `projects/project-registry.json` → set `paused: true` with `pausedReason`
2. Kelly stops surfacing the project in heartbeat checks
3. To resume: set `paused: false` in registry

---

### 2.3. Dashboard Health Check

**Task:** Ensure kelly-dashboard is running on port 3000.

**Process:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
- If HTTP 200 → fine, skip
- If anything else → restart via launchd:
  ```bash
  launchctl kickstart -k gui/$(id -u)/com.openclaw.kelly-dashboard
  ```
- If still down after kickstart → alert operator: "🚨 Dashboard down on :3000, launchd restart failed"

**Persistence:** Dashboard runs as a launchd service (`com.openclaw.kelly-dashboard`). Auto-restarts on crash. This heartbeat check is a safety net in case launchd itself has issues.

---

**Note:** This is a **safety net**, not primary monitoring. Project Lead should notify proactively. This catches edge cases where Project Lead doesn't notify or report an issue.
