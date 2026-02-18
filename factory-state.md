# Factory State

**Last Updated:** 2026-02-18 10:42 CST (pre-compaction state flush)

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

### fleai-market-v5 (TEA Testing Active)
- **Status:** 🟡 **TESTING** — 48/48 stories complete (100%), Murat TEA audit in progress
- **Session:** `agent:project-lead:project-fleai-market-v5` (created via `gateway call agent`)
- **Repo path:** `projects/active/fleai-market-v5`
- **Description:** Multi-chain crypto marketplace (Solana + Ethereum). AI agents as sellers and buyers. Crossmint integration.
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + Supabase + Crossmint + Stripe + Printful + Vercel
- **Mode:** Normal Greenfield (full BMAD planning → dependency-driven implementation)
- **Fresh Restart:** 2026-02-17 17:31 CST (cleaned all BMAD state, kept intake.md only)
- **Phase 1 Planning:** ✅ COMPLETE (all 8 steps done, 52 min total)
- **Phase 2 Implementation:** ✅ COMPLETE (48/48 stories)
  - **Complete:** 48 stories implemented and committed
  - **Story 3.6 retry history:**
    - First attempt: Failed 01:10 CST (OpenAI billing)
    - Retry #1: Session faint-crustacean died 09:46 CST (signal 9)
    - Retry #2: Succeeded 10:36 CST with new 4-tier fallback wrapper (10m duration)
  - **Deferred:** Story 4.8 (Email Notifications) actually completed on retry
- **Phase 3 Testing:** 🟡 ACTIVE — Murat spawned 10:36 CST (session 369b796f, automate → test-review → trace → nfr-assess)
- **Artifacts:** Full planning docs + 48 stories + dependency-graph.json
- **Last Status Check:** 10:42 CST — Murat TEA audit running (~6 min elapsed), ETA 20-30 min total

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

### takeouttrap (Code Review Found 10 Blockers)
- **Status:** 🔴 **BLOCKED** — 28/37 stories implemented, 10 stories blocked by code review issues, 9 unstarted
- **Session:** `agent:project-lead:project-takeouttrap` (created via `gateway call agent`)
- **Repo path:** `projects/active/takeouttrap`
- **Description:** Browser extension to intervene at DoorDash/Uber Eats checkout with healthier/cheaper alternatives (meal kits, local pickup, home cooking)
- **Tech Stack:** Chrome Extension + React + TypeScript + Tailwind + OpenAI API + Firebase
- **Mode:** Normal Greenfield (full BMAD planning → dependency-driven implementation)
- **Started:** 2026-02-17 19:33 CST
- **Phase 1 Planning:** ✅ COMPLETE (8/8 steps done, finished 20:38 CST)
  - ✅ John (PRD) — 10m (69KB)
  - ✅ Sally (UX retry) — 9m35s (first attempt failed: workflow exploration only, fixed by BMAD path correction)
  - ✅ Winston (Architecture retry) — 7m54s (first attempt stuck 5h+)
  - ✅ John (Epics) — 8m36s
  - ✅ John (Gate Check) — 3m37s (result: CONCERNS - 12 documented, proceeded per old rules, would require remediation under new strict gate)
  - ✅ Bob (Sprint Planning) — 56s
  - ✅ Bob (Dependency Graph) — 1m35s
  - ✅ Bob (Create Stories) — 10m creating 37 story files (26 initially, 11 added via self-heal at 04:02 CST)
- **Phase 2 Implementation:** 🔴 BLOCKED (28 implemented, 10 blocked, 9 unstarted)
  - **Complete & Passing Code Review (12):** 1.8, 3.2, 1.5, 1.4, 1.2, 1.9, 1.7, 1.11, 1.6, 2.1, 3.1, 3.3
  - **Blocked by Code Review (10):** 1.1 (129 ESLint), 1.3 (Sentry setup), 1.10 (test code in prod), 2.2 (AC violations), 2.3 (cook time AC), 2.4 (duplicate recipes), 2.5 (Redis bug), 2.6 (multi-story commit), 2.7 (3 blockers), 2.8 (4 critical), 2.10 (3 deployment blockers)
  - **Unstarted (9):** 2.9, 3.4-3.7, 4.1-4.8
  - **Implementation started:** 04:14 CST
  - **Codex rate limit hits:** Stories 2.8 & 3.2 at 05:02-05:03 CST
  - **4-tier fallback validated:** Both retries succeeded with Claude Code (10:26-10:34 CST)
  - **Code review results (10:34-11:03 CST):** 12 PASSED, 10 BLOCKED (critical issues require rework)
