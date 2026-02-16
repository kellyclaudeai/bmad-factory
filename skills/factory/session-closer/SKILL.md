---
name: session-closer
description: Close/remove stale OpenClaw sessions (especially Project Lead project sessions) by pruning the session index and archiving transcripts; used when a project is Shipped/Done to keep the dashboard clean.
---

# session-closer

Use this when a project is **Shipped/Done** (or you explicitly want to close a Project Lead session) so it disappears from `sessions_list` and the factory dashboard.

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
