# Gateway Session Recovery - Enhancement Proposal

**Issue:** Sessions wedge when tool calls fail during gateway restarts or transient network issues. The session remains stuck waiting for the failed tool call to resolve, and cannot process subsequent messages (including heartbeats).

**Impact:** Project Lead sessions become unresponsive and require manual intervention (session deletion + restart). Discovered during fleai-market-v5 planning when PL wedged for 12+ minutes after `sessions_send` failed during gateway restart.

---

## Current Behavior

When a tool call fails with transient errors (e.g., "gateway closed (1012): service restart"), the session:
1. Records the error in tool results
2. Waits indefinitely for resolution
3. Cannot process new messages (including heartbeats)
4. Appears "active" but is functionally dead
5. Requires manual session deletion + restart

**Example failure:**
```json
{
  "runId": "61909b57-7d38-4f30-9835-a837ea7e1c64",
  "status": "error",
  "error": "gateway closed (1012): service restart",
  "sessionKey": "agent:bmad-bmm-winston:subagent:..."
}
```

---

## Proposed Solution

**Gateway-level automatic recovery for transient tool call failures.**

### Error Classification

**Transient errors (retry):**
- `gateway closed (1012)` - service restart
- `gateway closed (1006)` - abnormal closure  
- `ECONNREFUSED` - connection refused
- `ETIMEDOUT` - timeout
- `ENOTFOUND` - temporary DNS failure
- `503 Service Unavailable`

**Permanent errors (fail immediately):**
- `400 Bad Request` - invalid parameters
- `401 Unauthorized` - missing/invalid credentials
- `404 Not Found` - resource doesn't exist
- `422 Unprocessable Entity` - validation failure
- Tool-specific errors (e.g., "No session found with label: main")

### Recovery Logic

```typescript
interface RetryConfig {
  maxAttempts: number;      // default: 3
  backoffMs: number[];      // default: [100, 500, 2000]
  transientPatterns: RegExp[];
}

async function executeToolCall(call: ToolCall, config: RetryConfig): Promise<ToolResult> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await executeTool(call);
    } catch (error) {
      lastError = error;
      
      // Check if error is transient
      const isTransient = config.transientPatterns.some(pattern => 
        pattern.test(error.message)
      );
      
      if (!isTransient || attempt === config.maxAttempts - 1) {
        // Permanent error or final attempt - fail immediately
        break;
      }
      
      // Transient error - wait and retry
      const backoff = config.backoffMs[attempt] || config.backoffMs[config.backoffMs.length - 1];
      await sleep(backoff);
      
      console.log(`[gateway] Retrying tool ${call.name} (attempt ${attempt + 2}/${config.maxAttempts})`);
    }
  }
  
  // All retries exhausted or permanent error - record failure and CONTINUE SESSION
  return {
    status: 'error',
    error: lastError.message,
    retries: attempt,
    recoverable: false
  };
}
```

### Session Continuation

**Critical:** After tool call failure (transient or permanent), the session must:
1. Record the error in message history
2. **Continue processing** — not wedge waiting for resolution
3. Allow the agent to handle the error (retry, skip, escalate)
4. Process subsequent heartbeats and commands normally

### Configuration

Add to `openclaw.json`:

```json
{
  "gateway": {
    "toolCallRetry": {
      "enabled": true,
      "maxAttempts": 3,
      "backoffMs": [100, 500, 2000],
      "transientPatterns": [
        "gateway closed \\(101[26]\\)",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "503 Service Unavailable"
      ]
    }
  }
}
```

---

## Benefits

1. **Self-healing** — Sessions recover automatically from transient failures
2. **Generic** — Helps all agents (PL, RL, Kelly, subagents), not just specific ones
3. **Immediate** — Recovery happens in milliseconds, not minutes (vs. heartbeat polling)
4. **Simple** — No external dependencies or complex orchestration
5. **Safe** — Permanent errors still fail fast, only transient errors retry

---

## Alternative: Session Watchdog

If gateway-level recovery is too invasive, an alternative is a **session watchdog** that:
- Monitors all active sessions for "wedged" state (pending tool call >5 min)
- Auto-cancels stuck tool calls
- Injects synthetic error result so session can continue

**Tradeoff:** More complex, slower (polling vs immediate), but doesn't touch core tool execution.

---

## Testing

**Test cases:**
1. Tool call during gateway restart → retries successfully
2. Tool call with permanent error → fails immediately (no retry)
3. Tool call with 3 transient failures → exhausts retries, records error, session continues
4. Heartbeat arrives during tool retry → queued and processed after recovery
5. Agent handles tool error gracefully → calls alternative tool or escalates

---

## Implementation Priority

**High** — This is a core reliability issue. Without recovery:
- Every gateway restart risks wedging active sessions
- Manual intervention required (breaks autonomous operation)
- No graceful degradation (sessions just hang)

Estimated effort: 1-2 days (core gateway changes + testing)

---

**Related Issues:**
- fleai-market-v5 PL wedge (2026-02-17 17:07 CST)
- Kelly's heartbeat enhancement (commit 8cbf098) — monitors planning projects, but can't fix wedged sessions

**Submitted by:** Kelly Router  
**Date:** 2026-02-17  
**Session:** agent:main:matrix:direct:@matt:austens-mac-mini.local
