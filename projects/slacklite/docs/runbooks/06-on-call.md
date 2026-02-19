# Runbook: On-Call Guide

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team

---

## Overview

This runbook covers on-call responsibilities, escalation paths, and contact information for SlackLite production operations.

---

## 1. On-Call Responsibilities

The on-call engineer is responsible for:

- Monitoring alerts during their shift
- Responding to P0/P1 incidents within 15 minutes
- Triaging and escalating as needed
- Updating the incident log
- Handing off open incidents to the next on-call

**On-call shift:** Typically 1 week rotations. Schedule managed in PagerDuty (or equivalent).

---

## 2. Alert Channels

| Channel | Use For | How to Access |
|---------|---------|---------------|
| Sentry Alerts | Error rate spikes, new high-volume errors | sentry.io → Alerts |
| Vercel Alerts | Build failures, function errors | vercel.com → Notifications |
| Firebase Alerts | Quota warnings, billing thresholds | Firebase Console → Alerts |
| GCP Billing Alerts | Cost threshold breaches ($50/$200/$500) | GCP Console → Billing → Budgets |

---

## 3. Escalation Path

```
Level 1 (On-Call Engineer)
  → Acknowledge within 15 min (P0/P1) or 1 hour (P2)
  → Attempt resolution using runbooks

Level 2 (Senior Engineer / Tech Lead)
  → Escalate if: unable to resolve in 30 min (P0) or 2 hours (P1)
  → Contact: [FILL IN — e.g., Slack DM, phone]

Level 3 (Engineering Manager)
  → Escalate if: requires architectural change, data loss, or customer communication
  → Contact: [FILL IN]

Level 4 (Firebase/Vercel Support)
  → For platform-level issues only
  → Firebase Support: https://firebase.google.com/support
  → Vercel Support: https://vercel.com/support
```

---

## 4. Contact Directory

> **Note:** Fill in actual contact info before going to production.

| Role | Name | Primary Contact | Secondary Contact |
|------|------|----------------|------------------|
| On-Call Engineer | [FILL IN] | [Slack / Phone] | [Email] |
| Tech Lead | [FILL IN] | [Slack / Phone] | [Email] |
| Engineering Manager | [FILL IN] | [Slack / Phone] | [Email] |
| Firebase Account Owner | [FILL IN] | [Email] | — |
| Vercel Account Owner | [FILL IN] | [Email] | — |

---

## 5. On-Call Shift Handoff

At the end of each on-call shift, complete the following:

```markdown
## On-Call Handoff — [Date]

**Outgoing On-Call:** [Name]
**Incoming On-Call:** [Name]

### Open Incidents
- [ ] [Incident title] — Status: [investigating/mitigated] — Link: [issue URL]

### Alerts to Watch
- [Any recurring alert or flapping monitor to be aware of]

### Pending Work
- [Any maintenance task scheduled during next shift]

### Notes
- [Anything unusual observed during the shift]
```

---

## 6. First 5 Minutes of an Alert

When you receive a page/alert:

1. **Acknowledge** the alert (stop the noise)
2. **Open the monitoring runbook** → [Monitoring Runbook](./05-monitoring.md)
3. **Check health endpoint:**
   ```bash
   curl -s https://slacklite.app/api/health | jq .
   ```
4. **Check Sentry** for errors in the last 5 minutes
5. **Check Vercel** for failed deployments or function errors
6. **Decide severity** (P0–P3) using the [Incident Response Runbook](./03-incident-response.md)
7. **If P0/P1:** Declare incident and post in `#incidents` immediately

---

## 7. Non-Emergency Support Requests

For non-emergency issues (P3/P4 bug reports, feature questions):

- Direct users to: [support email / GitHub Issues]
- Log in GitHub Issues with label `bug` or `support`
- Triage during next business day standup

---

## 8. Useful Commands for On-Call

```bash
# Quick health check
curl -f https://slacklite.app/api/health

# Recent Vercel logs (last 100 lines)
vercel logs --prod --output raw | tail -100

# List recent Vercel deployments
vercel ls --prod | head -5

# Firebase project status
firebase projects:list | grep slacklite

# Check Firestore rules
cat firestore.rules | head -30

# Check RTDB rules
cat database.rules.json

# Trigger emergency redeploy
vercel --prod --force

# Roll back to previous deployment (see rollback runbook for full steps)
vercel promote <previous-deployment-url>
```

---

## 9. Communication Templates

### User-Facing Incident Notice

```
🔴 We're aware of an issue affecting [feature] for some users.
Our team is actively investigating. We'll provide an update in [30 min / 1 hour].
Thank you for your patience.
— SlackLite Team
```

### Incident Resolution Notice

```
✅ The issue affecting [feature] has been resolved as of [time].
If you're still experiencing problems, please try refreshing the page.
We apologize for the inconvenience.
— SlackLite Team
```

---

## Related Runbooks

- [Incident Response Runbook](./03-incident-response.md)
- [Monitoring Runbook](./05-monitoring.md)
- [Rollback Runbook](./02-rollback.md)
- [Deployment Runbook](./01-deployment.md)
