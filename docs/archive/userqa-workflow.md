# User QA Workflow

**⚠️ DEPRECATED:** 2026-02-18 - Merged into `project-lead-flow.md` Phase 4

This content is now part of the main Project Lead flow documentation. See:
- `/Users/austenallred/clawd/docs/project-lead-flow.md` → Phase 4: User QA

---

This document describes the complete workflow for surfacing projects ready for user testing.

## Overview

When a Project Lead completes TEA and the project is ready for human validation, this workflow ensures:
1. The app is hosted/deployed with a testable URL
2. Kelly automatically detects and surfaces it to the operator
3. The operator can pause projects when needed

## Actors

- **Project Lead** - Autonomous orchestrator for each project
- **Kelly** - Main router/coordinator with heartbeat monitoring
- **Operator** - Human (Austen) who performs QA testing

## Flow Diagram

```
Project Lead (TEA passes)
  ↓
1. Host/Deploy App (localhost or Vercel)
  ↓
2. Update project-state.json
   - stage: "userQA"
   - qaUrl: "http://localhost:3000"
   - qaReadyAt: timestamp
   - qaInstructions: "..."
  ↓
3. Send message to Kelly
   "🧪 Project {name} ready for user QA: {url}"
  ↓
[Project Lead Heartbeat every 5-10 min]
  ↓ (self-check)
  stage="userQA" but no qaUrl? → Complete Stage 4.5 NOW
  ↓

Kelly Heartbeat (every 30-60 min)
  ↓
4. Scan projects/*/project-state.json
   - stage="userQA" AND qaUrl present?
   - NOT already in surfacedQA list?
  ↓
5. Surface to Operator
   "🧪 **Calculator App** ready for user QA: http://localhost:3000"
  ↓
6. Add to heartbeat-state.json → surfacedQA[]
  ↓
Operator Tests
  ↓
  [PASS] → Project Lead deploys to production → status="shipped"
  [PAUSE] → Kelly updates factory-state.md → status="paused"
```

## Project Lead Responsibilities

### Stage 4.5: User QA Preparation

When TEA passes, Project Lead MUST:

#### 1. Host or Deploy
Choose based on project type:
- **Local (default):** `npm run dev` (or equivalent)
  - Bind to `0.0.0.0` if Tailscale access needed
  - Note exact URL (usually `http://localhost:3000`)
- **Vercel (web apps):** Deploy preview/production
  - Get live URL (e.g., `https://app-name.vercel.app`)

#### 2. Update project-state.json
```json
{
  "stage": "userQA",
  "qaUrl": "http://localhost:3000",
  "qaReadyAt": "2026-02-16T18:50:00Z",
  "qaInstructions": "Run 'npm run dev' in projects/{projectId}. Test features: ..."
}
```

**Required fields:**
- `qaUrl` - Testable URL (localhost or deployed)
- `qaReadyAt` - ISO timestamp
- `qaInstructions` - How to run/test (especially for localhost)

#### 3. Notify Kelly (Push)
```javascript
sessions_send(
  sessionKey="agent:main",
  message="🧪 Project {projectName} ready for user QA: {qaUrl}\n\n{brief instructions}"
)
```

This is **push-based notification** (immediate). Kelly's heartbeat provides **pull-based detection** (safety net).

#### 4. Update factory-state.md
Ensure project is listed with current status visible to Kelly's monitoring.

### Project Lead's Own Heartbeat (Self-Healing)

**Every 5-10 minutes**, Project Lead checks their own progress:
- **If stage="userQA" but no qaUrl field:**
  - Caught completion gap! (forgot Stage 4.5)
  - Action: Host app, update project-state.json, notify Kelly
  - Log: "Caught missing userQA setup, completed Stage 4.5"

This prevents Project Lead from moving to userQA but forgetting to make it testable.

## Kelly Heartbeat Responsibilities

### Every 30-60 Minutes

#### 1. Check for Projects Ready for QA

**Process:**
1. Read all `projects/*/project-state.json` files
2. Filter for: `stage="userQA"` AND `qaUrl` present
3. Check `heartbeat-state.json` → if NOT in `surfacedQA[]`:
   - Alert operator: `🧪 **{projectName}** ready for user QA: {qaUrl}`
   - If `qaInstructions` exist, include them
   - Add `projectId` to `surfacedQA[]` in `heartbeat-state.json`

**What NOT to surface:**
- Projects with `status="paused"` (explicitly paused by operator)
- Projects already in `surfacedQA[]` list
- Projects without a `qaUrl` (not ready yet)

#### 2. Check for Stalled Projects (Safety Net)

Only for projects with `status="in-progress"` (NOT "paused"):
1. Check last state file update timestamp
2. If stalled >90 minutes → ping Project Lead
3. If no response or confirmed blocker → escalate to operator

**Skip all checks for paused projects.**

## Pausing Workflow

### When Operator Says "Pause {project}"

Kelly should:
1. Update `factory-state.md` → change project status to `"paused"`
2. Add reason/context if provided
3. Confirm to operator: "✅ Paused {project}. Won't surface in heartbeats until resumed."

