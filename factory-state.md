# Factory State

**Last Updated:** 2026-02-18 13:25 CST

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

### Workflow v2.0 (DOCUMENTED, PENDING AGENT CONFIG IMPLEMENTATION)
- **Doc:** `docs/core/research-lead-flow.md` (v2.0)
- **Status:** Workflow design complete. Agent configs NOT yet updated.
- **Key changes from v1:**
  - Config-driven research (platform, business model, stack)
  - LLM-based pain point dedup (not keyword matching)
  - Broad→narrow market scanning (not random vertical)
  - Carson creative naming in Phase 6 (9 naming styles)
  - Writes to project-registry.json (not projects-queue folders)
- **Agent configs pending:**
  - ⏳ Mary AGENTS.md (new discovery protocol)
  - ⏳ Research Lead AGENTS.md (config propagation, LLM dedup, registry writes)
  - ⏳ Carson AGENTS.md (naming task)
  - ⏳ Victor/Maya/Quinn AGENTS.md (config awareness)
  - ⏳ Kelly AGENTS.md (spawn protocol with config passing)
- **Config file:** ✅ Created at `~/.openclaw/agents/research-lead/config` (model: sonnet-4-5)

## Active Sessions (as of 13:25 CST)

| Session | Status |
|---------|--------|
| agent:main:matt | ✅ Active (Kelly main - this session) |
| agent:main:main | ✅ Heartbeat |
| agent:project-lead:kelly-dashboard | ✅ Active |
| agent:project-lead:main | ✅ Heartbeat |
| agent:main:jason | ✅ Active |

## Pending Actions

### Waiting-on-Operator
- **Research Lead v2.0 agent configs:** Design documented, agent AGENTS.md files need implementation
- **kelly-dashboard QA:** Running on port 3000 (20/21 stories complete)

### Recently Completed
- ✅ **Project Registry Lifecycle Architecture** (13:15-13:25 CST)
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
