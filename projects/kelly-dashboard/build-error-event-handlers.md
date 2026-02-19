# Build Error: Event Handlers in Server Components

**Reported:** 2026-02-18 18:31 CST  
**Status:** ✅ RESOLVED  
**Fixed:** 2026-02-18 18:33 CST  
**Commit:** 90e0936

## Error

```
Event handlers cannot be passed to Client Component props.
<... className=... tabIndex={0} role=... onKeyDown={function onKeyDown} children=...>
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

## Issue

Server Components are trying to pass event handlers (like `onKeyDown`) to Client Components, which is not allowed in React Server Components architecture.

## Fix Required

1. Identify component with `onKeyDown` handler
2. Add `"use client"` directive at top of file to convert to Client Component
3. OR refactor to move interactive parts to a Client Component

## Priority

**BLOCKING** - Must be fixed before project is marked complete. Build errors = not done.

## Note to Project Lead

Do not mark this project as done until all build errors are resolved and the dev server runs clean.

---

## Resolution

**Fixed:** 2026-02-18 18:33 CST

### Root Cause
The `QueuedProjectCard` component was defined inline within `next-up.tsx`, a Server Component. It was trying to pass event handlers (`onKeyDown`, `tabIndex`, `role`) to the `Card` component, which violates React Server Components rules.

### Solution
Extracted `QueuedProjectCard` into a separate Client Component file:
- Created `/components/factory-view/queued-project-card.tsx` with `'use client'` directive
- Moved all interactive logic (event handlers) into this Client Component
- `next-up.tsx` remains a Server Component and imports `QueuedProjectCard`

### Files Changed
- `components/factory-view/queued-project-card.tsx` - New Client Component (48 lines)
- `components/factory-view/next-up.tsx` - Removed inline component, added import

### Verification
- ✅ Build completes successfully
- ✅ TypeScript compilation passes  
- ✅ Dev server runs without errors
- ✅ Page renders correctly with clickable queued project cards

**Commit:** 90e0936
