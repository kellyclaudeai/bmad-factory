# Story 15.3: Add "Next: Queued Stories" Section

## Problem
No visibility into upcoming work. Users can see active/completed subagents but not what's queued to start next.

## Requirements
Add new section to Project Details page showing queued stories:
1. Read from `stories-parallelization.json` (or `planningArtifacts.storiesJson` path)
2. Show stories with status: pending/queued
3. Display in dependency order (stories ready to start shown first)
4. Include story ID, title, and dependencies

## Data Source
`/Users/austenallred/clawd/projects/{projectId}/stories-parallelization.json`:
```json
{
  "stories": [
    {
      "id": "1.5",
      "title": "Create User Registration Flow",
      "dependsOn": ["1.4"],
      "complexity": "medium",
      "estimatedMinutes": 15
    }
  ]
}
```

## Implementation
1. Create new component: `components/project-view/queued-stories.tsx`
2. Read stories-parallelization.json in ProjectDetail page
3. Filter stories where:
   - All dependencies complete (from project-state.json)
   - Story not yet started (not in subagents array)
4. Display as cards similar to SubagentCard (but status: queued)

## Display Format
```
Next: Queued Stories
┌─────────────────────────────────┐
│ 1.5: Create User Registration   │
│ Status: Ready (deps complete)   │
│ Est: 15m | Complexity: medium   │
│ Depends on: 1.4 ✓               │
└─────────────────────────────────┘
```

## Files to Create/Modify
- `components/project-view/queued-stories.tsx` - New component
- `app/project/[id]/page.tsx` - Read stories JSON, pass to component
- Possibly `components/project-view/subagent-card.tsx` - Extend for queued display

## Graceful Degradation
If `stories-parallelization.json` doesn't exist:
- Show message: "Queued stories data not available (planning incomplete)"
- Don't error/crash

## Acceptance Criteria
- [x] fleai-market-v4 shows queued stories (has stories-parallelization.json)
- [x] kelly-dashboard shows "no queued stories" message (file missing)
- [x] Stories display in ready-first order
- [x] Dependency status shown clearly
- [x] No errors if file missing

## Branch
`barry-add-queued-stories`

## Testing
1. View fleai-market-v4 project details
2. Verify queued stories section appears with correct data
3. Verify dependencies marked correctly
4. View kelly-dashboard (no stories file) - verify graceful message
