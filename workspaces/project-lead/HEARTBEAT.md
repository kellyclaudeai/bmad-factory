# Project Lead HEARTBEAT.md

## Completion Detection & Health Check (Every 60 seconds)

**Task:** Detect new story completions, notify Kelly immediately, monitor subagent health, self-heal stuck sessions.

### Process

### 0. **Initialize (First Heartbeat Only)**

Load project context (should already exist from first message):

```bash
# Verify project context exists
if [ ! -f "memory/project-context.json" ]; then
  echo "⚠️ ERROR: Project context not initialized!" >> memory/error-log.txt
  sessions_send(
    sessionKey="agent:main:main",
    message="⚠️ Project Lead ERROR: No project context found. Session may be corrupted."
  )
  # Reply HEARTBEAT_OK to avoid spam, investigate on next heartbeat
  exit
fi

# Initialize heartbeat state if missing
if [ ! -f "memory/heartbeat-state.json" ]; then
  echo '{
    "lastCheck": 0,
    "lastSubagentCount": 0,
    "checksToday": 0,
    "restarts": [],
    "escalations": []
  }' > memory/heartbeat-state.json
fi
```

### 1. **Check for New Completions (CRITICAL)**

This is the PRIMARY purpose of heartbeat - detect when Amelia finishes stories and notify Kelly.

```bash
# Load paths from project context
projectId=$(jq -r '.projectId' memory/project-context.json)
projectState=$(jq -r '.projectState' memory/project-context.json)

# Try to read project state (with error recovery)
stateContent=$(read ${projectState})

if [[ "$stateContent" == *"ENOENT"* ]] || [[ "$stateContent" == *"error"* ]]; then
  # Project state missing - log but don't crash
  echo "$(date -Iseconds) ERROR: Cannot read ${projectState}" >> memory/error-log.txt
  sessions_send(
    sessionKey="agent:main:main",
    message="⚠️ Project Lead (${projectId}): Cannot read project-state.json at ${projectState}"
  )
  # Continue with other checks, skip completion detection this cycle
else
  # Count current subagents
  currentCount=$(echo "$stateContent" | jq '.subagents | length')
  
  # Load last known count
  lastKnown=$(jq -r '.lastSubagentCount // 0' memory/heartbeat-state.json)
  
  # If count increased, new completion(s) detected
  if [ "$currentCount" -gt "$lastKnown" ]; then
    # Get new completions (subagents added since last check)
    newCompletions=$(echo "$stateContent" | jq ".subagents[$lastKnown:]")
    
    # Notify Kelly for each new completion
    echo "$newCompletions" | jq -c '.[]' | while read -r completion; do
      story=$(echo "$completion" | jq -r '.story')
      status=$(echo "$completion" | jq -r '.status')
      duration=$(echo "$completion" | jq -r '.duration // "unknown"')
      
      # Send notification to Kelly
      sessions_send(
        sessionKey="agent:main:main",
        message="✅ ${projectId}: ${story} - ${status} (${duration})"
      )
      
      # Log to memory
      echo "$(date -Iseconds) COMPLETION: ${story} ${status}" >> memory/$(date +%Y-%m-%d).md
    done
    
    # Update last known count
    jq ".lastSubagentCount = ${currentCount}" memory/heartbeat-state.json > tmp.json && mv tmp.json memory/heartbeat-state.json
  fi
fi
```

### 2. **Read my project's state:**
   - `project-state.json` → active subagents, current stage (already loaded above)
   - `stage-*-state.json` → stage-specific progress
   - Check last modified timestamps on state files

3. **Check active subagents:**
   - For each subagent in "active" status:
     - Calculate runtime: now - startedAt
     - Compare to expected time (persona-specific):
       - John (PRD): 2-7 minutes
       - Sally (UX): 3-8 minutes  
       - Winston (Architecture): 5-10 minutes
       - Bob (Parallelization): 8-15 minutes
       - Amelia (Story implementation): 3-12 minutes
       - Murat (TEA audit): 5-15 minutes
     - **If runtime > 1.5x expected (45-60 min for stories):**
       - Check if process still alive via `ps -p <pid>`
       - If dead but work exists → verify + commit, notify Kelly of recovery
       - If dead with no work → restart, notify Kelly of restart
       - If alive but stuck → send status ping, wait 2 min, then restart
     - **If runtime > 2x expected after restart:**
       - Escalate to Kelly with blocker format
     - **Always notify Kelly when recovering stuck/dead sessions:**
       - Format: "🔧 Auto-recovery: Story X.Y - process died, work verified, committed"

