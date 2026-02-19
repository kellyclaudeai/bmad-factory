# SlackLite Cost Optimization Guide

Project: `slacklite-prod`  
Billing account: `01985F-2D08C2-BDA5A7`  
Budget target: `$500/month`

## Alert Thresholds

Use these checkpoints to catch spend early:

- `$50` (10%): early warning, confirm expected growth.
- `$200` (40%): investigate usage spikes and optimize immediately.
- `$500` (100%): critical threshold, freeze non-essential workloads and escalate.

Budget policy can include additional internal signals at `50% ($250)` and `90% ($450)` for progressive escalation.

## Cost Breakdown Projections

Reference model from architecture cost assumptions:

| Workspace count | Firestore writes | Firestore reads | Estimated monthly cost |
| --- | --- | --- | --- |
| 100 | 0.48M (`~$0.86`) | 12M (`~$7.20`) | `~$8` |
| 1,000 | 4.8M (`~$8.64`) | 120M (`~$72.00`) | `~$81` |
| 10,000 | 48M (`~$86.40`) | 1.2B (`~$720.00`) | `~$891` planning envelope |

Notes:
- `~$891` at 10,000 workspaces is the operational planning envelope (includes growth headroom above direct read/write line items).
- Firebase Auth remains effectively free below the current monthly active user free tier.
- RTDB usage remains low if ephemeral presence and typing data are aggressively expired.

## Optimization Strategies

### 1. Query Caching
- Cache repeated room/thread reads in memory and/or edge cache where possible.
- Deduplicate concurrent fetches for the same document set.
- Reduce repeated hydration of unchanged collections.

### 2. RTDB TTL Enforcement
- Set short-lived keys for presence/typing with hard TTL cleanup.
- Keep ephemeral records on a strict expiry policy (target: 1 hour or less).
- Periodically verify old presence data is not accumulating.

### 3. Pagination Controls
- Limit initial message fetch size (for example: first 50 messages).
- Load older messages incrementally with cursor-based pagination.
- Avoid broad unbounded history reads on channel open.

### 4. Indexed Queries
- Ensure all production read patterns are backed by required composite indexes.
- Reject or refactor any query pattern that triggers collection scans.
- Periodically review slow query logs and index recommendations.

## Weekly Cost Review Process (Every Monday)

Run this checklist every Monday:

1. Open Firebase Console usage metrics for the prior 7 days.
2. Open GCP Billing cost breakdown for the same period.
3. Compare actual spend vs. projected band (100/1,000/10,000 workspace model).
4. Log anomalies and likely root cause in `docs/cost-log.md`.
5. Assign optimization follow-ups with an owner and due date.
6. Confirm alert channels are healthy and budget notifications are still active.

## Monitoring Dashboard Instructions

### Firebase Console (Usage)
1. Go to Firebase Console.
2. Select project `slacklite-prod`.
3. Open `Usage` tab.
4. Review Firestore reads/writes/deletes, Realtime Database bandwidth/storage, and Auth usage.
5. Compare day-over-day trends and spike windows.

### Google Cloud Billing (Cost Breakdown)
1. Open Google Cloud Console.
2. Go to `Billing` -> `Reports` (and `Budgets & alerts` for threshold events).
3. Filter billing account `01985F-2D08C2-BDA5A7`.
4. Group by service and SKU to identify cost drivers.
5. Export/report weekly totals and update `docs/cost-log.md`.
