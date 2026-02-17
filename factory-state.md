# Factory State

**Last Updated:** 2026-02-17 16:52 CST

## Project Organization

```
/projects/
  ideas/      # Intake drafts, future projects (not started)
  active/     # All work in progress (includes implementation + QA)
  shipped/    # Delivered to customer, factory hands-off
  archived/   # Abandoned/failed projects
```

**Rule:** If shipped project needs re-work, move back to `active/` during work, then return to `shipped/` when complete.

## Active Projects

### fleai-market-v5 (Planning In Progress)
- **Status:** 🟡 **PLANNING** — Phase 1 BMAD pipeline active
- **Session:** `agent:project-lead:project-fleai-market-v5` (created via `gateway call agent`)
- **Repo path:** `projects/active/fleai-market-v5`
- **Description:** Multi-chain crypto marketplace (Solana + Ethereum). AI agents as sellers and buyers. Crossmint integration.
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + Supabase + Crossmint + Stripe + Printful + Vercel
- **Mode:** Normal Greenfield (full BMAD planning pipeline)
- **Start Date:** 2026-02-17 16:24 CST
- **Phase:** Phase 1 - Planning
  - ✅ **John (PRD):** On attempt 3 (fresh restart), active session
  - ✅ **Sally (UX Design):** COMPLETE — 20+ wireframes, 5 user flows, design system (9m8s)
  - 🟡 **Winston (Architecture):** Active — system architecture in progress
  - ⏳ **John (Epic/Stories):** Not started (waiting on architecture)
  - ⏳ **Bob (Dependency Graph):** Not started (waiting on epics)
- **Artifacts created:** intake.md, prd.md, ux-design.md
- **Artifacts pending:** architecture.md, epics, stories-parallelization.json

### daily-todo-tracker (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3011
- **Session:** agent:project-lead:project-daily-todo-tracker
- **Repo path:** `projects/active/daily-todo-tracker`
- **Progress:** ✅ All 7 stories complete (1.1-1.7)

### calculator-app (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000
- **Session:** agent:project-lead:calculator-app
- **Repo path:** `projects/active/calculator-app`
- **Progress:** ✅ All 6 stories complete

### kelly-dashboard (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000 (kelly-dashboard)
- **Session:** agent:project-lead:kelly-dashboard
- **Repo path:** `projects/active/kelly-dashboard`
- **Progress:** 20/21 stories complete

## Research Lead

### Current Run (16:13 CST → agent:research-lead:main)
- **Status:** 🔬 **RUNNING** — 125k/200k context used
- **Session:** `agent:research-lead:main` (created via `openclaw agent --agent research-lead`)
- **Note:** Originally spawned as subagent (wrong), then relaunched as full orchestrator session
- **Previous billing error:** First attempt hit API credit limit at 14m11s. Current run appears to be progressing.
- **Expected output:** `projects-queue/<name>/intake.md`

## Active Sessions (as of 16:52 CST)

| Session | Model | Context | Status |
|---------|-------|---------|--------|
| agent:main:matrix:direct:@matt:austens-mac-mini.local | opus-4-6 | 200k/200k | ✅ Active (this session) |
| agent:project-lead:project-fleai-market-v5 | sonnet-4-5 | Fresh | ✅ Planning (John PRD + Winston arch) |
| agent:project-lead:main | sonnet-4-5 | 200k/200k | ✅ Active (heartbeat) |
| agent:research-lead:main | sonnet-4-5 | 125k/200k | 🔬 Running RL pipeline |
| agent:kelly-improver:matt | sonnet-4-5 | 40k/200k | ✅ Active |
| agent:main:main | opus-4-6 | 200k/200k | ✅ Heartbeat |
| agent:main:project-fleai-market-v5-test | sonnet-4-5 | 19k/200k | Test session |

## Pending Actions

### In Progress
- **fleai-market-v5:** BMAD planning pipeline (Phase 1: PRD + UX + Architecture)
- **Research Lead:** First full autonomous run

### Waiting-on-Operator
- **Stripe refunds tool:** Waiting for Stripe API key
- **QA review:** calculator-app, kelly-dashboard, daily-todo-tracker awaiting operator testing

## Known Issues

### Orchestrator Session Creation (RESOLVED 16:49 CST)
- `openclaw agent --agent <id> --session-id <id>` → session key always becomes `agent:<id>:main` (--session-id sets UUID, not key suffix)
- `openclaw gateway call agent --params '{"sessionKey":"...","idempotencyKey":"..."}'` → sets exact session key ✅
- `sessions_spawn(...)` → creates subagent (can't spawn sub-agents) ❌
- **Documentation fixed:** AGENTS.md commit `f2dcfbd`

### API Billing Error (16:28 CST)
- First RL attempt hit credit limit; second run appears to be progressing
- Monitor for recurrence

### Codex Session Death Pattern (fleai-market-v4 - ARCHIVED)
- 3 waves affected in v4; root cause unknown
- v5 using Sonnet 4.5 subagents (not Codex) — may not recur

## Archived Projects

15 archived projects in `projects/archived/` (see git history for details)

## Key Architecture Decisions (2026-02-17)

- **Dependency-driven spawning:** No artificial batching/waves. Stories spawn as `dependsOn` satisfied.
- **docs/ is source of truth:** `factory-overview.md`, `project-lead-flow.md`, `research-lead-flow.md`
- **AGENTS.md = behavioral rules:** References docs/ for flow specs
- **Session creation:** `gateway call agent` for custom keys; `openclaw agent` for `:main` only
- **Project structure:** `projects/{ideas,active,shipped,archived}/`
- **Bob's dependency-graph.json:** Authority for story parallelization

## Factory Infrastructure

### Heartbeat Monitoring
- **Kelly (main agent):** 5-min heartbeat polls
- **Project Lead:** 60s heartbeat polls (no `target` restriction)
- **Checks:** QA surfacing, stall detection (60 min threshold)

### Git Commits Today
- `f2dcfbd` — fix: correct orchestrator session creation docs
- `51ffc79` — docs: add orchestrator session creation protocol (partially wrong, fixed by f2dcfbd)
- `ed44250` — refactor: reorganize projects into ideas/active/shipped/archived
- `8342cc0` — major: agent audit - rewrite AGENTS.md for all modes, create RL + CIS agents
- `f04767c` — refactor: move factory architecture from skill to docs/
