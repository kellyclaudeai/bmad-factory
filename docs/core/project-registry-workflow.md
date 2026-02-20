# Project Registry Lifecycle

**Purpose:** Define how projects flow through the software factory from discovery to production, tracked via a single JSON registry.

## Overview

The software factory manages projects through a clear lifecycle, with all state tracked in `/Users/austenallred/clawd/projects/project-registry.json`. Research Lead creates ideas, Project Lead builds them, and Kelly monitors the flow.

## State Machine

```
discovery → in-progress → pending-qa → shipped → followup → shipped
    ↓           ↓           ↓          ↓
  paused      paused      paused    paused
```

### States

| State | Description | Owner |
|-------|-------------|-------|
| **discovery** | Fresh idea from Research Lead, awaiting operator selection | Research Lead creates, Kelly surfaces |
| **in-progress** | Active implementation by Project Lead (planning → build → test) | Project Lead |
| **pending-qa** | Automated testing passed, deployed, awaiting operator human QA | Project Lead sets; Operator clears |
| **shipped** | Operator approved after human QA, live in production | Operator only |
| **followup** | Post-ship work (fixes, enhancements, new features) | Project Lead |
| **paused** | User explicitly paused (any phase) - can resume to previous state | Operator/Kelly |

### Transitions

| From | To | Trigger | Actor |
|------|----|---------| ------|
| discovery | in-progress | Operator picks idea, PL starts project | Project Lead |
| in-progress | pending-qa | Phase 3 TEA passes, PL notifies Kelly | Project Lead |
| pending-qa | shipped | Operator approves → Kelly signals PL → PL ships and updates registry | PL (on Kelly's SHIP signal) |
| pending-qa | in-progress | Operator sends project back for fixes | Operator/Kelly |
| shipped | followup | Operator requests fixes/enhancements | Project Lead |
| followup | shipped | Followup work complete and deployed | Project Lead |
| any | paused | Operator pauses (blocked, deprioritized, etc.) | Project Lead |
| paused | {previous} | Operator resumes | Project Lead |

## Registry Schema

**Location:** `/Users/austenallred/clawd/projects/project-registry.json`

```json
{
  "version": "1.1",
  "projects": [
    {
      "id": "fleai-market-v5",
      "name": "Fleai Market",
      "state": "shipped",
      "paused": false,
      "pausedReason": null,
      "surfacedForQA": true,
      "researchDir": null,
      
      "timeline": {
        "discoveredAt": "2026-02-17T18:02:00Z",
        "startedAt": "2026-02-17T19:00:00Z",
        "shippedAt": "2026-02-18T10:00:00Z",
        "lastUpdated": "2026-02-18T10:00:00Z"
      },
      
      "intake": {
        "problem": "Craigslist is outdated and sketchy for local sales",
        "solution": "Modern, safe peer-to-peer marketplace with real-time chat",
        "targetAudience": "Urban renters and small-space dwellers",
        "keyFeatures": [
          "Real-time chat with sellers",
          "Location-based search",
          "Photo uploads with descriptions"
        ]
      },
      
      "implementation": {
        "projectDir": "fleai-market-v5",
        "deployedUrl": "https://fleai-market-v5.vercel.app",
        "qaUrl": "https://fleai-market-v5-preview.vercel.app",
        "repo": "https://github.com/user/fleai-market-v5"
      },
      
      "followup": []
    },
    {
      "id": "takeouttrap-2026-02-17-1830",
      "name": "TakeoutTrap",
      "state": "in-progress",
      "paused": false,
      "pausedReason": null,
      "surfacedForQA": false,
      "researchDir": null,
      
      "timeline": {
        "discoveredAt": "2026-02-17T18:30:00Z",
        "startedAt": "2026-02-18T09:15:00Z",
        "lastUpdated": "2026-02-18T11:30:00Z"
      },
      
      "intake": {
        "problem": "Takeout subscriptions keep charging after free trials",
        "solution": "Auto-track trials, send reminders before charges",
        "targetAudience": "Busy professionals trying new services",
        "keyFeatures": [
          "Email parsing for trial signups",
          "Pre-charge reminders",
          "One-click cancellation links"
        ]
      },
      
      "implementation": {
        "projectDir": "takeouttrap",
        "qaUrl": null,
        "deployedUrl": null,
        "repo": null
      },
      
      "followup": []
    },
    {
      "id": "quickpoll-2026-02-19-1200",
      "name": "QuickPoll",
      "state": "pending-qa",
      "paused": false,
      "pausedReason": null,
      "surfacedForQA": false,
      "researchDir": null,
      
      "timeline": {
        "discoveredAt": "2026-02-19T12:00:00Z",
        "startedAt": "2026-02-19T12:30:00Z",
        "lastUpdated": "2026-02-19T18:00:00Z"
      },
      
      "intake": {
        "problem": "Need a simple no-auth polling app",
        "solution": "Public poll creation, sharing, and live results",
        "targetAudience": "Anyone who needs quick polls without login",
        "keyFeatures": ["Create poll", "Share link", "Vote", "Live results"]
      },
      
      "implementation": {
        "projectDir": "quickpoll",
        "plSession": "agent:project-lead:project-quickpoll",
        "qaUrl": "https://quickpoll-20260219.web.app",
        "deployedUrl": null,
        "repo": "https://github.com/kellyclaudeai/quickpoll"
      },
      
      "followup": []
    },
    {
      "id": "benchmarkiq-2026-02-17-1802",
      "name": "BenchmarkIQ",
      "state": "discovery",
      "paused": false,
      "pausedReason": null,
      "surfacedForQA": false,
      "researchDir": "ideas/benchmarkiq-2026-02-17-1802",
      
      "timeline": {
        "discoveredAt": "2026-02-17T18:02:00Z",
        "lastUpdated": "2026-02-17T18:02:00Z"
      },
      
      "intake": {
        "problem": "SaaS teams struggle to find competitive pricing data",
        "solution": "Crowdsourced pricing intelligence platform",
        "targetAudience": "B2B SaaS product managers and founders",
        "keyFeatures": [
          "Anonymous pricing submissions",
          "Trend analysis across segments",
          "Industry benchmarks"
        ]
      },
      
      "implementation": null,
      "followup": []
    }
  ]
}
```

## Field Definitions

### Top Level
- **id** - Unique identifier (kebab-case name + optional timestamp)
- **name** - Human-readable project name
- **state** - Current lifecycle state (discovery|in-progress|pending-qa|shipped|followup|paused)
- **paused** - Boolean flag (paused state OR any state with pause)
- **pausedReason** - Why paused (optional, for operator context)
- **surfacedForQA** - Boolean flag: has Kelly already announced this project's QA URL to operator? Prevents duplicate announcements during heartbeats. Reset to false when project changes state or qaUrl changes.
- **researchDir** - Path to Research Lead output directory, relative to `projects/` (e.g., `ideas/my-project-2026-02-18-1656`). Set by Research Lead in Phase 6. Null for legacy projects without research artifacts.

### timeline
- **discoveredAt** - When Research Lead generated the idea (ISO 8601)
- **startedAt** - When Project Lead began implementation (null if discovery)
- **shippedAt** - When deployed to production (null if not shipped)
- **lastUpdated** - Last registry update timestamp (any state change)

### intake
Research Lead's product brief (immutable after creation):
- **problem** - Pain point being solved
- **solution** - High-level approach
- **targetAudience** - Who it's for
- **keyFeatures** - Core capabilities (array)

### implementation
Project Lead's workspace and deployment info:
- **projectDir** - Path to project workspace, relative to `projects/` (e.g., `prepwise`). Null if still in discovery. Set by Project Lead when starting implementation.
- **qaUrl** - Preview deployment for user QA (null until Phase 3)
- **deployedUrl** - Production deployment URL (null until shipped)
- **repo** - Git repository URL (optional)

### followup
Array of post-ship work items (operator-designated, never auto-populated by PL):
```json
{
  "type": "enhancement|fix",
  "description": "Add seller ratings system",
  "priority": "high|medium|low",
  "addedAt": "2026-02-18T12:00:00Z"
}
```

### qaRounds
Array tracking each round of operator QA feedback (pre-ship). PL appends on each FIX signal:
```json
{
  "round": 1,
  "date": "2026-02-19T19:46:00Z",
  "feedback": "Add Google sign-in, fix mobile nav padding",
  "path": "amelia-direct",
  "status": "addressed",
  "addressedAt": "2026-02-19T20:30:00Z"
}
```
- **path** — `amelia-direct` (no new stories) or `new-stories` (John + Bob involved)
- **status** — `in-progress` | `addressed`

## Actor Responsibilities

### Research Lead
**Creates discovery entries:**
1. Generate product idea via autonomous research workflow
2. Create research artifacts directory at `projects/ideas/<project-id>/`
3. Write `intake.md` + supporting research docs to that directory
4. Write summary intake data to registry with `researchDir` pointing to idea directory
5. Set state: `"discovery"`
6. Notify Kelly that new idea is ready

**Research artifacts location:** `projects/ideas/<project-id>/`
- `intake.md` - Comprehensive research document
- `solution-scoring.md` - Full scoring matrix for all CIS solutions
- `competitive-deepdive.md` - Detailed competitive analysis
- `creative-naming.md` - Naming options and rationale

**Example registry write (discovery):**
```json
{
  "id": "new-project-2026-02-18-1400",
  "name": "New Project",
  "state": "discovery",
  "paused": false,
  "pausedReason": null,
  "surfacedForQA": false,
  "researchDir": "ideas/new-project-2026-02-18-1400",
  "timeline": {
    "discoveredAt": "2026-02-18T14:00:00Z",
    "lastUpdated": "2026-02-18T14:00:00Z"
  },
  "intake": { ... },
  "implementation": null,
  "followup": []
}
```

### Project Lead
**Owns project lifecycle from selection onward:**

#### 1. discovery → in-progress (project start)
- Operator selects idea, routes to PL
- PL reads Research Lead's intake from `projects/{researchDir}/intake.md`
- PL creates project directory at `projects/<project-name>/`
- Update registry:
```json
{
  "state": "in-progress",
  "timeline.startedAt": "2026-02-18T09:00:00Z",
  "timeline.lastUpdated": "2026-02-18T09:00:00Z",
  "implementation.projectDir": "prepwise"
}
```

#### 2. QA URL available (Phase 3 complete)
- Deploy preview/QA build
- Update registry:
```json
{
  "implementation.qaUrl": "https://project-name-preview.vercel.app",
  "timeline.lastUpdated": "2026-02-18T10:30:00Z"
}
```

#### 3. in-progress → shipped (Phase 4 complete)
- User QA passed, deploy to production
- Update registry:
```json
{
  "state": "shipped",
  "timeline.shippedAt": "2026-02-18T11:00:00Z",
  "timeline.lastUpdated": "2026-02-18T11:00:00Z",
  "implementation.deployedUrl": "https://project-name.vercel.app"
}
```

#### 4. shipped → followup (operator requests changes)
- Operator identifies fixes/enhancements needed
- Update registry:
```json
{
  "state": "followup",
  "timeline.lastUpdated": "2026-02-18T12:00:00Z",
  "followup": [
    {
      "type": "enhancement",
      "description": "Add user profile pages",
      "priority": "high",
      "addedAt": "2026-02-18T12:00:00Z"
    }
  ]
}
```

#### 5. followup → shipped (work complete)
- Followup items implemented and deployed
- Update registry:
```json
{
  "state": "shipped",
  "timeline.lastUpdated": "2026-02-18T14:00:00Z"
}
```
- Keep followup array for history (don't clear)

#### 6. Pause/Resume (any state)
- Operator pauses project (blocked, deprioritized, etc.)
- Update registry:
```json
{
  "paused": true,
  "pausedReason": "Waiting for API access approval",
  "timeline.lastUpdated": "2026-02-18T13:00:00Z"
}
```

### Kelly (Main Session)
**Monitors and routes projects:**

#### Discovery surfacing
- Periodically check registry for `state: "discovery"` entries
- Surface to operator: "🔍 New idea ready: **{name}** - {problem}"
- Operator decides: start now, later, or ignore

#### Routing to Project Lead
- When operator picks discovery project: `sessions_send(sessionKey="agent:project-lead:project-{id}", message="Start project: {id}")`
- PL reads registry, updates to in-progress, begins work

#### Heartbeat monitoring (projects ready for QA)
- Check registry for `state: "in-progress"` AND `implementation.qaUrl` present AND `surfacedForQA: false`
- Surface to operator: "🧪 **{name}** ready for user QA: {qaUrl}"
- Update registry: set `surfacedForQA: true` to prevent duplicate announcements
- If project becomes `paused: true`, stop surfacing

#### Stall detection
- Check `state: "in-progress"` projects with `lastUpdated > 60 min ago`
- Ping PL session: "Status check - any blockers?"
- Escalate to operator if PL confirms blocker or doesn't respond

## Integration with Workflows

### Research Lead Flow
**doc:** `docs/core/research-lead-flow.md`

**Changes needed:**
- Step 10 (Final Output): Write to `project-registry.json` instead of `projects-queue/{name}-{timestamp}/intake.md`
- Notify Kelly after registry write

### Project Lead Flow
**doc:** `docs/core/project-lead-flow.md`

**Changes needed:**
- **Project Startup**: Read registry entry, update to in-progress
- **Phase 3 (Test)**: Update qaUrl when preview deployed
- **Phase 4 (User QA)**: Update to shipped when production deployed
- **Followup Mode**: Check registry for followup items, update state transitions

### Kelly Router Flow
**doc:** `docs/core/kelly-router-flow.md`

**No changes needed** - Kelly already routes to PL; just reads from registry instead of projects-queue

### Kelly Improver Flow
**doc:** `docs/core/kelly-improver-flow.md`

**No changes needed** - operates at meta level, doesn't interact with project registry

## Migration from Current System

### Old State (Pre-Migration)
- `projects-queue/{name}-{timestamp}/intake.md` - 20 discovery entries
- `research-registry.json` - Minimal state tracking
- `factory-state.md` - Active project tracking (deprecated as of 2026-02-18)

### Migration Steps
1. **Create new registry** at `/Users/austenallred/clawd/projects/project-registry.json`
2. **Migrate projects-queue entries:**
   - Read all `projects-queue/*/intake.md` files
   - Parse intake data, create discovery entries in new registry
3. **Migrate active projects:**
   - Read `fleai-market-v5/project-state.json` → registry entry with state=shipped
   - Read `takeouttrap/project-state.json` → registry entry with state=in-progress
4. **Delete legacy:**
   - Remove `projects-queue/` folder (20 directories)
   - Archive old `research-registry.json`
5. **Update agents:**
   - Research Lead AGENTS.md: write to registry (not projects-queue)
   - Project Lead AGENTS.md: read/update registry at state transitions
   - Kelly AGENTS.md: monitor registry (not projects-queue)

## Directory Structure

All paths relative to `/Users/austenallred/clawd/projects/`.

```
projects/
├── project-registry.json              # Single source of truth for all project lifecycle state
├── ideas/                             # Research Lead outputs (idea stage)
│   ├── <project-id>/                  # One directory per researched idea
│   │   ├── intake.md                  # Comprehensive research document
│   │   ├── solution-scoring.md        # CIS solution scoring
│   │   ├── competitive-deepdive.md    # Competitive analysis
│   │   └── creative-naming.md         # Naming options
│   └── archived/                      # Failed/duplicate research (NO-GO, dedup aborts)
├── <project-name>/                    # Project Lead implementation (created when PL starts)
│   ├── _bmad-output/                  # Planning + implementation artifacts
│   ├── src/
│   └── ...
└── ...
```

**Key separation:**
- `ideas/<project-id>/` — Research Lead creates during discovery (never modified by PL)
- `<project-name>/` — Project Lead creates when starting implementation
- Registry `researchDir` links to ideas directory; `implementation.projectDir` links to project directory

## File Locations

| File | Purpose |
|------|---------|
| `projects/project-registry.json` | Single source of truth for all project lifecycle state |
| `projects/ideas/<project-id>/` | Research Lead artifacts (intake, scoring, competitive analysis) |
| `projects/<project-name>/` | Project workspace (code, BMAD artifacts) — created by PL |
| `memory/YYYY-MM-DD.md` | Daily logs for all agents (Kelly, PL, RL) — operational notes, decisions, events |

---

**Document Status:** Draft (2026-02-18)  
**Next:** Implement migration, update Research Lead + Project Lead flows
