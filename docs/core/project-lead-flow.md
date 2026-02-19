# Project Lead Flow

**Last Updated:** 2026-02-19  
**Purpose:** Complete specification of Project Lead orchestration across all modes and phases.  
**Audience:** Used as reference when building/updating Project Lead AGENTS.md.

**Recent Updates:**
- v3.3 (2026-02-19): **CODE REVIEW DISABLED.** Stories now go dev → done directly (skipping code-review Amelia). Rationale: 80%+ reviews pass, adds 5-10 min overhead per story, Phase 3 TEA testing more thorough. Can re-enable once factory proven.
- v3.2 (2026-02-19): Restructured Phase 3 into Pre-Deploy Gates → Deploy → Post-Deploy Verification. Full TEA suite (TD, TF, TA, RV, TR, NR) runs against deployed app. Failures batched → Amelia remediates → redeploy → re-run. Removed correct-course routing for QA failures (direct to Amelia).
- v3.1 (2026-02-18): Automated E2E test generation via Murat trace + automate workflows.

---

## Overview

Project Lead owns a single project from intake to ship. One PL session per project. PL spawns BMAD agents as subagents and tracks their progress.

**Intake Source:** Research Lead creates comprehensive intake document at `projects/ideas/<project-id>/intake.md`. When starting a new project, Project Lead reads the registry entry's `researchDir` field to locate the intake file and supporting research documents (solution scoring, competitive analysis, naming options).

**State tracking:** PL updates `projects/project-registry.json` at key lifecycle transitions. See `docs/core/project-registry-workflow.md` for full spec.

**Story status:** BMAD artifacts (`sprint-status.yaml`, `dependency-graph.json`) track implementation progress.

**Registry updates (PL responsibility):**
- **Project start:** `discovery` → `in-progress` (set `implementation.projectDir`, `timeline.startedAt`)
- **QA ready:** Set `implementation.qaUrl`, update `timeline.lastUpdated`
- **Ship:** `in-progress` → `shipped` (set `implementation.deployedUrl`, `timeline.shippedAt`)
- **Followup:** `shipped` → `followup` (add entries to `followup[]`)
- **Followup done:** `followup` → `shipped`
- **Pause/Resume:** Set `paused: true/false` with `pausedReason`

**Dependency authority:** Bob's `dependency-graph.json` (or `stories-parallelization.json`) in `_bmad-output/implementation-artifacts/`. Each story has individual `dependsOn` arrays.

---

## CLI-First Policy

**All planning artifacts (architecture, stories) must specify CLI commands, not browser steps.**

- Winston writes: `gcloud projects create "$PROJECT_ID"` (not "Navigate to Firebase Console")
- Bob writes: `firebase apps:create web` (not "Click Add App button")
- Amelia/Barry execute: CLI tools first, browser only if no CLI exists

**Lightest rule:** CLI-first. Browser only if no CLI exists.

---

## Normal Mode Greenfield

### Phase 1: Plan

All sequential — each step waits for the previous to complete.

**CRITICAL: All BMAD spawns MUST include YOLO MODE directive.** Without it, workflows halt at confirmation prompts and subagents time out waiting for input that never comes.

```
1. John: create-prd
   → Input: intake.md
   → Output: _bmad-output/planning-artifacts/prd.md
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."

2. Sally: create-ux-design
   → Input: prd.md
   → Output: _bmad-output/planning-artifacts/ux-design.md
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."

3. Winston: create-architecture
   → Input: prd.md, ux-design.md
   → Output: _bmad-output/planning-artifacts/architecture.md
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."

4. John: create-epics-and-stories (SEPARATE from create-prd)
   → Input: prd.md, architecture.md, ux-design.md
   → Output: _bmad-output/planning-artifacts/epics.md
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."

5. John: check-implementation-readiness (GATE CHECK)
   → Input: prd.md, epics.md, architecture.md
   → Output: PASS / CONCERNS / FAIL / NEEDS WORK / NOT READY (all treated as PASS or NOT PASS)
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."
   
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
2. Read sprint-status.yaml (which stories are "done")
3. For EACH incomplete story:
   - Check if ALL entries in its dependsOn array are "done"
   - If yes AND not already spawned → spawn immediately
4. Track active spawns (session keys, start times)

UNLIMITED PARALLELISM:
  - 1 story ready → spawn 1
  - 5 stories ready → spawn 5 simultaneously
  - 10+ stories ready → spawn 10+ simultaneously
  - No waiting for "batches" to complete
```

