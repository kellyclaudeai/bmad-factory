# Story 15.4.1: Fix Thinking Blocks Display (Always Visible)

## Problem
Story 15.4 implemented thinking blocks as collapsible (closed by default), but operator spec was clear: thinking blocks should be **always-visible inline**, not collapsed.

## Requirements
Remove collapsible wrapper from thinking blocks:
- Display inline with 💭 emoji prefix
- Always visible (no collapse/expand functionality)
- Keep terminal aesthetic (monospace, appropriate color)

## Implementation
Modify `components/subagent-view/formatted-message.tsx`:
1. Find thinking block rendering logic
2. Remove collapsible/expandable wrapper
3. Display as simple text block with 💭 prefix
4. Keep styling consistent with other message types

**Before (collapsible):**
```tsx
<details>
  <summary>💭 Thinking (click to expand)</summary>
  {thinking content}
</details>
```

**After (always visible):**
```tsx
<div className="thinking-block">
  <div className="font-semibold">💭 Thinking</div>
  <div>{thinking content}</div>
</div>
```

## Files to Modify
- `components/subagent-view/formatted-message.tsx` - Remove collapsible wrapper

## Acceptance Criteria
- [x] Thinking blocks always visible on load
- [x] No collapse/expand functionality
- [x] 💭 emoji prefix shown
- [x] Terminal aesthetic preserved

## Branch
Continue on `barry-cassio-style-logs` (amend or new commit)

## Testing
View session logs with thinking blocks → verify they display inline without collapse.
