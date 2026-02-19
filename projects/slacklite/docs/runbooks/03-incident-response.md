# Runbook: Incident Response

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team  
**Escalation:** See [on-call runbook](./05-on-call.md)

---

## Incident Severity Levels

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| **P0 – Critical** | Full outage; all users affected | 15 minutes | App unreachable, auth down, no messages deliver |
| **P1 – High** | Major feature broken; many users affected | 1 hour | Real-time messaging failing, login broken |
| **P2 – Medium** | Partial degradation; some users affected | 4 hours | Slow message delivery, occasional 500 errors |
| **P3 – Low** | Minor bug; few users affected | 24–48 hours | UI glitch, minor layout issue |

---

## 1. Incident Detection

Incidents are surfaced via:

1. **Sentry alerts** — automatic error spike notifications
2. **Vercel Analytics** — latency or error rate spikes  
3. **Firebase Console** — rule denials, quota errors, RTDB disconnections  
4. **User reports** — Slack/email reports from users
5. **On-call alerts** — PagerDuty / phone call

---

## 2. Incident Response Process

### Step 1: Declare the Incident (< 5 min)

For P0/P1, immediately:
1. Post in `#incidents` channel: "🚨 Incident declared: [brief description] — investigating"
2. Assign **Incident Commander** (IC) — first responder becomes IC
3. Assign **Communications Lead** — handles user-facing updates
4. Start a timeline log (use the template at the bottom of this runbook)

### Step 2: Assess Impact (< 10 min)

```bash
# 1. Check Vercel deployment health
curl -s -o /dev/null -w "%{http_code}" https://slacklite.app/api/health

# 2. Check recent deploys (may be the cause)
vercel ls --prod | head -5

# 3. Check Sentry for error volume
# https://sentry.io/organizations/slacklite/issues/?project=PROD&timefilter=1h

# 4. Check Firebase Console
# → https://console.firebase.google.com/project/slacklite-prod/overview
# Look at: Firestore usage, RTDB connections, Auth activity

# 5. Check Vercel Function logs
vercel logs --prod --output raw | tail -50
```

### Step 3: Identify Root Cause

**Common root causes and diagnostics:**

#### A. App unreachable (503/504)

```bash
# Check Vercel status
curl https://www.vercel-status.com/api/v2/status.json | jq .status.description

# Check DNS resolution
dig slacklite.app

# Check if Vercel build failed
vercel ls --prod
```

#### B. Authentication broken

```bash
# Test the session API
curl -X POST https://slacklite.app/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"token": "test"}' \
  -w "\nHTTP %{http_code}\n"

# Check Firebase Auth in console
# → https://console.firebase.google.com/project/slacklite-prod/authentication/users

# Check for recent Firebase Auth config changes
git log --oneline -- .
```

#### C. Real-time messaging broken

```bash
# Check Firebase RTDB status
curl "https://slacklite-prod-default-rtdb.firebaseio.com/.json?shallow=true" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"

# Check RTDB rules didn't accidentally lock all reads
firebase database:get --project slacklite-prod /.settings/rules

# Check for Firestore quota errors
# → Firebase Console → Firestore → Usage tab
```

#### D. High error rate in Sentry

```bash
# Get recent Sentry issues via CLI (if sentry-cli installed)
sentry-cli issues list --project slacklite --status unresolved --limit 10

# Or check Sentry dashboard:
# https://sentry.io/organizations/slacklite/issues/
# Filter: project=PROD, timefilter=1h, is:unresolved
```

#### E. Slow performance

```bash
# Check Vercel Edge Network latency
# → Vercel Dashboard → Analytics → Web Vitals

# Check Firestore slow queries
# → Firebase Console → Firestore → Usage → Slow query log (if enabled)

# Run a quick performance check
curl -w "
  DNS: %{time_namelookup}s
  Connect: %{time_connect}s
  TTFB: %{time_starttransfer}s
  Total: %{time_total}s
" -o /dev/null -s https://slacklite.app
```

### Step 4: Mitigate

**Fastest mitigation strategies, in order:**

1. **Roll back** if incident started immediately after a deploy → See [Rollback Runbook](./02-rollback.md)
2. **Disable broken feature** via feature flag (if applicable)
3. **Apply hotfix** if the fix is simple and < 30 minutes
4. **Restart** Vercel serverless functions by triggering a redeploy:
   ```bash
   vercel --prod --force
   ```
5. **Escalate to Firebase/Vercel support** if the issue is platform-level

### Step 5: Resolve & Communicate

Once the service is restored:

```bash
# Verify recovery
curl -f https://slacklite.app/api/health && echo "HEALTHY"
```

1. Post in `#incidents`: "✅ Incident resolved: [brief summary of fix]"
2. Update your status page (if applicable)
3. Close the incident in PagerDuty/alerting system

### Step 6: Post-Mortem (within 48 hours for P0/P1)

Use the template in Section 4 of this runbook.

---

## 3. Quick Reference: Key URLs

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel Logs | `vercel logs --prod` |
| Firebase Console | https://console.firebase.google.com/project/slacklite-prod |
| Sentry Issues | https://sentry.io/organizations/slacklite/issues/ |
| GitHub Actions | https://github.com/kellyclaudeai/bmad-factory/actions |
| Vercel Status | https://vercel-status.com |
| Firebase Status | https://status.firebase.google.com |

---

## 4. Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD  
**Severity:** P0/P1/P2  
**Duration:** X hours Y minutes  
**Incident Commander:** [Name]  
**Authors:** [Names]

## Summary

[2–3 sentence summary of what happened and impact]

## Timeline

| Time (CST) | Event |
|------------|-------|
| HH:MM | Incident detected via [Sentry/user report/etc] |
| HH:MM | Investigation started |
| HH:MM | Root cause identified: [brief description] |
| HH:MM | Mitigation applied: [what was done] |
| HH:MM | Service restored |
| HH:MM | Incident closed |

## Root Cause

[Detailed description of what caused the incident]

## Impact

- Users affected: [estimate]
- Duration: [X hours Y min]
- Features affected: [list]
- Data loss: [yes/no — if yes, describe]

## What Went Well

- [item 1]
- [item 2]

## What Went Wrong

- [item 1]
- [item 2]

## Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
| [Fix X] | [Name] | YYYY-MM-DD |
| [Add alert for Y] | [Name] | YYYY-MM-DD |
| [Update runbook for Z] | [Name] | YYYY-MM-DD |
```

---

## 5. Incident Timeline Log Template

Keep a running log during the incident (paste in a shared doc or Slack thread):

```
[HH:MM] [IC]: Incident declared — [brief description]
[HH:MM] [IC]: Investigating [component/area]
[HH:MM] [IC]: Found [observation]
[HH:MM] [IC]: Applying mitigation: [action]
[HH:MM] [IC]: Monitoring for recovery...
[HH:MM] [IC]: Service restored — [what was done]
[HH:MM] [IC]: Incident closed
```

---

## Related Runbooks

- [Deployment Runbook](./01-deployment.md)
- [Rollback Runbook](./02-rollback.md)
- [Monitoring Runbook](./04-monitoring.md)
- [On-Call Runbook](./05-on-call.md)
