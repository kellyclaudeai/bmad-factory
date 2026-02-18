# Minimal State Files - Complete List

**Created:** 2026-02-18  
**Purpose:** Define the minimal set of state files needed after cleanup

---

## Option 1: Minimal (Recommended)

### Global State

**1. Project Registry** (already exists)
- **Path:** `/Users/austenallred/clawd/projects/project-registry.json`
- **Owner:** Research Lead creates, Project Lead updates, Kelly reads
- **Contains:**
  - All projects (discovery → in-progress → shipped → followup)
  - Lifecycle state (state, paused, pausedReason)
  - Timeline (discoveredAt, startedAt, shippedAt, lastUpdated)
  - Intake (problem, solution, targetAudience, keyFeatures)
  - Implementation metadata (projectDir, qaUrl, deployedUrl, repo)
  - Followup tasks
- **Purpose:** Single source of truth for project lifecycle

**2. Kelly Operational State** (new)
- **Path:** `/Users/austenallred/clawd/state/kelly.json`
- **Owner:** Kelly writes, Dashboard reads
- **Contains:**
  - Heartbeat metadata (lastProjectScan, projectChecks{})
  - Surfacing state (surfacedQA[])
  - Pending actions (pendingActions[])
  - Waiting-on items (waitingOn[])
  - Operational notes (notes[])
- **Purpose:** Track Kelly's operational state (not duplicate project data)

### Per-Project State

**3. BMAD Artifacts** (already exist)
- **Paths:**
  - `_bmad-output/implementation-artifacts/sprint-status.yaml` — Story statuses (todo/in-progress/done)
  - `_bmad-output/implementation-artifacts/dependency-graph.json` — Story dependencies
  - `_bmad-output/implementation-artifacts/stories/story-*.md` — Story requirements
  - `_bmad-output/planning-artifacts/*.md` — PRD, UX, architecture, epics
- **Owner:** BMAD personas write (Bob, John, Sally, Winston, Amelia)
- **Purpose:** Story requirements, dependencies, completion status

**4. Memory Files** (already exist)
- **Paths:**
  - `/Users/austenallred/clawd/memory/YYYY-MM-DD.md` — Daily logs
  - `/Users/austenallred/clawd/MEMORY.md` — Long-term curated memory
- **Owner:** Kelly writes (main session only)
- **Purpose:** Human-written context, decisions, lessons learned

### Total: 4 state tracking systems

1. Registry (lifecycle)
2. Kelly state (operational)
3. BMAD artifacts (stories/requirements)
4. Memory files (context)

**Deleted files:**
- ❌ `factory-state.md` — Duplicates registry data
- ❌ `heartbeat-state.json` — Merge into kelly.json
- ❌ `implementation-state.md` — Redundant with sprint-status.yaml
- ❌ `project-state.json` — Execution history not needed for state (see below)

---

## Option 2: With Execution Tracking

**Add back per-project execution tracking:**

**5. Project Execution Log** (optional)
- **Path:** `/Users/austenallred/clawd/projects/{projectId}/execution.json`
- **Owner:** Project Lead writes
- **Contains:**
  - Subagent spawn history (who, when, sessionKey, runId)
  - Completion tracking (startedAt, completedAt, duration)
  - Failure tracking (story, reason, timestamp, retries)
  - Current active subagents
- **Purpose:** Debug failed stories, track retry attempts, monitor active work

**Question:** Do we need execution history?

**Pro:** Useful for debugging ("why did story 2.8 fail 3 times?")  
**Con:** Adds complexity, 79 entries for takeouttrap feels like overkill

**Alternative:** Just log this in memory/YYYY-MM-DD.md as events happen (no structured tracking)

---

## What Each File Answers

### Registry
- What projects exist?
- What state is each project in? (discovery, in-progress, shipped, followup, paused)
- When did it start? When did it ship?
- Where is the deployed app?
- What's in the project queue?

### Kelly State
- When did I last check projects? (stall detection)
- Which projects have I already surfaced for QA? (don't re-announce)
- What's on my to-do list? (pending actions)
- What am I waiting on? (blocked items)

### BMAD Artifacts
- What stories exist? (epics.md, story files)
- What are the requirements? (story-*.md)
- What dependencies exist? (dependency-graph.json)
- Which stories are done? (sprint-status.yaml)

### Memory Files
- What happened today? (YYYY-MM-DD.md)
- What have I learned? (MEMORY.md)
- What decisions were made? (both)

### Execution Log (optional)
- Which Amelia session handled story X?
- When did it start? Complete? Fail?
- Why did it fail? How many retries?
- Which stories are currently being worked on?

---

## Recommendation

**Start with Option 1 (Minimal - 4 systems)**

**Rationale:**
- Registry already tracks what we need for lifecycle
- BMAD artifacts already track story status (sprint-status.yaml)
- Kelly just needs operational metadata (not execution history)
- Memory files capture decisions/context

**If we discover we need execution history:**
- Add execution.json later (don't over-engineer upfront)
- Start with logging to memory/YYYY-MM-DD.md
- Upgrade to structured tracking if needed

---

## Migration Impact

### Current (Fragmented)
- factory-state.md (Kelly summary)
- heartbeat-state.json (Kelly timestamps)
- project-state.json (79 subagent entries)
- implementation-state.md (human summary)
- sprint-status.yaml (BMAD)
- dependency-graph.json (BMAD)

### After Migration (Minimal)
- project-registry.json (lifecycle)
- state/kelly.json (operational)
- sprint-status.yaml (BMAD)
- dependency-graph.json (BMAD)
- memory/YYYY-MM-DD.md (context)

**Reduction:** 6 → 5 files (simpler, less duplication)

---

## Schema: kelly.json (Operational Only)

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-18T14:20:00-06:00",
  
  "heartbeat": {
    "lastProjectScan": 1739907600,
    "projectChecks": {
      "fleai-market-v5": {
        "lastCheck": 1739907600,
        "lastPingSent": null,
        "consecutiveStalls": 0
      }
    },
    "surfacedQA": ["calculator-app"]
  },
  
  "pendingActions": [
    {
      "id": "state-schema-decision",
      "description": "Operator decision on minimal vs execution tracking",
      "priority": "high",
      "addedAt": "2026-02-18T14:20:00-06:00"
    }
  ],
  
  "waitingOn": [
    {
      "what": "Research Lead v2.0 test completion",
      "who": "agent:research-lead:20260218-1340",
      "expectedAt": "2026-02-18T14:30:00-06:00"
    }
  ],
  
  "notes": [
    {
      "timestamp": "2026-02-18T13:40:00-06:00",
      "text": "Research Lead v2.0 test spawned"
    }
  ]
}
```

**No project data duplication.** Kelly reads registry for project info.

---

## Questions for Operator

1. **Option 1 (Minimal - 4 systems)** or **Option 2 (With execution tracking - 5 systems)**?
2. Is execution history (79 subagent entries) useful for debugging? Or overkill?
3. Should execution history just go in memory/YYYY-MM-DD.md as narrative logs?
4. Approve deleting: factory-state.md, heartbeat-state.json, implementation-state.md, project-state.json?
