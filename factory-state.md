# Factory State

**Last Updated:** 2026-02-17 15:31 CST

## Active Projects

### fleai-market-v4 (Implementation In Progress)
- **Status:** 🟡 **IN PROGRESS** - Dependency-driven spawning (waves removed)
- **Session:** `agent:project-lead:fleai-market-v4` (184k/200k context, last active ~14:51 CST)
- **Repo path:** `projects/fleai-market-v4`
- **Description:** Multi-chain crypto marketplace (Solana + Ethereum). AI agents as sellers and buyers. Crossmint integration.
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + Supabase + Vercel
- **Start Date:** 2026-02-16 13:46 CST
- **Progress:** 37/68 stories complete (54%)
- **Active subagents:** 2 (stories 2.9-v2 and 4.8-v2 — PIDs 96278/96279, status uncertain, may be dead Codex sessions)
- **Completed stories:** 1.1-1.8, 2.1-2.8, 3.1-3.7, 4.1-4.7, 5.1, 5.2, 8.1, 8.2, 8.6, 8.7, 9.1
- **Remaining:** 31 stories (2.9, 4.8 in progress + 29 unstarted)
- **Key changes today:**
  - Removed batch/wave parallelization from PL AGENTS.md → dependency-driven spawning
  - Codex session death pattern (3 waves affected): PIDs die after spawn or after completion
  - BMAD Amelia took over implementation when Codex died (Wave 4)
  - PL session approaching context limit (184k/200k)
- **Monitoring:** Heartbeat every 60s, stuck threshold 60 min
- **Risk:** PL context at 92% — may need fresh session soon

### daily-todo-tracker (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3011
- **Session:** agent:project-lead:project-daily-todo-tracker
- **Repo path:** `projects/daily-todo-tracker`
- **Description:** Simple to-do tracking app with localStorage
- **Tech Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Timeline:** 12:27-13:38 CST (1h 9min total)
- **Progress:** ✅ All 7 stories complete (1.1-1.7)
- **QA Instructions:** Test task CRUD, filters (All/Today/Week/Completed), mobile responsiveness

### calculator-app (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000
- **Session:** agent:project-lead:calculator-app
- **Repo path:** `projects/calculator-app`
- **Description:** Simple calculator with keyboard support
- **Tech Stack:** Next.js + TypeScript + Tailwind
- **Completed:** 2026-02-17 00:50 CST
- **Progress:** ✅ All 6 stories complete

### kelly-dashboard (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000 (kelly-dashboard)
- **Session:** agent:project-lead:kelly-dashboard
- **Repo path:** `projects/kelly-dashboard`
- **Description:** Factory monitoring dashboard
- **Tech Stack:** Next.js + TypeScript + Tailwind
- **Completed:** 2026-02-15 20:12 CST
- **Progress:** 20/21 stories complete

## Terminated Projects

### fleai-market (v2 - TERMINATED)
- **Status:** ❌ **TERMINATED** - Parallel spawning + missing menu commands
- **Termination Date:** 2026-02-16 19:46 CST

### fleai-market (v1 - TERMINATED)
- **Status:** ❌ **TERMINATED** - BMAD compliance violation
- **Termination Date:** 2026-02-16 13:15 CST

### meeting-time-tracker-web
- **Status:** ✅ Firebase-only migration complete
- **Repo path:** `projects/meeting-time-tracker-web`

## Known Issues

### Codex Session Death Pattern (RECURRING)
- **Frequency:** 3 waves affected (Wave 4 all 6 died, Wave 5 2/3 died, Wave 6 2/4 died)
- **Pattern:** PIDs die immediately after spawn, or complete work then die before commit
- **Workaround:** PL respawns failed stories; BMAD Amelia as fallback
- **Root cause:** Unknown — possibly resource limits or Codex stability issue

### PL Context Exhaustion Risk
- `agent:project-lead:fleai-market-v4` at 184k/200k tokens (92%)
- May need fresh PL instantiation soon
- Updated AGENTS.md already in PL workspace (dependency-driven, no waves)

## Active Sessions (as of 15:30 CST)

| Session | Model | Context | Status |
|---------|-------|---------|--------|
| agent:project-lead:main | sonnet-4-5 | 200k/200k | ✅ HEARTBEAT_OK |
| agent:project-lead:fleai-market-v4 | sonnet-4-5 | 184k/200k | Active (last msg 14:51) |
| agent:kelly-improver:matt | opus-4-6 | 200k/200k | Compacted |
| agent:main:main | opus-4-6 | 200k/200k | ✅ HEARTBEAT_OK |
| agent:main:jason | sonnet-4-5 | 200k/200k | Dashboard work |
| agent:kelly-improver:jason-i8 | sonnet-4-5 | 200k/200k | Config updates |

## Pending Actions

### Waiting-on-Operator
- **Research Lead Flow:** Operator creating this — architecture approved, awaiting design
- **Stripe refunds tool:** Waiting for Stripe API key
- **Factory architecture test:** v2.4 complete, needs real project test run

### In Progress (Kelly)
- **Factory skills audit:** Remaining: `kelly-improver/`, `memory-system-v2/`, `project-closer/`, `session-closer/`
- **Spawning-protocol fixes:** Found outdated refs (Quinn→Murat, stories-parallel→dependency-graph, stage naming) — need to fix
- **TOOLS.md orchestrator check:** Verify only PL/Kelly/RL reference factory-architecture skill

## Factory Infrastructure

### Heartbeat Monitoring
- **Kelly (main agent):** 5-min heartbeat polls
- **Project Lead:** 60s heartbeat polls (no `target` restriction)
- **Checks:** QA surfacing, stall detection (60 min threshold)

### Key Architecture Changes (today)
- Removed `target: "last"` from PL heartbeat config → all PL sessions polled
- Removed batch/wave logic from PL AGENTS.md → dependency-driven spawning
- Bob's `dependency-graph.json` is authority for story dependencies
- **Complete BMAD workspace rewrite:** All 8 workspaces updated (PL, John, Sally, Winston, Bob, Amelia, Barry, Murat)
- **Murat (TEA) workspace created:** NEW agent for test phase
- **Skill consolidation:** 6 skills deleted (moved to AGENTS.md), 6 kept
- **New skills created:** `project-lead-flow/SKILL.md`, updated `factory-architecture/SKILL.md` to v2.4
- **New docs:** `docs/FACTORY-ARCHITECTURE.md`
- **Architecture doc v2.4:** Git workflow, simplified mode selection, John for impl-readiness gate
