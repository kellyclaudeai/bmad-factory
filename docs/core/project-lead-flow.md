# Project Lead Flow

**Last Updated:** 2026-02-19  
**Purpose:** Complete specification of Project Lead orchestration across all modes and phases.  
**Audience:** Used as reference when building/updating Project Lead AGENTS.md.

**Recent Updates:**
- v4.1 (2026-02-19): **STATELESS PL + CONTEXT DISCIPLINE.** PL must keep replies to 1-2 lines, never narrate history, rotate session every 25 stories. Prevents 200k token overflow on large projects. See Context Discipline section.
- v4.0 (2026-02-19): **DESIGN WORKFLOW INTEGRATION.** Sally outputs design-assets.json with Figma URLs, Bob adds design_references to stories, Amelia uses Figma MCP for visual fidelity. See [design-workflow.md](./design-workflow.md) for full details. (Proposed, not yet implemented)
- v4.5 (2026-02-19): **QA FEEDBACK = STORY FLOW.** QA feedback from the operator creates new stories and updates BMAD artifacts — same pipeline as greenfield Phase 2. Bug exception only: if feedback is a missed implementation or something clearly broken (not new behavior), Amelia fixes directly without story creation. No qaRounds[] in registry — feedback is tracked in BMAD artifacts like everything else.
- v4.4 (2026-02-19): **FAST MODE REMOVED.** Factory runs Normal Mode only: Greenfield or Brownfield. Barry Fast Track eliminated.
- v4.3 (2026-02-19): **PENDING-QA STATE + PL HOLDS SESSION.** After Phase 3 TEA passes, PL sets `state: "pending-qa"` and enters an idle hold — the session stays alive (lock file held) until Kelly signals SHIP, FIX, or PAUSE. PL MUST NOT exit or mark shipped on its own. Only the operator (via Kelly) can trigger ship. Dashboard shows the live PL session as "AWAITING QA".
- v4.2 (2026-02-19): **PHASE NAMING + TEA STREAMLINED.** Phase 3 renamed "Test" (was "Post-Deploy Verification/QA"). TEA simplified: TD+TF+TA combined into single Murat "test-generate" pass. Removed RV (test review) and TR (traceability) — redundant overhead for MVP factory. New TEA: test-generate → E2E execution + NR in parallel.
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
- **QA ready:** `in-progress` → `pending-qa` (set `implementation.qaUrl`, `timeline.lastUpdated`, notify Kelly)
- **Followup:** `shipped` → `followup` (add entries to `followup[]`)
- **Followup done:** `followup` → `shipped`
- **Pause/Resume:** Set `paused: true/false` with `pausedReason`

