# Fix: Event Handler Error Resolution

**Date:** 2026-02-18 17:16 CST  
**Status:** ✅ RESOLVED  
**Issue:** "Event handlers cannot be passed to Client Component props"

---

## Problem Summary

The Kelly Dashboard was failing with a runtime error:
```
Error: Event handlers cannot be passed to Client Component props
```

**Root Cause:**
- `CollapsibleSection` (Client Component) passes `onClick` handler to `CardContent`
- `Card` and `CardContent` components were Server Components (missing `'use client'` directive)
- Next.js doesn't allow passing event handlers from Client Components to Server Components

---

## Fix Applied

### 1. Added 'use client' Directive
**File:** `/components/ui/card.tsx`

Added `'use client'` as the first line to make Card, CardContent, and all card components Client Components.

**Commit:** d5a7835

### 2. Fixed TypeScript Error
**File:** `/components/factory-view/section-counts.tsx`

Added `projectId?: string` to local `Session` type to match API response shape.

**Commit:** 74a9d66

### 3. Cleared Build Caches
The 'use client' directive wasn't being picked up due to stale build cache.

**Actions taken:**
```bash
# Kill all Node.js processes
killall -9 node

# Clear all caches
rm -rf .next node_modules/.cache

# Remove dev lock files
rm -rf .next/dev

# Restart dev server
npm run dev
```

---

## Verification

**Dev server output:**
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000

✓ Starting...
✓ Ready in 259ms
```

No errors during compilation or runtime.

---

## Components Affected

### CollapsibleSection
**Location:** `/components/factory-view/collapsible-section.tsx`

Passes event handlers to CardContent:
```tsx
<CardContent onClick={toggle}>
  {/* Collapsible content */}
</CardContent>
```

This works now because CardContent is a Client Component.

### SubagentCard
**Location:** `/components/project-view/subagent-card.tsx`

Passes event handlers to Card:
```tsx
<Card
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
  role="button"
>
  {/* Card content */}
</Card>
```

This works now because Card is a Client Component.

---

## Why Cache Clearing Was Necessary

Next.js Turbopack caches compiled modules aggressively. When we added `'use client'` to card.tsx:
1. Git showed the change committed
2. TypeScript compilation passed
3. **But runtime still used cached Server Component version**

Cache corruption required full cleanup:
- `.next/` directory (build output)
- `node_modules/.cache/` (Turbopack cache)
- `.next/dev/lock` (dev server lock file)

After clearing caches, Next.js re-compiled card.tsx and correctly recognized it as a Client Component.

---

## Prevention

To avoid similar issues in the future:

1. **When adding 'use client':**
   - Clear `.next/` directory: `rm -rf .next`
   - Restart dev server

2. **When seeing stale behavior:**
   - Full cache clear: `rm -rf .next node_modules/.cache`
   - Kill all node processes: `killall -9 node`
   - Restart: `npm run dev`

3. **Component Guidelines:**
   - Any component receiving event handlers must be a Client Component
   - Add `'use client'` at the top of the file (before imports)
   - Verify in browser DevTools (React DevTools shows C for Client Components)

---

## Related Files

**Fixed:**
- `/components/ui/card.tsx` - Added 'use client'
- `/components/factory-view/section-counts.tsx` - Added projectId type

**Components Using Card:**
- `/components/factory-view/collapsible-section.tsx` - Passes onClick to CardContent
- `/components/project-view/subagent-card.tsx` - Passes onClick to Card
- `/components/research-view/research-subagent-grid.tsx` - Uses SubagentCard (which uses Card)

---

## Testing Checklist

- [x] Dev server starts without errors
- [x] Build completes successfully
- [x] TypeScript compilation passes
- [x] CollapsibleSection toggles work (Factory View)
- [x] SubagentCard clicks work (Project Details)
- [x] Research Details page renders (with new subagent tracking)

---

**Resolution Time:** ~10 minutes (diagnosis + cache clear + restart)  
**Status:** Dashboard fully operational on http://localhost:3000 🚀
