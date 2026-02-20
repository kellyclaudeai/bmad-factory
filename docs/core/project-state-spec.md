# Project State Specification

**Version:** 1.0  
**Date:** 2026-02-19  
**Status:** Active — supersedes `state-management.md`, `project-registry-workflow.md`, and all `proposals/state-*.md` files

---

## Overview

Three files, each with a distinct owner and purpose. No overlap.

| File | Owner | Scope | When read |
|------|-------|-------|-----------|
| `projects/projects-registry.json` | Project Lead | Project index — list view only | Kelly routing, dashboard list |
| `projects/{id}/project-state.json` | Project Lead | Operational state — detail view | Dashboard detail, Kelly status checks |
| `projects/{id}/_bmad-output/implementation-artifacts/sprint-status.yaml` | Bob / Amelia | Story-level detail | Dashboard story grid, PL Phase 2 loop |

---

## 1. projects-registry.json

**Purpose:** Fast index for project discovery and PL session routing. Never duplicates detail-level state.

**Location:** `/Users/austenallred/clawd/projects/projects-registry.json`

**Owner:** Project Lead writes it. Kelly reads it for routing. Dashboard reads it for project list.

**Schema:**
```json
{
  "version": "2.0",
  "projects": [
    {
      "id": "weather-dashboard",
      "name": "Weather Dashboard",
      "path": "projects/weather-dashboard",
      "plSession": "agent:project-lead:project-weather-dashboard",
      "phase": "planning",
      "createdAt": "2026-02-19T19:09:00Z"
    }
  ]
}
```

**Fields:**
- `id` — kebab-case identifier, unique
- `name` — human-readable display name
- `path` — relative path from clawd workspace root to project directory
- `plSession` — full session key for the active Project Lead session
- `phase` — current phase (denormalized cache from project-state.json for fast listing)
- `createdAt` — when the project was created (never changes)

**Rules:**
- PL writes a registry entry when first creating a project (same turn as creating project-state.json)
- PL updates `phase` whenever it transitions — atomically with project-state.json
- Projects are NEVER deleted from the registry — shipped and paused projects remain as historical record
- Registry has NO other fields — qaUrl, subagents, deployedUrl all belong in project-state.json

---

## 2. project-state.json

**Purpose:** Full operational state for a single project. Single source of truth for everything the dashboard detail view and Kelly need to know.

**Location:** `/Users/austenallred/clawd/projects/{id}/project-state.json`

**Owner:** Project Lead exclusively. No other agent writes this file.

**Schema:**
```json
{
  "id": "weather-dashboard",
  "name": "Weather Dashboard",
  "plSession": "agent:project-lead:project-weather-dashboard",
  "phase": "planning",
  "createdAt": "2026-02-19T19:09:00Z",
  "shippedAt": null,
  "devServerUrl": null,
  "qaUrl": null,
  "deployedUrl": null,
  "activeSubagents": [
    {
      "persona": "John (PM)",
      "task": "create-prd",
      "sessionKey": "agent:bmad-bmm-john:subagent:abc123",
      "startedAt": "2026-02-19T19:15:00Z"
    }
  ],
  "completedSubagents": [
    {
      "persona": "John (PM)",
      "task": "create-prd",
      "sessionKey": "agent:bmad-bmm-john:subagent:abc123",
      "completedAt": "2026-02-19T19:18:00Z",
      "durationSec": 180
    }
  ],
  "sprintSummary": {
    "total": 21,
    "done": 0,
    "inProgress": 0,
    "todo": 21
  }
}
```

**Fields:**
- `id`, `name`, `plSession`, `createdAt` — same as registry (PL writes both)
- `phase` — see Phase Values below
- `shippedAt` — ISO timestamp when shipped, null until then
- `devServerUrl` — local dev server URL (e.g. `http://localhost:5173`), written by PL as soon as Amelia's first story reports a running dev server; shown as **Local Dev** on the dashboard during build/qa phases
- `qaUrl` — deployed URL used for QA testing (set after Phase 3 Step 2 deploy)
- `deployedUrl` — production URL; **never cleared after shipping** — dashboard always shows it
- `activeSubagents` — agents currently running (PL clears when they complete)
- `completedSubagents` — append-only history of all agent runs
- `sprintSummary` — PL derives from sprint-status.yaml and writes here; dashboard reads this, not the raw YAML

