# Story 13: Active Project Leads Default View

**Created:** 2026-02-15T14:06:00-06:00  
**Agent:** Barry (bmad-bmm-barry)  
**Branch:** barry-story-13  
**Priority:** Enhancement  

---

## Objective

Reorder the Factory View homepage to prioritize **Active Project Leads** as the primary/default view, making operational project status immediately visible when landing on the dashboard.

## Current State

Homepage sections (in order):
1. Project Statistics (4 stat cards)
2. Factory Health (6 health metrics)
3. Active Agents (all agents mixed together)
4. Historical Projects

**Problem:** Operators need to scroll past stats and health to see active project leads - the most actionable information.

## Desired State

Homepage sections (new order):
1. **Active Project Leads** (NEW - featured section)
2. Now Running (active sessions - non-project agents like Barry, Mary)
3. Next Up (queued projects from factory-state.md)
4. Project Statistics (moved down)
5. Factory Health (moved down)
6. Historical Projects (unchanged)

## Requirements

### Phase 1: Gateway Token Reader Utility
Create a utility to read the OpenClaw Gateway token from the standard location.

**File:** `lib/gateway-token.ts`
```typescript
export function getGatewayToken(): string | null {
  // Read from ~/.openclaw/gateway-token.txt
  // Return token or null if not found
}
```

### Phase 2: Real Sessions API Route
Create API route to fetch real session data from OpenClaw Gateway.

**File:** `app/api/sessions/route.ts`
```typescript
// Fetch from Gateway using token
// Transform to frontend format
// Return Session[] or error
```

### Phase 3: Active Project Leads Component
Create new component to display project leads prominently.

**File:** `components/factory-view/active-project-leads.tsx`
```typescript
// Filter sessions for project-lead agents
// Display in grid with project name, status, duration
// Large, prominent cards (bigger than other agent cards)
// Click to navigate to project detail
```

### Phase 4: Reorder Homepage
Update `app/page.tsx` to show sections in new order:
1. Active Project Leads (prominent, top)
2. Now Running (other agents)
3. Next Up (queued)
4. Stats (moved down)
5. Health (moved down)
6. Historical (unchanged)

### Phase 5: Now/Next/History Components
Create components for operational awareness:

**File:** `components/factory-view/now-running.tsx`
- Show non-project agents (Barry, Mary, independent sessions)
- Smaller cards than project leads

**File:** `components/factory-view/next-up.tsx`
- Show queued projects from factory-state.md
- Display project name + position in queue

### Phase 6: Enhance Project Detail Page
Add "Back to Active Projects" breadcrumb shortcut.

### Phase 7: Testing
- Test with real Gateway connection
- Test with Gateway offline (graceful fallback)
- Test empty states (no active projects)
- Verify navigation works

### Phase 8: Commit & Report
- Commit changes to barry-story-13 branch
- Merge to main
- Report completion

## Technical Details

### Gateway Integration
- Gateway API: `http://localhost:3000/api/sessions_list`
- Auth: Bearer token from `~/.openclaw/gateway-token.txt`
- Response: Array of session objects

### Session Filtering
```typescript
// Project Lead sessions
sessions.filter(s => s.sessionKey.includes('agent:project-lead:'))

// Other agent sessions (Barry, Mary, etc.)
sessions.filter(s => 
  s.sessionKey.includes('agent:bmad-bmm-') || 
  !s.sessionKey.includes('project-lead')
)
```

### UI Design
- **Project Leads:** Large cards (full-width on mobile, 2-col on desktop)
- **Now Running:** Medium cards (grid layout)
- **Next Up:** Compact list view

## Acceptance Criteria

- ✅ Active Project Leads appear first on homepage
- ✅ Gateway API integration works (reads token, fetches sessions)
- ✅ Real session data displayed (not mock data)
- ✅ Project leads visually distinct (larger cards)
- ✅ Now/Next/History sections added
- ✅ Navigation to project detail works
- ✅ Graceful fallback when Gateway offline
- ✅ Empty states handled (no active projects)
- ✅ Code committed and merged to main

## Files to Modify/Create

**New Files:**
- `lib/gateway-token.ts` - Token reader utility
- `components/factory-view/active-project-leads.tsx` - Featured section
- `components/factory-view/now-running.tsx` - Non-project agents
- `components/factory-view/next-up.tsx` - Queued projects

**Modified Files:**
- `app/page.tsx` - Reorder sections
- `app/api/sessions/route.ts` - Real Gateway integration (replace mock)
- `components/project-view/project-header.tsx` - Add "Back to Active" link

## Success Metrics

- Time to see active project status: 0 seconds (immediately visible)
- Operator satisfaction: "I can see what's running right away"
- Reduced scrolling: Key info above the fold

---

**Estimated Duration:** 45-60 minutes  
**Dependencies:** None (Stories 1-12 complete)  
**Risk:** Low (additive changes, no breaking modifications)
