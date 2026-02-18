# Project Lead Flow

**Last Updated:** 2026-02-17  
**Purpose:** Complete specification of Project Lead orchestration across all modes and phases.  
**Audience:** Used as reference when building/updating Project Lead AGENTS.md.

---

## Overview

Project Lead owns a single project from intake to ship. One PL session per project. PL spawns BMAD agents as subagents and tracks their progress.

**State files PL must maintain:**
- `project-state.json` — subagent tracking, completed stories, pipeline status
- `implementation-state.md` — required during implementation phase (wave/dependency tracking)

**Dependency authority:** Bob's `dependency-graph.json` (or `stories-parallelization.json`) in `_bmad-output/implementation-artifacts/`. Each story has individual `dependsOn` arrays.

---

## Normal Mode Greenfield

### Phase 1: Plan

All sequential — each step waits for the previous to complete.

```
1. John: create-prd
   → Input: intake.md
   → Output: _bmad-output/planning-artifacts/prd.md

2. Sally: create-ux-design
   → Input: prd.md
   → Output: _bmad-output/planning-artifacts/ux-design.md

3. Winston: create-architecture
   → Input: prd.md, ux-design.md
   → Output: _bmad-output/planning-artifacts/architecture.md

4. John: create-epics-and-stories (SEPARATE from create-prd)
   → Input: prd.md, architecture.md, ux-design.md
   → Output: _bmad-output/planning-artifacts/epics.md

5. John: check-implementation-readiness (GATE CHECK)
   → Input: prd.md, epics.md, architecture.md
   → Output: PASS / CONCERNS / FAIL / NEEDS WORK / NOT READY (all treated as PASS or NOT PASS)
   
   **GATE LOGIC (STRICT):**
   
   **PASS / READY** → Proceed to Bob (step 6)
   
   **NOT PASS** (CONCERNS / FAIL / NEEDS WORK / NOT READY) → Remediation Loop
   - Do NOT proceed to Bob until gate check returns PASS
   - ANY documented concerns require fixes before implementation
   - Prevents shipping with known issues or technical debt
   
   **Remediation Loop (for NOT PASS):**
   
   1. **Project Lead reads gate check report** (`implementation-readiness-check.md`)
      - Identify all documented issues (IMMEDIATE, HIGH PRIORITY, MEDIUM PRIORITY)
      - Categorize by artifact: PRD, UX, Architecture, Epics
   
   2. **Route to appropriate persona(s) for fixes:**
      - **PRD gaps/issues** → John (edit-prd)
        - Missing requirements, unclear scope, stakeholder decisions needed
      - **UX issues** → Sally (edit-ux-design)
        - Missing screens, incomplete user flows, accessibility gaps
      - **Architecture gaps** → Winston (edit-architecture)
        - Technical feasibility concerns, missing ADRs, infrastructure gaps
      - **Epic/story issues** → John (edit epics.md directly OR create new stories via Bob)
        - Missing epics, incomplete stories, missing acceptance criteria
        - Option A: John edits epics.md to add missing content
        - Option B: Bob creates new story files for missing functionality (if epics complete but stories missing)
   
   3. **Spawn persona(s) with specific fix instructions from report:**
      - Pass exact issues from gate check report to spawned agent
      - Example: "Fix IMMEDIATE concerns #1-5 from implementation-readiness-check.md"
   
   4. **Re-run John: check-implementation-readiness**
      - After fixes applied, spawn John again with same workflow
      - John validates fixes and produces updated report
   
   5. **Repeat until PASS**
      - Maximum 3 remediation cycles (escalate to operator if stuck)
      - Track remediation attempts in project-state.json

6. Bob: sprint-planning
   → Input: epics.md
   → Output: _bmad-output/implementation-artifacts/sprint-status.yaml

7. Bob: Create dependency-graph.json (CUSTOM FACTORY LOGIC, not BMAD)
   → Input: epics.md, architecture.md
   → Output: _bmad-output/implementation-artifacts/dependency-graph.json

8. Bob: create-story (LOOP for each story in epics.md)
   → Input: epics.md, architecture.md, prd.md, ux-design.md
   → Output: _bmad-output/implementation-artifacts/stories/story-{N.M}.md
```

### Phase 2: Implement — Dependency-Driven Parallelization

**No artificial batching or waves.** Spawn stories as soon as their dependencies are satisfied.

```
CONTINUOUS LOOP (every 60 seconds):

1. Read dependency-graph.json
2. Read sprint-status.yaml or project-state.json (which stories are "done")
3. For EACH incomplete story:
   - Check if ALL entries in its dependsOn array are "done"
   - If yes AND not already spawned → spawn immediately
4. Track spawned subagents in project-state.json

UNLIMITED PARALLELISM:
  - 1 story ready → spawn 1
  - 5 stories ready → spawn 5 simultaneously
  - 10+ stories ready → spawn 10+ simultaneously
  - No waiting for "batches" to complete
```

**Per-Story Flow (two sequential subagents):**

```
1. Spawn Amelia: dev-story
   → Implements story
   → git pull, implement, git commit, git push to dev
   → Status → "review"

2. Spawn Amelia: code-review (SEPARATE subagent)
   → Adversarial review
   → Option A: Auto-fix → status = "done"
   → Option B: Create review follow-ups → status = "in-progress" → loop

Story COMPLETE when status = "done"
```

**Subagent death handling:**
- If an Amelia session dies, PL detects (no completion announcement) and respawns
- Coding CLI fallback (Codex → Claude Code) happens transparently within Amelia's execution
- Track failed attempts in project-state.json with failure reason
- Increment version suffix on retry (e.g., `story-2.4-v1`, `story-2.4-v2`)