**Per-Story Flow:**

**⚠️ CODE REVIEW CURRENTLY DISABLED (as of 2026-02-19)**

Stories go directly from dev → done. Code review step is skipped to maximize factory throughput.

**Rationale:**
- Majority of reviews pass without changes (~80%+)
- Doubles subagent count per story (5-10 min overhead each)
- Phase 3 TEA testing suite catches issues more thoroughly
- Can re-enable once factory is mature and proven

**Current flow (single subagent per story):**

```
1. Spawn Amelia: dev-story
   → Implements story
   → git pull, implement, git commit, git push to dev
   → Status → "done" (skipping review)

Story COMPLETE when dev work finishes
```

**When code review was enabled (historical):**

```
1. Spawn Amelia: dev-story
   → Status → "review"

2. Spawn Amelia: code-review (SEPARATE subagent)
   → Adversarial review
   → Option A: Auto-fix → status = "done"
   → Option B: Create review follow-ups → status = "in-progress" → loop
```

**To re-enable:** Update PL workflow to spawn code-review subagent after dev-story completion.

**Subagent death handling:**
- If an Amelia session dies, PL detects (no completion announcement) and respawns
- Coding CLI fallback (Claude Code → Codex) happens transparently within Amelia's execution (Claude Code primary as of 2026-02-18)
- Log failed attempts in daily memory notes with failure reason
- Increment version suffix on retry (e.g., `story-2.4-v1`, `story-2.4-v2`)

### Phase 3: Pre-Deploy Gates → Deploy → Post-Deploy Verification

**Goal:** Ship a working, tested deployment. Pre-deploy catches build/lint issues cheaply. Post-deploy runs the full TEA quality suite against the real deployed app.

---

#### Step 1: Pre-Deploy Gates

**Fast, cheap checks before deploying.** Failures batched → Amelia remediates → re-run gates.

```
Gate 1: Build Verification
  → npm run build (or equivalent)
  → Must produce clean build with zero errors

Gate 2: Lint & Type Checking
  → npm run lint (ESLint/Biome)
  → npx tsc --noEmit (TypeScript strict check)
  → Zero errors required (warnings OK)

Gate 3: Security Scanning (Phase 2 — skip for now)
  → npm audit --audit-level=high
  → Dependency vulnerability check
  → Known CVE scanning
```

**On failure:**
```
1. Batch ALL failures from Gates 1-3 into single remediation ticket
2. Spawn Amelia: fix-predeploy
   → Input: Batched failure report (build errors, lint errors, type errors)
   → Task: Fix all pre-deploy gate failures, commit, push to dev
3. Re-run Pre-Deploy Gates
4. Repeat until all gates pass (max 3 cycles, escalate to Kelly if stuck)
```

**Timeline:** 2-5 min per run. Remediation: 5-15 min per cycle.

---

#### Step 2: Deployment

**Deploy after pre-deploy gates pass.**

```
1. Deploy to production/preview environment:
   - Vercel: Push to dev triggers deploy, or `vercel --prod`
   - Firebase Hosting: `firebase deploy --only hosting`
   - Other: Project-specific deploy command

2. Verify deployment accessible:
   - Confirm live URL returns 200
   - Set `implementation.qaUrl` in project-registry.json
   - Set `implementation.deployedUrl` if production

3. If deploy fails:
   - Batch deployment errors → Amelia fix → redeploy
```

---

#### Step 3: Post-Deploy Verification (Full TEA Suite)

**Run the complete TEA quality suite against the DEPLOYED app.** Failures batched → Amelia remediates → redeploy → re-run.

**Sequential test design + framework (one-time setup):**

```
TEA TD — Test Design (Murat test-design workflow)
  → Input: PRD, architecture.md, story acceptance criteria
  → Output: _bmad-output/test-artifacts/test-strategy.md
  → What: Design test strategy/plan from requirements and codebase
  → Duration: 10-20 min

TEA TF — Test Framework (Murat framework workflow)
  → Input: Test strategy, project tech stack
  → Output: Playwright config, test helpers, fixtures scaffolded
  → What: Scaffold E2E test framework (Playwright for web apps)
  → Duration: 10-15 min
```

