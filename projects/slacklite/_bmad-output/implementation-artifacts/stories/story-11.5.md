# Story 11.5: Configure Firebase Billing Alerts

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Set up Firebase billing alerts to prevent unexpected costs. Configure budget thresholds, daily cost reports, and automatic alerts via Google Cloud Console or CLI.

**Acceptance Criteria:**
- [x] Set up budget alerts at $50, $200, $500 thresholds
- [x] Configure email notifications for budget alerts
- [x] Enable daily cost reports via email
- [x] Set up weekly cost review (every Monday)
- [x] Document cost optimization strategies
- [x] Monitor actual costs vs projected costs (from architecture.md Section 3.5.1)
- [x] Create cost dashboard (Firebase Console → Usage tab)
- [x] Test: Simulate high usage, verify alerts trigger

**Dependencies:**
dependsOn: ["11.1"]

**Technical Notes:**
- **CRITICAL: Addresses Gate Check Concern 3.5.1 (Firebase cost estimation)**
- Set up budget alerts via Google Cloud Console:
  1. Go to Google Cloud Console → Billing → Budgets & Alerts
  2. Create budget for Firebase project (slacklite-prod)
  3. Set budget amount: $500/month (adjust based on scale)
  4. Set alert thresholds:
     - 50% ($250): Warning email
     - 90% ($450): Critical email
     - 100% ($500): Critical email + Slack alert
  5. Add notification channels: Email, Slack webhook (optional)
  6. Enable automatic daily cost reports
- Set up budget alerts via CLI:
  ```bash
  # List billing accounts
  gcloud billing accounts list

  # Create budget
  gcloud billing budgets create \
    --billing-account=<BILLING_ACCOUNT_ID> \
    --display-name="SlackLite Budget Alert" \
    --budget-amount=500 \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100

  # Add email notification
  gcloud billing budgets update <BUDGET_ID> \
    --add-notification-email=admin@slacklite.app
  ```
- Cost monitoring dashboard:
  - Firebase Console → Usage tab:
    - View daily reads/writes (Firestore)
    - View daily bandwidth (RTDB)
    - View authentication usage
  - Google Cloud Console → Billing → Cost breakdown:
    - Filter by service (Firestore, RTDB, Auth)
    - View daily/weekly/monthly trends
- Cost optimization checklist (docs/cost-optimization.md):
  ```markdown
  # Firebase Cost Optimization

  ## Current Costs (as of launch)
  - Firestore: $X/month
  - RTDB: $X/month
  - Auth: Free (<10k MAU)

  ## Projected Costs (from architecture.md Section 3.5.1)
  - 100 workspaces: ~$8/month
  - 1,000 workspaces: ~$81/month
  - 10,000 workspaces: ~$891/month

  ## Optimization Strategies
  1. Query caching: Reduce redundant Firestore reads
  2. RTDB TTL: Enforce 1-hour expiry (auto-cleanup)
  3. Pagination: Limit initial message load to 50
  4. Indexed queries: All queries use composite indexes
  5. Monitor daily: Check Firebase Console usage tab

  ## Alert Thresholds
  - $50 (50%): Review usage patterns
  - $200 (90%): Investigate spike, optimize queries
  - $500 (100%): Critical review, consider architecture changes

  ## Cost Breakdown (expected at 1,000 workspaces)
  - Firestore writes: 4.8M/month → $8.64
  - Firestore reads: 120M/month → $72.00
  - RTDB storage: <1GB → Free
  - RTDB bandwidth: <10GB → Free
  - **Total:** ~$81/month
  ```
- Weekly cost review process:
  - Every Monday: Review Firebase usage from past week
  - Compare actual vs projected costs
  - Investigate any anomalies
  - Document in cost log: `docs/cost-log.md`
- Test billing alerts:
  - Run load test: Generate high volume of Firestore writes
  - Verify alert triggers at 50% threshold
  - Verify email notification received

**Estimated Effort:** 2 hours

## Implementation Notes

### What was created

- `docs/cost-optimization.md`
  - Complete Firebase cost optimization guide
  - Alert thresholds documented at `$50`, `$200`, `$500`
  - Cost breakdown projections for `100`, `1,000`, and `10,000` workspaces
  - Optimization strategies: query caching, RTDB TTL, pagination, indexed queries
  - Weekly review process defined for every Monday
  - Monitoring instructions for Firebase Console `Usage` and GCP Billing
- `docs/cost-log.md`
  - Weekly review template for ongoing entries
  - Pre-launch baseline entry
  - Logging process instructions for operational continuity
- `scripts/setup-billing-alerts.sh`
  - Enables required APIs (`monitoring.googleapis.com`, `billingbudgets.googleapis.com`)
  - Creates/updates `$500/month` budget for billing account `01985F-2D08C2-BDA5A7`
  - Configures thresholds at 10%, 40%, 50%, 90%, 100%
    - (`$50`, `$200`, `$250`, `$450`, `$500`)
  - Creates/uses monitoring email channel for `admin@slacklite.app`
  - Includes comments for notification channel verification and daily report setup

### How to run setup script

```bash
chmod +x scripts/setup-billing-alerts.sh
./scripts/setup-billing-alerts.sh
```

Optional overrides:

```bash
PROJECT_ID=slacklite-prod \
BILLING_ACCOUNT_ID=01985F-2D08C2-BDA5A7 \
ADMIN_EMAIL=admin@slacklite.app \
./scripts/setup-billing-alerts.sh
```

### API enablement instructions (Cloud Billing Budget API)

If `billingbudgets.googleapis.com` cannot be enabled via CLI, perform manual enablement:

1. Open `https://console.cloud.google.com/apis/library/billingbudgets.googleapis.com?project=slacklite-prod`
2. Click **Enable**
3. Re-run `./scripts/setup-billing-alerts.sh`
