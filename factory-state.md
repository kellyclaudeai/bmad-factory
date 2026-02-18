# Factory State

**Last Updated:** 2026-02-18 13:42 CST (pre-compaction state flush)

## Project Organization

**Single source of truth:** `/Users/austenallred/clawd/projects/project-registry.json`  
**Spec:** `docs/core/project-registry-workflow.md`

**Lifecycle states:** discovery → in-progress → shipped → followup (+ paused)

**Directory structure:**
```
/projects/
  project-registry.json   # ALL project state (lifecycle, intake, implementation)
  {project-name}/         # Project workspace (code, BMAD artifacts)
  archived/               # Abandoned/failed projects
```

**Ownership:**
- Research Lead creates discovery entries (intake data + pain point for dedup)
- Project Lead owns all transitions after (in-progress → shipped → followup)
- Kelly monitors registry for surfacing and stall detection

## Current Registry State

**Registry:** Empty (fresh slate as of 13:19 CST)
- All 20 old discovery entries deleted (projects-queue cleared)
- Old research-registry.json deleted
- 5 previously active projects archived (12:47 CST)
- Ready for fresh Research Lead runs with v2.0 workflow

## Research Lead

### Workflow v2.0 Test Run (IN PROGRESS)
- **Session:** `agent:research-lead:20260218-1340`
- **Spawned:** 13:40 CST
- **PID:** 90161
- **Expected duration:** 38-56 minutes (completion ~14:18-14:36 CST)
- **Test objective:** Validate v2.0 workflow with new registry writes
- **Expected output:** First discovery entry in `projects/project-registry.json`

### Workflow v2.0 (AGENT CONFIGS UPDATED)
- **Doc:** `docs/core/research-lead-flow.md` (v2.0)
- **Status:** Workflow design complete. Agent configs fully updated (13:31-13:37 CST).
- **Key changes from v1:**
  - Config-driven research (platform, business model, stack)
  - LLM-based pain point dedup (not keyword matching)
  - Broad→narrow market scanning (not random vertical)
  - Carson creative naming in Phase 6 (9 naming styles)
  - Writes to project-registry.json (not projects-queue folders)
- **Agent configs updated:**
  - ✅ Research Lead AGENTS.md (full rewrite, 13KB — config propagation, LLM dedup, registry writes)
  - ✅ Project Lead AGENTS.md (registry update jq commands)
  - ✅ Kelly-Improver AGENTS.md (registry doc reference)
  - ✅ 12 other BMAD agents verified as aligned with core docs
- **Config file:** ✅ Created at `~/.openclaw/agents/research-lead/config` (model: sonnet-4-5)

## Active Sessions (as of 13:42 CST)

| Session | Status |
|---------|--------|
| agent:main:matt | ✅ Active (Kelly main - this session) |
| agent:main:main | ✅ Heartbeat |
| agent:project-lead:kelly-dashboard | ✅ Active |
| agent:project-lead:main | ✅ Heartbeat |
| agent:main:jason | ✅ Active |
| agent:research-lead:20260218-1340 | ⏳ Test run in progress (spawned 13:40 CST) |

## Pending Actions

### In Progress
- **Research Lead v2.0 test run:** Validating new workflow + registry writes (13:40 CST, expected completion ~14:18-14:36 CST)

### Waiting-on-Operator
- **Normal Mode Greenfield end-to-end test:** Will use Research Lead output as intake for full BMAD pipeline test

### Recently Completed
- ✅ **Agent Config Audit** (13:31-13:37 CST) - All 15 agents audited against core docs. Research Lead fully rewritten. Commit: `8e057ca`
- ✅ **Project Registry Lifecycle Architecture** (13:10-13:25 CST)
  - Created `docs/core/project-registry-workflow.md` (full state machine spec)
  - Created `projects/project-registry.json` (empty, single source of truth)
  - Updated research-lead-flow.md (writes to registry)
  - Updated project-lead-flow.md (PL registry responsibilities)
  - Deleted projects-queue/ (20 dirs) and old research-registry.json
  - Commit: `5ec20cf`
- ✅ **Factory cleanup & fresh slate** (12:47 CST) - All 5 projects archived
- ✅ **Session cleanup** (13:08-13:13 CST) - Removed stale sessions
- ✅ **Phase 3 Quality Gate redesign** (12:00-12:11 CST)
- ✅ **Consolidated remediation via correct-course** (12:20-12:30 CST)
- ✅ **Murat quality gate ownership** (12:44-12:47 CST)
- ✅ **4-tier fallback VALIDATED** (10:26-10:36 CST)

## Key Architecture Decisions

- **Project registry:** Single JSON at `/projects/project-registry.json` (replaces projects-queue + research-registry.json)
- **Lifecycle states:** discovery, in-progress, shipped, followup, paused
- **PL owns transitions:** discovery→in-progress when starting, updates qaUrl/deployedUrl, shipped, followup
- **Dependency-driven spawning:** No artificial batching/waves
- **docs/core/ is source of truth:** project-lead-flow.md, research-lead-flow.md, project-registry-workflow.md, kelly-router-flow.md, kelly-improver-flow.md
- **4-tier coding fallback:** Codex GPT → Codex API → Claude Code Anthropic → Claude Code API
- **Consolidated remediation:** ALL bugs/feedback → John correct-course → Sprint Change Proposal
- **Web search default:** SearXNG local Docker (not Brave API)

## Known Issues

### OpenAI API Billing (MONITORING)
- Out of credits since 09:09 CST
- 4-tier fallback handles it (cascades to Claude Code)
- Optional: Top up credits or rely on Claude Code

## Archived Projects

5 archived (12:47 CST): fleai-market-v5, calculator-app, daily-todo-tracker, kelly-dashboard, takeouttrap  
15+ older archived in `projects/archived/` (see git history)
