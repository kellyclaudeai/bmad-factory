# Story 14.5: Fix SSR Project State Fetching

## Problem
Project details pages showing incorrect/fallback data:
- Status: "unknown" (should show actual stage)
- Runtime: "0s" (should show elapsed time)
- "No Project Lead session found" (sessions exist but not displayed)

**Root Cause:** `getProjectState()` in `app/project/[id]/page.tsx` uses HTTP fetch to `http://localhost:3000/api/project-state` during SSR, which fails. Returns `null` → fallback values rendered.

## Requirements
Replace HTTP fetch with direct filesystem read during SSR.

## Implementation
Modify `app/project/[id]/page.tsx`:

```typescript
import { promises as fs } from 'node:fs'
import path from 'node:path'

const PROJECTS_ROOT = '/Users/austenallred/clawd/projects'

async function getProjectState(projectId: string): Promise<ProjectState | null> {
  try {
    const projectStatePath = path.join(PROJECTS_ROOT, projectId, 'project-state.json')
    const contents = await fs.readFile(projectStatePath, 'utf8')
    return JSON.parse(contents)
  } catch (error) {
    console.error('Failed to read project state:', error)
    return null
  }
}
```

## Files to Modify
- `app/project/[id]/page.tsx` - Replace fetch with fs.readFile

## Acceptance Criteria
- [x] Project details page loads with correct status (not "unknown")
- [x] Runtime displays correctly (not "0s")
- [x] Project Lead session displays when exists
- [x] SSR renders complete data on initial page load

## Branch
`barry-fix-ssr-project-state`

## Testing
1. Navigate to `/project/fleai-market` or `/project/kelly-dashboard`
2. Verify status shows actual stage (e.g., "user-qa")
3. Verify runtime shows elapsed time
4. Verify Project Lead session card displays
5. Check browser Network tab: no failed API requests during SSR
