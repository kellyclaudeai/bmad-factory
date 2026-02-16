---
name: session-closer
description: Close/remove stale OpenClaw sessions (especially Project Lead project sessions) by pruning the session index and archiving transcripts; used when a project is Shipped/Done to keep the dashboard clean.
---

# session-closer

**Generic session cleanup** - closes any OpenClaw session (Project Lead, isolated agents, etc.) by removing from session index and archiving transcripts.

## When to Use

- **Shipped projects:** Close Project Lead session when project is complete
- **Stale sessions:** Remove abandoned or completed sessions
- **Dashboard cleanup:** Make sessions disappear from `sessions_list`

## Relation to project-closer

**session-closer** handles session cleanup only (generic, any session type).

**project-closer** handles full project termination (calls session-closer + deletes project directory + updates factory state).

Use:
- **session-closer** when you ONLY want to close a session (keep project files)
- **project-closer** when you want COMPLETE project cleanup (session + directory + state)

## What it changes
Project Lead sessions are stored under:
- `~/.openclaw/agents/project-lead/sessions/sessions.json` (sessionKey → sessionId index)
- `~/.openclaw/agents/project-lead/sessions/<sessionId>.jsonl` (transcript)

“Closing” a session means:
1) Backup + remove the sessionKey entry from `sessions.json`
2) Archive transcript by renaming to `*.deleted.<timestamp>` (if present)
3) Restart the Gateway so UI/tools reflect the change immediately

## Commands
- Close by project id:
  - `bin/close-project <projectId>`

Examples:
- `bin/close-project kelly-dashboard`
- `bin/close-project meeting-time-tracker`

If `projectId` is ambiguous, ask the operator for the exact slug (folder name under `~/clawd/projects/`).
