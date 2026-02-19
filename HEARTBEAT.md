# HEARTBEAT.md

## Project Lead Session Distribution

Distribute heartbeat to all active Project Lead sessions every 60 seconds.

**Implementation:**
1. Read `~/.openclaw/agents/project-lead/sessions/sessions.json`
2. Find sessions matching `agent:project-lead:project-*`
3. Filter for recently active (updated in last 60 minutes)
4. Send `sessions_send(sessionKey, "HEARTBEAT_POLL")` to each

If nothing needs attention, reply HEARTBEAT_OK.
