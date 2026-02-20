# Compaction State Refresh Proposal

**⚠️ SUPERSEDED:** This proposal is obsolete. See `docs/core/state-management.md` for current unified state architecture.

**Created:** 2026-02-18  
**Superseded:** 2026-02-18 21:06 CST (eliminated kelly.json, unified state structure)  
**Issue:** Compaction prompt references outdated state file names that don't exist

---

## Current State Files (By Role)

### Kelly Router
- `factory-state.md` — High-level project tracking
- `heartbeat-state.json` — QA surfacing, stall detection timestamps
- `memory/YYYY-MM-DD.md` — Daily event logs

### Project Lead (per project)
- `project-state.json` — Canonical project state (always required)
- `implementation-state.md` — Dependency tracking (required during implementation phase only)

### Research Lead
- No specific state files (writes directly to project-registry.json)

---

## Problem: Current Compaction Prompt

**Current prompt references non-existent files:**
```
1. Your stage state file ({research,planning,implementation,test}-state.md)
2. project-state.json
3. factory-state.md (Kelly Router only)
4. memory/YYYY-MM-DD.md
```

**Issues:**
- `research-state.md` — doesn't exist
- `planning-state.md` — doesn't exist  
- `test-state.md` — doesn't exist
- Only `implementation-state.md` exists (Project Lead only, during Phase 2)

---

## Proposal A: Role-Based Compaction Prompts

**Different prompt per agent based on their actual state files:**

### Kelly Router (agent: main)
```
Pre-compaction state flush. Update ALL state files:

1. factory-state.md — current projects, pending actions, waiting-on items
2. heartbeat-state.json — surfacedQA[], projectChecks timestamps
3. memory/YYYY-MM-DD.md — key decisions not yet written

After updating, reply NO_REPLY.
```

### Project Lead (agent: project-lead)
```
Pre-compaction state flush. Update ALL state files:

1. project-state.json — subagent statuses, completed stories, stage
2. implementation-state.md — IF in implementation phase: dependency frontier, active subagents, recently completed
3. memory/YYYY-MM-DD.md — key decisions not yet written

After updating, reply NO_REPLY.
```

### Research Lead (agent: research-lead)
```
Pre-compaction state flush. Update ALL state files:

1. project-registry.json — IF entry created: ensure discovery state complete
2. memory/YYYY-MM-DD.md — key decisions not yet written

After updating, reply NO_REPLY.
```

---

## Proposal B: Unified Minimal Prompt

**Single prompt that works for all roles:**

```
Pre-compaction state flush. If you manage state files, update them now (factory-state.md, project-state.json, implementation-state.md, heartbeat-state.json). Then reply NO_REPLY.
```

**Pros:**
- Simple, doesn't list non-existent files
- Agents already know which files they own
- Avoids confusion

**Cons:**
- Less explicit than role-based prompts
- Agents might forget what to update

---

## Proposal C: Rethink State Management (Bigger Change)

**Problem:** State split across multiple files makes it hard to reason about.

### Current Split

**Kelly:**
- `factory-state.md` (markdown, human-readable summary)
- `heartbeat-state.json` (JSON, machine-readable timestamps)

**Project Lead:**
- `project-state.json` (JSON, canonical machine state)
- `implementation-state.md` (markdown, human-readable summary during Phase 2)

### Consolidated Option

**Single JSON file per context:**

```
/Users/austenallred/clawd/state/
  kelly-state.json         # Kelly Router's state
  
/Users/austenallred/clawd/projects/{projectId}/
  project-state.json       # All PL state (merge implementation-state data into JSON)
```

**Benefits:**
- Machine-readable (easier to parse in heartbeats)
- Single source of truth per context
- No duplicate/conflicting data between .md and .json

**Tradeoffs:**
- Lose human-readable markdown summaries
- JSON harder for humans to quick-scan
- Would require updating all workflows

---

## Recommendation

**Short-term (FAST FIX):** Proposal B — Unified minimal prompt  
**Why:** Works immediately, no workflow changes needed

**Long-term (BETTER ARCHITECTURE):** Proposal C — Consolidate to JSON  
**Why:** Cleaner architecture, single source of truth, easier automation

---

## Implementation Plan (Short-term Fix)

### Step 1: Update Compaction Prompt

**Edit:** `/Users/austenallred/.openclaw/openclaw.json`  
**Path:** `agents.defaults.compaction.memoryFlush.prompt`

**New prompt:**
```
Pre-compaction state flush. Update your state files if you manage any:
- factory-state.md (Kelly)
- project-state.json (Project Lead)
- implementation-state.md (Project Lead, if in implementation phase)
- heartbeat-state.json (Kelly)
- memory/YYYY-MM-DD.md (all roles)

After updating, reply NO_REPLY.
```

### Step 2: Test Compaction

1. Trigger compaction in main session (Kelly)
2. Verify state files updated correctly
3. Check NO_REPLY behavior works

### Step 3: Document

Update `docs/core/kelly-router-flow.md` and `docs/core/project-lead-flow.md` to clarify compaction responsibilities.

---

## Questions for Operator

1. **Short-term:** Use Proposal B (minimal prompt) or A (role-based)?
2. **Long-term:** Interested in Proposal C (consolidate to JSON)?
3. **Dashboard:** Should kelly-dashboard read state from JSON instead of markdown?

---

**Next Actions:**
- [ ] Operator decides on proposal
- [ ] Update compaction prompt in openclaw.json
- [ ] Test compaction behavior
- [ ] Update docs with compaction responsibilities
