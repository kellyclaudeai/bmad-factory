# Model Lineup - Factory Agents (2026-02-18 EMERGENCY UPDATE)

## Current Allocation (ALL SONNET 4.5)

### Sonnet 4.5 (Everything)
- **John** - PM (PRD, epics breakdown, gate check)
- **Winston** - Architect (system design, technical decisions)
- **Sally** - UX Designer
- **Bob** - Scrum Master (sprint planning, stories, dependency-graph)
- **Barry** - Quick Flow (fast track mode - still uses Spark for CLI)
- **Mary** - Business Analyst (research, discovery)
- **Amelia** - Developer (wrapper only - orchestrates CLI)
- **Murat** - TEA Auditor (testing)
- **Carson, Victor, Maya, Quinn** - CIS agents (Creative Ideation System)
- **Research Lead** - Orchestrator
- **Kelly-Improver** - Factory improver

### CLI Models (Actual Code Generation)
- **PRIMARY: Claude Code** (Sonnet 4.5) - cheaper, more reliable
- **FALLBACK: Codex** (gpt-5.3-codex default, gpt-5.3-spark for Barry)

**NEW FALLBACK ORDER (as of 2026-02-18 14:11 CST):**
1. Claude Code (Anthropic plan)
2. Claude Code (API key)
3. Codex (GPT plan)
4. Codex (API key)

## Rationale for Emergency Change

**Critical billing issue discovered:** Mary hit billing errors using Opus 4.6 during Research Lead test.

**Cost comparison:**
- Opus 4.6: $15/1M input tokens
- Sonnet 4.5: $3/1M input tokens
- **5x cost savings** for all planning/analysis agents

**Operator mandate:** "change every single agent config to be sonnet 4.5"

**Why Sonnet is sufficient:**
- Research/planning agents don't need Opus-level reasoning
- Factory work is structured (BMAD workflows provide scaffolding)
- Cost efficiency enables more agent usage
- Sonnet 4.5 proven reliable across Sally, Bob, Barry testing

**Why Claude Code before Codex:**
- Cheaper (Anthropic plan available)
- More reliable for factory work
- Workspace continuation across fallback tiers
- Codex as backstop still available

## Changes from 2026-02-17

**Model downgrades (cost optimization):**
- John: Opus 4.6 → Sonnet 4.5
- Winston: Opus 4.6 → Sonnet 4.5
- Mary: Opus 4.6 → Sonnet 4.5 ← **CRITICAL BLOCKER FIX**
- Bob: Opus 4.6 → Sonnet 4.5
- Kelly-Improver: gpt-5.3 → Sonnet 4.5

**Coding CLI reorder:**
- OLD: Codex (primary) → Claude Code (fallback)
- NEW: Claude Code (primary) → Codex (fallback)

## Files Updated

**Agent configs:** `~/.openclaw/agents/{agent}/config`
- Bob, John, Mary, Winston, Kelly-Improver all updated to Sonnet 4.5

**Coding CLI:** `/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback`
- Reversed tier order: Claude Code tiers 1-2, Codex tiers 3-4

**Docs:** 
- `docs/core/project-lead-flow.md` - fallback order updated
- `memory/model-lineup-2026-02-18.md` - this file (replaces 2026-02-17 version)

**Commit:** `65655ae` - CRITICAL: standardize all agents to sonnet-4-5, reverse coding CLI fallback order (Claude Code first)

## Status
✅ All changes complete  
✅ Ready for Research Lead v2.0 retry (billing issue resolved)
