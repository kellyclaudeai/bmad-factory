# SlackLite Production Runbooks

**Last Updated:** 2026-02-19  
**Project:** SlackLite — Lightweight Team Messaging  
**Environment:** Production (`slacklite-prod`)

---

## Runbook Index

| # | Runbook | Use When |
|---|---------|----------|
| 01 | [Deployment](./01-deployment.md) | Deploying to production (normal or emergency) |
| 02 | [Rollback](./02-rollback.md) | Reverting a bad deployment |
| 03 | [Incident Response](./03-incident-response.md) | Diagnosing and resolving outages |
| 04 | [Database Operations](./04-database-operations.md) | Firestore/RTDB backup, restore, maintenance |
| 05 | [Monitoring](./05-monitoring.md) | Using Sentry, Vercel Analytics, Firebase dashboards |
| 06 | [On-Call](./06-on-call.md) | On-call responsibilities, escalation, contacts |

---

## Quick Links

| Resource | URL |
|----------|-----|
| Production App | https://slacklite.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Firebase Console | https://console.firebase.google.com/project/slacklite-prod |
| Sentry Issues | https://sentry.io/organizations/slacklite/issues |
| GitHub Actions | https://github.com/kellyclaudeai/bmad-factory/actions |
| GCP Billing | https://console.cloud.google.com/billing |

---

## Architecture Overview

SlackLite stack:
- **Frontend:** Next.js 15 (React) — deployed to Vercel
- **Auth:** Firebase Authentication (Email/Password)
- **Database (persistent):** Firestore (`slacklite-prod`)
- **Database (real-time):** Firebase Realtime Database
- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics + Speed Insights
- **CI/CD:** GitHub Actions → Vercel auto-deploy

---

## When in Doubt

1. **Is it down?** → Start with [Incident Response](./03-incident-response.md)
2. **Bad deploy?** → [Rollback](./02-rollback.md)
3. **Need to deploy?** → [Deployment](./01-deployment.md)
4. **Database issue?** → [Database Operations](./04-database-operations.md)
5. **Unclear what's wrong?** → [Monitoring](./05-monitoring.md)
6. **Need to escalate?** → [On-Call](./06-on-call.md)
