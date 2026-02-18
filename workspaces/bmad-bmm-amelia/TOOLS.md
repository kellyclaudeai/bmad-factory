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

## CLI-First Policy (CRITICAL)

**Default to CLI tools. Use browser automation ONLY as absolute last resort.**

### Always Use CLI When Available

- **Firebase/GCP:** Use `firebase` and `gcloud` CLIs (see firebase-cli skill)
  - ✅ Create projects: `gcloud projects create` + `firebase projects:addfirebase`
  - ✅ Enable APIs: `gcloud services enable`
  - ✅ Create web apps: `firebase apps:create web`
  - ✅ Get SDK config: `firebase apps:sdkconfig web`
  - ✅ Init Firestore: `firebase init firestore`
  - ❌ **Only needs browser:** Creating custom OAuth clients with redirect URIs (rare)

- **Vercel:** Use `vercel` CLI for project creation, deployment, env vars
- **GitHub:** Use `gh` CLI for repos, issues, PRs, actions
- **AWS:** Use `aws` CLI for S3, Lambda, CloudFormation
- **Database migrations:** Use ORM CLIs (Prisma, Drizzle, Sequelize)
- **Package management:** npm/yarn/pnpm CLIs only

### When Browser is Acceptable

- Custom OAuth client creation (no API exists)
- One-time account setup (if CLI login is blocked)
- Visual design QA (screenshot/video capture for human review)
- CAPTCHA/2FA flows (no CLI bypass)

### Why This Matters

- **Speed:** CLI is 5-10x faster than browser automation
- **Reliability:** No DOM selectors breaking, no timing issues
- **Debugging:** CLI errors are explicit; browser failures are opaque
- **Cost:** Browser automation burns more tokens and time

**If a story instructs you to use the console/UI and a CLI exists, OVERRIDE the story and use CLI.** Document the change in your completion notes.

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
