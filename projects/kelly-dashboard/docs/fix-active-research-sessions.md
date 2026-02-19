# Fix: Active Research Session Handling

**Date:** 2026-02-18 18:28 CST  
**Status:** ✅ RESOLVED  
**Issue:** Research Details page error when viewing active sessions

---

## Problem Summary

When clicking on an active Research Lead session in the Factory View, the Research Details page would either:
1. Show "Research Session Not Found" error
2. Display a blank/incomplete page with no useful information

**Root Cause:**
Active research sessions exist in the OpenClaw sessions list before creating any artifacts. The Details page was designed assuming artifacts (findings, output path, subagents) would always exist, causing a poor UX when viewing in-progress research.

---

## Fix Applied

### Added "Research in Progress" Notice

**File:** `/app/research/[sessionKey]/page.tsx`

Added conditional rendering that displays an informative status card when:
- Session status is `"active"`
- No output path exists yet (`!outputPath`)
- No findings exist yet (`!findings.length`)

**Visual Design:**
```
┌─────────────────────────────────────────────┐
│ 🟡 Research in Progress                     │
│                                             │
│ This research session is currently active.  │
│ Research findings and artifacts will appear │
│ here once the Research Lead completes its   │
│ work.                                       │
│                                             │
│ Expected completion: 20-30 minutes from     │
│ start                                       │
└─────────────────────────────────────────────┘
```

**Features:**
- Amber border and background (`border-terminal-amber/30 bg-terminal-amber/5`)
- Pulsing dot animation to indicate active status
- Clear explanation of what's happening
- Expected completion time (20-30 min from Research Lead plan)
- Session Logs section still visible for real-time monitoring

---

## User Experience Flow

### Before Fix:
1. User clicks active Research Lead session card
2. Page loads → "Research Session Not Found" OR blank page
3. Confusion: "Did something break? Where's the data?"

### After Fix:
1. User clicks active Research Lead session card
2. Page loads → Shows session details + "Research in Progress" notice
3. Clear understanding: "Research is running, come back in 20-30 min"
4. Session logs visible for monitoring progress

---

## Technical Implementation

### Detection Logic
```typescript
{status === "active" && !outputPath && !findings.length && (
  <Card className="border-terminal-amber/30 bg-terminal-amber/5">
    {/* In Progress notice */}
  </Card>
)}
```

**Why this works:**
- `status === "active"` → Session is running (from Gateway sessions list)
- `!outputPath` → No final artifacts written yet
- `!findings.length` → No research findings generated yet

All three conditions together = Research in progress, no artifacts to display.

### Progressive Disclosure

As Research Lead makes progress, the page automatically shows more data:

**Phase 1: Initial (0-5 min)**
- ✅ Session details (key, ID, model, topic)
- ✅ "Research in Progress" notice
- ✅ Session logs

**Phase 2: Subagents Active (5-20 min)**
- ✅ Session details
- ✅ "Research in Progress" notice
- ✅ **Research Subagents section** (Carson, Victor, Maya, Quinn, Mary)
- ✅ Session logs

**Phase 3: Complete (20-30 min)**
- ✅ Session details
- ✅ **Research Findings** (consolidated approaches)
- ✅ Research Subagents (all completed)
- ✅ Session logs
- ❌ "Research in Progress" notice (removed)

---

## Related Files

**Modified:**
- `/app/research/[sessionKey]/page.tsx` - Added in-progress notice

**Related Components:**
- `ResearchHeader` - Shows status badge (active/complete)
- `ResearchSubagentGrid` - Shows subagents as they spawn
- `LogsSection` - Shows real-time session activity

**API Endpoints:**
- `/api/research-sessions` - Returns active sessions from Gateway
- `/api/research-state` - Returns state from research-lead workspace

---

## Testing Checklist

- [x] Active session without artifacts → Shows "Research in Progress"
- [x] Active session with subagents → Shows subagents + notice
- [x] Completed session → Shows findings, no notice
- [x] Session logs visible in all states
- [x] Pulsing animation works
- [x] Amber color theme consistent

---

## Future Enhancements

**Potential improvements:**
1. **Real-time progress updates**
   - Show current phase (Ideation, Validation, Compilation)
   - Live subagent status updates (without page refresh)

2. **Estimated time remaining**
   - Calculate based on phase + subagent progress
   - "~15 minutes remaining" instead of generic "20-30 min"

3. **Partial findings display**
   - Show findings as they're generated (streaming)
   - "4/5 personas complete, consolidating..."

4. **Cancel button**
   - Allow operator to stop research mid-session
   - Useful if direction is wrong

---

## Bug Report Reference

**Original Report:** `/Users/austenallred/clawd/projects/kelly-dashboard/bug-active-research-details.md`

**Reproduction Case:** `agent:research-lead:2` (iOS app idea, currently running)

**Resolution:** Active sessions now show clear "Research in Progress" status with expected completion time. No more errors or confusion.

---

**Commit:** fd66c26  
**Status:** ✅ Deployed - Dev server running  
**Resolution Time:** ~15 minutes
