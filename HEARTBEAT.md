# HEARTBEAT.md

## Project Lead Session Distribution

Distribute heartbeat to all active Project Lead sessions every 60 seconds.

**Implementation:**

1. Find all PL lock files:
   ```bash
   ls ~/.openclaw/agents/project-lead/sessions/*.jsonl.lock 2>/dev/null
   ```

2. For each lock file, extract the session UUID and check for **context overflow**:
   ```bash
   SESSION_FILE=~/.openclaw/agents/project-lead/sessions/<uuid>.jsonl
   SIZE=$(wc -c < "$SESSION_FILE")
   # If > 2.5MB (~180k tokens), session is approaching overflow limit
   if [ "$SIZE" -gt 2500000 ]; then
     # Archive bloated session and clear it
     cp "$SESSION_FILE" "${SESSION_FILE}.overflow-archived-$(date +%Y%m%d-%H%M%S)"
     echo "[]" > "$SESSION_FILE"
     # Then send a fresh-context heartbeat below
   fi
   ```

3. Send heartbeat via Gateway (bypasses broken sessions.json):
   ```bash
   openclaw gateway call agent \
     --params '{"message":"HEARTBEAT_POLL","sessionKey":"<key>","idempotencyKey":"'$(uuidgen)'"}' \
     --timeout 5000 &
   ```

4. Run in background (don't wait for responses)

**Why not sessions_send:** sessions.json mapping can be corrupted, causing timeouts. Gateway call is more reliable.

**Why check file size:** PL sessions can overflow 200k token limit silently. At ~2.5MB the session is near the limit and will start failing all heartbeats/messages. Clearing the transcript lets PL start fresh (it reads sprint-status.yaml for state, not session history).

If nothing needs attention, reply HEARTBEAT_OK.