- **Blockers require:** Fix critical issues (ESLint, test code, AC violations, Redis bugs) before resuming implementation
- **ETA unknown:** Waiting on blocker remediation plan from Project Lead

## Research Lead

### Workflow Improvement (IN PROGRESS - 2026-02-18 11:02 CST)
- **Status:** 🟡 **PLANNING** — Design phase for Research Lead workflow improvements
- **Problem identified:** Batch runs 1+2 produced low diversity output
  - Too many subscription-cancellation ideas (6+ similar concepts)
  - Formulaic compound-word naming (MeetCost, EventSquad, TakeoutTrap pattern)
  - Mary's "random vertical" approach creates artificial constraints, not real stochasticity
- **Root causes:**
  1. **Phase 1 randomness is superficial** - "Pick a random vertical" doesn't vary search approach
  2. **Search strategy too mechanical** - Following checklist instead of genuine discovery
  3. **Naming is formulaic** - Always generates compound words
  4. **No real stochastic variation** - Every session follows same pattern with different inputs
- **Proposed fixes:**
  1. **Rewrite Phase 1 (Pain Point Discovery):** 8 stochastic search strategies (Sentiment Mining, Workflow Analysis, Money Signals, Time Signals, Failure Mining, Workaround Archaeology, Emerging Context, Anti-pattern Discovery) - Mary picks 2-3 randomly per session
  2. **Add naming diversity (Phase 6):** 9 naming styles to rotate (Compound Words, Single Evocative, Playful, Descriptive Phrases, Made-up Words, Domain-style, Metaphorical, Action-oriented, Outcome-focused)
  3. **Remove "random vertical" language:** Stochastic element is search STRATEGY, not arbitrary vertical selection
- **Implementation plan:**
  1. Update `/Users/austenallred/clawd/docs/core/research-lead-flow.md` (Phase 1 + Phase 6)
  2. Update Mary's AGENTS.md with new search strategy instructions
  3. Update Research Lead's AGENTS.md with naming diversity
  4. Test with 3-5 parallel runs to validate diversity improvement
- **Files to change:**
  - `docs/core/research-lead-flow.md` (source of truth)
  - `~/.openclaw/workspace-mary/AGENTS.md` (Phase 1 execution)
  - `~/.openclaw/workspace-research-lead/AGENTS.md` (Phase 6 naming)
- **Next action:** Awaiting operator confirmation to proceed with edits

### Batch Run #1 - 20 Parallel Sessions (COMPLETE)
- **Status:** ✅ **COMPLETE** — 10 project directories created from 20 sessions (50% success rate)
- **Sessions:** `agent:research-lead:3` through `agent:research-lead:22`
- **Launch time:** 2026-02-17 19:31 CST
- **Completed:** ~20:10-20:20 CST (40-50 min per session)
- **Constraints:** B2C businessModel, web-app platform, avoid B2B/enterprise/agency-tools
- **Registry coordination:** Prevents duplicate pain point research across parallel sessions
- **Output location:** `projects-queue/<name>-<timestamp>/intake.md`
- **Results:**
  - ✅ 10 project directories created: benchmarkiq, cancelchampion, cancelpilot, clearrate, done-ish, intentstack, mealmemory, now-or-never, patternwitness, redux, valuestream
  - ❌ 10 sessions failed (likely Brave API rate limits - batch started before web-search skill fix)