### Resuming

Change status back:
- `"paused"` → `"in-progress"` (if still building)
- `"paused"` → `"userQA"` (if ready for testing again)

Kelly will automatically resume monitoring on next heartbeat.

## State Files

### heartbeat-state.json
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

**Fields:**
- `surfacedQA` - Projects already shown to operator (prevents duplicates)
- `projectChecks` - Safety net ping tracking for stalled projects

### project-state.json (Example)
```json
{
  "projectId": "calculator-app",
  "projectName": "Calculator App",
  "stage": "userQA",
  "qaUrl": "http://localhost:3000",
  "qaReadyAt": "2026-02-17T00:50:00Z",
  "qaInstructions": "Run 'npm run dev' in projects/calculator-app. Test: Click calculator buttons or use keyboard.",
  "workflow": "barry-fast-mode-greenfield",
  "pipelineStages": {
    "userQA": {
      "status": "active",
      "startedAt": "2026-02-17T00:50:00Z"
    }
  }
}
```

### factory-state.md
```markdown
### calculator-app
- **Status:** 🧪 **USER QA** - Ready for testing
- **QA URL:** http://localhost:3000
- **Completed:** 2026-02-16 18:50 CST

### fleai-market-v4
- **Status:** ⏸️ **PAUSED** - User requested pause (operator busy this week)
- **Repo path:** `projects/fleai-market-v4`
```

## Example Flow

### Happy Path (calculator-app)

1. **Project Lead** (18:50 CST):
   - TEA passes ✅
   - Adds `qaUrl`, `qaInstructions` to `project-state.json`
   - Sends to Kelly: "🧪 Calculator App ready for user QA: http://localhost:3000"

2. **Kelly** receives push notification:
   - Immediately surfaces to operator in chat
   - Operator sees message right away

3. **Kelly Heartbeat** (next cycle, 19:30 CST):
   - Scans `projects/calculator-app/project-state.json`
   - Sees `stage="userQA"`, `qaUrl` present
   - Checks `heartbeat-state.json` → calculator-app NOT in `surfacedQA[]`
   - **Would** surface, but Kelly already did via push notification
   - Adds `calculator-app` to `surfacedQA[]` to prevent duplicate alerts

4. **Operator** tests:
   - Opens `http://localhost:3000`
   - Tests calculator features
   - ✅ Approves → tells Kelly "ship it"

5. **Kelly** routes to Project Lead:
   - "Operator approved, deploy to production"

6. **Project Lead**:
   - Deploys to Vercel production
   - Updates `factory-state.md` → `status="shipped"`
   - Archives session via `session-closer`
   - Sends final: "🚢 SHIPPED: Calculator App at https://calc.vercel.app"

### Pause Example (fleai-market-v4)

1. **Operator** to Kelly:
   - "Pause fleai-market-v4, I'm busy this week"

2. **Kelly**:
   - Updates `factory-state.md` → status: "⏸️ **PAUSED** - User requested pause"
   - Confirms: "✅ Paused fleai-market-v4. Won't surface in heartbeats until resumed."

3. **Kelly Heartbeat** (every 30-60 min):
   - Scans projects
   - Sees fleai-market-v4 has `status="paused"`
   - **SKIPS** all checks (stall detection, QA surfacing, etc.)

4. **Resume** (later):
   - Operator: "Resume fleai-market-v4"
   - Kelly updates status back to `"in-progress"`
   - Next heartbeat resumes monitoring

## Implementation Checklist

### ✅ Completed
- [x] Updated `HEARTBEAT.md` (Kelly's responsibilities)
- [x] Updated Project Lead `AGENTS.md` (Stage 4.5 protocol)
- [x] Updated Project Lead `HEARTBEAT.md` (self-healing check for missing qaUrl)
- [x] Created `heartbeat-state.json` structure
- [x] Added QA fields to `calculator-app/project-state.json` (example)
- [x] Documented pause workflow

### 🔄 Next Steps (Automatic)
- [ ] Kelly's next heartbeat will check for userQA projects
- [ ] Project Lead sessions will follow new Stage 4.5 protocol
- [ ] Pausing will work as documented when operator requests it

## Benefits

1. **Automatic Detection:** Kelly finds projects ready for QA without manual pings
2. **No Duplicates:** `surfacedQA[]` tracking prevents repeat alerts
3. **Pause Support:** Operator can pause projects instead of constant pings
4. **Push + Pull:** Immediate notification (push) + safety net (heartbeat pull)
5. **Clear Handoff:** URL + instructions make testing frictionless
6. **File-Based State:** No reliance on chat context or memory
7. **Self-Healing:** Project Lead's heartbeat catches if they forgot to complete userQA setup (missing qaUrl)

## Notes

- **Timing:** Kelly's heartbeat runs every 30-60 minutes (configurable)
- **Priority:** Push notification (Project Lead → Kelly) is immediate
- **Safety Net:** Heartbeat catches cases where push fails or is missed
- **Testability:** All projects in userQA have a `qaUrl` field (required)
- **Discoverability:** Factory dashboard can show all userQA projects by scanning state files
