# Story 15.2: Fix Active Subagent Title Consistency

## Problem
Active subagent cards sometimes show title/story name, sometimes don't. Inconsistent data structure:
- kelly-dashboard subagents use `story` field (string like "Story 14.5: Fix SSR...")
- fleai-market-v4 subagents use `storyTitle` field (string like "Initialize Next.js Project...")
- Some subagents have neither (legacy format)

## Requirements
Active subagent cards should ALWAYS show a meaningful title:
1. Priority: `storyTitle` field (structured BMAD format)
2. Fallback: `story` field (legacy format)
3. Fallback: `task` field formatted (e.g., "implement-story-1.4" → "Implement Story 1.4")
4. Final fallback: `{persona} ({role})` or "Unnamed Subagent"

## Current Code
`components/project-view/subagent-card.tsx`:
```typescript
const displayName = persona && role 
  ? `${persona} (${role})` 
  : story || 'Unnamed Subagent'
```

This prioritizes persona+role OVER story, which is wrong for active subagents.

## Implementation
Update `SubagentCard` component:
1. Change displayName logic to prioritize story/storyTitle
2. Add formatting for task field (split on `-`, titlecase)
3. Use persona+role only as final fallback

```typescript
const displayName = 
  storyTitle ||
  story ||
  (task ? formatTask(task) : null) ||
  (persona && role ? `${persona} (${role})` : 'Unnamed Subagent')
```

## Files to Modify
- `components/project-view/subagent-card.tsx` - Update displayName logic

## Acceptance Criteria
- [x] fleai-market-v4 active subagent shows "Set Up Supabase Authentication" (from storyTitle)
- [x] kelly-dashboard historical subagents show "Story 14.5: Fix SSR..." (from story)
- [x] Task-only subagents show formatted task name
- [x] No "Unnamed Subagent" for any active subagent with data

## Branch
`barry-fix-subagent-titles`

## Testing
1. View fleai-market-v4 active subagent (should show storyTitle)
2. View kelly-dashboard historical subagents (should show story field)
3. Verify all cards have meaningful titles
