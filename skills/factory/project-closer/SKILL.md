# Project Closer

## Purpose

**Completely terminate and clean up a project** including:
- Project directory deletion
- Project Lead session closure
- Session index cleanup
- Transcript archival
- Factory state updates
- Memory documentation

Use when:
- Project is complete and shipped
- Project is terminated due to failure/restart
- Project is archived/deprecated
- Complete cleanup is required

## Usage

### From Kelly Improver or Project Lead

```javascript
exec({
  command: `bash /Users/austenallred/clawd/skills/factory/project-closer/close-project.sh ${projectId} "${reason}"`
})
```

### Parameters

- `projectId`: The project identifier (e.g., "fleai-market", "kelly-dashboard")
- `reason`: Termination reason (e.g., "BMAD compliance violation", "Project complete", "Restart required")

### Example

```javascript
exec({
  command: `bash /Users/austenallred/clawd/skills/factory/project-closer/close-project.sh fleai-market "BMAD template compliance violation - full restart required"`
})
```

## What It Does

### 1. Project Directory Cleanup
- Archives project directory to timestamped backup (optional)
- Deletes project directory: `/Users/austenallred/clawd/projects/{projectId}/`
- Validates deletion

### 2. Session Cleanup (delegates to session-closer)
- Closes Project Lead session: `agent:project-lead:project-{projectId}`
- Archives active transcript to `.terminated.{timestamp}`
- Removes session from project-lead sessions.json
- Validates session closure

### 3. State Updates
- Updates `/Users/austenallred/clawd/factory-state.md`:
  - Marks project as TERMINATED
  - Documents termination reason
  - Records timestamp
  - Preserves lessons learned
- Preserves original project metadata for reference

### 4. Memory Documentation
- Appends termination record to `/Users/austenallred/clawd/memory/YYYY-MM-DD.md`:
  - Timestamp
  - Project ID
  - Termination reason
  - Artifacts deleted
  - Lessons learned (if provided)

## Output

The script outputs:
```
✅ Project Closure Complete: {projectId}

Deleted:
- Directory: /Users/austenallred/clawd/projects/{projectId}/
- Session: agent:project-lead:project-{projectId}
- Transcript: archived to {sessionId}.jsonl.terminated.{timestamp}

Updated:
- factory-state.md (project marked TERMINATED)
- memory/{date}.md (termination documented)

Reason: {reason}
```

## Error Handling

If any step fails:
- Continue with remaining steps (best-effort cleanup)
- Report which steps failed
- Manual cleanup instructions provided

Common failures:
- Project directory doesn't exist (already deleted) → Continue
- Session doesn't exist (already closed) → Continue
- State files missing → Create and update

## Relation to session-closer

**project-closer** is project-specific and calls **session-closer** for session cleanup:

```
project-closer (project scope)
  ├── Delete project directory
  ├── Call session-closer (session scope)
  │   ├── Archive transcript
  │   ├── Remove from sessions.json
  │   └── Validate closure
  ├── Update factory-state.md
  └── Document in memory
```

**session-closer** remains generic (can close any session type).
**project-closer** is specifically for Project Lead projects with full cleanup.

## Safety Features

- **Backup option**: Can create timestamped backup before deletion
- **Validation**: Confirms each step completed
- **Best-effort**: Continues even if some steps fail
- **Documentation**: Always documents termination in memory

## Recovery

If project needs to restart after termination:
1. Termination reason documented in factory-state.md
2. Lessons learned preserved in memory
3. Business plan preserved in `/Users/austenallred/clawd/business-plans/`
4. Archived transcript available for forensics

## Notes

- Does NOT close subagent sessions (those are cleanup="delete" and auto-terminate)
- Does NOT delete business plans (preserved for restart)
- Does NOT touch other projects
- Safe to run multiple times (idempotent)
