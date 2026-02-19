# SlackLite — Support Plan

**Version:** 1.0  
**Date:** 2026-02-19

---

## Support Channels

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| support@slacklite.app | General support, bug reports | < 24 hours |
| GitHub Issues | Bug reports, feature requests | 48 hours |
| In-app feedback | Quick feedback | Best effort |

---

## Issue Classification

### P0 — Critical (Service Down)
- App is inaccessible (HTTP 5xx or DNS failure)
- Authentication completely broken (cannot sign in)
- Data loss reported

**Response:** Immediate (< 1 hour)  
**Action:** Roll back deployment → investigate → fix → redeploy

### P1 — High (Major Feature Broken)
- Real-time messaging not working for all users
- Sign-up flow broken
- Database security rule violation

**Response:** < 4 hours  
**Action:** Hotfix branch → fix → test → deploy

### P2 — Medium (Feature Degraded)
- Unread counts inaccurate
- Mobile UI issues
- Occasional message delivery delays

**Response:** < 24 hours  
**Action:** Create GitHub issue → prioritize in next sprint

### P3 — Low (Minor Issues)
- UI polish issues
- Non-critical feature requests
- Documentation gaps

**Response:** < 48 hours  
**Action:** Add to backlog → prioritize appropriately

---

## Escalation Matrix

```
User Reports Issue
       ↓
Level 1: Support Email Triage
  - Reproduce issue
  - Check Sentry for errors
  - Check Vercel logs
       ↓ (if cannot resolve)
Level 2: Engineering Escalation
  - File GitHub issue with reproduction steps
  - Assign severity (P0-P3)
  - Implement fix
       ↓ (if production outage)
Level 3: Incident Response
  - Rollback deployment
  - Post status update
  - Root cause analysis
```

---

## Common Issues & Resolutions

### "I can't sign in"
1. Check email/password are correct
2. Check Firebase Auth console for account status
3. Check Sentry for auth-related errors

### "Messages not sending"
1. Check browser console for errors
2. Check Firebase RTDB connection status
3. Check Firestore security rules (may be blocking write)

### "App is slow"
1. Check Vercel Analytics for performance regression
2. Check Sentry for performance issues
3. Check Firebase quotas (Blaze plan limits)

---

## Monitoring Runbook

### Check Service Health
```bash
# Vercel deployment status
vercel ls --scope=slacklite

# Check latest deployment
vercel inspect [deployment-url]

# View function logs
vercel logs [deployment-url] --follow
```

### Check Firebase Health
```bash
# Firebase project status
firebase projects:list

# Check Firestore rules
firebase firestore:rules

# Check RTDB rules
firebase database:get /.settings/rules.json --project slacklite-prod
```

### View Sentry Errors
1. Log in to https://sentry.io
2. Navigate to slacklite project
3. Filter by environment: production
4. Sort by frequency or recency

---

## Incident Response Template

```
INCIDENT REPORT
Date: YYYY-MM-DD HH:MM UTC
Severity: P0 / P1 / P2 / P3
Status: Investigating / Identified / Monitoring / Resolved

Summary:
[Brief description of the incident]

Impact:
- Affected users: [estimate]
- Duration: [HH:MM]
- Features affected: [list]

Timeline:
- HH:MM: Issue first reported
- HH:MM: Engineering notified
- HH:MM: Root cause identified
- HH:MM: Fix deployed
- HH:MM: Monitoring for stability
- HH:MM: Resolved

Root Cause:
[Technical description]

Resolution:
[What was done to fix it]

Prevention:
[What will be done to prevent recurrence]
```

---

## Contact Directory

| Role | Contact |
|------|---------|
| Support Email | support@slacklite.app |
| GitHub Issues | https://github.com/kelly-1224s-projects/slacklite/issues |
| Production URL | https://slacklite.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Firebase Console | https://console.firebase.google.com/project/slacklite-prod |
| Sentry Dashboard | https://sentry.io |
