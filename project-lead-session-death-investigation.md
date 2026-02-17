# Project Lead Session Death Investigation

**Date:** 2026-02-17  
**Investigator:** Kelly  
**Trigger:** User reported Story 15.4.2 completion not notified to Kelly

---

## Summary

**Problem:** Project Lead sessions are updating project-state.json files successfully but failing to notify Kelly of completions, then becoming unresponsive or timing out.

**Root Cause:** **Path confusion** - Project Lead is looking for `project-state.json` in their WORKSPACE (`/Users/austenallred/clawd/workspaces/project-lead/`) instead of in the PROJECT directory (`/Users/austenallred/clawd/projects/{projectId}/project-state.json`).

---

## Evidence

### kelly-dashboard (Session: 1e1776bd-be2c-4dd3-ae27-123998ec9cfd)

**Timeline:**
- **10:52 AM CST:** Story 15.4.2 completes, project-state.json updated in `/Users/austenallred/clawd/projects/kelly-dashboard/`
- **10:57 AM CST:** Kelly sends status check asking why no notification
- **Response:** Project Lead tries to read `project-state.json` from WORKSPACE: `/Users/austenallred/clawd/workspaces/project-lead/project-state.json`
- **Result:** `ENOENT: no such file or directory`
- **Session State:** Confused, searching for files in wrong location, never notified Kelly

**Transcript excerpt:**
```json
{"type":"toolCall","id":"toolu_01XtZsEc6mfTV7Q6DgBEw7yB","name":"read","arguments":{"path":"/Users/austenallred/clawd/workspaces/project-lead/project-state.json"}}
{"type":"toolResult","toolCallId":"toolu_01XtZsEc6mfTV7Q6DgBEw7yB","toolName":"read","content":[{"type":"text","text":"{\n  \"status\": \"error\",\n  \"tool\": \"read\",\n  \"error\": \"ENOENT: no such file or directory, access '/Users/austenallred/clawd/workspaces/project-lead/project-state.json'\"\n}"}]}
```

### fleai-market-v4 (Session: 8848c0e3-5e5d-4e97-8ac1-b5fd8d636777)

**Timeline:**
- **Multiple story completions:** Wave 4 (9 stories), Wave 5 (3 stories)
- **11:00 AM CST:** Project Lead still trying to work, but session timing out on all messages (30s timeout)
- **Memory Log:** Uses `implementation-state.md` instead of `project-state.json`
- **Session State:** Completely unresponsive, operator reports "timing out on all messages"

**Observation:** This session has a different tracking file (`implementation-state.md`) but also exhibits path confusion when asked about specific stories.

---

## Pattern Analysis

### Common Failure Mode

1. **Barry completes story** → Updates `/Users/austenallred/clawd/projects/{projectId}/project-state.json`
2. **Project Lead should notify Kelly** → But doesn't
3. **When asked about completion** → Looks in WRONG location (`/workspaces/project-lead/`)
4. **File not found** → Session gets confused, never recovers
5. **Result:** Notification never sent, session becomes unresponsive

### Why Sessions Die/Hang

**Hypothesis:**
- Project Lead doesn't have a clear understanding of WHERE project state lives
- When completion detection logic runs, it's checking the wrong directory
- File-not-found errors cause the session to get stuck in error-handling loops
- Eventually the session times out or becomes non-responsive

---

## Technical Details

### Path Architecture

**Correct paths:**
- Project state: `/Users/austenallred/clawd/projects/{projectId}/project-state.json`
- Project directory: `/Users/austenallred/clawd/projects/{projectId}/`
- Story files: `/Users/austenallred/clawd/projects/{projectId}/_bmad-output/implementation-artifacts/stories/`

**Incorrect paths (what Project Lead is using):**
- Workspace root: `/Users/austenallred/clawd/workspaces/project-lead/`
- This directory contains: `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `HEARTBEAT.md`, `memory/`, `implementation-state.md`
- **NO project-state.json files exist here**

### Missing Context

Project Lead sessions need:
1. **Explicit projectId tracking** - Know which project they're managing
2. **Correct project directory path** - `/Users/austenallred/clawd/projects/{projectId}/`
3. **Project state file path** - `{projectDir}/project-state.json`
4. **Completion detection logic** - Check subagents array in project-state.json for new completions
5. **Notification trigger** - When new completion detected → message Kelly

---

## Impact

### Active Projects Affected

- **kelly-dashboard:** Story 15.4.2 complete but not surfaced to user
- **fleai-market-v4:** Session completely dead (30s timeout), Wave 5 complete but uncommitted/unsurfaced

### Workflow Breakdown

**Intended flow:**
```
Barry completes → Updates project-state.json → PL detects completion → PL notifies Kelly → Kelly surfaces to user
```

**Actual flow:**
```
Barry completes → Updates project-state.json → PL checks wrong directory → File not found → PL gets stuck → Kelly never notified
```

---

## Recommended Fixes

### Immediate (Critical)

1. **Add projectId context to Project Lead sessions**
   - Pass projectId explicitly in session spawn or env
   - Store in session memory/state
   - Use for all file path construction

2. **Fix path construction**
   - Change: `~/workspaces/project-lead/project-state.json`
   - To: `~/projects/{projectId}/project-state.json`

3. **Add completion polling**
   - Project Lead should periodically check project-state.json for new completions
   - Compare last-known state vs current state
   - Trigger notification on new entries in subagents array

4. **Add heartbeat health checks**
   - Project Lead should respond to heartbeat with "alive + last activity"
   - If no response in 60s → Kelly escalates (session dead)

### Medium Priority

1. **Improve error recovery**
   - File-not-found shouldn't kill the session
   - Log error, notify Kelly, but continue operating

2. **Standardize state tracking**
   - Either use `project-state.json` everywhere OR `implementation-state.md`
   - Don't mix approaches (fleai-market has `implementation-state.md`, kelly-dashboard has `project-state.json`)

3. **Add session instrumentation**
   - Log all file reads/writes with timestamps
   - Track notification attempts
   - Make debugging easier

### Long-term

1. **Centralized project state service**
   - Single source of truth for project status
   - Project Lead queries service instead of reading files
   - Eliminates path confusion

2. **Explicit notification protocol**
   - Project Lead must ACK completions back to Kelly
   - Kelly tracks pending notifications
   - Retry logic if no ACK in 5 minutes

3. **Session lifecycle management**
   - Auto-restart dead Project Lead sessions
   - Preserve context across restarts
   - Graceful degradation when sessions fail

---

## Next Steps

**Priority 1:** Fix path confusion in Project Lead agent config  
**Priority 2:** Add explicit projectId tracking to all Project Lead sessions  
**Priority 3:** Implement completion polling loop in Project Lead HEARTBEAT.md  
**Priority 4:** Test with both kelly-dashboard and fleai-market-v4 recovery

---

## Notes

- This is a **critical reliability issue** - completions are happening but going unreported
- User QA is blocked because surfacing mechanism is broken
- Affects ALL projects using Project Lead orchestration
- Should be fixed before spawning new projects

---

**Investigation Status:** Complete  
**Root Cause:** Identified (path confusion)  
**Fix Status:** Recommendations documented, awaiting operator direction
