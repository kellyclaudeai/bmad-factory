# State Schema Design Proposal

**⚠️ SUPERSEDED:** This proposal is obsolete. See `docs/core/state-management.md` for current unified state architecture.

**Created:** 2026-02-18  
**Superseded:** 2026-02-18 21:06 CST (eliminated kelly.json, unified state structure)  
**Purpose:** Define canonical state schemas for Kelly Router and Project Lead

---

## Current State (Fragmented + Overlapping)

### Existing (Good)
- `projects/project-registry.json` — Project lifecycle source of truth (already correct)

### Kelly Router (Needs Consolidation)
- `factory-state.md` — Markdown project summary (duplicates registry data)
- `heartbeat-state.json` — JSON timestamps (good, but separate file)

### Project Lead (Needs Expansion)
- `project-state.json` — JSON, basic metadata (missing implementation details)
- `implementation-state.md` — Markdown Phase 2 summary (should be in JSON)

**Problems:**
1. **Duplication:** factory-state.md duplicates registry data (project names, statuses, timelines)
2. **Fragmentation:** Kelly state split across 2 files (factory-state.md + heartbeat-state.json)
3. **Missing detail:** project-state.json lacks implementation tracking (stories, subagents, dependencies)
4. **Unclear ownership:** Who updates what? When?

---

## Three-Tier State Architecture

**Tier 1: Project Registry** (Lifecycle Source of Truth)
- **Location:** `/Users/austenallred/clawd/projects/project-registry.json`
- **Owner:** Research Lead creates, Project Lead updates, Kelly reads
- **Contains:** All projects (discovery → shipped → followup), intake data, timeline, implementation metadata (dirs, URLs)
- **Purpose:** Single source of truth for project lifecycle

**Tier 2: Kelly State** (Operational Tracking)
- **Location:** `/Users/austenallred/clawd/state/kelly-state.json`
- **Owner:** Kelly writes, Dashboard reads
- **Contains:** Heartbeat timestamps, surfaced QA list, pending actions, waiting-on items
- **Purpose:** Track Kelly's operational state (not duplicate project data)

**Tier 3: Project State** (Implementation Details)
- **Location:** `/Users/austenallred/clawd/projects/{projectId}/project-state.json`
- **Owner:** Project Lead writes, Kelly reads for stall detection
- **Contains:** Stories (completed/in-progress/blocked), subagents (active/completed/failed), dependency frontier
- **Purpose:** Fine-grained implementation tracking

**Key principle:** No duplication. Registry owns lifecycle, Kelly tracks operations, Project Lead tracks implementation.

---

## Design Questions

1. **Format:** JSON vs Markdown vs Hybrid?
2. **Granularity:** What level of detail do we actually need?
3. **Frequency:** How often do these get updated?
4. **Consumers:** Who/what reads these files? (Heartbeats, dashboard, operator, compaction)

---

## Proposal: All JSON

**Rationale:**
- Machine-parseable (easier for heartbeats, dashboard)
- Single source of truth (no markdown summary drifting from JSON state)
- Compaction can write structured updates (not free-form text)
- Dashboard can render human-readable views from JSON

**Tradeoff:**
- Lose quick-scan markdown summaries
- JSON harder for humans to read directly
- But: Dashboard + `jq` provide human views

---

## Schema: Kelly State (Operational Only)

**Location:** `/Users/austenallred/clawd/state/kelly-state.json`

