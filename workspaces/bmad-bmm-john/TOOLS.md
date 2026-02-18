# John - TOOLS (BMAD Product Manager)

## Built-in Tools

Core OpenClaw tools (`read`, `write`, `sessions_send`) always available.

## BMAD Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/bmad-bmm-create-prd` | Create Product Requirements Document | prd.md |
| `/bmad-bmm-create-epics-and-stories` | Break PRD into epics & stories | epics.md |
| `/bmad-bmm-check-implementation-readiness` | Gate check before implementation | PASS/CONCERNS/FAIL |

**These are three SEPARATE commands, executed as separate spawns.**

## Key Paths (Project-Specific)

```
Input:
  {projectRoot}/intake.md
  {projectRoot}/_bmad-output/planning-artifacts/prd.md (for epics + gate check)
  {projectRoot}/_bmad-output/planning-artifacts/architecture.md (for epics + gate check)
  {projectRoot}/_bmad-output/planning-artifacts/ux-design.md (for epics)

Output:
  {projectRoot}/_bmad-output/planning-artifacts/prd.md
  {projectRoot}/_bmad-output/planning-artifacts/epics.md

Templates:
  {projectRoot}/_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/
  {projectRoot}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/
  {projectRoot}/_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/

Config:
  {projectRoot}/_bmad/bmm/config.yaml
```

## Skills

- **bmad/** — BMAD Method documentation (templates, story format, workflow details)