**PL write obligations:**
- **On project start:** Create file with `phase: planning`, empty subagent arrays
- **On spawning any subagent:** Add entry to `activeSubagents`
- **On subagent completion:** Move entry from `activeSubagents` to `completedSubagents` (with durationSec)
- **On phase change:** Update `phase` field here AND in projects-registry.json
- **On sprint progress:** Update `sprintSummary` after each story completes
- **After first Phase 2 story:** Set `devServerUrl` (from Amelia's reported dev server port)
- **On deploy (Phase 3 Step 2):** Set `qaUrl` AND `deployedUrl` to the deployed URL
- **On ship:** Set `phase: shipped`, `shippedAt` — `deployedUrl` stays as-is (never clear it)

---

## 3. sprint-status.yaml

**Purpose:** Story-level tracking — the source of truth for which stories are done, in-progress, or todo. Not a project-level state file.

**Location:** `/Users/austenallred/clawd/projects/{id}/_bmad-output/implementation-artifacts/sprint-status.yaml`

**Owner:** Bob creates it during sprint planning. Amelia updates story status as she completes stories.

**Story schema (per entry):**
```yaml
- id: "3.6"                          # story ID (e.g., "1.1", "3.6")
  title: "CurrentConditions Hero"    # story title
  epic: 3                            # epic number
  status: done                       # todo | in-progress | review | done
  depends_on: ["1.1", "2.3"]        # story IDs that must be done first
  started_at: "2026-02-19"          # ISO date when Amelia began
  completed_at: "2026-02-19"        # ISO date when marked done
  session_id: "8bffe4fa-cfbe-..."   # UUID of Amelia session — written on completion
                                     # used by dashboard to link logs to completed story cards
```

`session_id` is written by Amelia when she marks a story done (lock file trick: her own `.jsonl.lock` filename IS her UUID). Dashboard uses it to link completed subagent cards to their transcripts. Falls back to transcript scan if missing.

**Not duplicated in project-state.json** — PL derives `sprintSummary` counts from this file and writes the summary into project-state.json. Dashboard reads the summary from project-state.json for the progress bar; reads sprint-status.yaml only for the full story grid view.

---

## Phase Values

```
planning        Phase 1 — PRD, UX design, architecture, epics/stories
build  Phase 2 — Amelia/Barry building stories
qa              Phase 3+4 — Murat automated testing + user QA
shipped         Done — merged to main, live in production
paused          Any phase — explicitly paused, will resume
```

**No hardcoded phase ordering.** PL starts at whichever phase is appropriate:
- Greenfield projects start at `planning`
- Brownfield/improvement work can start at `build` (if stories already defined) or `qa`
- Bug fixes can start at `build`

Active subagents (e.g., Murat running vs no subagents) tell the detailed story within a phase — the phase itself is coarse-grained.

---

## What Is NOT a State File

| Thing | What it actually is | Don't use for |
|-------|--------------------|--------------| 
| `*.jsonl.lock` | OpenClaw process mutex | UI state, "is this running?" |
| `sessions.json` (per agent) | OpenClaw session UUID index | Project status |
| `memory/YYYY-MM-DD.md` | Kelly's operational log | Project state |
| Planning artifacts (`prd.md` etc.) | Output artifacts | Inferring phase or subagent status |

Lock files are ephemeral (seconds to minutes). They exist while an agent is mid-LLM-turn. They disappear between turns even when a project is very much active. **Never use lock files as a proxy for project or subagent state.**

---

## Migration from Old Design

The old design used `projects-registry.json` (singular) as the sole state file with fields like `state`, `surfacedForQA`, `implementedAt`, etc.

**Mapping:**

| Old (registry) | New location |
|----------------|-------------|
| `state: in-progress` | `project-state.json` → `phase: planning/build/qa` |
| `state: pending-qa` | `project-state.json` → `phase: qa` |
| `state: shipped` | `project-state.json` → `phase: shipped` |
| `surfacedForQA` | Removed — dashboard derives from `phase: qa` |
| `implementation.qaUrl` | `project-state.json` → `qaUrl` |
| `implementation.deployedUrl` | `project-state.json` → `deployedUrl` |
| `implementation.plSession` | `projects-registry.json` → `plSession` |

---

## Files to Archive

These docs are superseded by this spec:
- `docs/core/state-management.md` → archive
- `docs/core/project-registry-workflow.md` → archive  
- `docs/proposals/state-files-minimal.md` → archive
- `docs/proposals/state-schema-design.md` → archive
- `docs/proposals/state-migration-complete.md` → archive
- `docs/proposals/compaction-state-refresh.md` → archive