**Philosophy:** Kelly state tracks **operational metadata only**. Project lifecycle data lives in `projects/project-registry.json` (single source of truth).

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-18T14:01:00-06:00",
  
  "heartbeat": {
    "lastProjectScan": 1739900520,
    "projectChecks": {
      "fleai-market-v5": {
        "lastCheck": 1739900520,
        "lastPingSent": null,
        "consecutiveStalls": 0,
        "note": null
      }
    },
    "surfacedQA": ["calculator-app", "kelly-dashboard"]
  },
  
  "pendingActions": [
    {
      "id": "compaction-decision",
      "description": "Operator decision on state schema proposal",
      "addedAt": "2026-02-18T14:01:00-06:00",
      "priority": "high"
    }
  ],
  
  "waitingOn": [
    {
      "what": "Research Lead v2.0 test completion",
      "who": "agent:research-lead:20260218-1340",
      "expectedAt": "2026-02-18T14:18:00-06:00"
    }
  ],
  
  "notes": [
    {
      "timestamp": "2026-02-18T13:40:00-06:00",
      "text": "Research Lead v2.0 test spawned (session 20260218-1340)"
    }
  ]
}
```

**Key fields:**
- `heartbeat.lastProjectScan` — Last time Kelly scanned registry
- `heartbeat.projectChecks{}` — Per-project stall detection state
- `heartbeat.surfacedQA[]` — Projects already announced for QA (don't re-announce)
- `pendingActions[]` — Kelly's to-do list
- `waitingOn[]` — Blocked on external completion
- `notes[]` — Operational timeline (not project timeline)

**What Kelly reads from registry:**
- `projects[].state` — Filter for "in-progress", "discovery"
- `projects[].implementation.qaUrl` — Check if ready for QA
- `projects[].timeline.lastUpdated` — Stall detection
- `projects[].paused` — Exclude from checks

---

## Schema: Project State

**Location:** `/Users/austenallred/clawd/projects/{projectId}/project-state.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-18T13:42:00-06:00",
  
  "project": {
    "projectId": "fleai-market-v5",
    "name": "Fleai - Flea Market + AI",
    "status": "in-progress",
    "stage": "implementation",
    "mode": "normal-greenfield",
    "sessionKey": "agent:project-lead:project-fleai-market-v5",
    "paused": false
  },
  
  "timeline": {
    "startedAt": "2026-02-17T10:00:00-06:00",
    "planningCompletedAt": "2026-02-17T11:30:00-06:00",
    "implementationStartedAt": "2026-02-17T11:45:00-06:00",
    "testingStartedAt": null,
    "qaReadyAt": null,
    "shippedAt": null
  },
  
  "planning": {
    "completed": true,
    "artifacts": {
      "prd": "_bmad-output/planning-artifacts/prd.md",
      "uxDesign": "_bmad-output/planning-artifacts/ux-design.md",
      "architecture": "_bmad-output/planning-artifacts/architecture.md",
      "epics": "_bmad-output/planning-artifacts/epics.md"
    },
    "gateCheck": {
      "status": "PASS",
      "checkedAt": "2026-02-17T11:30:00-06:00"
    }
  },
  
  "implementation": {
    "totalStories": 48,
    "completedStories": ["1.1", "1.2", "1.3", "2.1", "2.2"],
    "inProgressStories": ["2.3", "3.1"],
    "blockedStories": [],
    "failedStories": [],
    "dependencyGraph": "_bmad-output/implementation-artifacts/dependency-graph.json",
    
    "activeSubagents": [
      {
        "id": "amelia-story-2.3-dev",
        "persona": "Amelia",
        "workflow": "dev-story",
        "storyId": "2.3",
        "sessionKey": "agent:bmad-bmm-amelia:story-2.3-dev-v1",
        "status": "active",
        "startedAt": "2026-02-18T13:30:00-06:00",
        "expectedCompletionAt": "2026-02-18T13:50:00-06:00"
      }
    ],
    
    "completedSubagents": [
      {
        "id": "amelia-story-1.1-dev",
        "persona": "Amelia",
        "workflow": "dev-story",
        "storyId": "1.1",
        "status": "complete",
        "startedAt": "2026-02-17T11:45:00-06:00",
        "completedAt": "2026-02-17T12:05:00-06:00",
        "duration": 1200
      }
    ],
    
    "dependencyFrontier": [
      {
        "storyId": "3.2",
        "dependsOn": ["2.3"],
        "readyToSpawn": false,
        "blockedBy": ["2.3"]
      },
      {
        "storyId": "4.1",
        "dependsOn": [],
        "readyToSpawn": true,
        "blockedBy": []
      }
    ]
  },
  
  "testing": {
    "started": false,
    "qualityGate": null,
    "qaUrl": null,
    "qaInstructions": null
  },
  
  "notes": [
    {
      "timestamp": "2026-02-18T13:30:00-06:00",
      "text": "Story 2.3 spawned (Amelia dev-story)"
    }
  ]
}
```

**Key fields:**
- `project` — Metadata (id, name, status, stage, mode)
- `timeline` — Phase completion timestamps
- `planning` — Artifacts + gate check results
- `implementation.completedStories[]` — Done stories
- `implementation.activeSubagents[]` — Currently running
- `implementation.dependencyFrontier[]` — Ready to spawn + blocked by
- `testing` — Quality gate results, QA status
- `notes[]` — Timeline events

---

## What Gets Deleted

**Remove these files:**
- ❌ `factory-state.md` → Replaced by reading registry + kelly-state.json
- ❌ `heartbeat-state.json` → Merge into `state/kelly-state.json`
- ❌ `implementation-state.md` → Merge into `project-state.json`

**Keep these files:**
- ✅ `projects/project-registry.json` — Source of truth (already exists, already correct)
- ✅ `projects/{projectId}/project-state.json` — Expand with implementation fields
- ✅ `memory/YYYY-MM-DD.md` — Daily logs (human-written context, not state)

**Data flow:**
- **Registry:** Research Lead creates discovery entries, Project Lead updates lifecycle state
- **Kelly state:** Kelly tracks operational metadata (heartbeat timestamps, surfacing, pending actions)
- **Project state:** Project Lead tracks implementation details (stories, subagents, dependencies)
- **Dashboard:** Reads registry + kelly-state + project-state for complete view

---

## Migration Plan

### Phase 1: Create New Files (No Breaking Changes)
1. ✅ **Registry already exists** at `projects/project-registry.json` (no changes needed)
2. Create `state/kelly-state.json` (Kelly writes to both old + new)
   - Migrate heartbeat timestamps from `heartbeat-state.json`
   - Add pendingActions[], waitingOn[], notes[] (from factory-state.md)
3. Expand `projects/{projectId}/project-state.json` with implementation fields (PL writes to both)
   - Migrate data from `implementation-state.md`
   - Add activeSubagents[], completedSubagents[], dependencyFrontier[]
4. Test for 1-2 sessions (dual-write validates new schemas)

### Phase 2: Cut Over
1. Update Kelly heartbeat to read registry instead of factory-state.md
2. Stop writing to old files (factory-state.md, heartbeat-state.json, implementation-state.md)
3. Update compaction prompt to reference new schemas
4. Delete old files after confirming new schemas work

### Phase 3: Dashboard Integration
1. Dashboard reads registry (project lifecycle data)
2. Dashboard reads kelly-state (operational metadata)
3. Dashboard reads project-state (implementation details)
4. Richer views: project progress bars, dependency graphs, subagent timelines

**Example Dashboard Views:**
- **Discovery Queue:** Filter registry for `state: "discovery"`, show intake.problem + intake.solution
- **Active Projects:** Filter registry for `state: "in-progress"`, join with project-state for progress %
- **User QA Queue:** Filter registry for `implementation.qaUrl != null`, show surfacing status from kelly-state
- **Shipped:** Filter registry for `state: "shipped"`, show deployedUrl + shippedAt
- **Stalled Projects:** Check kelly-state.projectChecks for `lastCheck > 60min`, highlight in dashboard
- **Subagent Activity:** Read project-state.activeSubagents[] for real-time implementation status

---

## Compaction Prompt (After Migration)

**Kelly Router:**
```
Pre-compaction state flush. Update state/kelly-state.json:
- heartbeat.projectChecks{} (last check timestamps, ping status)
- heartbeat.surfacedQA[] (projects already announced)
- pendingActions[] (current to-do items)
- waitingOn[] (blocked on what/who)
- notes[] (operational timeline)

