# Kelly Factory Changelog

**Purpose:** Log significant changes to Kelly's architecture, workflows, and agent behavior. Brief entries with timestamps - what changed and why.

**Format:** `YYYY-MM-DD HH:MM CST | Component | What Changed | Why`

---

## 2026-02-18

### 16:38 CST | CLI-First Policy (Minimal Guidance)
**What:** Added minimal CLI-first guidance to project-lead-flow.md and 5 agent AGENTS.md files (Winston, Bob, Amelia, Barry, John). Removed factory-principles.md (too heavyweight).
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
- `workspaces/bmad-bmm-amelia/TOOLS.md` — CLI-First Policy (condensed)
- `workspaces/bmad-qf-barry/AGENTS.md` — CLI-First Policy (2 lines)
- `docs/factory-overview.md` — Removed factory-principles.md reference
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
