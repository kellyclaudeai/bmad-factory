---
name: project-lead-instantiator
description: Create/reuse a standalone per-project Project Lead session using a deterministic project-named session key (agent:project-lead:<projectId>), update Kelly’s registry + project-state.json, and print the exact openclaw commands (tui + agent). Use when Kelly needs to start/route a project to Project Lead without spawning subagents.
---

# Project Lead Instantiator

Use this when you need a **standalone per-project Project Lead session** (not `sessions_spawn`).

## What it does

- Allocates (or reuses) a **project-named session key** for `projectId`:
  - `agent:project-lead:<projectId>`
- Writes/updates Kelly-owned registry:
  - `~/.openclaw/workspace-kelly/project-lead-registry.json`
- Optionally writes the mapping into the project’s `project-state.json`
- Prints:
  - the `openclaw tui --session ... --message ...` command (creates/starts session)
  - the `openclaw agent --agent project-lead --message ...` or `openclaw tui --session ...` follow-up command(s)

## CLI

Prefer running the bundled CLI:

```bash
skills/factory/project-lead-instantiator/bin/pl-instantiate \
  --project-id kelly-dashboard \
  --project-dir /Users/austenallred/clawd/projects/kelly-dashboard
```

Then copy/paste the printed commands.

## Notes

- This skill is meant for **Kelly / Kelly-Improver** operational use.
- This does **not** create chat rooms.
- It uses a project-named session key so the project id is visible in session lists.
