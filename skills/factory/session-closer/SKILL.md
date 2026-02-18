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
- **Batch cleanup:** Clean multiple sessions at once (faster, single gateway restart)

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

"Closing" a session means:
1) Backup + remove the sessionKey entry from `sessions.json`
2) Archive transcript by renaming to `*.deleted.<timestamp>` (if present)
3) Restart the Gateway so UI/tools reflect the change immediately

## Commands

### Single Session Close
Close one session at a time (restarts gateway after each):
```bash
bin/close-project <projectId>
```

Examples:
- `bin/close-project kelly-dashboard`
- `bin/close-project meeting-time-tracker`

### Batch Close
Close multiple sessions at once (single gateway restart at end):
```bash
bin/close-project-batch <projectId1> <projectId2> <projectId3> ...
```

Examples:
- `bin/close-project-batch calculator-app daily-todo-tracker takeouttrap`
- `bin/close-project-batch fleai-market-v5 hydration-tracker meeting-time-tracker`

**Batch mode is faster** when closing multiple sessions (3+ sessions = use batch).

### Keep Only Specific Session(s)
Clean all sessions EXCEPT the ones you want to keep:
```bash
bin/keep-only-sessions <projectId1> <projectId2> ...
```

Examples:
- `bin/keep-only-sessions kelly-dashboard` (removes all others)
- `bin/keep-only-sessions kelly-dashboard meeting-tracker` (keeps both, removes others)

This is useful for "fresh slate" scenarios where you want to archive everything except 1-2 active projects.

## Session Key Formats

The scripts support both canonical and legacy formats:
- `agent:project-lead:<projectId>` (canonical)
- `agent:project-lead:project-<projectId>` (legacy)

Just pass the `<projectId>` (e.g., `kelly-dashboard`) and the script will try both formats.

## Notes

- **Backup:** sessions.json is backed up before modification (`.bak-<timestamp>`)
- **Transcripts:** Archived as `<sessionId>.jsonl.deleted.<timestamp>` (not deleted, just renamed)
- **Gateway restart:** Required for changes to take effect immediately in dashboard/sessions_list
- **agent:project-lead:main:** Never cleaned (system session)
