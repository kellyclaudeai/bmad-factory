# Project Lead Flow

**Last Updated:** 2026-02-17  
**Purpose:** Complete specification of Project Lead orchestration across all modes and phases.  
**Audience:** Used as reference when building/updating Project Lead AGENTS.md.

---

## Overview

Project Lead owns a single project from intake to ship. One PL session per project. PL spawns BMAD agents as subagents and tracks their progress.

**Intake Source:** Research Lead creates comprehensive intake document at `projects/<project-id>/intake.md`. Project Lead reads this file (along with supporting research documents) when starting a new project. The `project-registry.json` entry contains the `project-id` to locate these files.

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
- Coding CLI fallback (Claude Code → Codex) happens transparently within Amelia's execution (Claude Code primary as of 2026-02-18)
- Log failed attempts in daily memory notes with failure reason
- Increment version suffix on retry (e.g., `story-2.4-v1`, `story-2.4-v2`)

### Phase 3: Quality Gate

**Goal:** Catch functional bugs, security issues, and performance problems before user QA.

**Two classification dimensions:**
- **SEVERITY** (Murat decides): How bad is it? BLOCKER / HIGH / MEDIUM / LOW
- **SCOPE** (John decides via correct-course): How much work to fix? MINOR / MODERATE / MAJOR

A HIGH severity bug can be MINOR scope (simple code fix). A MEDIUM severity issue can be MAJOR scope (requires architectural redesign).

#### Step 1: Quality Assessment (Parallel Murat Spawns)

**Murat owns the entire quality gate.** Project Lead spawns, Murat executes.

```
Parallel spawn:
  A. Murat E2E (single subagent — sequential gates):
     Gate 1: Build check (npm run build)
       → If FAIL: Report build errors, skip remaining gates
     Gate 2: Test suite (npm test)
       → If FAIL: Report failing tests, skip remaining gates
     Gate 3: Functional smoke test (browser automation)
       → Start dev server (npm run dev)
       → Test PRD functional requirements in browser
       → Screenshot evidence for each tested feature
       → Report: Which features work, which are broken
     
  B. Murat NFR (separate subagent — parallel with E2E):
     → Security: Auth vulnerabilities, XSS/CSRF, API exposure, HIPAA/GDPR basics
     → Performance: Load time, bundle size, database queries
     → Compliance: HIPAA/GDPR basics (if applicable)
     → Report: Issues found with severity (BLOCKER/HIGH/MEDIUM/LOW)

Both complete independently (~15-20 min each)
Wait for BOTH reports before proceeding to Step 2.
```

#### Step 2: Remediation (via correct-course)

**Consolidated remediation path: ALL bugs route through John's correct-course workflow.**

```
1. Wait for BOTH Murat reports to complete:
   - E2E Functional Report: test-artifacts/e2e-functional-report.md
   - NFR Assessment Report: test-artifacts/nfr-assessment-report.md

2. Spawn John: correct-course workflow
   → Input: Both Murat bug reports
   → Task: "Analyze Quality Gate failures. Read test-artifacts/e2e-functional-report.md 
           and test-artifacts/nfr-assessment-report.md. Create Sprint Change Proposal 
           with recommended approach for each issue."
   
   John categorizes issues:
   
   SIMPLE CODE BUGS → Recommendation: "Add fix stories" (Minor scope)
   - Story 2.3: Auth validation allows empty passwords
   - Story 4.1: Checkout crash on empty cart
   
   ARCHITECTURAL ISSUES → Recommendation: "Redesign + PRD update" (Major scope)
   - Performance: Requires caching layer (Redis integration)
   - Security: Session management insecure (JWT redesign needed)
   
   SCOPE ISSUES → Recommendation: "Descope feature or extend timeline" (Major scope)
   - Feature X too complex for current sprint

3. John outputs: Sprint Change Proposal document
   → Sections:
     - Issue Summary (what's broken)
     - Impact Analysis (what needs to change: stories, PRD, architecture)
     - Recommended Approach (Minor/Moderate/Major)
     - Detailed Change Proposals (story edits, PRD edits, arch changes)
     - Implementation Handoff (who does what)

4. Project Lead implements based on scope classification:

   MINOR (simple fix stories):
   a. Bob creates fix story files from Sprint Change Proposal
      → Stories like: 2.3-fix-1.md, 4.1-fix-1.md
   b. Bob creates fix-dependency-graph.json
      → Analyzes dependencies between fix stories
   c. Dependency-driven fix implementation:
      → Same spawning logic as Phase 2
      → Each fix spawns when its dependsOn array satisfied
      → Unlimited parallelism (independent fixes run simultaneously)
      → Per-fix: Amelia dev-story → Amelia code-review → done
   
   MODERATE (backlog reorganization):
   a. John updates epics.md with new stories or scope changes
   b. Bob updates sprint-planning and dependency-graph
   c. Dependency-driven implementation
   
   MAJOR (fundamental replanning):
   a. Winston redesigns architecture (if arch issue)
   b. John updates PRD (if scope issue)
   c. Sally updates UX (if design issue)
   d. Bob updates epics + stories
   e. Dependency-driven implementation

5. Re-run Quality Gate (Step 1):
   → If new bugs found: Spawn John correct-course again, repeat Step 2-4
   → If clean: Proceed to Phase 4
```

