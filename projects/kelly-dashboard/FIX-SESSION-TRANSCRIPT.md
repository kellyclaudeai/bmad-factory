# Fix: Project Lead Session Transcript Display

## Problem
When clicking into a Project Lead session (e.g., `agent:project-lead:project-kelly-dashboard`), the Session Logs section displayed:
```
⚠️ Transcript file not found
```

The dashboard was constructing an incorrect path:
```
~/.openclaw/sessions/agent:project-lead:project-kelly-dashboard/transcript.jsonl
```

## Root Cause
OpenClaw stores agent session transcripts by **sessionId**, not by session key:
- Session key: `agent:project-lead:project-kelly-dashboard`
- Session ID: `43708c92-e082-425b-9726-581eb278742b`
- **Actual path**: `~/.openclaw/agents/project-lead/sessions/43708c92-e082-425b-9726-581eb278742b.jsonl`

The `logs-section.tsx` component only handled:
1. Subagent sessions (with `:subagent:` in the key)
2. Fallback path using session key (which was incorrect for project-lead sessions)

## Solution

### 1. Extended Sessions API (`/app/api/sessions/route.ts`)
- Added `sessionId` to `FrontendSession` type
- Included `sessionId` in API response

### 2. Created Session Detail API (`/app/api/sessions/[sessionKey]/route.ts`)
- New endpoint to fetch session details by sessionKey
- Returns sessionId, transcriptPath, and metadata

### 3. Updated LogsSection (`/components/subagent-view/logs-section.tsx`)
- Added `fetchSessionId()` helper to call the new API
- Added handling for `agent:*` sessions (not just subagents)
- Constructs correct path: `~/.openclaw/agents/{agentType}/sessions/{sessionId}.jsonl`

## How It Works Now

For a session key like `agent:project-lead:project-kelly-dashboard`:

1. Component recognizes it starts with `agent:` (but isn't a subagent)
2. Extracts agent type: `project-lead`
3. Calls API to fetch sessionId: `43708c92-e082-425b-9726-581eb278742b`
4. Constructs path: `~/.openclaw/agents/project-lead/sessions/43708c92-e082-425b-9726-581eb278742b.jsonl`
5. Reads and displays the last 10 lines

## Testing
```bash
# Verify transcript exists
tail -5 ~/.openclaw/agents/project-lead/sessions/43708c92-e082-425b-9726-581eb278742b.jsonl

# Test the fix by navigating to:
# http://localhost:3000/session/agent%3Aproject-lead%3Aproject-kelly-dashboard
```

## Files Changed
1. `app/api/sessions/route.ts` - Added sessionId to response
2. `app/api/sessions/[sessionKey]/route.ts` - New endpoint (created)
3. `components/subagent-view/logs-section.tsx` - Fixed path construction logic

## Deployment
Changes are in the working tree. Next steps:
1. Test in dev server (should auto-reload)
2. Verify Project Lead session logs display correctly
3. Commit and merge to main branch
