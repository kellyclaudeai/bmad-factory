# HEARTBEAT.md

## Project Health Check (Every 30-60 minutes)

### 1. Check for Projects Ready for User QA

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

### 2. Active Project Stall Check

**Task:** Check if any active projects have stalled without Project Lead escalation.

**Process:**
1. Read `projects/project-registry.json` to identify active projects (state: "in-progress")
2. **Skip projects with `paused: true`** (user explicitly paused them)
3. For each active (non-paused) project, check `timeline.lastUpdated`:
   - Compare with current time
   - Use registry's `timeline.lastUpdated` as source of truth
4. If a project has been in same state **>60 minutes** with no registry updates:
   - Send message to Project Lead: "Status check - any blockers? (Kelly safety net ping)"
   - If Project Lead responds "all good", note in daily memory file and skip for 45 min
   - If Project Lead confirms blocker OR doesn't respond in 5 min, escalate to operator

**When to escalate to operator:**
- Project Lead confirms they're blocked after retry attempts
- Project Lead session doesn't respond to ping (session may be dead)
- Project has been stalled **>2 hours** even with "all good" responses (sanity check)

**Tracking:** Keep ephemeral notes in session memory (which project checked when). No persistent state needed—if Kelly restarts, it's fine to re-check projects. Document significant checks/escalations in `memory/YYYY-MM-DD.md`.

---

## Pausing Projects

When operator says "pause {project}" or "pause QA for {project}":
1. Update `projects/project-registry.json` → set `paused: true` with `pausedReason`
2. Kelly stops surfacing the project in heartbeat checks
3. To resume: set `paused: false` in registry

---

### 3. Dashboard Health Check

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
