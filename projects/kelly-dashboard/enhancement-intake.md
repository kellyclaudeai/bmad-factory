# Kelly Dashboard - Enhanced Subagent Detail View

## Project Type
Fast Track - Barry Implementation

## Overview
Enhance the subagent/session detail view to show more granular information about completed subagents, including persona details, precise timestamps, and log locations.

## Current State
- Session detail page at `/session/[sessionKey]/page.tsx` exists
- Shows: status, model, tokens, duration, artifacts
- Missing: persona/role, exact timestamps, log locations

## Requirements

### 1. Persona & Role Display
Add persona and role information to session detail header:
- Show "Persona: Barry (Developer)" when available
- Show "Persona: John (Product Manager)" for planning agents
- Fall back to current display if persona not available

### 2. Enhanced Timestamp Display
Replace simple "Started" / "Completed" with precise timestamps:
- Start time: Show both absolute (e.g., "Feb 16, 2026 1:45:32 PM CST") and relative (e.g., "2 hours ago")
- End time: Show both absolute and relative
- Duration: Keep current format (e.g., "5m 23s")

### 3. Log Location Section
Add new card showing where to find logs:
- Session transcript path: `~/.openclaw/sessions/{sessionKey}/transcript.jsonl`
- Link to open in file browser or copy path
- Show last 10 lines of transcript as preview (if file exists)
- Show "Transcript not available" if file doesn't exist

### 4. Update project-state.json Schema (Reference)
When Project Lead spawns subagents in the future, they should write:
```json
{
  "persona": "Barry",
  "role": "Developer", 
  "task": "implement-story-3",
  "sessionKey": "agent:...",
  "status": "active",
  "startedAt": "2026-02-16T19:00:00Z"
}
```

This task only handles the UI display - Project Lead updates are handled separately.

## Deliverables
- Enhanced session detail page showing persona/role
- Precise timestamp display (absolute + relative)
- Logs section with transcript path and preview
- Graceful degradation for old data format (no persona field)

## Fast Track
fast_track: true

## Implementation Notes
- Use Next.js server components for file system access (transcript reading)
- Add error handling for missing transcript files
- Keep terminal aesthetic (green/amber colors)
- Maintain responsive design
