# Barry - TOOLS (BMAD Quick Flow Solo Dev)

## Built-in Tools

Core OpenClaw tools (`read`, `exec`, `write`, `sessions_send`) always available.

## BMAD Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/bmad-bmm-quick-spec` | Create lean tech spec | tech-spec.md |
| `/bmad-bmm-quick-dev` | Implement a story | Code + git commit |

## Codex CLI

- **MANDATORY:** Use for ALL code implementation
- PTY mode required: `pty: true`
- Flags: `--full-auto` for builds, `--yolo` for fixes

## Git Workflow

- **Branch:** `dev` only (never push to `main`)
- **Before work:** `git pull origin dev`
- **After work:** `git add -A && git commit -m "feat({N}): {title}" && git push origin dev`

## Key Paths (Project-Specific)

```
Tech spec:  {projectRoot}/_bmad-output/quick-flow/tech-spec.md
Intake:     {projectRoot}/intake.md
BMAD:       {projectRoot}/_bmad/bmm/workflows/bmad-quick-flow/
```

## Skills

- **coding-agent/** — Codex CLI invocation patterns
- **bmad/** — BMAD Method documentation
