# Kelly Factory Changelog

**Purpose:** Log significant changes to Kelly's architecture, workflows, and agent behavior. Brief entries with timestamps - what changed and why.

**Format:** `YYYY-MM-DD HH:MM CST | Component | What Changed | Why`

---

## 2026-02-18

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
