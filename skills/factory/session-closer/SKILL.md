---
name: session-closer
description: Close/remove stale OpenClaw sessions (any agent) by pruning the session index and archiving transcripts; used when a project is Shipped/Done or to clean up test/abandoned sessions.
---

# session-closer

**Generic session cleanup** - closes any OpenClaw session (Project Lead, main agent, or any other agent) by removing from session index and archiving transcripts.

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
Agent sessions are stored under:
- `~/.openclaw/agents/<agent>/sessions/sessions.json` (sessionKey → sessionId index)
- `~/.openclaw/agents/<agent>/sessions/<sessionId>.jsonl` (transcript)

Examples:
- **Project Lead:** `~/.openclaw/agents/project-lead/sessions/`
- **Main agent:** `~/.openclaw/agents/main/sessions/`
- **Other agents:** `~/.openclaw/agents/<agent-name>/sessions/`

"Closing" a session means:
1) Backup + remove the sessionKey entry from `sessions.json`
2) Archive transcript by renaming to `*.deleted.<timestamp>` (if present)
3) Restart the Gateway so UI/tools reflect the change immediately

## Commands

All commands support `--agent <agent-name>` to target a specific agent. Defaults to `project-lead` if not specified.

### Single Session Close
Close one session at a time (restarts gateway after each):
```bash
bin/close-project [--agent <agent>] <projectId|sessionKey>
```

**Project Lead examples:**
- `bin/close-project kelly-dashboard` (defaults to project-lead)
- `bin/close-project --agent project-lead meeting-time-tracker`

**Main agent examples:**
- `bin/close-project --agent main jason`
- `bin/close-project --agent main jason-dashupdate`
- `bin/close-project --session-key agent:main:matrix:channel:!wbxlmlrvmmzmzchiaf:austens-mac-mini.local`

### Batch Close
Close multiple sessions at once (single gateway restart at end):
```bash
bin/close-project-batch [--agent <agent>] <projectId1|sessionKey1> <projectId2|sessionKey2> ...
```

**Project Lead examples:**
- `bin/close-project-batch calculator-app daily-todo-tracker takeouttrap`
- `bin/close-project-batch fleai-market-v5 hydration-tracker meeting-time-tracker`

**Main agent examples:**
- `bin/close-project-batch --agent main jason jason-dashupdate`
- `bin/close-project-batch --agent main agent:main:matrix:channel:xyz agent:main:project-test`

**Mixed (same agent):**
- `bin/close-project-batch --agent main jason agent:main:matrix:channel:xyz` (project ID + full key)

**Batch mode is faster** when closing 3+ sessions (single gateway restart).

### Keep Only Specific Session(s)
Clean all sessions EXCEPT the ones you want to keep:
```bash
bin/keep-only-sessions [--agent <agent>] <projectId1|sessionKey1> <projectId2|sessionKey2> ...
```

**Project Lead examples:**
- `bin/keep-only-sessions kelly-dashboard` (removes all other project-lead sessions)
- `bin/keep-only-sessions kelly-dashboard meeting-tracker` (keeps both, removes others)

**Main agent examples:**
- `bin/keep-only-sessions --agent main jason` (removes all other main sessions)
- `bin/keep-only-sessions --agent main agent:main:jason agent:main:matt`

**Note:** Always keeps `agent:<agent>:main` (system session) regardless of what you specify.

This is useful for "fresh slate" scenarios where you want to archive everything except 1-2 active sessions.

## Session Key Formats

**For Project Lead sessions:**
- `agent:project-lead:<projectId>` (canonical)
- `agent:project-lead:project-<projectId>` (legacy)

Just pass the `<projectId>` (e.g., `kelly-dashboard`) and the script will try both formats.

**For other agents:**
- You can pass a project ID: `--agent main jason`
- Or a full session key: `--session-key agent:main:matrix:channel:xyz`

**Examples of full session keys:**
- `agent:main:jason` (simple session)
- `agent:main:project-test` (project-style naming)
- `agent:main:matrix:channel:!wbxlmlrvmmzmzchiaf:austens-mac-mini.local` (Matrix channel)
- `agent:main:matrix:direct:@user:server.local` (Matrix direct message)

## Notes

- **Backup:** sessions.json is backed up before modification (`.bak-<timestamp>`)
- **Transcripts:** Archived as `<sessionId>.jsonl.deleted.<timestamp>` (not deleted, just renamed)
- **Gateway restart:** Required for changes to take effect immediately in dashboard/sessions_list
- **System sessions:** `agent:<agent>:main` sessions are always preserved by `keep-only-sessions` (e.g., `agent:project-lead:main`, `agent:main:main`)
- **Agent parameter:** Defaults to `project-lead` for backward compatibility with existing scripts/workflows
