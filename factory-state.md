# Factory State

**Last Updated:** 2026-02-18 09:20 CST (pre-compaction state flush)

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

### fleai-market-v5 (Implementation 97.9% Complete, Story 3.6 Retry Active)
- **Status:** 🟡 **IMPLEMENTATION** — 47/48 stories complete (97.9%), Story 3.6 retry in progress
- **Session:** `agent:project-lead:project-fleai-market-v5` (created via `gateway call agent`)
- **Repo path:** `projects/active/fleai-market-v5`
- **Description:** Multi-chain crypto marketplace (Solana + Ethereum). AI agents as sellers and buyers. Crossmint integration.
- **Tech Stack:** Next.js + TypeScript + Tailwind + Prisma + Supabase + Crossmint + Stripe + Printful + Vercel
- **Mode:** Normal Greenfield (full BMAD planning → dependency-driven implementation)
- **Fresh Restart:** 2026-02-17 17:31 CST (cleaned all BMAD state, kept intake.md only)
- **Phase 1 Planning:** ✅ COMPLETE (all 8 steps done, 52 min total)
- **Phase 2 Implementation:** 🟡 ACTIVE (47/48 stories complete)
  - **Complete:** 47 stories implemented and committed
  - **Active:** Story 3.6 (Agent Payments Protocol) retry with Claude Code (started 09:16 CST, session faint-crustacean)
  - **Deferred:** Story 4.8 (Email Notifications) actually completed on retry
  - **Issue:** Story 3.6 first attempt failed 01:10 CST (OpenAI billing error), retry using Claude Code fallback
  - **OpenAI billing error:** Hit again at 09:09 CST, confirming account out of credits
- **Phase 3 Testing:** ⏳ QUEUED — Murat (TEA) will spawn after Story 3.6 completes
- **Artifacts:** Full planning docs + 48 stories + dependency-graph.json
- **Last Status Check:** 09:20 CST — Story 3.6 retry active (~4 min elapsed), Claude Code analyzing story

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

### takeouttrap (Implementation 70% Complete, 2 Stories Blocked)
- **Status:** 🟡 **IMPLEMENTATION** — 26/37 stories complete (70%), 2 blocked by Codex rate limit
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
- **Phase 2 Implementation:** 🟡 ACTIVE (26/37 stories complete, 70%)
  - **Complete:** 26 stories implemented (as of 05:06 CST last check)
  - **Blocked:** Story 2.8, Story 3.2 (Codex rate limit, resets 14:19 CST 2:19 PM)
  - **Remaining:** 9 stories unstarted (Epic 2: 2.9-2.10, Epic 3: 3.3-3.4, Epic 4: 4.3-4.11)
  - **Implementation started:** 04:14 CST (overnight run)
  - **Auto-fallback:** Coding-agent skill will auto-retry with Claude Code when Codex limit hits
- **ETA to completion:** ~4 hours after rate limit clears (14:19 CST), target ~18:00 CST

## Research Lead

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
| agent:project-lead:project-fleai-market-v5 | sonnet-4-5 | Active | 🟡 Story 3.6 retry (Claude Code session faint-crustacean) |
| agent:project-lead:project-takeouttrap | sonnet-4-5 | Active | 🟡 Implementation (26/37, 2 blocked by Codex rate limit) |
| agent:project-lead:main | sonnet-4-5 | Active | ✅ Heartbeat |
| agent:main:main | opus-4-6 | Active | ✅ Heartbeat |

## Pending Actions

### In Progress
- **fleai-market-v5 Story 3.6:** Retry needed (session faint-crustacean died 09:46 CST), will retry with new amelia-coding skill
- **fleai-market-v5 TEA testing:** Queued after Story 3.6 completes (Murat, ~20-30 min)
- **takeouttrap:** Implementation — 26/37 stories complete (70%), 2 blocked by Codex rate limit (resets 14:19 CST)

### Recently Completed
- ✅ **Skill refactor:** Agent-specific skills with 4-tier fallback (09:30-10:10 CST, commits `f1cf231`, `7f88db9`, `dda1c8f`)

### Waiting-on-Operator
- **QA review:** calculator-app, kelly-dashboard, daily-todo-tracker awaiting operator testing
- **Research briefs review:** 20 product briefs available in projects-queue/ (17 from batches 1+2, 3 pre-batch)
  - Batch 1: 10 complete (50% success, Brave API rate limits)
  - Batch 2: 7 complete (70% success, SearXNG improved reliability)
- **fleai-market-v5 User QA:** Available after TEA testing completes (ETA ~09:40-09:50 CST)
- **takeouttrap User QA:** Available after implementation completes (ETA ~10:30-11:00 AM, blocked by Codex rate limit)

## Known Issues

### OpenAI API Billing Error (MITIGATED 10:10 CST)
- **Issue:** OpenAI API out of credits (billing error returned at 09:09 CST)
- **Impact:** All Codex CLI calls blocked (gpt-5.3-codex, gpt-5.3-spark)
- **Affected projects:** fleai-market-v5 Story 3.6 (failed 01:10 CST), TakeoutTrap stories 2.8 & 3.2 when rate limit clears
- **Mitigation:** 4-tier automatic fallback implemented (10:10 CST, commit `f1cf231`)
  - **Architecture:** Shared wrapper in `build/coding-cli/bin/code-with-fallback`
  - **Cascade:** Codex GPT plan → Codex API key → Claude Code Anthropic plan → Claude Code API key
  - **Detection:** Auto-detects billing/rate/quota errors, retries next tier automatically
  - **Inheritance:** Amelia, Barry, Murat all use same wrapper (no duplication)
  - **Status:** Ready for validation with Story 3.6 retry
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

### Git Commits (Last 2 Days)

**2026-02-18:**
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