**Test generation + traceability (one-time, reusable):**

```
TEA TA — Test Automation (Murat automate workflow)
  → Input: Codebase + planning artifacts + test strategy
  → Output: Comprehensive E2E tests in project
    - User flow tests (auth, CRUD, navigation)
    - Integration tests (API calls, state management)
    - Accessibility checks included in E2E tests
  → Duration: 15-30 min

TEA RV — Test Review (Murat test-review workflow)
  → Input: Generated test files + acceptance criteria
  → Output: Quality report, gap analysis
  → What: Review generated test quality, identify missing coverage
  → Duration: 10-15 min
  
TEA TR — Traceability (Murat trace workflow)
  → Input: PRD, tests, acceptance criteria
  → Output: _bmad-output/test-artifacts/requirements-matrix.md
  → What: Map every requirement to test(s), identify coverage gaps
  → Duration: 15-25 min
```

**After tests generated, run execution + NFR in parallel:**

```
Parallel spawn:
  A. E2E Test Execution (against deployed app):
     → Run Playwright tests against live URL (implementation.qaUrl)
     → Reports pass/fail per test
     → Screenshot evidence for failures
     → Includes accessibility checks (axe-core via Playwright)
     → Duration: 5-15 min
     → Output: _bmad-output/test-artifacts/test-execution-report.md

  B. TEA NR — NFR Assessment (Murat nfr workflow):
     → Security: Auth vulnerabilities, XSS/CSRF, API exposure
     → Performance: Load time, bundle size, database queries
     → Accessibility: WCAG compliance (supplementary to E2E checks)
     → Duration: 25-35 min
     → Output: _bmad-output/test-artifacts/nfr-assessment-report.md

  C. Lighthouse / Performance Assessment (Phase 2 — skip for now):
     → Run against deployed URL
     → Performance, SEO, Best Practices scores
     → Duration: 5 min

Wait for ALL to complete before proceeding.
```

**Regression tests (brownfield only):**
```
If brownfield project (existing codebase):
  → Run existing test suite to verify no regressions
  → Any new failures are treated as blockers
```

---

#### Step 4: Remediation (Batched)

**ALL failures from Post-Deploy Verification batched → Amelia → redeploy → re-run.**

```
1. Collect ALL failures:
   - E2E test failures (test-execution-report.md)
   - NFR issues (nfr-assessment-report.md)
   - Traceability gaps (requirements not covered by tests)

2. Spawn Amelia: fix-postdeploy
   → Input: Batched failure report from all TEA outputs
   → Task: Fix all failures. For each:
     - Test failures → Fix implementation code (not the tests)
     - NFR issues → Fix security/performance/accessibility issues
     - Traceability gaps → Implement missing functionality
   → Commit + push to dev

3. Redeploy (Step 2)

4. Re-run Post-Deploy Verification (Step 3)
   → Only re-run execution (tests already generated)
   → Re-run NFR assessment
   → Duration: 10-20 min (much faster — no test generation)

5. Repeat until clean (max 3 cycles, escalate to Kelly if stuck)
```

**Timeline:**
- Pre-Deploy Gates: 2-5 min
- Deployment: 2-5 min
- Post-Deploy First Pass:
  - TEA TD (design): 10-20 min
  - TEA TF (framework): 10-15 min
  - TEA TA (automate): 15-30 min
  - TEA RV (review): 10-15 min
  - TEA TR (traceability): 15-25 min
  - E2E execution + NFR (parallel): 25-35 min
- **Total first pass: ~85-150 min**
- **Re-runs (execution only): 10-20 min** (tests already generated)
- Remediation per cycle: 15-30 min

**Key principle:** First pass is expensive (test generation). Re-runs are cheap (just execution). Invest upfront, iterate fast.

### Phase 4: User QA

**When Post-Deploy Verification passes**, the app is already deployed (from Phase 3 Step 2). Notify the user for human testing.

#### Stage 4.1: Notify Kelly

```javascript
sessions_send(
  sessionKey="agent:main",
  message="🧪 Project {projectName} ready for user QA: {qaUrl}\n\nAll TEA tests passing. Deployed at: {deployedUrl}"
)
```

