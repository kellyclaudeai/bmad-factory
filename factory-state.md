# Factory State

**Last Updated:** 2026-02-17 16:19 CST

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

### daily-todo-tracker (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3011
- **Session:** agent:project-lead:project-daily-todo-tracker
- **Repo path:** `projects/active/daily-todo-tracker`
- **Description:** Simple to-do tracking app with localStorage
- **Tech Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Timeline:** 12:27-13:38 CST (1h 9min total)
- **Progress:** ✅ All 7 stories complete (1.1-1.7)
- **QA Instructions:** Test task CRUD, filters (All/Today/Week/Completed), mobile responsiveness

### calculator-app (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000
- **Session:** agent:project-lead:calculator-app
- **Repo path:** `projects/active/calculator-app`
- **Description:** Simple calculator with keyboard support
- **Tech Stack:** Next.js + TypeScript + Tailwind
- **Completed:** 2026-02-17 00:50 CST
- **Progress:** ✅ All 6 stories complete

### kelly-dashboard (Ready for User QA)
- **Status:** 🧪 **READY FOR QA**
- **QA URL:** http://localhost:3000 (kelly-dashboard)
- **Session:** agent:project-lead:kelly-dashboard
- **Repo path:** `projects/active/kelly-dashboard`
- **Description:** Factory monitoring dashboard
- **Tech Stack:** Next.js + TypeScript + Tailwind
- **Completed:** 2026-02-15 20:12 CST
- **Progress:** 20/21 stories complete

## Ideas

### fleai-market-v5 (Ready to Start)
- **Status:** 💡 **IDEA** - Product brief ready
- **Repo path:** `projects/ideas/fleai-market-v5`
- **Description:** Multi-chain crypto marketplace (Solana + Ethereum). AI agents as sellers and buyers. Crossmint integration.
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + Supabase + Vercel
- **Mode:** Normal Greenfield (full BMAD planning pipeline)
- **Intake:** `product-brief.md` (comprehensive 8KB brief, all decisions made)
- **Next:** Spawn Project Lead when operator approves

## Archived Projects

15 archived projects in `projects/archived/`:
- fleai-market-v4 (abandoned 16:19 CST - Codex death pattern, context exhaustion)
- fleai-market-v2 (terminated - parallel spawning issues)
- fleai-market-v1 (terminated - BMAD compliance violation)
- meeting-time-tracker-web (completed, archived)
- All timestamped archived_* folders
- calc-basic, hello-world, meeting-time-tracker
- fasting-timer, hydration-tracker, bug-dictionary

## Known Issues

### Codex Session Death Pattern (RECURRING - fleai-market-v4)
- **Frequency:** 3 waves affected (Wave 4 all 6 died, Wave 5 2/3 died, Wave 6 2/4 died)
- **Pattern:** PIDs die immediately after spawn, or complete work then die before commit
- **Workaround:** PL respawns failed stories; BMAD Amelia as fallback
- **Root cause:** Unknown — possibly resource limits or Codex stability issue
- **Status:** Project archived, will retry with v5 using updated PL AGENTS.md

## Active Sessions (as of 16:19 CST)

| Session | Model | Context | Status |
|---------|-------|---------|--------|
| agent:main:main | opus-4-6 | 200k/200k | ✅ Active |
| agent:kelly-improver:matt | opus-4-6 | 200k/200k | Compacted |

## Pending Actions

### Ready to Execute
- **fleai-market-v5:** Product brief ready in `projects/ideas/fleai-market-v5/product-brief.md`
  - Awaiting operator approval to start
  - Mode: Normal Greenfield
  - PL will run full BMAD planning (John → Sally → Winston → Bob → Amelia)

### Waiting-on-Operator
- **Stripe refunds tool:** Waiting for Stripe API key

### Completed Today (19:00-19:59)
- ✅ Agent readiness audit: All 4 PL modes + Research Lead pipeline fully documented
- ✅ Research Lead + 4 CIS agents created (carson, victor, maya, quinn)
- ✅ PL AGENTS.md rewrite (556→160 lines, references docs/)
- ✅ Bob dependency-graph.json documentation added
- ✅ Amelia git strategy fixed to `dev` branch
- ✅ John/Sally/Winston brownfield EDIT mode added
- ✅ Barry AGENTS.md trimmed (396→100 lines)
- ✅ Mary dual-context support (BMAD + Research Lead)
- ✅ Stale workspaces removed (bmm-john, kelly-refactor)
- ✅ Amelia workspace cleaned (11 leaked files)
- ✅ Factory architecture moved from skill to docs/
- ✅ Project structure reorganized (ideas/active/shipped/archived)
- ✅ fleai-market-v4 archived (37/68 stories, Codex death pattern)

## Factory Infrastructure

### Heartbeat Monitoring
- **Kelly (main agent):** 5-min heartbeat polls
- **Project Lead:** 60s heartbeat polls (no `target` restriction)
- **Checks:** QA surfacing, stall detection (60 min threshold)

### Key Architecture Changes (2026-02-17)
- Removed `target: "last"` from PL heartbeat config → all PL sessions polled
- Removed batch/wave logic from PL AGENTS.md → dependency-driven spawning
- Bob's `dependency-graph.json` is authority for story dependencies
- **Complete BMAD workspace rewrite:** All 8 workspaces updated (PL, John, Sally, Winston, Bob, Amelia, Barry, Murat)
- **Murat (TEA) workspace created:** NEW agent for test phase
- **Skill consolidation:** 6 skills deleted (moved to AGENTS.md), 6 kept
- **New skills created:** `project-lead-flow/SKILL.md`, updated `factory-architecture/SKILL.md` to v2.4
- **New docs:** `docs/FACTORY-ARCHITECTURE.md`
- **Architecture doc v2.4:** Git workflow, simplified mode selection, John for impl-readiness gate
- **Factory architecture refactor (19:00-19:59):**
  - Killed `factory-architecture` skill → moved to `docs/` as source of truth
  - Created `docs/factory-overview.md`, `docs/project-lead-flow.md`, `docs/research-lead-flow.md`
  - Archived 5 superseded drafts to `docs/archive/`
- **Agent readiness audit (19:00-19:59):**
  - PL AGENTS.md: 556→160 lines (references docs/ instead of duplicating)
  - Bob: added dependency-graph.json creation logic (critical gap fixed)
  - Amelia: fixed git strategy to `dev` branch (was branch-per-story)
  - John/Sally/Winston: added brownfield EDIT mode
  - Barry: trimmed from 396→100 lines (removed example bloat)
  - Mary: added dual context (BMAD + Research Lead roles)
  - Created Research Lead agent + workspace + gateway config
  - Created 4 CIS agents: carson, victor, maya, quinn (workspaces + AGENTS.md)
  - Removed stale workspaces: bmm-john, kelly-refactor
  - Cleaned Amelia workspace cruft (11 leaked files)