4. **Check for completion gaps:**
   - Subagent marked "complete" but no artifact file?
     - Check `sessions_history` for logs
     - If logs show output, extract and save artifact myself
     - If no output, restart subagent
   - Planning complete but no next stage started?
     - Check if I announced "moving to next stage" but didn't actually do it
     - If >5 minutes since completion announcement with no action → proceed now
   - **Stage is "userQA" but no qaUrl field in project-state.json?**
     - I forgot to complete Stage 4.5 (User QA Preparation)
     - Action NOW:
       1. Host/deploy the app (start dev server or deploy to Vercel)
       2. Update project-state.json with qaUrl, qaReadyAt, qaInstructions
       3. Notify Kelly via sessions_send: "🧪 Project {name} ready for user QA: {url}"
       4. Update factory-state.md
     - This is a CRITICAL gap - userQA is blocked without a testable URL

5. **Check for protocol violations:**
   - Bob completed but no individual Story-N.M.md files (only stories-parallel.json)?
     - Immediately restart Bob with explicit instruction
     - Do NOT proceed to implementation stage
   - Story completed but build failed?
     - Route to Amelia for fix
     - Continue with other runnable stories (don't block pipeline)

6. **Update tracking:**
   - Write `heartbeat-state.json` with check timestamp
   - Document any restarts in `memory/YYYY-MM-DD.md`

### When to Escalate to Kelly

Only escalate when I've exhausted self-healing attempts:

```
🚨 BLOCKER: [Brief description]

Project: [projectId]
Stage: [current stage]
Issue: [what's blocked and why]
Attempts: [what I've tried - be specific]
Need: [what I need from Kelly/user]
```

**Escalation scenarios:**
- Subagent stuck after 2 restart attempts
- Missing artifacts after investigation/regeneration attempts
- Architectural/scope conflicts discovered
- External dependencies missing (API keys, service accounts)
- Budget/timeline concerns (exceeding estimates)

### Self-Healing Examples

**Example 1: Stuck John session**
- John started 15 minutes ago (>2x expected 7 min)
- No `prd.md` artifact exists
- Check sessions_list → session still active
- Action: Restart John with same task, log in memory
- If restart also stalls >15 min → escalate to Kelly

**Example 2: Completion gap**
- Amelia announced "Story 3 complete" at 17:45
- It's now 17:52 (7 minutes later)
- Next story (Story 4) not started yet
- Action: Read dependency graph, spawn Story 4 now
- Log: "Caught completion gap, proceeding to Story 4"

**Example 3: Bob protocol violation**
- Bob completed, `stories-parallel.json` exists
- Individual story files (Story-*.md) DO NOT exist
- Action: Restart Bob with explicit instruction: "Create individual story files per spawning-protocol"
- Do NOT proceed to implementation

**Example 4: UserQA stage without qaUrl**
- project-state.json shows `stage: "userQA"`
- No `qaUrl` field present (I forgot Stage 4.5)
- It's been >5 minutes since TEA completed
- Action:
  1. Start dev server: `cd projects/{projectId} && npm run dev` (background process)
  2. Update project-state.json with qaUrl, qaReadyAt, qaInstructions
  3. Send to Kelly: `sessions_send(sessionKey="agent:main", message="🧪 {name} ready: http://localhost:3000")`
  4. Log in memory: "Caught missing userQA setup, completed Stage 4.5"

### Storage

```json
// heartbeat-state.json
{
  "lastCheck": 1771286400,
  "lastSubagentCount": 32,
  "checksToday": 12,
  "restarts": [
    {
      "timestamp": 1771286100,
      "subagent": "john-prd-fleai-market-v4",
      "reason": "stuck at 16min with no output",
      "outcome": "restarted successfully"
    }
  ],
  "escalations": []
}
```

---

**Remember:** I am autonomous. Check frequently, heal proactively, escalate only when truly blocked.
