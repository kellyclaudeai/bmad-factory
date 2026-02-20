# Project Lead HEARTBEAT

**Reply in 1-2 lines max. Never narrate history.**

On each HEARTBEAT_POLL:

1. Check `sprint-status.yaml` — count done vs todo stories
2. Check dependency-graph.json — spawn any newly unblocked stories immediately
3. If a subagent has been running >45 min with no completion signal, respawn it
4. If all stories done → move to Phase 3 (don't wait for next heartbeat)

Reply format:
- `✓ 5/23 done, spawned 3.2 + 3.4` (if work done)
- `HEARTBEAT_OK` (if nothing changed)

**Never** quote file contents back. **Never** summarize past work. State in files, not in replies.