### Phase 3: Test (TEA Module)

```
1. Spawn Murat: automate (generate tests)
2. Spawn Murat: test-review (review quality)
3. Spawn Murat: trace (requirements traceability)
4. Spawn Murat: nfr-assess (non-functional requirements)
5. Run all tests (npm test)

If tests FAIL → back to Phase 2 (create fix stories, implement, re-test)
If tests PASS → Phase 4
```

### Phase 4: User QA

```
1. Deploy dev branch (Vercel preview, localhost, etc.)
2. Update project-state.json: stage = "userQA", qaUrl = "{url}"
3. Kelly's heartbeat detects and surfaces to operator

SCENARIO A: User Accepts → SHIP
  git checkout main && git merge dev && git push origin main
  → Production deploy

SCENARIO B: User Rejects → Back to Phase 2
  Option A: correct-course workflow (analyzes feedback, proposes changes)
  Option B: Simple story creation (minor fixes)
  → Implement fixes → Test → Return to User QA
```

---

## Normal Mode Brownfield (BMAD Project)

**When:** Adding features to existing BMAD project (has `_bmad-output/` directory)

### Phase 1: Plan

```
0. Detect existing _bmad-output/ → read existing artifacts

1-3. John/Sally/Winston: Read existing PRD/UX/Architecture
     → Update in EDIT mode ONLY if changes needed
     → Skip if no changes

4. John: create-epics-and-stories (ADD to existing epics.md)
   → Continue numbering: Epic N+1, N+2...

5. John: check-implementation-readiness (for NEW features)
   → Same PASS/NOT PASS logic as Greenfield (see above)
   → Remediation loop targets only NEW artifacts (edit new epics, not existing ones)
   → Repeat until PASS

6-7. Bob: Update sprint-planning + dependency-graph.json (add new stories)

8. Bob: create-story (LOOP for each NEW story only)
```

### Phase 2-4: Same as Normal Mode Greenfield

---

## Normal Mode Brownfield (Non-BMAD Project)

**When:** Adding features to existing codebase without `_bmad-output/`

### Phase 1: Plan

```
0. document-project (FULL CODEBASE ANALYSIS — first time only)
   → Output: _bmad-output/project-knowledge/index.md + parts/

1. generate-project-context (optional)
   → Output: _bmad-output/project-context.md

2-8. Same as Normal Greenfield
   → All personas read project-knowledge/ for context
   → PRD includes "Modifications to Existing System" section
   → Architecture is UPDATE document, not replacement
```

### Phase 2-4: Same as Normal Mode Greenfield

---

## Fast Mode Greenfield

### Phase 1: Plan

```
1. Barry: quick-spec
   → Input: intake.md
   → Output: _bmad-output/quick-flow/tech-spec.md
   → Contains: Stories as flat numbered list (1, 2, 3...)
```

### Phase 2: Implement

**Sequential execution (one story at a time):**

```
FOR EACH story in tech-spec.md:
  1. Spawn Barry: quick-dev
     → git pull, implement, git commit, git push to dev
  2. WAIT for completion before next story
```

### Phase 3: Test

```
1. npm run build (build check)
2. npm test (run tests)
3. Smoke test

If FAIL → Barry fixes, re-test
If PASS → Phase 4
```

### Phase 4: User QA

Same as Normal Mode. Barry handles remediation instead of Amelia.

---

## Fast Mode Brownfield

### Phase 1: Plan

```
0. generate-project-context (if not exists)
   → Output: _bmad-output/project-context.md

1. Barry: quick-spec (APPEND mode)
   → Read existing tech-spec.md
   → ADD new stories starting at N+1
```

### Phase 2-4: Same as Fast Mode Greenfield

**Tracking:** n+1 approach — tech-spec.md tracks last story number, new features continue numbering.

---

## State Management

### project-state.json (always required)

```json
{
  "projectId": "...",
  "status": "planning|implementation|testing|userQA|shipped",
  "stage": "...",
  "subagents": [
    {
      "id": "amelia-story-1.1",
      "persona": "Amelia",
      "storyId": "1.1",
      "status": "active|complete|failed",
      "startedAt": "...",
      "completedAt": "..."
    }
  ],
  "implementationArtifacts": {
    "completedStories": ["1.1", "1.2"],
    "blockedStories": [],
    "failedAttempts": []
  }
}
```

### implementation-state.md (required during Phase 2)

Human-readable summary of:
- Current dependency frontier (which stories are ready to spawn)
- Active subagents with PIDs/session keys
- Recently completed stories
- Any blocked/failed stories
- Update after: story completion, subagent spawn, stuck recovery

---

## Kelly Communication

**PL → Kelly notifications:**
- Phase transitions (planning complete, implementation started, etc.)
- All stories complete → entering test phase
- Test results (pass/fail)
- Ready for User QA (with qaUrl)
- Ship complete

**Kelly → PL messages:**
- User QA feedback
- Pause/resume commands
- Status check pings (heartbeat safety net)

---

## Key Rules

1. **Dependency-graph.json is the authority** for story ordering — not artificial batches
2. **Spawn immediately** when dependencies satisfy — don't wait for groups
3. **Track everything** in project-state.json — subagent statuses, failures, retries
4. **Two subagents per story** in Normal Mode: dev-story then code-review
5. **One subagent per story** in Fast Mode: quick-dev only
6. **Detect dead subagents** — no completion = likely dead, respawn
7. **Update implementation-state.md** during Phase 2 for Kelly visibility
8. **All work on `dev` branch** — merge to `main` only at Ship
