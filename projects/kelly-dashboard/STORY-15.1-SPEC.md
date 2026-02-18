# Story 15.1: Fix Project Details Timing Display

## Problem
Project details page shows incorrect/inconsistent timing information:
- Runtime calculation uses session lastActivity (unreliable)
- No start time displayed
- No ETA shown
- fleai-market-v4 shows "Runtime: 0s" despite active implementation

## Requirements
Display accurate timing information:
1. **Start Time**: Read from `project-state.json` `startedAt` or `createdAt` field
2. **Total Runtime**: Calculate from start time to now (or `completedAt` if done)
3. **ETA**: Estimate based on:
   - Average story completion time (if available)
   - Remaining stories count
   - Show "N/A" if insufficient data

## Implementation
Modify `app/project/[id]/page.tsx`:
1. Replace `runtimeSeconds` calculation with project-state-based logic
2. Add ETA calculation function
3. Pass timing data to ProjectHeader or create new timing section component

## Data Sources
- **Start Time**: `projectState.startedAt || projectState.createdAt`
- **Completion Time**: `projectState.completedAt || projectState.implementationCompletedAt`
- **Stories**: `projectState.subagents` (filter status: complete/active/pending)
- **Average Story Time**: Calculate from completed subagents with duration field

## Display Format
```
Start Time: Feb 16, 2026 11:18 PM CST
Total Runtime: 1h 15m 23s
ETA: ~45m remaining (12 stories queued)
```

## Files to Modify
- `app/project/[id]/page.tsx` - Timing calculation logic
- Possibly `components/project-view/project-header.tsx` - Display timing info

## Acceptance Criteria
- [x] Start time displays correctly for all projects
- [x] Runtime shows elapsed time from start (not session lastActivity)
- [x] ETA displays when stories data available
- [x] Completed projects show total duration (not ongoing timer)

## Branch
`barry-fix-timing-display`

## Testing
1. View fleai-market-v4 project details (active project)
2. View kelly-dashboard project details (completed project)
3. Verify timing displays correctly for both
