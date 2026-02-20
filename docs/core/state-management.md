# State Management - Unified Architecture

**Last Updated:** 2026-02-18 21:06 CST  
**Status:** Active

---

## Overview

All OpenClaw agents (Kelly Router, Project Lead, Research Lead, sub-agents) use the **same state structure**:

1. **Project Registry** (`projects/project-registry.json`) — Lifecycle state for all projects
2. **Daily Memory** (`memory/YYYY-MM-DD.md`) — Operational logs, decisions, events

**No agent-specific state files.** This keeps compaction clean and consistent.

---

## State Files

### 1. Project Registry (All Agents)

**File:** `/Users/austenallren/clawd/projects/project-registry.json`

**Purpose:** Single source of truth for all project lifecycle state.

**Who writes:**
- **Research Lead:** Creates discovery entries with research artifacts
- **Project Lead:** Updates implementation metadata (qaUrl, deployedUrl, state transitions)
- **Kelly Router:** Updates `surfacedForQA` field after announcing projects

**Schema:** See `docs/core/project-registry-workflow.md`

**Key fields:**
- `state` — Lifecycle phase (discovery | in-progress | pending-qa | shipped | followup)
- `paused` — Boolean + reason (operator can pause at any time)
- `surfacedForQA` — Has Kelly announced this project's QA URL?
- `timeline` — Timestamps (discoveredAt, startedAt, shippedAt, lastUpdated)
- `intake` — Problem, solution, target audience, features
- `implementation` — projectDir, qaUrl, deployedUrl, repo
- `researchDir` — Path to Research Lead artifacts (if applicable)

---

### 2. Daily Memory (All Agents)

**File:** `memory/YYYY-MM-DD.md`

**Purpose:** Daily operational logs — what happened, decisions made, waiting-on items, lessons learned.

**Who writes:** All agents (Kelly, Project Lead, Research Lead, sub-agents)

**Format:** Markdown timeline

**What to capture:**
- Significant events (project started, QA surfaced, bugs found)
- Decisions made (architectural choices, approach selections)
- Waiting-on items (operator decisions, blocked work)
- Operational notes (session spawned, announcement sent)
- Lessons learned (mistakes, insights)

**Example:**
```markdown
# Memory Log — 2026-02-18

## 14:30 - Surfaced NoteLite for QA
Set registry `surfacedForQA: true` to prevent re-announcement.
QA URL: https://notelite-preview.vercel.app

## 15:15 - Project stall check
Pinged PL (project-calculator-app) - no registry updates in 75 min.
PL responded "all good, testing edge cases". Will re-check in 45 min.

## 16:00 - Waiting on operator decision
3 research ideas complete (Prepwise, ClaimDone, Ripple). Awaiting selection.

## 18:45 - Zombie subagent bug fixed
Root cause: PL heartbeat on nested lane (concurrency 1) blocked announce-back.
Fix: PL heartbeat set to 10m interval (was firing every gateway cycle). Lean HEARTBEAT.md for health checks only.
```

---

### 3. Long-Term Memory (Kelly Main Session Only)

**File:** `MEMORY.md`

**Purpose:** Curated long-term memory — distilled wisdom, not raw logs.

**Security:** ONLY loaded in main session (direct chats with operator). NOT loaded in group chats, Discord, shared contexts.

**What to capture:**
- Key learnings and insights
- Operator preferences and context
- Important decisions with lasting impact
- Patterns and lessons learned over time

**Maintenance:** During heartbeats, Kelly reviews recent daily files and updates MEMORY.md with what's worth keeping long-term.

---

## Pre-Compaction State Flush

**Canonical prompt (unified for all agents):**

```
Pre-compaction state flush. Update the state files you own:

1. projects/project-registry.json (if you created/modified a project entry)
2. memory/YYYY-MM-DD.md (daily log - capture recent decisions, events, waiting-on items)

After updating, reply NO_REPLY.
```

**Why unified:** All agents use the same state structure now. No agent-specific divisions needed.

**What agents do:**
- **Kelly Router:** Update memory with operational notes (announcements, checks, escalations). Update registry for `surfacedForQA` changes and `pending-qa` → `shipped` transitions (operator approval required before shipping).
- **Project Lead:** Update registry project entry (state, timeline, implementation). Update memory with decisions and progress.
- **Research Lead:** Update registry discovery entry (if created). Update memory with research progress.
- **Sub-agents:** Update memory with work completed and decisions made.

---

## Ephemeral State (Session Memory)

Some state doesn't need persistence:

**Heartbeat check timestamps:**
- Kelly tracks "when did I last check projects?" in session memory
- If Kelly restarts, re-checking is harmless (registry has `lastUpdated` timestamps)
- No need to persist this

**Recent conversation context:**
- Agents remember recent turns naturally
- No need to write every detail to files
- Capture only significant decisions/events in daily memory

---

## Anti-Patterns (Avoid)

❌ **Agent-specific state files** (kelly.json, project-state.json, heartbeat-state.json)  
✅ Use unified structure: registry + daily memory

❌ **Duplicating registry data in other files**  
✅ Registry is single source of truth for project state

❌ **Persisting ephemeral data** (every heartbeat check, every minor note)  
✅ Capture only significant events in daily memory

❌ **Different compaction prompts per agent**  
✅ Unified prompt works for everyone

---

## Migration Notes

**Removed files (2026-02-18):**
- `state/kelly.json` — Responsibilities moved to registry (`surfacedForQA`) and daily memory
- `factory-state.md` — Duplicated registry data
- `heartbeat-state.json` — Merged into kelly.json, then eliminated
- `implementation-state.md` — Redundant with BMAD artifacts
- `project-state.json` — Execution history not needed for state

**Why removed:** Agent-specific state files cluttered compaction. Different agents had different structures, making compaction summary inconsistent and noisy.

**Result:** Compaction now 10x cleaner — everyone uses the same simple structure.

---

## Related Docs

- `docs/core/project-registry-workflow.md` — Registry schema and lifecycle
- `docs/core/kelly-router-flow.md` — Kelly's monitoring responsibilities
- `docs/core/project-lead-flow.md` — Project Lead implementation workflow
- `docs/core/research-lead-flow.md` — Research Lead idea generation workflow

---

**Document Status:** Active  
**Supersedes:** `docs/proposals/state-files-minimal.md`, `docs/proposals/compaction-state-refresh.md`