**Timeline estimate:**
- Build + Tests: 5-7 min
- E2E + NFR (parallel): 15-20 min
- John correct-course: 10-15 min (analysis + Sprint Change Proposal)
- Minor fixes: 10-30 min (dependency-driven)
- Major replanning: 30-60 min (depends on scope)
- Quality Gate re-run: 20-27 min
- **Total first pass: 30-42 min | With Minor fixes: 75-109 min | With Major replanning: 105-159 min**

**Remediation uses identical dependency-driven spawning as Phase 2 implementation.** No artificial batching. Each fix story spawns as soon as its specific dependencies complete.

### Phase 4: User QA

**When TEA passes**, Project Lead prepares app for human testing. This phase has 4 stages:

#### Stage 4.5: QA Preparation (Project Lead)

**1. Host or Deploy**

Choose based on project type:
- **Local (default):** `npm run dev` (or equivalent)
  - Bind to `0.0.0.0` if Tailscale access needed
  - Note exact URL (usually `http://localhost:3000`)
- **Vercel (web apps):** Deploy preview or production
  - Get live URL (e.g., `https://app-name.vercel.app`)

**2. Update project-registry.json**
Update your project entry in the registry:
```bash
# Set qaUrl and update timestamp
jq '.projects |= map(
  if .id == "your-project-id" then
    .implementation.qaUrl = "http://localhost:3000" |
    .timeline.lastUpdated = (now|todate)
  else . end
)' projects/project-registry.json > tmp && mv tmp projects/project-registry.json
```

**Required fields:**
- `implementation.qaUrl` - Testable URL (localhost or deployed)
- `timeline.lastUpdated` - ISO timestamp (updated automatically)

**3. Notify Kelly (Push)**
```javascript
sessions_send(
  sessionKey="agent:main",
  message="🧪 Project {projectName} ready for user QA: {qaUrl}\n\n{brief instructions}"
)
```

This is **push notification** (immediate). Kelly's heartbeat is **pull detection** (safety net).

**4. Self-Healing Check**

Project Lead's own heartbeat (every 5-10 min):
- **If stage="userQA" but no qaUrl:**
  - Caught gap! Complete Stage 4.5 NOW
  - Host app, update state, notify Kelly

#### Stage 4.6: Surfacing (Kelly Heartbeat)

**Every 30-60 minutes**, Kelly scans for projects ready for QA:

1. Read `projects/project-registry.json`
2. Filter: `state="in-progress"` AND `implementation.qaUrl` present
3. Check `state/kelly.json` → if NOT in `heartbeat.surfacedQA[]`:
   - Alert operator: `🧪 **{name}** ready for user QA: {implementation.qaUrl}`
   - Add `projectId` to `heartbeat.surfacedQA[]` in `state/kelly.json`

**What NOT to surface:**
- Projects with `paused: true` (explicitly paused)
- Projects already in `heartbeat.surfacedQA[]` list
- Projects without `implementation.qaUrl` (not ready yet)

#### Stage 4.7: Operator Testing

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
# Kelly stops surfacing in heartbeats until resumed
```

**SCENARIO C: User Rejects → FIX (via correct-course)**
```
1. Project Lead receives operator feedback
   → Example: "Checkout flow confusing, auth doesn't work on mobile"

2. Spawn John: correct-course workflow
   → Input: Operator feedback
   → Task: "Analyze User QA feedback. Create Sprint Change Proposal with 
           recommended approach for each issue."
   
   John categorizes:
   - Simple bugs → "Add fix stories" (Minor)
   - UX issues → "Update UX design, modify stories" (Moderate)
   - Feature requests → "Add to backlog" or "Descope" (Major)

3. John outputs: Sprint Change Proposal
   → Recommendations: Minor/Moderate/Major scope classification
   → Detailed change proposals: Story edits, PRD updates, etc.

4. Project Lead implements based on scope (same as Phase 3 remediation):
   - MINOR: Bob creates fix stories → dependency-driven Amelia implementation
   - MODERATE: John updates epics → Bob updates sprint plan → implement
   - MAJOR: Winston/Sally/John replanning → Bob updates → implement

5. After fixes complete:
   → Phase 3 (Quality Gate) → Phase 4 (User QA retry)
```

**User QA uses the same correct-course remediation path as Quality Gate bugs.** Consolidated feedback handling.

#### State Files

**project-registry.json (your project entry):**
- `state`: "in-progress"
- `implementation.qaUrl`: testable URL
- `timeline.lastUpdated`: ISO timestamp (updated when qaUrl set)

**state/kelly.json (Kelly maintains):**
- `heartbeat.surfacedQA[]`: projects already announced to operator

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

**Build check only.** User QA is the primary quality gate for Barry projects.

```
1. Spawn Murat (fast mode): Build check only
   → npm run build
   → If PASS: Phase 4 (User QA)
   → If FAIL: Route through John correct-course
```

**No test suite, no E2E, no NFR.** Fast Mode prioritizes speed — User QA catches functional bugs.

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
jq '.projects |= map(
  if .id == "your-project-id" then
    .state = "in-progress" |
    .implementation.projectDir = "/Users/austenallred/clawd/projects/your-project-id" |
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
4. **Two subagents per story** in Normal Mode: dev-story then code-review
5. **One subagent per story** in Fast Mode: quick-dev only
6. **Detect dead subagents** — no completion = likely dead, respawn
7. **BMAD tracks story status** — sprint-status.yaml is source of truth
8. **All work on `dev` branch** — merge to `main` only at Ship
