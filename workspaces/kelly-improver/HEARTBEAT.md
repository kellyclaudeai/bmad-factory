# HEARTBEAT.md

## Project Health Check (Every 30-60 minutes)

### 1. Check for Projects Ready for User QA

**Task:** Surface projects that Project Lead has moved to userQA.

**Process:**
1. Read all `projects/*/project-state.json` files
2. Find projects with `stage: "userQA"` AND `qaUrl` field present
3. Check `heartbeat-state.json` → if project NOT in `surfacedQA` list:
   - Alert operator: "🧪 **{projectName}** ready for user QA: {qaUrl}"
   - Add projectId to `surfacedQA` list in `heartbeat-state.json`
4. If project status changes from "userQA" to "paused", remove from surfacing

**What NOT to surface:**
- Projects with status "paused" (user explicitly paused QA)
- Projects already surfaced (check `surfacedQA` list)
- Projects without a `qaUrl` (not ready yet)

### 2. Active Project Stall Check

**Task:** Check if any active projects have stalled without Project Lead escalation.

**Process:**
1. Read `factory-state.md` to identify active projects (status: "in-progress")
2. **Skip projects with status "paused"** (user explicitly paused them)
3. For each active (non-paused) project, check last state file update timestamp
4. If a project has been in the same stage >90 minutes with no file updates:
   - Send message to Project Lead: "Status check - any blockers? (Kelly safety net ping)"
   - If Project Lead responds "all good", mark in `heartbeat-state.json` and skip for 60 min
   - If Project Lead confirms blocker OR doesn't respond in 5 min, escalate to operator
5. Update `heartbeat-state.json` with check timestamp

**When to escalate to operator:**
- Project Lead confirms they're blocked after retry attempts
- Project Lead session doesn't respond to ping (session may be dead)
- Project has been stalled >3 hours even with "all good" responses (sanity check)

**Storage:**
```json
{
  "lastProjectCheck": 1708128000,
  "surfacedQA": ["calculator-app", "kelly-dashboard"],
  "projectChecks": {
    "fleai-market-v4": {
      "lastPing": 1708128000,
      "status": "ok",
      "stage": "stage-1-planning"
    }
  }
}
```

---

## Pausing Projects

When operator says "pause {project}" or "pause QA for {project}":
1. Update `factory-state.md` → change status to "paused" with reason
2. Kelly stops surfacing the project in heartbeat checks
3. To resume: change status back to "in-progress" or "userQA"

---

**Note:** This is a **safety net**, not primary monitoring. Project Lead should notify proactively. This catches edge cases where Project Lead doesn't notify or report an issue.
