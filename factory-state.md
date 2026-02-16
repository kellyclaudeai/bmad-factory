# Factory State

**Last Updated:** 2026-02-16 15:23 CST

## Active Projects

### fleai-market (v3 - Implementation BLOCKED)
- **Status:** 🚨 ROLLBACK IMMINENT - NEW codex CLI harness systematically failing (2/3 confirmed, 1 pending)
- **Session:** agent:project-lead:project-fleai-market (0794db11-34f6-414e-a724-2751ab62d31a)
- **Repo path:** `projects/fleai-market`
- **Description:** AI agent promotional goods marketplace (virtual farmers market)
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + PostgreSQL + Redis
- **Start Date:** 2026-02-16 13:46 CST
- **Progress:**
  - ✅ Stage 1: Planning complete (26 minutes total)
    - ✅ John (PRD) - 2 min
    - ✅ Sally (UX) - 6 min
    - ✅ Winston (Architecture) - 5 min (Opus 4-6)
    - ✅ John (Epics/Stories) - 7 min
    - ✅ Bob (Parallelization) - 6 min
  - 🚨 Stage 3: Implementation BLOCKED (67 total stories)
    - ✅ Complete: 7 stories (E1-S1, E1-S2, E1-S3, E1-S4, E1-S5, E6-S3, E8-S1) - OLD harness
    - ❌ Failed: 2 stories confirmed (E2-S1-v2, E8-S2-v2) - NEW harness analysis paralysis
    - ⏳ Pending failure: 1 story (E1-S6-v2) - still active, likely same issue
    - ⏸ Blocked: 57 stories (waiting for harness fix)
- **Orchestration Mode:** Mechanical file-based routing (14:16 CST)
  - spawning-protocol skill provides copy/paste spawn templates
  - Project Lead = router, not architect
  - **Parallelization:** UNLIMITED - spawn all runnable stories (no maxConcurrent cap)
  - **Account Setup Automation:** Use web-browser skill for external services (FREE tier default)
- **Story ID Format:** E1-S1 (Epic-Story) - accepted as valid alternative to Story N.M
- **Token Contract Note:** E6-S3 built despite scope removal directive - will address after completion
- **Harness Update (15:19-15:22 CST) - FAILED:**
  - ✅ All BMAD agents now use Sonnet 4.5 as wrapper orchestrator
  - ✅ Consolidated coding-agent skill (Amelia/Barry/Murat reference it)
  - ❌ exec tool with pty:true for codex CLI invocation - SYSTEMATIC FAILURE
  - 🚨 Testing result: 2/3 stories failed with analysis paralysis (E2-S1-v2, E8-S2-v2)
  - 🚨 Root cause: Codex analyzes but never implements when invoked via exec tool
  - 🚨 Rollback plan created: /Users/austenallred/clawd/ROLLBACK-PLAN-CODEX-HARNESS.md
  - ⏳ Waiting for E1-S6-v2 completion to confirm 3/3 failure, then execute rollback

## Terminated Projects

### fleai-market (v2 - TERMINATED)
- **Status:** ❌ **TERMINATED** - Parallel spawning + missing menu commands
- **Termination Date:** 2026-02-16 19:46 CST
- **Reason:** Project Lead spawned John+Sally+Winston in parallel instead of sequentially

### fleai-market (v1 - TERMINATED)
- **Status:** ❌ **TERMINATED** - BMAD compliance violation
- **Termination Date:** 2026-02-16 13:15 CST
- **Reason:** John created US-1 format, Bob created FOUND-001 format (both non-compliant)

### kelly-dashboard
- **Status:** ✅ Complete - Ready for user QA
- **Repo path:** `projects/kelly-dashboard`
- **Completed:** 2026-02-16 14:04 CST
- **Final:** 18 stories complete (14.1-14.4 post-completion bugfixes)
- **Post-completion fixes (15:15-15:28 CST):**
  - Story 14.3 fix: Reverted client component to server component, used Link for clickable cards
  - Story 14.4: Fixed Project Lead transcript display + removed duplicate sections
  - Branch: barry-fix-project-sections

### meeting-time-tracker-web
- **Status:** ✅ Firebase-only migration complete
- **Repo path:** `projects/meeting-time-tracker-web`
- **Backend:** Firebase (Auth + Firestore)
- **ProjectId:** `meeting-time-tracker-aaf`
- **Build:** Passing on `main`
- **Pending:** Manual QA of calendar sync end-to-end

