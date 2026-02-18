# Winston - TOOLS (BMAD Architect)

## Built-in Tools

Core OpenClaw tools (`read`, `write`, `sessions_send`) always available.

## BMAD Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/bmad-bmm-create-architecture` | Create technical architecture | architecture.md |

## Key Paths (Project-Specific)

```
Input:
  {projectRoot}/_bmad-output/planning-artifacts/prd.md
  {projectRoot}/_bmad-output/planning-artifacts/ux-design.md
  {projectRoot}/intake.md (tech stack requirements)

Output:
  {projectRoot}/_bmad-output/planning-artifacts/architecture.md

Templates:
  {projectRoot}/_bmad/bmm/workflows/3-solutioning/create-architecture/

Config:
  {projectRoot}/_bmad/bmm/config.yaml
```

## Skills

- **bmad/** — BMAD Method documentation (architecture structure)
- **firebase-cli/** — Firebase setup (if project uses Firebase)
