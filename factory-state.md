# Factory State

**Last Updated:** 2026-02-18 13:13 CST

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

**Fresh slate.** All projects archived on 2026-02-18 12:47 CST.

### Recently Archived (moved to projects/archived/)

1. **fleai-market-v5** (48/48 stories complete, TEA passed)
2. **calculator-app** (6/6 stories complete, Barry Fast Mode)
3. **daily-todo-tracker** (7/7 stories complete, Barry Fast Mode)
4. **kelly-dashboard** (20/21 stories complete)
5. **takeouttrap** (28/37 stories, mid-remediation - archived incomplete)

Ready for new projects.

## Research Lead

### Workflow v2.0 Update (COMPLETE - 2026-02-18 12:10 CST)
- **Status:** ✅ **DOCUMENTED** — Workflow design complete, ready for agent config implementation
- **Problem identified:** Batch runs 1+2 produced low diversity output
  - Too many subscription-cancellation ideas (6+ similar concepts)
  - Formulaic compound-word naming (MeetCost, EventSquad, TakeoutTrap pattern)
  - Mary's "random vertical" approach created artificial constraints, not real stochasticity
  - Keyword-based deduplication missed "same pain, different name" duplicates
- **Solutions implemented in v2.0 workflow:**
  1. ✅ **Config-driven research:** Platform, business model, stack constraints guide ALL phases
  2. ✅ **Mary Phase 1 redesign:** Broad market scanning (Google Trends, App Store, PH, VC news) → narrow pain discovery (Reddit, HN, reviews) → score for BOTH pain AND market size
  3. ✅ **LLM-based pain point deduplication:** CHECK 1 uses reasoning to catch "same pain, different wording" (not keyword matching)
  4. ✅ **Mary generates initial name:** Analytical/descriptive name for registry tracking (Phase 2)
  5. ✅ **Carson generates final names:** Creative brand names with varied styles (Phase 6) - NOT all compound words
  6. ✅ **Market size validation:** Built into scoring (competitors, revenue, search volume, willingness to pay)
  7. ✅ **Platform-aware feasibility:** Mary knows if we're building web app vs mobile app, scores accordingly
- **Key architectural changes:**
  - Research Lead receives config on spawn, propagates to ALL sub-agents (Mary, CIS)
  - Registry now stores `painPoint` field for LLM deduplication
  - 3 dedup checkpoints: CHECK 1 (LLM pain point), CHECK 2 (keyword solution), CHECK 3 (final safety)
  - Carson added to Phase 6 for creative naming (9 naming styles to rotate)
- **Files updated:**
  - ✅ `docs/core/research-lead-flow.md` (v2.0 - complete rewrite, 12:10 CST)
- **Files pending:**
  - ⏳ `~/.openclaw/workspace-mary/AGENTS.md` (new discovery protocol)
  - ⏳ `~/.openclaw/workspace-research-lead/AGENTS.md` (config propagation, LLM dedup, Carson naming)
  - ⏳ `~/.openclaw/workspace-carson/AGENTS.md` (naming task addition)
  - ⏳ `~/.openclaw/workspace-victor/AGENTS.md` (config awareness)
  - ⏳ `~/.openclaw/workspace-maya/AGENTS.md` (config awareness)
  - ⏳ `~/.openclaw/workspace-quinn/AGENTS.md` (config awareness)
  - ⏳ Kelly AGENTS.md (spawn protocol with config passing)
- **Next action:** Implement agent config changes, then test with 3-5 parallel runs to validate diversity

### Clean Slate (2026-02-18 12:58 CST)
- **Status:** 🔄 **RESET** — All previous sessions closed, projects-queue cleared, research-registry cleared
- **Actions taken:**
  - Deleted all 20 product briefs from projects-queue/
  - Cleared Research Lead sessions.json (sessions 2-5, test session)
  - Reset research-registry.json
- **Next:** Ready for fresh batch with v2.0 workflow (updated flows in docs/core/research-lead-flow.md)

## Active Sessions (as of 13:08 CST)

| Session | Model | Context | Status |
|---------|-------|---------|--------|
| agent:main:matt | sonnet-4-5 | Active | ✅ Active (Kelly main session) |
| agent:main:main | sonnet-4-5 | 200k tokens | ✅ Heartbeat |
| agent:project-lead:kelly-dashboard | sonnet-4-5 | 200k tokens | ✅ Active |
| agent:project-lead:main | sonnet-4-5 | Active | ✅ Heartbeat |
| agent:main:jason | sonnet-4-5 | 200k tokens | ✅ Active |
| agent:kelly-improver:main | sonnet-4-5 | 200k tokens | ✅ Heartbeat |

**Session Cleanup (13:08-13:13 CST):**
- Closed: project-fleai-market-v5-test, jason-dashupdate, agent:main (duplicate), matrix:channel session
- Fixed duplicate main session issue (agent:main vs agent:main:main)
- Updated session-closer skill to support any agent (not just project-lead)

## Pending Actions

### In Progress
- **takeouttrap remediation:** 3 fix sessions active (stories 1.10, 2.8, 2.6 started 11:05 CST, 61 min elapsed as of 12:06 CST), 7 stories still awaiting fixes

### Recently Completed
- ✅ **fleai-market-v5 TEA testing recovery:** Kelly safety net caught 71-min stall (11:47 CST), fresh Murat spawn succeeded (11:49-12:00 CST, 10 min), moved to User QA (12:01 CST)
- ✅ **Skill refactor:** Agent-specific skills with 4-tier fallback (09:30-10:10 CST, commits `f1cf231`, `7f88db9`, `dda1c8f`)
- ✅ **Story 3.6 retry #2:** Succeeded with 4-tier fallback (10:26-10:36 CST, 10m duration)
- ✅ **TakeoutTrap retries:** Stories 2.8 & 3.2 both succeeded with Claude Code fallback (10:26-10:34 CST)
- ✅ **Documentation restructuring:** Created docs/core/, merged userqa-workflow.md into project-lead-flow.md Phase 4, created CHANGELOG.md
- ✅ **Kelly workflow documentation:** Created kelly-router-flow.md and kelly-improver-flow.md (11KB each, in docs/core/)

### Waiting-on-Operator
- **QA review:** calculator-app, kelly-dashboard, daily-todo-tracker, fleai-market-v5 awaiting operator testing
  - fleai-market-v5: http://localhost:3000 (PID 83461, dev server running since 12:00 CST)
  - Focus: Multi-chain checkout, Story 3.6 (AP2 launch blocker), Printful fulfillment, agent payouts
- **kelly-dashboard:** Running on port 3000 (not 3001), restarted 13:05 CST
- **Research briefs:** Queue cleared (12:58 CST) - ready for fresh batch with v2.0 workflow
- **takeouttrap:** Remediation in progress (3 stories being fixed, 7 still awaiting remediation after first batch completes)
- **Kelly workflow README updates:** kelly-router-flow.md and kelly-improver-flow.md created, need to update docs/core/README.md and docs/README.md with links
- **Research Lead workflow improvements:** Design proposal ready (8 stochastic search strategies + 9 naming styles), awaiting operator confirmation to proceed

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