**Registry updates (PL does on Kelly's SHIP signal — operator approval required first):**
- **Ship:** `pending-qa` → `shipped` (set `implementation.deployedUrl`, `timeline.shippedAt`) — only after receiving `"SHIP: {projectId}"` from Kelly

**Dependency authority:** Bob's `dependency-graph.json` (or `stories-parallelization.json`) in `_bmad-output/implementation-artifacts/`. Each story has individual `dependsOn` arrays.

---

## CLI-First Policy

**All planning artifacts (architecture, stories) must specify CLI commands, not browser steps.**

- Winston writes: `gcloud projects create "$PROJECT_ID"` (not "Navigate to Firebase Console")
- Bob writes: `firebase apps:create web` (not "Click Add App button")
- Amelia executes: CLI tools first, browser only if no CLI exists

**Lightest rule:** CLI-first. Browser only if no CLI exists.

---

## ⚠️ Vercel Deploy Limit (Free Tier)

**Vercel free plan: 100 deployments/day hard limit.**

When a project uses Vercel:
1. **Disable git auto-deploy immediately.** Every `git push` from Amelia's stories triggers a deploy. With 20-80 stories each pushing commits, you'll blow through 100 in hours.
   - Set via Vercel dashboard → Project Settings → Git → disable "Deploy on Push"
   - Or: don't link the git repo to Vercel at all. Use CLI-only deploys.
2. **Zero deploys during Phase 2.** Amelia must NEVER run `vercel` CLI or push to a Vercel-connected branch during the build phase. Stories are `git push`-only to `dev`.
3. **Single deploy in Phase 3 Step 2.** One intentional `vercel --prod` at the start of Phase 3. That's it.
4. **If limit is hit:** Fall back to Firebase Hosting (`firebase deploy --only hosting`) for QA. Re-deploy to Vercel when limit resets (24h rolling window).

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
   → Optional: _bmad-output/design-assets.json (Figma URLs, see [design-workflow.md](./design-workflow.md))
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
   - ANY documented concerns require fixes before the build phase
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
   → Input: epics.md, architecture.md, prd.md, ux-design.md, design-assets.json (if exists)
   → Output: _bmad-output/implementation-artifacts/stories/story-{N.M}.md
   → Stories include design_references field when design-assets.json exists (see [design-workflow.md](./design-workflow.md))
```

### Phase 2: Implement — Dependency-Driven Parallelization

**🚫 NO VERCEL DEPLOYS IN PHASE 2.** Amelia's stories `git push` to dev only. If Vercel git auto-deploy is enabled, every push burns a daily deploy slot. Disable it before Phase 2 starts (see Vercel Deploy Limit section above).

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
   → Reads story + design_references (if design-assets.json exists)
   → Uses Figma MCP to extract design specs (see [design-workflow.md](./design-workflow.md))
   → Implements story with visual fidelity
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

### Phase 3: Test

**Goal:** Ship a working, tested deployment. Pre-deploy catches build/lint issues cheaply. Post-deploy runs the TEA quality suite against the real deployed app.

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

**Deploy after pre-deploy gates pass. This is the ONE intentional deploy for the project.**

```
1. Check Vercel limit first (free tier: 100/day rolling):
   - Run: vercel --prod
   - If error "api-deployments-free-per-day" → fall back to Firebase Hosting
   - Firebase fallback: firebase deploy --only hosting (no daily limit)
   - NOTE: Never use "push to dev triggers deploy" — git auto-deploy must be disabled

2. Verify deployment accessible:
   - Confirm live URL returns 200
   - Set `implementation.qaUrl` in project-registry.json
   - Set `implementation.deployedUrl` if production

3. If deploy fails:
   - Batch deployment errors → Amelia fix → redeploy
```

---

#### Step 3: Test (TEA Suite)

**Run the TEA quality suite against the DEPLOYED app.** Failures batched → Amelia remediates → redeploy → re-run.

**Step 3a: Test Generation (one-time, Murat test-generate workflow)**

```
Murat: test-generate
  → Input: PRD, architecture.md, acceptance criteria, codebase, tech stack
  → Output:
    - _bmad-output/test-artifacts/test-strategy.md (design + coverage plan)
    - Playwright config, test helpers, fixtures scaffolded
    - Comprehensive E2E tests (user flows, auth, CRUD, navigation)
    - Accessibility checks (axe-core) included in E2E tests
  → Duration: 25-45 min (combined design + scaffold + generate in one pass)
```

**Step 3b: Execution + NFR (parallel after test-generate completes)**

```
Parallel spawn:
  A. E2E Test Execution (against deployed app):
     → Run Playwright tests against live URL (implementation.qaUrl)
     → Reports pass/fail per test
     → Screenshot evidence for failures
     → Duration: 5-15 min
     → Output: _bmad-output/test-artifacts/test-execution-report.md

  B. Murat: nfr workflow — NFR Assessment:
     → Security: Auth vulnerabilities, XSS/CSRF, API exposure
     → Performance: Load time, bundle size, database queries
     → Accessibility: WCAG compliance (supplementary to E2E checks)
     → Duration: 25-35 min
     → Output: _bmad-output/test-artifacts/nfr-assessment-report.md

Wait for BOTH to complete before proceeding.
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

2. Spawn Amelia: fix-postdeploy
   → Input: Batched failure report from all TEA outputs
   → Task: Fix all failures. For each:
     - Test failures → Fix implementation code (not the tests)
     - NFR issues → Fix security/performance/accessibility issues
   → Commit + push to dev

3. Redeploy (Step 2)

4. Re-run Step 3b only (tests already generated — skip test-generate)
   → Re-run E2E execution + NFR assessment in parallel
   → Duration: 10-20 min (much faster)

5. Repeat until clean (max 3 cycles, escalate to Kelly if stuck)
```

**Timeline:**
- Pre-Deploy Gates: 2-5 min
- Deployment: 2-5 min
- Test First Pass:
  - Murat test-generate (design + scaffold + generate): 25-45 min
  - E2E execution + NFR (parallel): 25-35 min
- **Total first pass: ~55-90 min**
- **Re-runs (execution only): 10-20 min** (tests already generated)
- Remediation per cycle: 15-30 min

**Key principle:** First pass generates tests once. Re-runs are cheap (just execution). Invest upfront, iterate fast.

### Phase 4: User QA

**When Phase 3 (Test) passes**, the app is already deployed (from Phase 3 Step 2). Notify Kelly, set pending-qa, then **hold** — the PL session must NOT exit until the operator ships or kills the project.

#### Stage 4.1: Notify Kelly + Set pending-qa

```javascript
sessions_send(
  sessionKey="agent:main",
  message="🧪 Project {projectName} passed automated testing. Ready for user QA: {qaUrl}\n\nDeployed at: {deployedUrl}"
)
```

Update project-registry.json:
- **Set `state: "pending-qa"`** (was `in-progress`)
- Set `surfacedForQA: false` (Kelly will set to true after announcing)
- Ensure `implementation.qaUrl` is set

#### Stage 4.2: HOLD — Wait for Operator Signal

**DO NOT EXIT.** The PL session must stay alive (lock file held) so the project appears on the dashboard as an active session awaiting QA. Kelly will send a message when the operator makes a decision.

```
PL behavior: idle wait.
→ Reply to any incoming heartbeat with current status (project name, qaUrl, state=pending-qa).
→ Do NOT poll the registry in a loop. Just wait for a sessions_send message.
→ Acceptable wait: hours or days. Do not time out.
```

**Kelly's signal will be one of:**
- `"SHIP: {projectId}"` → proceed to Stage 4.4 (Ship)
- `"FIX: {projectId} — {feedback}"` → proceed to Stage 4.3 (Fix)
- `"PAUSE: {projectId}"` → update registry `paused: true`, stay idle

#### Stage 4.3: Operator Testing — Fix Path

**Operator decides WHAT goes in. PL decides HOW to implement it.**

QA feedback is treated like any other development work — it flows through BMAD artifacts and the same Phase 2 story pipeline as greenfield. The only exception is genuine bugs.

```
1. Receive fix feedback from Kelly
   → Example: "FIX: takeouttrap — Checkout flow confusing, auth broken on mobile"

2. Route the feedback (technical call — operator decides scope, PL decides path):

   BUG PATH — Feedback is a missed implementation or something clearly broken
   (i.e., a feature was specified and it just doesn't work as described):
   → Spawn Amelia: fix-qa-feedback
     → Input: operator feedback verbatim + relevant story/acceptance criteria
     → Task: Fix the broken behavior, commit, push to dev
   → No new stories created, but Amelia updates sprint-status.yaml to note the fix

   STORY PATH — Default for all other feedback
   (new behavior, changed UX, additions, anything that isn't a straight bug):
   → Spawn John: scope-qa-feedback
     → Input: operator feedback, existing prd.md, architecture.md, ux-design.md
     → Output: new story files in _bmad-output/implementation-artifacts/stories/
     → John updates sprint-status.yaml with new story entries (status: "todo")
   → Spawn Bob: update dependency-graph.json for new stories
   → Run new stories through Phase 2 loop (Amelia, dependency-driven, same rules as greenfield)

3. After all fixes/stories complete:
   → Re-run Phase 3 (Test): pre-deploy gates → deploy → TEA execution
   → test-generate NOT re-run unless major new flows added — Murat reuses existing suite

4. Back to Stage 4.1 (re-notify Kelly, re-enter hold)
```

**When in doubt, use the Story Path.** Story creation is cheap. It keeps the work visible in sprint-status.yaml, gives Amelia clear acceptance criteria, and makes the project auditable. Bug Path is the narrow exception — if a button literally doesn't work and the spec said it should, that's a bug. Everything else is a story.

#### Stage 4.4: Ship (on operator approval)

**Triggered by Kelly sending `"SHIP: {projectId}"`**

```bash
git checkout main && git merge dev && git push origin main
# CI/CD deploys to production from main
```

Update project-registry.json:
- `state: "shipped"`
- `timeline.shippedAt: (now)`
- `implementation.deployedUrl: {productionUrl}`

Notify Kelly:
```javascript
sessions_send(
  sessionKey="agent:main",
  message="🚀 {projectName} is live: {deployedUrl}"
)
```

**Then exit cleanly.** The session lock is released only after shipping is confirmed.

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
- Test phase complete (`in-progress` → `pending-qa`, set `implementation.qaUrl`, update `lastUpdated`, notify Kelly)
- Ship (`pending-qa` → `shipped`, set deployedUrl + shippedAt) — only after receiving `"SHIP: {projectId}"` from Kelly
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
- Phase transitions (planning complete, build started, etc.)
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
4. **One subagent per story** — dev-story only (code-review disabled as of v3.3)
5. **Detect dead subagents** — no completion = likely dead, respawn
6. **BMAD tracks story status** — sprint-status.yaml is source of truth
7. **All work on `dev` branch** — merge to `main` only at Ship
8. **Stay stateless** — terse replies only, all state in files, rotate session every 25 stories

## Context Discipline (v4.1 - 2026-02-19)

**PL is a stateless orchestrator. Session context must stay small.**

A 74-story project accumulates 280k+ tokens if PL narrates everything. This causes silent death at the 200k limit. The fix is behavioral — PL must externalize all state and keep replies minimal.

### Rules
- **Terse replies:** Max 1-2 lines per heartbeat (`✓ Spawned 10.7, 11.5` or `HEARTBEAT_OK`)
- **Never narrate history:** Don't summarize past waves. sprint-status.yaml has this.
- **Never quote sprint-status back:** Read → act → reply tersely. Don't copy file contents into context.
- **Subagent completions:** Update sprint-status.yaml status only. No elaboration.

### Voluntary Session Rotation (every 25 stories done)
At 25 stories complete, PL proactively archives its own session before hitting the 200k limit:

```bash
# Archive current session transcript
SESSION=$(ls ~/.openclaw/agents/project-lead/sessions/*.jsonl | grep -v ".lock\|.deleted\|.overflow" | head -1)
cp "$SESSION" "${SESSION}.overflow-archived-$(date +%Y%m%d-%H%M%S)"
echo '[]' > "$SESSION"
```

Then notify Kelly: `"PL session rotated at 25 stories. Resuming from sprint-status.yaml."`

**Why 25 stories:** At ~3k tokens/story spawn cycle, 25 stories = ~75k tokens. Well under the 200k limit even with heartbeat overhead. Fresh session picks up state from sprint-status.yaml instantly.

### Target Session Size
- Per-session token budget: **< 75k tokens**
- Trigger rotation at: **25 stories completed** (regardless of project size)
- Safety net: Kelly's "PL Context Overflow Guard" cron (every 30 min) catches any drift
