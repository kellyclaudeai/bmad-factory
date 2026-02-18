# Story 15.4.2: EMERGENCY - Fix Missing Session Logs Display

## CRITICAL BUG
Session logs are completely empty after Story 15.4 merge. No logs display at all (not formatted, not raw JSON, just empty).

## Symptoms
- LogsSection shows header and tips
- Preview section shows "last 50 messages" but renders nothing
- No console errors visible to operator
- This is a complete regression - logs were working before (raw JSON display)

## Root Cause Investigation Needed
Likely causes:
1. JSONL parsing failing silently
2. FormattedMessage component not rendering
3. Error handling swallowing content
4. Message array empty/undefined
5. CSS display issues (content exists but hidden)

## Requirements
1. **Restore log display immediately** (formatted or raw, just get them visible)
2. Debug why parsing/rendering failed
3. Add error logging for troubleshooting
4. Test with real transcript file before committing

## Implementation Approach
1. Add console.log debugging to LogsSection to see:
   - Transcript file read success/failure
   - Parsed message count
   - Any parsing errors
2. Check FormattedMessage component rendering logic
3. Add fallback to raw JSON if formatting fails
4. Verify messages array is populated and passed to components

## Files to Debug/Fix
- `components/subagent-view/logs-section.tsx` - JSONL parsing + rendering
- `components/subagent-view/formatted-message.tsx` - component rendering

## Acceptance Criteria
- [x] Session logs display content (formatted or fallback to raw)
- [x] No silent failures (errors logged to console)
- [x] Tested with real transcript file before merge

## Branch
`barry-fix-empty-logs` (emergency hotfix)

## Testing
1. View any session with transcript
2. Verify logs display
3. Check console for any errors
4. Test with multiple sessions

## Priority
🚨 **CRITICAL** - This is a blocking regression, not an enhancement
