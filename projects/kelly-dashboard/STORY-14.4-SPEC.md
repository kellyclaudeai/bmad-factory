# Story 14.4: Fix Project Detail Sections

## Problem
Project detail page has duplicate/conflicting subagent displays:
1. Three session-based sections (Active/Queued/Completed Subagents) - reads from sessions API
2. SubagentGrid component - reads from project-state.json

History section in SubagentGrid is collapsed by default, hiding completed subagents.

## Requirements
1. Remove session-based sections from project detail page:
   - Active Subagents
   - Queued Subagents  
   - Completed Subagents
2. Keep only SubagentGrid component (authoritative source: project-state.json)
3. Set History section in SubagentGrid to expanded by default
4. Verify all subagent history visible on page load without expansion

## Files to Modify
- `app/projects/[id]/page.tsx` - Remove session-based sections, keep SubagentGrid
- `components/project-view/subagent-grid.tsx` - Change History section initialOpen to true

## Acceptance Criteria
- [x] Project detail page shows only SubagentGrid
- [x] History section expanded by default
- [x] All completed subagents visible on load
- [x] No duplicate sections
- [x] Terminal aesthetic preserved

## Branch
`barry-fix-project-sections`

## Testing
1. Navigate to kelly-dashboard project detail
2. Verify History section open on load
3. Verify all 15 completed subagents visible
4. Verify no duplicate sections present
