# Session Detail Fixes

## Issue 1: Story Title Not Showing
Amelia subagents have `storyId` and `storyTitle` fields in project-state.json but the session detail page only looks for `story`. Need to:
- Read `storyId` and `storyTitle` from project-state.json
- Display as "Story E1-S1: Initialize Next.js Application with TypeScript and Tailwind" instead of just "Task: Dev Story"

## Issue 2: Transcript Path Wrong
Current code looks for: `~/.openclaw/sessions/{sessionKey}/transcript.jsonl`
But transcripts are stored at: `~/.openclaw/agents/{agent-type}/sessions/{sessionId}.jsonl`

Need to:
- Get sessionId from OpenClaw's /api/sessions endpoint by matching sessionKey
- Use that sessionId to build correct transcript path based on agent type
- For bmad-bmm-amelia: `~/.openclaw/agents/bmad-bmm-amelia/sessions/{sessionId}.jsonl`

## Files to Update
1. `app/session/[sessionKey]/page.tsx` - Add storyId/storyTitle to SessionData interface and getSessionData
2. `app/session/[sessionKey]/page.tsx` - Update display logic to show storyTitle
3. `components/subagent-view/logs-section.tsx` - Fix transcript path resolution
4. Add new API endpoint or helper to resolve sessionKey → sessionId + agent type