### Batch Run #2 - 10 Parallel Sessions (COMPLETE)
- **Status:** ✅ **COMPLETE** — 7 project directories created from 10 sessions (70% success rate)
- **Sessions:** `agent:research-lead:23` through `agent:research-lead:32`
- **Launch time:** 2026-02-17 20:48 CST
- **Completed:** ~21:00-21:46 CST (40-60 min per session)
- **Constraints:** B2C businessModel, web-app platform, avoid B2B/enterprise/agency-tools
- **Tooling:** web-search skill (SearXNG local Docker) - should avoid Brave API rate limit issues
- **Results:**
  - ✅ 7 project directories created: eventsquad, clearcut, spend-peace, weddingcopilot, trustcircle, maintenancestreak, fairshare-family
  - ❌ 3 sessions failed (improved from 50% to 70% success rate with SearXNG)

### Previous Runs (COMPLETE)
1. **ClientSignal** (session #1) — B2B customer intelligence platform (deferred, not B2C focus)
2. **TakeoutTrap** (session #2) — B2C browser extension for DoorDash takeout intervention (27 min runtime)

## Active Sessions (as of 09:20 CST)

| Session | Model | Context | Status |
|---------|-------|---------|--------|
| agent:main:matrix:direct:@matt:austens-mac-mini.local | opus-4-6 | Multiple compactions | ✅ Active (Kelly main session) |
| agent:project-lead:project-fleai-market-v5 | sonnet-4-5 | Active | 🟡 TEA testing (Murat session 369b796f, ~6 min elapsed) |
| agent:project-lead:project-takeouttrap | sonnet-4-5 | Active | 🔴 Blocked (10 stories failed code review, need remediation) |
| agent:project-lead:main | sonnet-4-5 | Active | ✅ Heartbeat |
| agent:main:main | opus-4-6 | Active | ✅ Heartbeat |

## Pending Actions

### In Progress
- **fleai-market-v5 TEA testing:** Active (Murat session 369b796f, started 10:36 CST, ~6 min elapsed, ETA 20-30 min)
- **takeouttrap:** Blocked — 10 stories failed code review, need remediation plan

### Recently Completed
- ✅ **Skill refactor:** Agent-specific skills with 4-tier fallback (09:30-10:10 CST, commits `f1cf231`, `7f88db9`, `dda1c8f`)
- ✅ **Story 3.6 retry #2:** Succeeded with 4-tier fallback (10:26-10:36 CST, 10m duration)
- ✅ **TakeoutTrap retries:** Stories 2.8 & 3.2 both succeeded with Claude Code fallback (10:26-10:34 CST)
- ✅ **Documentation restructuring:** Created docs/core/, merged userqa-workflow.md into project-lead-flow.md Phase 4, created CHANGELOG.md

### Waiting-on-Operator
- **QA review:** calculator-app, kelly-dashboard, daily-todo-tracker awaiting operator testing
- **Research briefs review:** 20 product briefs available in projects-queue/ (17 from batches 1+2, 3 pre-batch)
  - Batch 1: 10 complete (50% success, Brave API rate limits)
  - Batch 2: 7 complete (70% success, SearXNG improved reliability)
- **fleai-market-v5 User QA:** Available after TEA testing completes (ETA ~10:50-11:00 CST)
- **takeouttrap:** Remediation plan needed — 10 stories blocked by code review (critical issues require fixes before resuming)

## Known Issues

### OpenAI API Billing Error (RESOLVED 10:36 CST)
- **Issue:** OpenAI API out of credits (billing error returned at 09:09 CST)
- **Impact:** All Codex CLI calls blocked (gpt-5.3-codex, gpt-5.3-spark)
- **Mitigation:** 4-tier automatic fallback implemented (10:10 CST, commit `f1cf231`)
  - **Architecture:** Shared wrapper in `build/coding-cli/bin/code-with-fallback`
  - **Cascade:** Codex GPT plan → Codex API key → Claude Code Anthropic plan → Claude Code API key
  - **Detection:** Auto-detects billing/rate/quota errors, retries next tier automatically
  - **Inheritance:** Amelia, Barry, Murat all use same wrapper (no duplication)
- **Validation:** ✅ VALIDATED (10:26-10:36 CST)
  - Story 3.6 retry #2 succeeded with Claude Code fallback (10m duration)
  - TakeoutTrap stories 2.8 & 3.2 both succeeded with Claude Code fallback (~6 min each)
  - System auto-detected billing errors and cascaded to Tier 3 (Claude Code) successfully
- **Operator action:** Optional - Top up OpenAI credits OR rely on Claude Code long-term (both work now)

### Orchestrator Session Creation (RESOLVED 16:49 CST)
- `openclaw agent --agent <id> --session-id <id>` → session key always becomes `agent:<id>:main` (--session-id sets UUID, not key suffix)
- `openclaw gateway call agent --params '{"sessionKey":"...","idempotencyKey":"..."}'` → sets exact session key ✅
- `sessions_spawn(...)` → creates subagent (can't spawn sub-agents) ❌
- **Documentation fixed:** AGENTS.md commit `f2dcfbd`

### OpenAI API Rate Limits (MONITORING)
- **Issue:** Codex CLI hitting per-minute usage limits during implementation
- **TakeoutTrap impact:** Stories 2.8 & 3.2 blocked with "Codex CLI usage limit reached", resets 14:19 CST (2:19 PM)
- **Auto-fallback:** coding-agent skill will detect rate limit errors and retry with Claude Code
- **Expected behavior:** After Story 3.6 validates Claude Code fallback, remaining TakeoutTrap stories will auto-switch on rate limit

### BMAD Workflow Paths (FIXED 20:10-20:20 CST 2026-02-17)
- **Issue:** All BMAD agent AGENTS.md files had incorrect workflow paths
- **Symptom:** Sally's "workflow exploration only" failures (couldn't find workflow files)
- **Fix:** Updated all 8 BMAD agents (John, Sally, Winston, Bob, Amelia, Barry, Murat, Mary) with correct paths
- **Path structure:** `_bmad/{module}/workflows/{phase}/{workflow-name}/{file}`
- **Files:** workflow.md, instructions.xml, instructions.md, workflow.yaml (varies by workflow)

### Gate Check Strict Mode (IMPLEMENTED 20:30 CST 2026-02-17)
- **Decision:** Only PASS proceeds to implementation; CONCERNS/FAIL require remediation loop
- **Before:** CONCERNS was acceptable (proceed with noted risks)
- **After:** Any non-PASS result triggers automatic remediation (spawn appropriate personas to fix issues)
- **Impact:** TakeoutTrap proceeded under old rules (12 CONCERNS), future projects will enforce strict gate
- **Files:** `docs/project-lead-flow.md`, workspace-project-lead/AGENTS.md

### Codex Session Death Pattern (fleai-market-v4 - ARCHIVED)
- 3 waves affected in v4; root cause unknown
- v5 using Sonnet 4.5 subagents (not Codex) — may not recur
- Auto-fallback now prevents similar blocks

## Archived Projects

15 archived projects in `projects/archived/` (see git history for details)

## Key Architecture Decisions (2026-02-17)

- **Dependency-driven spawning:** No artificial batching/waves. Stories spawn as `dependsOn` satisfied.
- **docs/ is source of truth:** `factory-overview.md`, `project-lead-flow.md`, `research-lead-flow.md`
- **AGENTS.md = behavioral rules:** References docs/ for flow specs
- **Session creation:** `gateway call agent` for custom keys; `openclaw agent` for `:main` only
- **Project structure:** `projects/{ideas,active,shipped,archived}/`
- **Bob's dependency-graph.json:** Authority for story parallelization
- **Web search default:** ALWAYS use web-search skill (SearXNG local Docker), NOT web_search tool (Brave API)
- **TOOLS.md > AGENTS.md for tool preferences:** TOOLS.md = "what tools to use" (environment-specific), AGENTS.md = "how to behave" (workflow instructions)
- **Progressive disclosure for skills:** TOOLS.md lists skills with brief descriptions, agents read full SKILL.md when needed
- **Factory web app assumption:** All factory projects are web apps unless specified otherwise → web-browser + firebase-cli skills available by default

## Factory Infrastructure Updates (19:39-19:51 CST)

### Web Search Tool Migration
- **Problem:** Research Lead + Mary using Brave Search API (`web_search` tool) → rate limits + billing errors
- **Solution:** Migrated to **web-search skill** (SearXNG local Docker on localhost:8888)
- **Benefits:** No rate limits, no API costs, built specifically for high-volume research
- **Files updated:** Research Lead + Mary AGENTS.md (spawning instructions)

### TOOLS.md Standardization (15 Workspaces)
**Updated all agent workspaces with tool preference guidance:**
- Main workspace + 14 agent workspaces (Research Lead, Project Lead, Mary, all 9 BMAD agents, main)
- **web-search** section added: Default tool for all web queries (SearXNG, not Brave API)
- **web-browser** section added: Playwright CDP for logged-in automation (Firebase/GCP/Vercel dashboards, QA testing)
- **firebase-cli** section added: Backend provisioning (Auth, Firestore, Hosting) for web projects

**Agent-specific web skills:**
- **web-browser:** Project Lead (QA phase), Amelia (testing), Barry (fast-track QA)
- **firebase-cli:** Project Lead, Winston (Architect), Amelia (backend setup)

**Commits:**
- `db150b8` — web-search default to TOOLS.md
- `2fca09c` — web-browser skill
- `38ef0b0` — firebase-cli skill

### TOOLS.md Best Practice Established
- **TOOLS.md:** Tool preferences, environment-specific notes ("what tools to use")
- **AGENTS.md:** Behavioral rules, workflow instructions ("how to behave")
- **Progressive disclosure:** TOOLS.md lists skills briefly, agents read full SKILL.md when task requires detailed guidance
- **Factory assumption:** All projects are web apps → web-browser + firebase-cli available by default

## Factory Infrastructure

### Heartbeat Monitoring
- **Kelly (main agent):** 5-min heartbeat polls
- **Project Lead:** 60s heartbeat polls (no `target` restriction)
- **Checks:** QA surfacing, stall detection (60 min threshold)

### Documentation Restructuring (10:10-10:40 CST)
- **Created:** `docs/core/` folder for main workflow documentation
  - Moved `project-lead-flow.md` and `research-lead-flow.md` to `docs/core/`
  - Created `docs/core/README.md` as index
- **Merged:** `docs/userqa-workflow.md` content into `project-lead-flow.md` Phase 4 (expanded from 15 lines to comprehensive 200+ lines)
- **Archived:** `docs/userqa-workflow.md` moved to `docs/archive/` (deprecated)
- **Created:** `docs/CHANGELOG.md` — Kelly improvement history (skill refactors, fallback systems, BMAD workflows, Research Lead, doc restructuring)
- **Rationale:** Main workflows easy to find, userqa integrated into project flow, architectural decisions tracked

### Git Commits (Last 2 Days)

**2026-02-18:**
- `1df742f` — revert: allow CLI continuation (no workspace reset between tiers) - FINAL decision
- `a2c3e8f` — fix: clean working directory (REVERTED - breaks continuation)
- `d1e33d2` — state: update factory state
- `dda1c8f` — docs: update for skill refactor (remove Codex reference, mark audit as superseded)
- `7f88db9` — docs: skill refactor complete - agent-specific skills + 4-tier fallback
- `f1cf231` — refactor: split coding-agent into agent-specific skills with 4-tier fallback
- `4d93786` — state: update heartbeat state - OpenAI billing error, auto-fallback architecture decision
- `16dd596` — docs: pre-compaction state flush - Story 3.6 retry, OpenAI billing error, auto-fallback architecture

**2026-02-17:**
- `cd9b065` — docs: document gate check strict mode decision and implementation
- `074504f` — docs: enforce strict gate check - only PASS proceeds to implementation
- `dae6a72` — fix: document BMAD workflow paths fix for all agents
- `38ef0b0` — docs(tools): add firebase-cli skill to TOOLS.md
- `2fca09c` — docs(tools): add web-browser skill to TOOLS.md
- `db150b8` — docs(tools): add web-search default to TOOLS.md
- `f2dcfbd` — fix: correct orchestrator session creation docs
- `51ffc79` — docs: add orchestrator session creation protocol (partially wrong, fixed by f2dcfbd)
- `ed44250` — refactor: reorganize projects into ideas/active/shipped/archived
- `8342cc0` — major: agent audit - rewrite AGENTS.md for all modes, create RL + CIS agents
- `f04767c` — refactor: move factory architecture from skill to docs/
