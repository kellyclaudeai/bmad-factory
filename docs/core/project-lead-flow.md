# Project Lead Flow

**Last Updated:** 2026-02-20  
**Purpose:** Complete specification of Project Lead orchestration across all modes and phases.  
**Audience:** Used as reference when building/updating Project Lead AGENTS.md.

**Recent Updates:**
- v5.7 (2026-02-20): **HARD GATE: 0 FAILURES TO ENTER PHASE 4.** Explicit gate added before Phase 4 — "minor" or "infra-only" test failures are still blocking. All unit, E2E, and NFR failures route back to Step 5 (Change Flow). Max 3 remediation cycles before escalating to Kelly.
- v5.1 (2026-02-20): **SALLY MOCKUPS MANDATORY.** design-assets.json is no longer optional. Sally MUST use the `frontend-design` skill to build HTML prototypes + Playwright screenshots for every main screen after writing ux-design.md. PL task prompt now explicitly requires this with a pointer to `docs/core/design-workflow.md`. Removed stale "Figma URLs" reference from Sally step.
- v5.0 (2026-02-20): **DEFAULT TECH STACK.** `docs/core/tech-stack.md` created. Winston must read it before writing architecture.md on every project. Default: Next.js 15 + TypeScript + Tailwind + shadcn/ui + pnpm + Supabase (DB+Auth) + Drizzle + Vercel. Override by specifying in intake.md; document as ADR in architecture.md.
- v4.9 (2026-02-20): **NO MOCKING IN E2E — REAL EVERYTHING.** Phase 3 E2E tests must use real deployed URL, real Firebase Auth, real credentials. No stubbing `signInWithPopup` or any external service. Console error listener mandatory in every test file (CSP violations = auto-fail). Test credentials must be a dedicated factory test Gmail (NOT kelly@bloomtech.com). If auth project and `test-credentials.md` missing → Murat halts + PL notifies Kelly. Same policy codified in murat-testing/SKILL.md.
- v4.8 (2026-02-19): **FULL QA FEEDBACK WORKFLOWS IN ALL AGENTS.** John: `scope-qa-feedback` (4th responsibility). Winston: `review-architecture-change` (2nd responsibility). Amelia: `fix-qa-feedback` (Mode 3). Bob: `update-dependency-graph` (4th responsibility). Every agent now knows its QA feedback role — PL routes, agents execute.
- v5.6 (2026-02-20): **DUAL VIEWPORT DESIGNS MANDATORY.** Sally now screenshots every screen at both mobile (390px) and desktop (1440px). design-assets.json includes both viewports. Exception for fixed-viewport projects (Chrome extensions) documented with viewports: 'mobile-only'.
- v5.5 (2026-02-20): **PHASE 3 REMEDIATION USES CHANGE FLOW.** Step 5 routes failures through the unified Change Flow instead of hardcoding Amelia. Architectural issues → Winston. UX issues → Sally. Scope gaps → John. Simple bugs stay Amelia-only.
- v5.4 (2026-02-20): **SPLIT TEST GENERATION FROM EXECUTION.** Step 3 = test-generate (one-time, never re-run). Step 4 = E2E execution + NFR (repeats each remediation cycle). Step 5 = remediation loop. Clearer separation of concerns.
- v5.3 (2026-02-20): **TECH-STACK-AWARE PRE-DEPLOY GATES.** Gates now read architecture.md to determine actual stack before running checks. TypeScript check no longer hardcoded — adapts to TS, Python, Chrome Extension, etc. Added Gate 3 (unit tests if they exist) and Gate 4 (security scanning). NFR (accessibility + performance) confirmed present in Phase 3b.
- v5.2 (2026-02-20): **UNIFIED CHANGE FLOW.** QA feedback, brownfield, correct courses all use one pipeline: John → Sally → Winston → Bob → Amelia. Skip who isn't needed. Same order as greenfield. No separate QA feedback flow. No double-John.
- v4.6 (2026-02-19): **PHASE 3 HARD GATE + FORBIDDEN STORY TYPES.** Phase 3 (TEA) is now an explicit hard gate — cannot be skipped, cannot be substituted by a Phase 2 "Smoke Test" story. John AGENTS.md: forbidden from creating testing/deployment epics. Bob AGENTS.md: must skip any test/deploy stories that slip through from John's epics. Root cause: Verdict shipped with zero test artifacts because story 7.2 "Production Build, Deploy & Smoke Test" was mistaken for Phase 3.
- v4.1 (2026-02-19): **STATELESS PL + CONTEXT DISCIPLINE.** PL must keep replies to 1-2 lines, never narrate history, rotate session every 25 stories. Prevents 200k token overflow on large projects. See Context Discipline section.
- v4.0 (2026-02-19): **DESIGN WORKFLOW INTEGRATION.** Sally outputs design-assets.json with Figma URLs, Bob adds design_references to stories, Amelia uses Figma MCP + frontend-design skill for visual fidelity. See [design-workflow.md](./design-workflow.md) for full details. ✅ Implemented (Figma MCP configured, all agents updated)
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

