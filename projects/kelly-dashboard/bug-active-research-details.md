# Bug: Research Details Page Error for Active Sessions

**Reported:** 2026-02-18 18:23 CST  
**Status:** ✅ RESOLVED  
**Fixed:** 2026-02-18 18:28 CST  
**Commit:** fd66c26

## Issue

When clicking on an active Research Lead session card in the Factory View, the Research Details page shows:

```
Research Session Not Found
Could not find research session for session key: agent:research-lead:2
```

## Current Behavior

1. Dashboard correctly shows active Research Lead sessions in the list view
2. User clicks the card to view details
3. Details page tries to load research artifacts (intake.md, etc.)
4. Research Lead hasn't completed yet, so artifacts don't exist
5. Page errors: "Could not find research session"

## Expected Behavior

The details page should:
1. Detect when Research Lead session is still active (no artifacts yet)
2. Show "Research in progress..." status with estimated completion time
3. Optionally: show live session activity/transcript
4. Once complete, show full research artifacts

## Reproduction

1. Start a Research Lead session: `agent:research-lead:2` (iOS app idea generation)
2. Go to Factory View → Research tab
3. Click on the "Research Lead 2" card
4. See error

## Technical Notes

- Active sessions exist in OpenClaw sessions list before creating registry entries
- Research artifacts written to `ideas/{name}-{timestamp}/` when complete
- Registry entry added to `project-registry.json` when Research Lead finishes

## Priority

Medium - affects UX when monitoring active research sessions

---

## Resolution

**Fixed:** 2026-02-18 18:28 CST

### Changes Applied

Added "Research in Progress" notice to Research Details page that displays when:
- Session status is "active"
- No artifacts (output path, findings) exist yet

**Features:**
- Amber status card with pulsing animation
- Clear explanation: "Research findings and artifacts will appear here once the Research Lead completes its work"
- Expected completion time: "20-30 minutes from start"
- Session logs still visible for monitoring

### Files Modified
- `/app/research/[sessionKey]/page.tsx` - Added conditional in-progress notice

### Documentation
- `/docs/fix-active-research-sessions.md` - Complete fix documentation

### User Experience
Users can now click on active Research Lead sessions and see a clear status message instead of errors or blank pages. The page progressively shows more data as subagents complete and artifacts are generated.

**Commit:** fd66c26
