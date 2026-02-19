# SlackLite Weekly Cost Log

Use this file as the running record for Monday cost reviews.

## How To Log Ongoing Reviews

1. Add one new section each Monday using the template below.
2. Pull numbers from Firebase Console (`Usage`) and GCP Billing (`Reports`, `Budgets & alerts`).
3. Compare against projected band from `docs/cost-optimization.md`.
4. Record anomalies, actions, and owners.
5. Keep entries append-only for auditability.

## Weekly Review Entry Template

```markdown
## Week Of YYYY-MM-DD

- Reviewer:
- Billing account: 01985F-2D08C2-BDA5A7
- Project: slacklite-prod
- Workspace estimate:

### Spend Summary
- Month-to-date spend (USD):
- Week spend delta (USD):
- Threshold events hit ($50 / $200 / $500):

### Usage Summary
- Firestore reads:
- Firestore writes:
- Firestore deletes:
- RTDB storage:
- RTDB bandwidth:
- Auth MAU:

### Variance Vs Projection
- Expected range:
- Actual:
- Variance:
- Likely cause:

### Actions
- [ ] Action item
- Owner:
- Due date:

### Follow-Up
- Risk level (low/medium/high):
- Notes:
```

## Pre-Launch Baseline Entry

## Week Of 2026-02-16

- Reviewer: Launch prep automation
- Billing account: 01985F-2D08C2-BDA5A7
- Project: slacklite-prod
- Workspace estimate: Pre-launch baseline (0-10 active test workspaces)

### Spend Summary
- Month-to-date spend (USD): `$0.00` (baseline placeholder, replace with actual billing export)
- Week spend delta (USD): `$0.00` (baseline placeholder)
- Threshold events hit ($50 / $200 / $500): None

### Usage Summary
- Firestore reads: Baseline only
- Firestore writes: Baseline only
- Firestore deletes: Baseline only
- RTDB storage: Baseline only
- RTDB bandwidth: Baseline only
- Auth MAU: Baseline only

### Variance Vs Projection
- Expected range: `$0-$8` pre-launch/low-traffic
- Actual: `$0.00` (placeholder)
- Variance: Within expected baseline band
- Likely cause: Non-production validation traffic only

### Actions
- [ ] Replace placeholder spend with actual first billing snapshot
- Owner: Project owner
- Due date: Next Monday review

### Follow-Up
- Risk level (low/medium/high): Low
- Notes: First production Monday review should include real Firestore read/write counts and confirmed threshold monitoring status.