**State tracking:** PL updates `projects/projects-registry.json` at key lifecycle transitions. See `docs/core/project-registry-workflow.md` for full spec.

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

### Phase 0: Git Init (MANDATORY — do this first, before anything else)

Every project has its own git repo. The `clawd` workspace ignores `projects/*/` in its `.gitignore`, so project code never bleeds into clawd's history.

```bash
# Run this immediately after the project directory is created:
cd /Users/austenallred/clawd/projects/{projectId}
git init
git add -A
git commit -m "feat: initial project setup — {ProjectName}"
```

- **Default branch:** `main`
- **No remote needed yet** — local history only until ship time
- **On ship:** create private GitHub repo + push: `gh repo create austenallred/{projectId} --private --source=. --push`
- **All repos must be private** — never create a public repo for factory projects

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
   → **MANDATORY:** _bmad-output/design-assets.json + _bmad-output/design-assets/screens/*.html + _bmad-output/design-assets/images/screens/*.png
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."
   → Task MUST include explicit instruction: "After writing ux-design.md, read and follow docs/core/design-workflow.md in full. Use the frontend-design skill to build a self-contained HTML prototype for each main screen. Screenshot each screen at BOTH mobile (390px) AND desktop (1440px) viewports with Playwright — name them {screen}-mobile.png and {screen}-desktop.png. Write design-assets.json with both viewport screenshots listed. For fixed-viewport projects (Chrome extensions, native apps), mobile-only is acceptable — document with viewports: 'mobile-only'. This is NOT optional."
   → After Sally completes: read _bmad-output/design-assets.json and set projectState.designAssets (dashboard displays screen mockups)

3. Winston: create-architecture
   → Input: prd.md, ux-design.md
   → Output: _bmad-output/planning-artifacts/architecture.md
   → Task MUST include: "YOLO MODE — skip all confirmations, run fully autonomously."
   → **MANDATORY:** Winston must read `docs/core/tech-stack.md` before writing architecture.md. Use the default stack unless intake.md explicitly overrides a layer. Document any deviation as an ADR in architecture.md.

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

8. Bob: create-story (ONE spawn — writes ALL stories sequentially in one session)
   → Spawn Bob ONCE with /bmad-bmm-create-story; Bob reads epics.md and writes every story file in sequence
   → Input: epics.md, architecture.md, prd.md, ux-design.md, design-assets.json (if exists)
   → Output: _bmad-output/implementation-artifacts/stories/story-{N.M}.md (all stories)
   → Stories include design_references field when design-assets.json exists (see [design-workflow.md](./design-workflow.md))
   → ⚡ One session = ~15 min regardless of story count (vs one spawn per story = 90+ min for 30 stories)
```

### Phase 2: Implement — Dependency-Driven Parallelization

**🚫 NO VERCEL DEPLOYS IN PHASE 2.** Amelia's stories `git push` to dev only. If Vercel git auto-deploy is enabled, every push burns a daily deploy slot. Disable it before Phase 2 starts (see Vercel Deploy Limit section above).

**📋 Dev server URL.** After the first setup story completes, Amelia reports the local dev server URL (e.g. `http://localhost:5173`). PL must immediately write it to `project-state.json`:
```bash
# as soon as Amelia's first story finishes and the dev server is running:
python3 -c "
import json
f = 'project-state.json'
d = json.load(open(f))
d['devServerUrl'] = 'http://localhost:PORT'  # replace PORT with actual port
json.dump(d, open(f,'w'), indent=2)
"
```
This shows up as the **Local Dev** link on the Kelly Dashboard project detail page.

**No artificial batching or waves.** Spawn stories as soon as their dependencies are satisfied.

```
CONTINUOUS LOOP (every 60 seconds):

1. Read dependency-graph.json
2. Read sprint-status.yaml (which stories are "done")
3. For EACH incomplete story:
   - Check if ALL entries in its dependsOn array are "done"
   - If yes AND not already spawned → spawn immediately
4. Track active spawns (session keys, start times)

UNLIMITED PARALLELISM — no cap, spawn ALL ready stories at once:
  - 1 story ready → spawn 1
  - 10 stories ready → spawn 10 simultaneously
  - 20 stories ready → spawn 20 simultaneously
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
   → Implement story
   → git commit + push
   → Write status = "done" + session_id to sprint-status.yaml
   → Announce completion to PL
```

**Code review disabled (v3.3).** Dev → done directly. No review subagent.
**To re-enable:** Add code-review spawn after dev-story, update status flow to review → done.

**Subagent death handling:**
- If an Amelia session dies, PL detects (no completion announcement) and respawns
- Coding CLI fallback (Claude Code → Codex) happens transparently within Amelia's execution (Claude Code primary as of 2026-02-18)
- Log failed attempts in daily memory notes with failure reason
- Increment version suffix on retry (e.g., `story-2.4-v1`, `story-2.4-v2`)

### Phase 3: Test

> ⛔ **HARD GATE — MANDATORY. CANNOT BE SKIPPED.**
> Phase 3 is NOT implemented as stories. Bob does NOT create test stories. Murat is NOT spawned by Amelia as a dev task. Project Lead directly orchestrates Phase 3 after ALL Phase 2 stories are `done`. You CANNOT set `phase = "qa"` or proceed to Phase 4 without `_bmad-output/test-artifacts/test-execution-report.md` existing and showing PASS.
>
> **A Phase 2 story named "Smoke Test", "Deploy", or "Production Build" is NOT Phase 3.** If that story completed, ignore it — Phase 3 still requires Murat's full test-generate → E2E execution. This is what happened with Verdict: story 7.2 "Production Build, Deploy & Smoke Test" was marked done in Phase 2, PL skipped Phase 3, and the project shipped with zero real tests.

**Goal:** Ship a working, tested deployment. Pre-deploy catches build/lint issues cheaply. Post-deploy runs the TEA quality suite against the real deployed app.

---

#### Step 1: Pre-Deploy Gates

**Fast, cheap checks before deploying.** Failures batched → Amelia remediates → re-run gates.

**Read architecture.md to determine the actual tech stack before running gates. Commands vary by stack.**

```
Gate 1: Build Verification
  → Run the project's build command (check architecture.md / package.json)
  → TypeScript/Next.js:  pnpm build / npm run build
  → Vite/React:          pnpm build
  → Python/FastAPI:      pip check + import validation
  → Chrome Extension:    pnpm build / webpack
  → Must produce clean build with zero errors

Gate 2: Lint & Type Checking
  → Run the project's lint command (check package.json scripts)
  → If TypeScript project:  npx tsc --noEmit (zero type errors required)
  → If ESLint configured:   npm run lint / pnpm lint
  → If Biome configured:    biome check
  → If Python:              ruff check / flake8
  → Zero errors required (warnings OK)

Gate 3: Unit Tests (if test suite exists)
  → Check for test script in package.json / pytest / etc.
  → If tests exist: run them. Failures are blockers.
  → If no tests exist: skip (note in gate report)

Gate 4: Security Scanning
  → npm audit --audit-level=high (Node projects)
  → pip-audit (Python projects)
  → Dependency vulnerability check — high/critical CVEs are blockers
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
   - Write both fields to `project-state.json` (dashboard reads these):
     ```bash
     python3 -c "
     import json; f='project-state.json'; d=json.load(open(f))
     d['qaUrl'] = 'DEPLOYED_URL'
     d['deployedUrl'] = 'DEPLOYED_URL'
     json.dump(d, open(f,'w'), indent=2)
     "
     ```
   - `qaUrl` = the URL used for QA testing (same as deployed URL)
   - `deployedUrl` = production URL — **persists in project-state.json forever** so the dashboard always shows it, even after shipping

3. If deploy fails:
   - Batch deployment errors → Amelia fix → redeploy
```

---

#### Step 3: Test (TEA Suite)

**Run the TEA quality suite against the DEPLOYED app.** Failures batched → Amelia remediates → redeploy → re-run.

---

> ### 🚨 E2E TESTING STANDARDS (NON-NEGOTIABLE)
>
> **No mocking in E2E tests. Real everything.**
>
> E2E tests must exercise the real, deployed app as a real user would. Mocking external services (Firebase Auth, APIs, etc.) in E2E tests defeats their purpose — it's the production environment (CSP headers, real OAuth flows, real network) that catches real bugs.
>
> **Rules Murat MUST follow when generating E2E tests:**
>
> 1. **No Firebase Auth mocking.** Do NOT stub `signInWithPopup`, `signInWithEmailAndPassword`, or any Firebase Auth method in E2E tests. Use real auth flows with a dedicated test account.
>
> 2. **Dedicated test account required.** If the project uses auth, Murat must check for a test credential file at `_bmad-output/test-artifacts/test-credentials.md`. If it doesn't exist, Murat outputs a blocker in `test-strategy.md` and halts — PL must obtain credentials before proceeding. PL notifies Kelly: "Blocked: need test account credentials for E2E auth flows."
>
> 3. **Console error assertions mandatory.** Every test file must include a `page.on('console', ...)` listener that captures browser console errors. Any CSP violation, uncaught JS error, or network failure detected in the console automatically fails the test.
>
> 4. **Tests run against deployed URL.** `playwright.config.ts` must set `baseURL` to `implementation.qaUrl` (the deployed app), not localhost. E2E tests do NOT spin up a dev server.
>
> 5. **Unit/integration tests may use mocks.** Only E2E is held to this standard. Unit and integration tests may mock freely.
>
> **Test credential file format** (`_bmad-output/test-artifacts/test-credentials.md`):
> ```
> ## Test Account
> Email: [dedicated test Gmail - NOT kelly@bloomtech.com]
> Password: [stored in env var TEST_ACCOUNT_PASSWORD]
> Provider: google / email / etc.
> Notes: This account is used exclusively for automated E2E testing.
> ```
>
> **Where to get credentials:** Kelly maintains a dedicated factory test Gmail. Ask Kelly via PL message: "Need test credentials for {projectId} E2E auth flows." Kelly will create the credentials file.

---

**Step 3: Test Generation (one-time — never re-run)**

```
Murat: test-generate
  → Input: PRD, architecture.md, acceptance criteria, codebase, tech stack
  → Output:
    - _bmad-output/test-artifacts/test-strategy.md (design + coverage plan)
    - Playwright config (baseURL = deployed qaUrl, NOT localhost)
    - test helpers, fixtures scaffolded
    - Three mandatory test suites (ALL required):

      1. HAPPY PATH JOURNEY (exploratory — written independently of ACs)
         → Full end-to-end user journey from landing to core value
         → Example: sign up → complete onboarding → use main feature → see result
         → Must not rely on pre-seeded data — create everything fresh in the test
         → One test per major user role (e.g. employer + candidate, or free + paid user)

      2. ERROR PATH JOURNEY (exploratory — written independently of ACs)
         → Key failure scenarios a real user would hit
         → Examples: wrong password, empty form submit, network-dependent error states,
           permission denied, invalid input, empty states (no data yet)
         → At least 3-5 error scenarios per app

      3. AC-BASED TESTS (story-driven)
         → One test per story AC that isn't already covered by journeys above
         → Auth flows: REAL credentials, no mocking
         → Console error listener mandatory in every test file (CSP violations = auto-fail)
         → Accessibility checks (axe-core) included

  → Duration: 25-45 min (combined design + scaffold + generate in one pass)
  → BLOCKER: If project uses auth and test-credentials.md does not exist → halt + notify Kelly
  → One-time only — tests are NOT regenerated on remediation cycles
```

---

**Step 4: E2E Execution + NFR Assessment (parallel — repeats each remediation cycle)**

```
Parallel spawn:
  A. E2E Test Execution (against deployed app):
     → Run Playwright tests against live URL (implementation.qaUrl)
     → Reports pass/fail per test
     → Screenshot evidence for failures
     → Duration: 5-15 min
     → Output: _bmad-output/test-artifacts/test-execution-report.md
     ⚠️  HARD BLOCKERS: Happy path journey failure OR error path journey failure
         → Do NOT proceed to pending-QA. Kick back to Amelia immediately.
         → AC-based test failures also block but are batched with other failures

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

#### Step 5: Remediation (Batched — repeats until clean)

**Phase 3 remediation IS the brownfield Change Flow. Same pipeline, same routing, same agents.**

Treat every test/NFR failure as a brownfield change. Batch all failures, classify depth, run the Change Flow:

```
1. Collect ALL failures:
   - E2E test failures (test-execution-report.md)
   - NFR issues (nfr-assessment-report.md)

2. Route failures through the Change Flow at the appropriate depth:

   Implementation bug (code doesn't match AC, simple fix)
   → Amelia only

   NFR fix with no design/arch impact (add aria-label, fix contrast, cache a query)
   → Amelia only

   UX/design issue (component needs redesign, flow is confusing)
   → Sally → Amelia

   Architectural issue (security model wrong, data model needs change, performance requires rethink)
   → Winston → Bob (new/updated stories) → Amelia

   Misunderstood feature (journey test reveals fundamental scope gap)
   → John → [Sally/Winston as needed] → Bob → Amelia

3. After fixes committed → Redeploy (Step 2)

4. Re-run Step 4 only (tests already generated — never re-run Step 3)
   → Re-run E2E execution + NFR assessment in parallel
   → Duration: 10-20 min (much faster than first pass)

5. Repeat until clean (max 3 cycles, escalate to Kelly if stuck)

6. **When Murat announces completion (pass or fail):**
   - Move Murat from `activeSubagents` → `completedSubagents` in project-state.json
   - Murat exits after announcing — do NOT leave in active list
```

**Timeline:**
- Pre-Deploy Gates: 2-5 min
- Deployment: 2-5 min
- Step 3 — Test Generation (one-time): 25-45 min
- Step 4 — E2E + NFR first pass (parallel): 25-35 min
- **Total first pass: ~55-90 min**
- **Step 4 re-runs (execution only): 10-20 min** (tests already generated)
- Remediation per cycle: 15-30 min

**Key principle:** Step 3 runs once. Step 4 repeats. Invest upfront in good tests, iterate fast on fixes.

### Phase 4: User QA

**Phase 3 "passes" means ALL tests are green — zero failures, zero skips without documented rationale.**

> ⛔ **Hard gate:** Do NOT enter Phase 4 if even one test is failing.
> - Unit test failures → back to Step 5 (Change Flow → Amelia)
> - E2E test failures → back to Step 5 (Change Flow, route by depth)
> - NFR failures → back to Step 5 (Change Flow → Amelia/Sally/Winston)
> - "Minor" or "infra-only" failures → still blocking. Fix them.
> - Max 3 remediation cycles before escalating to Kelly as a blocker.

Only when `test-execution-report.md` shows **0 failures** does PL proceed to Phase 4.

#### Stage 4.1: Notify Kelly + Set pending-qa

```javascript
sessions_send(
  sessionKey="agent:main",
  message="🧪 Project {projectName} passed automated testing. Ready for user QA: {qaUrl}\n\nDeployed at: {deployedUrl}"
)
```

Update projects-registry.json:
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

#### Stage 4.3: Fix Path (Change Flow)

**Operator decides WHAT goes in. PL decides HOW to route it.**

> ⛔ **PL NEVER writes stories or creates story IDs itself.** Story creation is John's job. Dependency graphs are Bob's job. PL is a router — classify the depth of change, spawn the right agents. That's it.

**This is just the unified Change Flow applied to QA feedback. Same pipeline, different depth.**

```
1. Receive feedback from Kelly
   → Example: "FIX: auth broken on mobile" or "ADD: user needs export feature"

2. Classify depth and run the Change Flow:

   Bug / missed impl (was specified, just broken)
   → Amelia only: direct fix, no new stories
   → Amelia notes fix in sprint-status.yaml

   Small change, no design/arch impact
   → Bob → Amelia

   Change with UX impact
   → John (scope, add epics) → Sally (UX update) → Bob → Amelia

   Change with arch impact
   → John (scope, add epics) → Winston (arch update) → Bob → Amelia

   Full change
   → John → Sally → Winston → Bob → Amelia

3. After all fixes/stories complete:
   → Re-run Phase 3 (Test): pre-deploy gates → deploy → TEA execution
   → test-generate NOT re-run unless major new flows added — Murat reuses existing suite

4. Back to Stage 4.1 (re-notify Kelly, re-enter hold)
```

**When in doubt, use John.** Story creation is cheap, keeps work visible and auditable. Direct Amelia fix is the narrow exception for clear bugs only.

#### Stage 4.4: Ship (on operator approval)

**Triggered by Kelly sending `"SHIP: {projectId}"`**

```bash
git checkout main && git merge dev && git push origin main
# CI/CD deploys to production from main
```

Update projects-registry.json:
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

**ALL CHANGES use the unified Change Flow** — new features, QA feedback, bug fixes, correct courses. Same pipeline, different depth. See "The Change Flow (Unified)" section above.

### The Change Flow (Unified)

**One flow handles everything: QA feedback, new features, bug fixes, correct courses, brownfield additions.** PL classifies depth, runs pipeline at that depth.

**Fixed order — never changes:** John → Sally → Winston → Bob → Amelia

Skip agents who aren't affected. Never reorder them.

| Depth | Pipeline |
|-------|----------|
| Bug / missed impl (was specified, just broken) | Amelia only |
| Small change, no design/arch impact | Bob → Amelia |
| Change with UX impact | John → Sally → Bob → Amelia |
| Change with arch impact | John → Winston → Bob → Amelia |
| Full change (stack swap, major feature, complex feedback) | John → Sally → Winston → Bob → Amelia |

**Key rules:**
- John always runs first to scope the change (PRD/epics edit, additive only — never rewrites existing epics)
- Winston can freely rewrite architecture.md — Bob reads it and writes stories that reflect it
- Sally runs only if UX/design is affected
- Bob always runs before Amelia to update sprint-status + dep graph
- After Amelia implements: re-run Phase 3 (Test) if major new flows added, otherwise Murat reuses existing suite

### Phase 1: Plan

```
0. Detect existing _bmad-output/ → read existing artifacts
   → Determine change type (requirements / tech / both) → route per table above

1-3. John/Sally/Winston: Read existing PRD/UX/Architecture
     → Update in EDIT mode ONLY if changes needed
     → Skip if no changes
     → Follow order-of-operations table above

4. John: create-epics-and-stories (ADD to existing epics.md)
   → Continue numbering: Epic N+1, N+2...

5. John: check-implementation-readiness (for NEW features)
   → Same PASS/NOT PASS logic as Greenfield (see above)
   → Remediation loop targets only NEW artifacts (edit new epics, not existing ones)
   → Repeat until PASS

6-7. Bob: Update sprint-planning + dependency-graph.json (add new stories)

8. Bob: create-story (ONE spawn — writes all NEW stories sequentially in one session)
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

### projects/projects-registry.json (Project Lead updates)

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
)' projects/projects-registry.json > tmp && mv tmp projects/projects-registry.json
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
