# Kelly Factory Changelog

**Purpose:** Log significant changes to Kelly's architecture, workflows, and agent behavior. Brief entries with timestamps - what changed and why.

**Format:** `YYYY-MM-DD HH:MM CST | Component | What Changed | Why`

2026-02-21 01:05 CST | project-state.json schema + PL flow + AGENTS.md Quick Update | Added `mode` field to project lifecycle. Values: greenfield / qa-feedback / hotfix / feature. Shows in Quick Update as [mode] badge next to phase. PL sets on creation (greenfield) and transitions (qa-feedback on rejection, hotfix/feature post-ship). All active projects seeded with mode=greenfield.
2026-02-20 23:05 CST | Murat AGENTS.md + shared-factory-rules.md | Zero Skips Rule. `test.skip()` conditioned on env vars/credentials is FORBIDDEN — it silently hides entire authenticated test suites while reporting 100% pass. Distill: 38/38 "passing" but every post-auth test was skipped because TEST_USER_EMAIL wasn't set. Same pattern as ReelRolla's setOnboardingComplete bypass. Fix: auth tests must throw (not skip) if credentials missing. Murat Validate treats any conditional skip as FAKE → auto-REJECT.
2026-02-20 22:10 CST | shared-factory-rules.md + Murat AGENTS.md + project-lead-flow.md | OAuth E2E scope + localhost redirect bug prevention. Added Gate 5 (OAuth redirect URL audit) to pre-deploy gates. Codified OAuth E2E rule: Playwright asserts redirect to accounts.google.com only (no full flow automation), manual QA gate for end-to-end. Localhost redirect = misconfigured OAuth client — caught at Gate 5 before deploy. Murat must include redirect assertion test if app has OAuth. Triggered by Distill QA hitting localhost redirect on OAuth sign-in.
2026-02-20 19:10 CST | Murat AGENTS.md + project-lead-flow.md + PL AGENTS.md | Added dual-mode Murat (TEST WRITER / TEST VALIDATOR). Same workspace, two adversarial roles. PL spawns writer first, then validator in a separate session. Validator scores tests SOLID/WEAK/FAKE and returns PASS/REVISE/REJECT verdict. Only PASS unlocks Step 4. Validation loop max 3 cycles. Tests that pass but miss real bugs are evidence of fake tests — validator's job is to find them before QA.
2026-02-20 14:04 CST | Sally AGENTS.md + PL AGENTS.md | Added viewport guidance (1440×900 for web/responsive, 390×844 for native mobile only; "mobile-first" ≠ mobile-only) + PL normalizes screens paths on copy (strips design-assets/images/ prefix if present) | All masterpiece-remix screenshots were 390×844 (mobile) for a responsive web app; PL kept re-introducing double-prefix paths on each design-assets.json sync
2026-02-20 13:57 CST | Sally AGENTS.md | Added explicit ✅/❌ path format examples to design-assets.json section | Sally consistently wrote `design-assets/images/screens/{name}.png` (full path) instead of `screens/{name}.png` (API-relative). The dashboard API already prepends `_bmad-output/design-assets/images/` so the full path caused a double-prefix 404. Added unmissable warning with correct vs wrong examples and explanation of how the API resolves paths.
2026-02-20 13:48 CST | Sally AGENTS.md | Fixed Playwright script: hardcoded full path to `/opt/homebrew/lib/node_modules/playwright`, switched from `node -e "..."` to heredoc format, batched all screens in one loop | Bare `require('playwright')` fails (not in project's node_modules), `$(pwd)` breaks in quoted node -e strings. Sally was forced to debug this herself every run, causing inconsistent results. Now a reliable copy-paste pattern.
2026-02-20 13:48 CST | Sally AGENTS.md | Added explicit Revise/Elevate Workflow section | Revise tasks were skipping HTML prototype + screenshot steps — Sally interpreted "revise UX doc" as text-only work, wrote doc references in `screens` field instead of file paths. Section now explicit: revision = full workflow including all 5 steps. Screens field must always be file paths, never doc refs.
2026-02-20 13:48 CST | PL AGENTS.md | Added post-Sally validation gate for design-assets.json screens field | PL was blindly copying design-assets.json to project-state.json even when screens contained doc references (not file paths), causing broken dashboard images. Now validates screens values are paths before copying; if doc refs found, respawns Sally for prototype-only task with explicit instructions.
2026-02-20 12:53 CST | Sally AGENTS.md + design-workflow.md | Fixed design-assets.json path format — screens values must be relative to `design-assets/images/`, not include that prefix | API prepends the directory automatically; Sally wrote full prefix causing path doubling and broken images. Documented the correct format with explicit warning in both AGENTS.md and design-workflow.md.
2026-02-20 12:41 CST | Sally AGENTS.md | Added mandatory mockup generation: frontend-design skill, HTML prototypes, Playwright screenshots, design-assets.json | Sally's AGENTS.md only listed ux-design.md as output and said "you design interfaces, not code" — directly contradicting the design-workflow. Added Step 1–4 mockup section, updated auto-announce, fixed Key Principles, fixed Remember note.
2026-02-20 12:37 CST | Sally + PL Flow | Made design-assets.json + HTML prototypes mandatory; Sally must use frontend-design skill | ReelRolla launched with broken mockup images because PL task prompt treated design assets as optional and still referenced "Figma URLs" (stale). design-workflow.md already described the correct flow (frontend-design skill → HTML prototypes → Playwright screenshots) but project-lead-flow.md Sally step never pointed to it. Fixed: Sally step now mandatory, task prompt explicitly requires reading design-workflow.md and generating screens. PL flow v5.1.
2026-02-20 12:33 CST | Intake Template + Winston | Simplified intake.md to lean product brief; research detail moves to research-notes.md. Fixed Phase 5 naming bug (PRD→intake.md). Winston AGENTS.md updated: reads tech-stack.md first, architecture template now shows defaults not options.
2026-02-20 12:26 CST | Tech Stack | Created docs/core/tech-stack.md — explicit default stack + override policy | Stack standardized: Next.js 15 + TypeScript + Tailwind + shadcn/ui + pnpm + Supabase (DB+Auth) + Drizzle + Vercel. Winston must read before architecture. Overrides documented as ADRs. PL flow v5.0.
2026-02-20 08:59 CST | PL Flow + Murat | E2E testing must use real everything — no mocking | Sentinel Hire CSP bug reached production because Playwright mocked Firebase Auth. Real Google OAuth flow loads apis.google.com which the CSP blocked — never caught. New standard: E2E tests use deployed URL (not localhost), real auth with dedicated test Gmail, console error listener mandatory (CSP = auto-fail). Codified in project-lead-flow.md v4.9 + murat-testing/SKILL.md. ⚠️ ACTION: Need dedicated factory test Gmail (not kelly@bloomtech.com).
2026-02-19 19:53 CST | PL Flow | QA feedback uses story pipeline, not registry tracking | Stage 4.3 rewritten (v4.5): QA feedback from operator → stories → BMAD artifacts → Phase 2 (same as greenfield). Bug exception only: if a specified feature is broken, Amelia fixes directly. Removed qaRounds[] from registry schema — BMAD sprint-status.yaml is source of truth for all work including QA rounds.
2026-02-19 19:49 CST | PL Flow | Removed Fast Mode — Normal Mode only (Greenfield + Brownfield) | Barry Fast Track eliminated. Simplifies PL flow significantly. Cleaned AGENTS.md + kelly-router-flow.md of Barry references.
2026-02-19 19:31 CST | PL Flow | PL session holds alive in pending-qa until operator ships | PL no longer exits after Phase 3 TEA. Stays in idle hold (lock file kept) waiting for Kelly's SHIP/FIX/PAUSE signal. Dashboard shows live session as "AWAITING QA". PL handles ship registry update on SHIP signal from Kelly.
2026-02-19 19:04 CST | Dashboard + PL Flow | Added `pending-qa` registry state + dashboard support | Projects were disappearing from dashboard when PL session ended. Now projects stay visible as "AWAITING QA" (purple badge) until operator explicitly approves and ships them. PL must set `pending-qa` after Phase 3 TEA passes. Only operator can move to `shipped`.

---

## 2026-02-19

### 08:53 CST | Session Recovery (Auto-Healing for Frozen Sessions)
**What:** Created session-recovery skill for autonomous detection and restart of frozen orchestrator sessions (Project Lead, Research Lead).
**Why:** SlackLite PL session hit 215k tokens (git rm output too large), exceeded 200k model limit, and entered unrecoverable death loop. Every API call returned 400 error. Session was frozen for 7+ hours before manual intervention.
**Root cause:** Default compaction only runs between turns. Single massive tool result (git rm listing hundreds of files) jumped over 35k safety buffer in one turn. Compaction never got a chance to trigger.
**Solution:** Kelly can now autonomously detect and recover frozen sessions during heartbeat checks
- **Detection:** Check `sessions_history` for 400 errors + token overflow when PL doesn't respond to status ping
- **Recovery:** Archive transcript, clear session state, send context refresh message (creates new session with same key)
- **Safety:** Transcripts preserved, project state loaded from registry, idempotent operation, logged to daily memory
**Files created:**
- `skills/factory/session-recovery/SKILL.md` — Architecture and usage documentation
- `skills/factory/session-recovery/bin/recover-session` — Recovery script (archive, clear, refresh)
**Files updated:**
- `HEARTBEAT.md` — Auto-recovery workflow for stall check (step 5: detect frozen, run recovery)
- `docs/core/kelly-router-flow.md` — Session Recovery section added
- `memory/2026-02-19.md` — Recovery creation and architecture documented
**Temporary solution:** This is a workaround skill until OpenClaw core adds proper `sessions_restart(sessionKey, reason)` tool. Proposal documented in SKILL.md.
**Also fixed:** Enabled instinct8-compaction plugin (threshold 150k, earlier than default 165k). Should prevent future death loops by compacting during tool execution, not just between turns.
**Commits:**
- (pending) `feat: Add session-recovery skill for frozen orchestrator sessions`

---

## 2026-02-18

### 16:45 CST | CLI-First Policy (Minimal Guidance)
**What:** Added minimal CLI-first guidance to project-lead-flow.md and 6 agent AGENTS.md files (Winston, Bob, John, Amelia, Barry). Removed factory-principles.md (too heavyweight).
**Why:** NoteLite story 1.2 (Firebase setup) used browser automation because BMAD workflows assume human operators. Winston/Bob were writing planning artifacts for humans, but agents execute them autonomously.
**Root cause:** BMAD workflows are interactive/collaborative by design. Factory agents execute autonomously. Mismatch → browser instructions → slower implementation.
**Solution:** Minimal guidance in the right places
- **project-lead-flow.md** — CLI-first policy section (2 sentences)
- **Winston/Bob** — "Write CLI commands (not browser steps). Browser only if no CLI exists."
- **Amelia/Barry** — "Use CLI tools. Browser only if no CLI exists. Override story instructions if needed."
**Lightest rule:** CLI-first. Browser only if no CLI exists.
**Files updated:**
- `docs/core/project-lead-flow.md` — CLI-First Policy section
- `workspaces/bmad-bmm-winston/AGENTS.md` — CLI-First Architecture (3 lines)
- `workspaces/bmad-bmm-bob/AGENTS.md` — CLI-First Story Tasks (3 lines)
- `workspaces/bmad-bmm-john/AGENTS.md` — CLI-First Epics & Stories (3 lines)
- `workspaces/bmad-bmm-amelia/TOOLS.md` — CLI-First Policy (condensed)
- `workspaces/bmad-qf-barry/AGENTS.md` — CLI-First Policy (2 lines)
- `docs/factory-overview.md` — Removed factory-principles.md reference
**Commits:**
- `68932f0` — refactor: Simplify CLI-first guidance (remove factory-principles.md)
- `8c92734` — docs: Add CLI-first guidance to John (PM)

**Status:** ✅ Complete — lightest possible guidance, upstream fix in planning

### 15:42 CST | BMAD YOLO Mode for All Subagent Spawns
**What:** Added YOLO MODE directive to all BMAD subagent spawn patterns. Updated 8 AGENTS.md files + core project-lead-flow.md.
**Why:** BMAD workflows default to interactive mode — halting at every step to ask "Continue?" or "Should I use this file?". When spawned as subagents, there's no human to respond, so they timeout and die. NoteLite test revealed John needed 3 attempts and Sally needed 2 attempts due to this.
**Files updated:**
- `docs/core/project-lead-flow.md` — Phase 1 spawn patterns now require YOLO directive
- `workspace-project-lead/AGENTS.md` — Spawn template includes YOLO, BMAD install PTY note
- `workspace-bmad-bmm-john/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-sally/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-winston/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-bob/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-amelia/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-barry/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-tea-murat/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-cis-carson/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-cis-maya/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-cis-quinn/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-cis-victor/AGENTS.md` — YOLO Mode section added
- `workspace-bmad-bmm-mary/AGENTS.md` — YOLO Mode section added
- `workspace-research-lead/AGENTS.md` — All 5 spawn examples now include YOLO directive

### 14:11 CST | CRITICAL: Model Standardization + Fallback Reorder
**What:** Emergency fix - standardized ALL agents to Sonnet 4.5, reversed coding CLI fallback to Claude Code BEFORE Codex.  
**Why:** Mary hit billing errors using Opus 4.6 ($15/1M input vs $3/1M for Sonnet). Multiple agents misconfigured with Opus. Operator mandate: "change every single agent config to be sonnet 4.5" + "coding CLI stuff to Claude Code before Codex."  
**Agent configs updated:**
- Bob: opus-4-6 → sonnet-4-5
- John: opus-4-6 → sonnet-4-5
- Mary: opus-4-6 → sonnet-4-5 ← THIS WAS THE BLOCKER
- Winston: opus-4-6 → sonnet-4-5
- Kelly-Improver: gpt-5.3 → sonnet-4-5
- ✅ Sally, Research Lead already sonnet-4-5
- ⚠️ Amelia, Barry, Murat stay on GPT models (Codex/Spark for coding/testing)
**Coding CLI fallback NEW ORDER:**
1. Claude Code Anthropic plan (PRIMARY)
2. Claude Code API key
3. Codex GPT plan
4. Codex API key
**Rationale:** Claude Code cheaper + more reliable for factory work. Sonnet 4.5 across all planning/analysis agents = 5x cost savings vs Opus.  
**Impact:** Research Lead test can now proceed without billing errors. All future factory work uses cheaper, reliable models.  
**Status:** ✅ Complete — ready to retry Research Lead test

### 13:59 CST | Research Lead v2.0 Test Prep — Configs Verified
**What:** Confirmed Research Lead + Mary AGENTS.md files fully updated with v2.0 workflow (from 13:37 CST audit). Ready to test first complete v2.0 run.  
**Status:** Research Lead AGENTS.md (438 lines) - all 6 phases, config propagation, LLM dedup, registry atomic ops, Carson naming. Mary AGENTS.md (489 lines) - Phase 1/4/5 with config-aware scoring, web-search skill integration.  
**Previous test:** agent:research-lead:20260218-1340 aborted at 4m33s (OpenAI billing error during Mary Phase 1).  
**Next:** Close failed session, spawn fresh test with same config (web-app, B2C, Next.js stack).  
**Expected:** 38-56 min runtime, first discovery entry in project-registry.json.

### 13:37 CST | Agent Config Audit — Registry + Doc Path Alignment
**What:** Audited all 15 agent AGENTS.md files against core docs. Updated Research Lead (major: registry rewrite), Project Lead (medium: doc paths + registry update steps), Kelly-Improver (minor: added registry doc reference).  
**Why:** Core docs changed (project-registry.json replaces research-registry.json + projects-queue, doc paths moved to docs/core/). Agent configs must match.  
**Result:** 12/15 agents already aligned. 3 updated. All agents now consistent with core docs.  
**Status:** ✅ Complete

### 13:15 CST | Project Registry Lifecycle Architecture
**What:** Created unified project-registry.json at /projects/ root to track all project state (discovery → in-progress → shipped → followup). Replaces projects-queue folder structure.  
**Why:** Factory needs single source of truth for project lifecycle. Folder-based queue was messy; JSON registry enables atomic updates, query by state, version tracking, and futures management.  
**States:** discovery (RL generated), in-progress (PL building), shipped (deployed), followup (post-ship work), paused (any state).  
**Ownership:**
- Research Lead: Creates discovery entries with full intake data
- Project Lead: Moves discovery→in-progress when starting, updates qaUrl/deployedUrl, transitions to shipped/followup
- Kelly: Routes discovery to PL, monitors for QA surfacing and stall detection  
**Schema:** ID, name, state, timeline (discovered/started/shipped), intake (immutable brief), implementation (dirs/URLs), followup array  
**Files:** docs/core/project-registry-workflow.md (new), research-lead-flow.md (updated), project-lead-flow.md (updated)  
**Migration:** Cleared 20 projects-queue entries, created empty projects/project-registry.json, deleted old research-registry.json  
**Impact:** Cleaner state management, easier querying, built-in version history, followup tracking in same place  
**Status:** ✅ Complete

### 12:30 CST | Consolidated Remediation via correct-course
**What:** ALL bug reports, user feedback, and complex new features now route through John's correct-course workflow for unified Sprint Change Management.  
**Why:** Single remediation path with John as decision-maker. John categorizes scope (Minor/Moderate/Major) and recommends approach. Eliminates ad-hoc fix story creation - everything goes through formal change analysis.  
**Scope classifications:**
- **MINOR:** Simple code bugs → Bob creates fix stories → Amelia implements (dependency-driven)
- **MODERATE:** Backlog reorganization → John updates epics → Bob updates sprint plan → implement
- **MAJOR:** Fundamental replanning → Winston/Sally/John redesign artifacts → Bob updates stories → implement
**Triggers:** Phase 3 Quality Gate bugs (Murat reports), Phase 4 User QA feedback, Brownfield complex new features  
**Files:** docs/core/project-lead-flow.md, all BMAD agent AGENTS.md files (outside repo)  
**Impact:** Project Lead waits for BOTH Murat reports → spawns John correct-course → implements based on scope classification → re-runs Quality Gate if needed. User QA feedback uses same path.  
**Status:** ✅ Complete

### 12:15 CST | Phase 3 Quality Gate Redesign (Corrected)
**What:** Replaced sequential TEA workflows with parallel Quality Gate: Build+Tests → (E2E + NFR parallel) → Bob creates fix stories → Dependency-driven fix implementation  
**Why:** Original TEA (56+ min, 4 sequential workflows) was overkill for B2C MVPs. Focused on functional bug catching, security/performance assessment, removed compliance paperwork (traceability matrices). Fix stories use same dependency-driven spawning as Phase 2.  
**Files:** docs/core/project-lead-flow.md, workspace-project-lead/AGENTS.md, workspace-bmad-tea-murat/AGENTS.md  
**Key correction:** Bob creates fix story files (not Project Lead directly) - consistent with Bob's role in Phase 1. Murat provides bug reports → Bob converts to fix stories → PL orchestrates dependency-driven fixes.  
**Impact:** Normal Mode QA: 20-27 min clean pass, 57-87 min with fixes. Barry Fast Mode: Sequential build+test+smoke. All code implementation (normal + fixes) uses dependency-driven spawning (no waves).  
**Status:** ✅ Complete

### 11:22 CST | Kelly-Improver AGENTS.md Updated
**What:** Updated Kelly-Improver's AGENTS.md to reference kelly-improver-flow.md and mandate changelog logging  
**Why:** Was using old "proposal-only" model. Now references comprehensive workflow doc and includes changelog as CRITICAL responsibility.  
**Status:** ✅ Complete

### 11:15 CST | Kelly Workflow Documentation
**What:** Created kelly-router-flow.md and kelly-improver-flow.md as comprehensive workflow references  
**Why:** Separate source-of-truth docs from runtime AGENTS.md. Clear responsibilities, decision frameworks, and quality standards for Kelly and Kelly-Improver.  
**Status:** ✅ Complete

### 10:53 CST | Docs Structure
**What:** Merged userqa-workflow.md into project-lead-flow.md Phase 4, created /core and /changelog folders  
**Why:** User QA is part of project lifecycle, should live in main flow doc. Structured docs for clarity.

### 10:36 CST | Coding CLI Fallback - Continuation
**What:** 4-tier fallback allows workspace continuation (no reset between Codex → Claude Code)  
**Why:** Avoid wasting work. Both tools read same story file + git diff, can pick up where the other left off. BMAD workflow provides coordination structure.

### 09:30 CST | Skill Refactor - Agent-Specific Skills
**What:** Split coding-agent into 3 skills: coding-cli (shared wrapper), amelia-coding, barry-coding, test/murat-testing  
**Why:** Eliminate context bleed. Each agent sees only their workflows. DRY principle for fallback logic in shared wrapper.

### 09:06 CST | 4-Tier Automatic Fallback
**What:** Created code-with-fallback wrapper with cascade: Codex GPT plan → Codex API key → Claude Code Anthropic plan → Claude Code API key  
**Why:** Handle OpenAI billing errors and rate limits automatically. No manual intervention, no blocked stories.

---

## 2026-02-17

### 17:27 CST | Gateway Session Recovery (PROPOSED)
**What:** Proposal for automatic retry with backoff for transient tool call failures during gateway restarts  
**Why:** Sessions wedge when tool calls fail mid-execution (e.g., fleai-market-v5 PL wedge for 12+ min). Requires manual intervention.  
**Status:** 🔴 Not implemented (high priority)  
**Details:** [gateway-session-recovery-proposal.md](changelog/gateway-session-recovery-proposal.md)

### 20:41 CST | Gate Check Strict Mode
**What:** Enforced strict gate check - only PASS proceeds to implementation, CONCERNS/FAIL require remediation loop  
**Why:** Prevent shipping with known issues. Gate check exists to catch problems early, not rubber-stamp.

### 20:10 CST | BMAD Workflow Paths Fix
**What:** Corrected all 8 BMAD agent AGENTS.md files with proper workflow paths: `_bmad/{module}/workflows/{phase}/{workflow}/`  
**Why:** Sally failures due to wrong paths. John (Opus 4.6) smart enough to find correct paths despite wrong docs, Sally (Sonnet 4.5) followed instructions literally and failed.

### 19:39 CST | Web Search Migration - SearXNG
**What:** Research Lead + Mary switched from Brave API (web_search tool) to SearXNG skill (local Docker)  
**Why:** Brave API rate limits caused 50% failure rate in Research Lead Batch 1. SearXNG has no limits, improved to 70% success in Batch 2.

### 15:50 CST | Factory Architecture - docs/ Folder
**What:** Moved factory architecture docs from skills/factory/factory-architecture/ to docs/  
**Why:** Core architecture docs shouldn't live in skills folder. docs/ is canonical source of truth.

---

## 2026-02-16

### 18:47 CST | BMAD Skills Created
**What:** Created coding-agent (Amelia/Barry) and testing-agent (Murat) skills with BMAD workflow documentation  
**Why:** Centralize BMAD CLI invocation patterns. Agents reference skills for implementation guidance.

---

## 2026-02-15

### 14:22 CST | Project Lead - Dependency-Driven Spawning
**What:** Removed artificial batching/waves, implemented dependency-driven story spawning from Bob's dependency-graph.json  
**Why:** Maximize parallelism. Stories spawn as soon as dependencies satisfied, not in fixed batches.

---

## 2026-02-14

### 09:15 CST | Research Lead - Autonomous Idea Generation
**What:** Created Research Lead orchestrator with 5-phase autonomous product idea generation workflow  
**Why:** Scale idea generation. Research Lead spawns Mary for pain point research, creates complete product briefs without human intervention.

---

## 2026-02-13

### 16:30 CST | Project Structure - 4 Folders
**What:** Reorganized projects into: ideas/, active/, shipped/, archived/  
**Why:** Clear lifecycle stages. Makes it obvious where projects are in the pipeline.

---

---

## Changelog Structure

**CHANGELOG.md** — Lightweight timeline with brief what/why entries  
**changelog/** — Detailed proposals, architectural decisions, and deep-dive docs referenced by main log

### Status Indicators
- ✅ Implemented and validated
- 🟡 Partially implemented / in progress
- 🔴 Proposed / not yet implemented
- ❌ Rejected / deprecated

---

**Note:** This log started 2026-02-18. Earlier entries reconstructed from git history and memory files.
22:05 CST | Bob Story Creation | One session writes all stories sequentially | Was: one spawn per story (~90 min for 30 stories). Now: one spawn writes all (~15 min flat)

## [v4.6] 2026-02-19
### Added
- Phase 3 (TEA) is now a HARD GATE in both project-lead-flow.md and PL AGENTS.md
- Phase 3 is NOT stories — PL orchestrates Murat directly after all Phase 2 stories done
- Phase 4 cannot start without test-execution-report.md showing PASS
- Root cause: Verdict shipped to user QA with zero test artifacts (Phase 3 bypassed)

## [v4.7] 2026-02-19
### Changed
- Stage 4.3 routing: PL now has explicit decision tree (Bug→Amelia, Architecture change→Winston→John→Bob, Everything else→John→Bob). PL NEVER writes stories or creates story IDs.
- John AGENTS.md: forbidden epic clarification — unit tests WITHIN a story are fine; it's stories whose PRIMARY DELIVERABLE is testing that are forbidden
- Bob AGENTS.md: same unit test clarification
- project-lead-flow.md: Stage 4.3 rewritten with routing decision tree diagram

## [v4.8] 2026-02-19
### Added
- John AGENTS.md: `scope-qa-feedback` as 4th responsibility (Phase 4 → Phase 2 loop)
- Winston AGENTS.md: `review-architecture-change` as 2nd responsibility (triggered before John for arch changes)
- Amelia AGENTS.md: `fix-qa-feedback` as Mode 3 (direct bug fix path, no story creation)
- Bob AGENTS.md: `update-dependency-graph` as 4th responsibility (after John creates QA feedback stories)
- Every agent now has an explicit QA feedback workflow — PL routes, agents execute
