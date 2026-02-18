# Factory View Dashboard Bug - 2026-02-16 16:43 CST

## Symptom
Project details page shows:
- Status: "unknown" (should be "implementation")
- Runtime: "0s" (should show elapsed time)
- ETA: "—" (should show estimate)
- Project Lead Session: "No Project Lead session found" (session exists)

## Root Cause
**SSR fetch failure** - During Server-Side Rendering, `getProjectState()` fetches from `http://localhost:3000/api/project-state`, which fails because:
- SSR runs before the dev server is fully ready
- Or port mismatch
- Or `NEXT_PUBLIC_BASE_URL` not configured

Result: `getProjectState()` returns `null`, page falls back to "unknown" status.

## Evidence
✓ `/Users/austenallred/clawd/projects/fleai-market/project-state.json` exists with valid data
✓ API route `/api/project-state` correctly reads and returns JSON
✓ Active Project Lead session exists: `agent:project-lead:project-fleai-market`
✗ SSR fetch fails, `projectState === null` on page render

## Fix
**Option A (preferred):** Read `project-state.json` directly during SSR (no HTTP fetch)
**Option B:** Configure `NEXT_PUBLIC_BASE_URL` correctly for SSR context
**Option C:** Use client-side data fetching only (add loading state)

## Files to Change
- `/Users/austenallred/clawd/projects/kelly-dashboard/app/project/[id]/page.tsx`
  - Change `getProjectState()` to read directly from filesystem during SSR
  - Keep HTTP fetch as fallback for client-side navigation

## Implementation
```typescript
import { promises as fs } from 'node:fs'
import path from 'node:path'

const PROJECTS_ROOT = '/Users/austenallred/clawd/projects'

async function getProjectState(projectId: string): Promise<ProjectState | null> {
  try {
    // Direct filesystem read during SSR
    const projectStatePath = path.join(PROJECTS_ROOT, projectId, 'project-state.json')
    const contents = await fs.readFile(projectStatePath, 'utf8')
    return JSON.parse(contents)
  } catch (error) {
    console.error('Failed to read project state:', error)
    return null
  }
}
```

## Status
📋 DOCUMENTED - Awaiting operator approval to implement fix

## Impact
- Medium severity (dashboard non-functional for project details)
- Affects ALL project detail pages
- Workaround: Check `project-state.json` directly in filesystem
