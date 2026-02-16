---
name: project-lead-instantiator
description: Create/reuse a standalone per-project Project Lead session using a deterministic virtual peer, update Kelly’s registry + project-state.json, and print the exact openclaw commands (agent + tui). Use when Kelly needs to start/route a project to Project Lead without spawning subagents.
---

# Project Lead Instantiator

Use this when you need a **standalone per-project Project Lead session** (not `sessions_spawn`).

## What it does

- Allocates (or reuses) a **virtual peer** (fake E.164 number) for `projectId`
- Writes/updates Kelly-owned registry:
  - `~/.openclaw/workspace-kelly/project-lead-registry.json`
- Optionally writes the mapping into the project’s `project-state.json`
- Prints:
  - the `openclaw agent --agent project-lead --to ... --message ...` command
  - the `openclaw tui --session ...` command

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
- This does **not** create chat rooms. It uses virtual peers.
