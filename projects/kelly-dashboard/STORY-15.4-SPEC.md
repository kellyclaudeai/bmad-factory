# Story 15.4: Apply Cassio-Style Formatting to Session Logs

## Problem
Session logs in Project Detail view show raw JSONL with full JSON objects (role, toolCallId, timestamp, etc.) — very hard to read and scan quickly.

## Requirements
Format session logs with Cassio-style emoji indicators for better readability:
- 📋 Session metadata (session start, model info, config)
- 👤 User messages
- 🤖 Assistant messages (with text content)
- 🔧 Tool calls (with tool name + brief summary)
  - ✅ Successful tool calls (green border/bg)
  - ❌ Failed tool calls (red border/bg)
- 💭 Thinking blocks (visible inline, NOT collapsed)

## Reference
Cassio CLI: https://github.com/ianzepp/cassio
- Emoji-based role indicators
- Compact tool call summaries
- Collapsible thinking blocks
- Color-coded status (success/error)

## Implementation

### 1. Parse JSONL Messages
Read transcript file line-by-line, parse each line as JSON message object:
```typescript
type Message = {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content?: string | Array<{type: string, text?: string}>
  toolCalls?: Array<{id: string, function: {name: string, arguments: string}}>
  toolCallId?: string
  name?: string // tool name for tool-result messages
  thinking?: string
  timestamp?: string
}
```

### 2. Create Formatting Component
New component: `components/subagent-view/formatted-message.tsx`

**Features:**
- Map role → emoji icon
- Extract text from content (handle string or array format)
- Format tool calls:
  - Show tool name prominently
  - Parse arguments JSON, show key fields only (e.g., "command: ls -la")
  - Truncate long outputs (e.g., first 200 chars with "... (N more lines)")
- Thinking blocks visible inline (NOT collapsed - valuable context)
- Terminal aesthetic (monospace, green/amber/red accents)

### 3. Update LogsSection Component
Modify `components/subagent-view/logs-section.tsx`:
- Parse JSONL transcript into message array
- Map each message to FormattedMessage component
- Keep scrollable container (max height)
- Preserve terminal styling

## Display Format Examples

**User message:**
```
👤 User
Deploy the dashboard to Vercel
```

**Assistant message:**
```
🤖 Assistant
Deploying to Vercel now. I'll run the deployment and verify it's live.
```

**Tool call (success):**
```
✅ exec
command: vercel --prod
exit: 0
output: Deployed to https://kelly-dashboard.vercel.app
```

**Tool call (error):**
```
❌ exec
command: npm run build
exit: 1
error: Type error in app/page.tsx:42
```

**Thinking block (visible):**
```
💭 Thinking
Good, project-state.json is already up to date in the working tree (no changes to commit). The merges are complete...
```

## Files to Modify/Create
- `components/subagent-view/formatted-message.tsx` (new component)
- `components/subagent-view/logs-section.tsx` (integrate formatter)
- Possibly add utility: `lib/format-message.ts` for parsing logic

## Acceptance Criteria
- [x] Session logs show emoji indicators instead of raw JSON
- [x] Tool calls display tool name + key arguments/results
- [x] Thinking blocks visible inline (not collapsed)
- [x] Terminal aesthetic preserved (monospace, green/amber/red)
- [x] Long outputs truncated gracefully
- [x] Logs remain scrollable and readable

## Branch
`barry-cassio-style-logs`

## Testing
1. View fleai-market-v4 project detail → click subagent session
2. Verify logs section shows formatted messages with emojis
3. Verify thinking blocks show inline with 💭 prefix
4. Verify tool calls show success (✅) or error (❌) indicators
5. Check terminal aesthetic consistency

## Notes
- This is UI formatting only — no changes to log format or storage
- Keep it compact: goal is scannable overview, not full detail
- Reference Cassio CLI for formatting patterns but don't need to install it