Also update memory/YYYY-MM-DD.md (daily log).

DO NOT duplicate project data from registry.

After updating, reply NO_REPLY.
```

**Project Lead:**
```
Pre-compaction state flush. Update project-state.json:
- implementation.completedStories[], inProgressStories[], blockedStories[]
- implementation.activeSubagents[], completedSubagents[]
- implementation.dependencyFrontier[] (ready to spawn, blocked by)
- timeline.* (phase completion timestamps)
- notes[] (key decisions)

Also update memory/YYYY-MM-DD.md (daily log).

After updating, reply NO_REPLY.
```

---

## Alternative: Hybrid Approach

**Keep markdown for notes, JSON for structured state:**

- `projects/project-registry.json` — Lifecycle source of truth (already exists)
- `state/kelly-state.json` — Operational tracking (heartbeat, pending, waiting-on)
- `state/kelly-notes.md` — Human-written operational notes (free-form)
- `projects/{projectId}/project-state.json` — Implementation tracking
- `projects/{projectId}/project-notes.md` — Human-written project notes

**Pros:**
- Best of both (machine state + human notes)
- Operators can edit notes without JSON skills
- Operational timeline in markdown (more readable than JSON notes[])

**Cons:**
- More files to manage
- Compaction needs to update both JSON and markdown
- Unclear boundary (what goes in notes.md vs state JSON notes[]?)

---

## Questions for Operator

1. **Approve three-tier architecture?** (registry + kelly-state + project-state)
2. **Hybrid variant?** Add `state/kelly-notes.md` for human-written operational notes?
3. **Migration timing:** Start now or wait for Research Lead v2.0 test to complete?
4. **Dashboard priority:** Want richer project views (progress bars, dependency graphs) soon?

---

**Recommendation:**
- **Three-tier JSON architecture** (registry + kelly-state + project-state)
- Registry already exists and is correct (no changes needed)
- Kelly state = operational tracking only (no project duplication)
- Dashboard reads from all three tiers for complete view
- Compaction writes structured updates (less error-prone)

**Benefits of this model:**
- Single source of truth per concern (registry = lifecycle, kelly = operations, project = implementation)
- No duplication between files
- Kelly heartbeats become simpler (read registry, update own state)
- Dashboard gets richer data (lifecycle + operational + implementation)

**Timeline:**
- Design approval: Today
- Phase 1 (create kelly-state.json, expand project-state.json): Tomorrow
- Phase 2 (cut over from factory-state.md): After 1-2 sessions validate
- Phase 3 (dashboard integration): Following week
