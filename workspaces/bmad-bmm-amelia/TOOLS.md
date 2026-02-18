# Amelia - TOOLS (BMAD Developer)

## Built-in Tools

Core OpenClaw tools (`read`, `exec`, `write`, `sessions_send`) always available.

## BMAD Commands

| Command | Purpose |
|---------|---------|
| `/bmad-bmm-dev-story` | Implement a story |
| `/bmad-bmm-code-review` | Adversarial code review |

## Codex CLI

- **MANDATORY:** Use for ALL code implementation (you orchestrate, Codex codes)
- PTY mode required: `pty: true`
- Flags: `--full-auto` for builds, `--yolo` for fixes
- Always `background: true` for long-running work

## CLI-First Policy

**Use CLI tools. Browser only if no CLI exists.**

- Firebase/GCP: `gcloud` and `firebase` CLIs (see firebase-cli skill)
- Vercel: `vercel` CLI
- GitHub: `gh` CLI
- Database migrations: ORM CLIs

**If a story says browser but CLI exists:** Override the story and use CLI. Document in completion notes.

## Git Workflow

- **Branch:** `dev` only (never push to `main`)
- **Before work:** `git pull origin dev`
- **After work:** `git add -A && git commit -m "feat({N.M}): {title}" && git push origin dev`
- **If push fails:** `git pull --rebase origin dev` then retry

## Key Paths (Project-Specific)

```
Story files:    {projectRoot}/_bmad-output/implementation-artifacts/stories/story-{N.M}.md
Architecture:   {projectRoot}/_bmad-output/planning-artifacts/architecture.md
PRD:            {projectRoot}/_bmad-output/planning-artifacts/prd.md
Sprint status:  {projectRoot}/_bmad-output/implementation-artifacts/sprint-status.yaml
BMAD workflows: {projectRoot}/_bmad/bmm/workflows/
```

## Skills

- **coding-agent/** — Codex CLI invocation patterns
- **bmad/** — BMAD Method documentation (story format, workflow details)
