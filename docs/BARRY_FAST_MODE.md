# Barry Fast Mode (Software Factory)

Barry Fast Mode is a lightweight orchestration pattern for OpenClaw to reduce thrash on multi-step implementations.

## When to use

Use Barry Fast Mode when:
- A project needs a **clear plan** and then **fast parallel execution** (2–4 independent workstreams).
- There’s repeated context switching (auth + backend + UI + env wiring).
- You want a single “integrator” step at the end to merge + verify.

Avoid it when:
- The task is linear and small.
- Changes are risky/destructive and require human confirmation at each step.

## Roles

### 1) Barry-Planner (one sub-agent)
Responsibilities:
- Read repo state + current blockers.
- Choose the **target architecture** (must be explicit).
- Produce a short execution plan split into **independent workstreams**.
- Define success criteria (what “working end-to-end” means).

Output format (recommended):
- Goal
- Assumptions
- Workstreams (W1…Wn)
- Merge/integration steps
- Verification checklist

### 2) Barry-Executors (parallel sub-agents)
Each executor takes exactly one workstream and is responsible for:
- Making changes in its scope.
- Keeping changes small and reviewable.
- Writing down any manual/UI steps needed (ideally none; if unavoidable, specify exact clicks).
- Committing changes in isolated commits (or providing a patch summary for the integrator).

### 3) Integrator (can be main agent or a dedicated sub-agent)
Responsibilities:
- Resolve overlaps/merge conflicts.
- Run end-to-end verification.
- Produce final “how to run it” instructions.

## Typical workstreams

- Backend provisioning (Firebase/Supabase) + env output
- Auth/OAuth setup (CLI-first; UI automation as fallback)
- App wiring (SDKs, env vars, callbacks)
- End-to-end test harness / smoke test

## Operational notes (OpenClaw)

- Use `sessions_spawn` to create the planner and executors.
- Keep workstreams **truly independent** to avoid duplicated/conflicting edits.
- If a workstream requires browser UI automation:
  - Prefer Chrome Relay with an attached driver tab.
  - Stay in a single tab; navigate in-place to avoid attachment churn.

## Example: meeting-time-tracker decision A

Architecture decision:
- Port `projects/meeting-time-tracker-web` to Firebase (use existing GCP/Firebase project `meeting-time-tracker-aaf`).

Workstreams:
- W1: Provision/verify Firebase project + web app config output
- W2: Auth wiring in Next.js (Firebase Auth Google)
- W3: Calendar sync backend/service wiring (if applicable)
- W4: End-to-end login smoke test + docs
