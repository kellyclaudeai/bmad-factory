# HEARTBEAT.md

## Project Lead Session Distribution

Distribute heartbeat to all active Project Lead sessions every 60 seconds.

**Implementation:**
1. List active PL sessions: `ls ~/.openclaw/agents/project-lead/sessions/*.lock | grep "project-" | grep -v "project-lead:main"`
2. Extract session keys from lock files
3. For each session, send heartbeat via Gateway (bypasses broken sessions.json):
   ```bash
   openclaw gateway call agent --params '{"message":"HEARTBEAT_POLL","sessionKey":"<key>","idempotencyKey":"'$(uuidgen)'"}' --timeout 5000 &
   ```
4. Run in background (don't wait for responses)

**Why not sessions_send:** sessions.json mapping can be corrupted, causing timeouts. Gateway call is more reliable.

If nothing needs attention, reply HEARTBEAT_OK.