## Pending Actions

### Waiting-on
- **Stripe refunds tool:** Waiting for Stripe API key from Austen
- **Screen sharing to mini:** Needs Screen Sharing enabled on Mac mini
- **meeting-time-tracker-web:** Manual QA of calendar sync end-to-end
- **fleai-market v3 CRITICAL:** Rollback decision pending E1-S6-v2 completion (ETA: 2-3 min)
  - 2/3 stories failed with NEW harness (E2-S1-v2, E8-S2-v2)
  - If E1-S6-v2 also fails → Execute immediate rollback to OLD harness
  - Rollback plan: ROLLBACK-PLAN-CODEX-HARNESS.md

### Autonomous work in progress
- **fleai-market v3 BLOCKED:** Harness failure, rollback pending
  - ❌ E2-S1-v2: Failed at 15:28 (analysis paralysis)
  - ❌ E8-S2-v2: Failed at 15:27 (analysis paralysis)
  - ⏳ E1-S6-v2: Still active, likely same failure
  - 🚨 Next: Execute rollback if E1-S6-v2 fails, respawn with OLD harness
  - ⏸ Remaining 57 stories blocked until harness issue resolved

## Recent Completions

- ✅ Sonnet 4.5 orchestrator decision (15:19 CST)
  - All BMAD agents updated: Amelia, Barry, Murat
  - Config files + AGENTS.md + coding-agent skill updated
- ✅ BMAD coding harness consolidation (15:00-15:15 CST)
  - Created centralized coding-agent skill with BMAD integration
  - Condensed Amelia/Barry AGENTS.md from ~150 lines to ~40-50 lines
  - Added Murat coding harness (was missing)
  - Model strategy finalized for all roles
- ✅ Session termination recovery (15:22 CST)
  - Detected 3 crashed Amelia sessions
  - Marked as terminated in project-state.json
  - Respawned with NEW harness (Sonnet 4.5 + exec pty:true)
- ✅ Coding harness documentation update (14:48 CST)
  - Updated invocation pattern to exec tool with pty:true
  - Changed from bash to exec for proper PTY handling
- ✅ Account setup automation guidance added (14:31-14:34 CST)
  - Use web-browser skill for external service accounts
  - Default to FREE tier, zero-click automation
- ✅ BMAD template root cause investigation (14:20-14:25 CST)
  - Model training bias toward E1-S1 format
  - Decision: Accept E1-S1, revisit template design later
- ✅ Parallelization limit removed (14:25 CST)
  - No maxConcurrent cap, spawn all runnable stories
- ✅ Project Lead simplified to mechanical routing (14:12 CST)
- ✅ spawning-protocol skill enhanced (14:12 CST)
- ✅ fleai-market v3 planning complete (14:14 CST)

## Factory Infrastructure

### Skills Updates
- **coding-agent:** Consolidated BMAD integration documentation
  - Location: `/Users/austenallred/clawd/skills/build/coding-agent/SKILL.md`
  - Added Amelia/Barry/Murat role-specific patterns
  - Updated all examples to exec tool with pty:true
  - Model strategy documented for each role
- **Project Lead:** Simplified orchestration mode (mechanical routing)
  - Location: `/Users/austenallred/.openclaw/agents/project-lead/agent/AGENTS.md`
  - File-based routing protocol
  - Parallelization: Spawn ALL runnable stories
- **spawning-protocol:** Quick Reference section with copy/paste templates
  - Location: `/Users/austenallred/clawd/skills/factory/project-lead/spawning-protocol/SKILL.md`
- **BMAD Agents:** All use Sonnet 4.5 orchestrator
  - Amelia: `/Users/austenallred/.openclaw/agents/bmad-bmm-amelia/config`
  - Barry: `/Users/austenallred/.openclaw/agents/bmad-bmm-barry/config`
  - Murat: `/Users/austenallred/.openclaw/agents/bmad-tea-murat/config`

### Chrome CDP Automation
- **Status:** ✅ Active
- **CDP Endpoint:** `http://127.0.0.1:9222`
- **Profile:** `~/.openclaw/chrome-cdp-profile` (persistent)
- **Usage:** web-browser skill for zero-click automation