Update project-registry.json:
- Set `surfacedForQA: false` (Kelly will set to true after announcing)
- Ensure `implementation.qaUrl` is set (should be from Phase 3 deployment)

#### Stage 4.2: Surfacing (Kelly Heartbeat)

**Every 30-60 minutes**, Kelly scans for projects ready for QA:

1. Read `projects/project-registry.json`
2. Filter: `state="in-progress"` AND `implementation.qaUrl` present AND `surfacedForQA: false`
3. Alert operator: `🧪 **{name}** ready for user QA: {implementation.qaUrl}`
4. Update registry: set `surfacedForQA: true` for that project

#### Stage 4.3: Operator Testing

**SCENARIO A: User Accepts → SHIP**
```bash
git checkout main && git merge dev && git push origin main
# CI/CD deploys to production from main
# Project Lead updates project-registry.json: state="shipped", timeline.shippedAt, implementation.deployedUrl
```

**SCENARIO B: User Pauses → PAUSE**
```
Operator: "pause {project}"
# Kelly updates project-registry.json → paused: true with pausedReason
```

**SCENARIO C: User Rejects → FIX**
```
1. Project Lead receives operator feedback
   → Example: "Checkout flow confusing, auth doesn't work on mobile"

2. Spawn Amelia: fix-qa-feedback
   → Input: Operator feedback (specific issues)
   → Task: Fix all reported issues, commit, push to dev

3. After fixes: Re-run Phase 3 (Pre-Deploy → Deploy → Post-Deploy Verification)
4. If clean: Back to Phase 4 (User QA retry)
```

---

## Normal Mode Brownfield (BMAD Project)

**When:** Adding features to existing BMAD project (has `_bmad-output/` directory)

**NEW FEATURE ROUTING:**
- **Simple features** (well-defined, small scope) → Direct to Phase 1 planning
- **Complex features** (architectural impact, scope uncertainty) → **correct-course first**
  - Spawn John: correct-course to analyze impact, recommend approach
  - Sprint Change Proposal identifies needed changes (PRD, architecture, epics)
  - Then proceed to Phase 1 with clear plan

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

### Phase 3: Fast Quality Gate (Barry Projects)

**Pre-Deploy Gates only.** User QA is the primary quality gate for Barry projects.

```
1. Pre-Deploy Gates (same as Normal Mode Step 1):
   → Build verification (npm run build)
   → Lint/type checking
   → If FAIL: Barry remediates → re-run

2. Deploy (same as Normal Mode Step 2)

3. NO Post-Deploy Verification for Fast Mode
   → No TEA suite, no E2E, no NFR
   → Fast Mode prioritizes speed — User QA catches functional bugs
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

### projects/project-registry.json (Project Lead updates)

Update your project entry at key lifecycle transitions:

```bash
# Example: Mark project as in-progress
# Note: projectDir is relative to /Users/austenallred/clawd/projects/
jq '.projects |= map(
  if .id == "your-project-id" then
    .state = "in-progress" |
    .implementation.projectDir = "your-project-name" |
    .timeline.startedAt = (now|todate) |
    .timeline.lastUpdated = (now|todate)
  else . end
)' projects/project-registry.json > tmp && mv tmp projects/project-registry.json
```

**When to update:**
- Project start (`discovery` → `in-progress`, set projectDir + startedAt)
- QA ready (set `implementation.qaUrl`, update `lastUpdated`)
- Ship (`in-progress` → `shipped`, set deployedUrl + shippedAt)
- Pause/resume (set `paused` + `pausedReason`)

### _bmad-output/implementation-artifacts/ (BMAD tracks)

**Story status:** `sprint-status.yaml`
- Which stories are done/in-progress/todo
- Updated by Bob and Amelia

**Dependencies:** `dependency-graph.json`
- Story dependency tree
- Created by Bob, read by PL for spawning logic

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
3. **Update registry at lifecycle transitions** — Kelly reads for monitoring
4. **One subagent per story** in Normal Mode: dev-story only (code-review disabled as of v3.3)
5. **One subagent per story** in Fast Mode: quick-dev only
6. **Detect dead subagents** — no completion = likely dead, respawn
7. **BMAD tracks story status** — sprint-status.yaml is source of truth
8. **All work on `dev` branch** — merge to `main` only at Ship
