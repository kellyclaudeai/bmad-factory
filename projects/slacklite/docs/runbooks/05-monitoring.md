# Runbook: Monitoring & Observability

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team

---

## Overview

SlackLite uses three monitoring tools:

| Tool | Purpose | Access |
|------|---------|--------|
| **Sentry** | Error tracking, crash reports, performance traces | https://sentry.io/organizations/slacklite |
| **Vercel Analytics** | Web Vitals, page performance, traffic | Vercel Dashboard → Analytics |
| **Firebase Console** | Database usage, auth activity, billing | https://console.firebase.google.com/project/slacklite-prod |

---

## 1. Sentry — Error Tracking

### Configured in:
- `sentry.client.config.ts` — browser-side errors
- `sentry.server.config.ts` — server-side / API route errors
- `sentry.edge.config.ts` — edge middleware errors
- `instrumentation.ts` — server startup / initialization errors

### Daily Monitoring Checklist

```
□ Check Sentry Issues dashboard for new unresolved errors
  URL: https://sentry.io/organizations/slacklite/issues/?project=PROD&query=is:unresolved

□ Review error rate trend (should be < 0.5% of requests)
  URL: https://sentry.io/organizations/slacklite/performance/

□ Check for any P0/P1 alerts in Sentry Alerts tab
  URL: https://sentry.io/organizations/slacklite/alerts/
```

### Alert Thresholds (configure in Sentry → Alerts)

| Alert | Threshold | Action |
|-------|-----------|--------|
| Error rate spike | > 5% of requests in 5 min | Page on-call |
| New issue (high volume) | > 100 occurrences in 1 hour | Notify team |
| Performance regression | P95 > 3s for any route | Notify team |
| Auth failures | > 50 auth errors in 5 min | Page on-call |

### Sentry CLI (optional)

```bash
# Install sentry-cli
npm install -g @sentry/cli

# List recent issues
sentry-cli issues list --project slacklite --status unresolved --limit 20

# Mark an issue as resolved
sentry-cli issues update <issue-id> --status resolved
```

---

## 2. Vercel Analytics — Performance Monitoring

### Core Web Vitals Targets

SlackLite targets (from story 11.4 implementation):

| Metric | Target | Source |
|--------|--------|--------|
| **FCP** (First Contentful Paint) | < 1.8s | Vercel Speed Insights |
| **LCP** (Largest Contentful Paint) | < 2.5s | Vercel Speed Insights |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Vercel Speed Insights |
| **INP** (Interaction to Next Paint) | < 200ms | Vercel Speed Insights |
| **TTFB** (Time to First Byte) | < 800ms | Vercel Speed Insights |

### Custom SlackLite Metrics

| Metric | Target | Where Tracked |
|--------|--------|---------------|
| Message send latency | < 500ms | Vercel custom metric |
| Channel switch time | < 200ms | Vercel custom metric |
| Auth load time | < 1s | Vercel custom metric |

### Accessing Analytics

1. Go to [Vercel Dashboard](https://vercel.com) → **slacklite** project
2. Click **Analytics** tab → Web Vitals
3. Click **Speed Insights** tab → Real User Monitoring

### What to Watch

```
□ Weekly: Check Web Vitals trend — all metrics should be "Good" (green)
□ After deploy: Check if any metrics degraded vs previous week
□ Monthly: Review traffic patterns, top pages, geographic distribution
```

---

## 3. Firebase Console — Infrastructure Monitoring

### Firestore Monitoring

1. Go to https://console.firebase.google.com/project/slacklite-prod/firestore
2. Click **Usage** tab

**Key metrics to monitor:**

| Metric | Warning Threshold | Action |
|--------|-------------------|--------|
| Daily reads | > 40k (80% of free tier) | Check for query leaks |
| Daily writes | > 16k (80% of free tier) | Check for write storms |
| Storage | > 900MB (90% of 1GB free) | Archive old messages |
| Rules evaluations denied | > 100/day | Check auth + rules |

### Realtime Database Monitoring

1. Go to https://console.firebase.google.com/project/slacklite-prod/database
2. Click **Usage** tab

**Key metrics:**

| Metric | Warning Threshold | Action |
|--------|-------------------|--------|
| Simultaneous connections | > 8,000 (80% of 10k limit) | Scale plan or optimize |
| Bandwidth | > 8GB/month | Review RTDB TTL enforcement |
| Storage | > 900MB | Run TTL cleanup |

### Authentication Monitoring

1. Go to https://console.firebase.google.com/project/slacklite-prod/authentication
2. View **Users** tab for user growth
3. View **Usage** tab for MAU

---

## 4. Uptime Monitoring

Set up external uptime checks (free options: UptimeRobot, Better Uptime):

**Endpoints to monitor:**

| Endpoint | Expected | Check Interval |
|----------|---------|----------------|
| `https://slacklite.app` | HTTP 200 | 1 minute |
| `https://slacklite.app/api/health` | HTTP 200 + `{"status":"ok"}` | 1 minute |
| `https://slacklite.app/login` | HTTP 200 | 5 minutes |

**Manual uptime check:**

```bash
# Quick health check
curl -s https://slacklite.app/api/health | jq .

# Full endpoint check
for endpoint in "" "/api/health" "/login"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://slacklite.app$endpoint")
  echo "$endpoint → HTTP $code"
done
```

---

## 5. Log Monitoring

### Vercel Function Logs

```bash
# Real-time logs (production)
vercel logs --prod --follow

# Last 100 lines
vercel logs --prod --output raw | tail -100

# Filter for errors
vercel logs --prod --output raw | grep -i "error\|exception\|fatal"
```

### Firebase Functions Logs (if applicable)

```bash
# Stream logs
firebase functions:log --project slacklite-prod

# Last 50 lines
firebase functions:log --project slacklite-prod -n 50
```

---

## 6. Weekly Review Checklist

Every Monday morning, run through this checklist:

```
□ Error Rate: Sentry → check new unresolved issues this week
□ Performance: Vercel Analytics → Web Vitals vs last week
□ Database Costs: Firebase Console → Usage tab → week-over-week change
□ Auth Users: Firebase Auth → new signups this week
□ Uptime: Check uptime monitor → any downtime incidents?
□ Billing: GCP Console → Billing → confirm within budget
□ Security: Sentry → any auth-related errors or anomalies?
```

---

## 7. Runbook for Performance Degradation

If P95 latency exceeds targets:

```bash
# 1. Check which routes are slow
# Vercel Analytics → Performance → slowest routes

# 2. Check Firestore slow queries
# Firebase Console → Firestore → Usage → slow queries tab

# 3. Profile a slow page load
curl -w "
  DNS: %{time_namelookup}s
  TCP: %{time_connect}s
  TTFB: %{time_starttransfer}s
  Total: %{time_total}s
" -o /dev/null -s "https://slacklite.app/[slow-route]"

# 4. Check for N+1 query patterns
rg "await.*firestore\|getDoc\|getDocs" app/ --type ts -l

# 5. Review Sentry Performance for slow transactions
# Sentry → Performance → filter by route
```

---

## Related Runbooks

- [Incident Response Runbook](./03-incident-response.md)
- [Database Operations Runbook](./04-database-operations.md)
- [On-Call Runbook](./06-on-call.md)
