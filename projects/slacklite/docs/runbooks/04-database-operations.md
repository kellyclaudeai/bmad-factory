# Runbook: Database Operations (Firestore & Realtime Database)

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team  
**Firebase Project:** `slacklite-prod`

---

## Overview

SlackLite uses two Firebase databases:

| Database | Purpose | Key Collections/Paths |
|----------|---------|----------------------|
| **Firestore** | Persistent data (workspaces, channels, messages, users) | `/workspaces`, `/channels`, `/messages`, `/users` |
| **Realtime Database (RTDB)** | Real-time ephemeral data (typing indicators, presence, live message sync) | `/messages/{workspaceId}/{channelId}`, `/presence`, `/typing` |

---

## 1. Accessing Production Data

### Firestore via CLI

```bash
# Switch to production project
firebase use slacklite-prod

# List documents in a collection
firebase firestore:get /workspaces --limit 5

# Export a collection to JSON
firebase firestore:export gs://slacklite-prod.appspot.com/exports/$(date +%Y%m%d)
```

### Firestore via Console

1. Go to https://console.firebase.google.com/project/slacklite-prod/firestore
2. Browse collections in the left panel
3. Click any document to view/edit fields

### RTDB via CLI

```bash
# Read data at a path
firebase database:get --project slacklite-prod /presence

# Read with a limit
firebase database:get --project slacklite-prod /messages/workspace123 --limit-to-first 10
```

### RTDB via Console

1. Go to https://console.firebase.google.com/project/slacklite-prod/database
2. Navigate the tree in the UI

---

## 2. Backups

### Firestore Backups

Firebase does **not** auto-backup Firestore on the free tier. On Blaze plan, use scheduled exports.

#### Manual Backup

```bash
# Authenticate with GCloud
gcloud auth login
gcloud config set project slacklite-prod

# Export all Firestore collections to GCS
gcloud firestore export gs://slacklite-prod.appspot.com/backups/manual/$(date +%Y%m%d-%H%M%S)

# Verify the export
gsutil ls gs://slacklite-prod.appspot.com/backups/
```

#### Scheduled Daily Backup (Recommended)

Set up a Cloud Scheduler job (via GCP Console or CLI):

```bash
# Create a scheduled export job (daily at 2am UTC)
gcloud scheduler jobs create http firestore-daily-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/slacklite-prod/databases/(default):exportDocuments" \
  --message-body='{"outputUriPrefix": "gs://slacklite-prod.appspot.com/backups/daily"}' \
  --oauth-service-account-email=firebase-adminsdk@slacklite-prod.iam.gserviceaccount.com \
  --time-zone="America/Chicago"

# Verify job was created
gcloud scheduler jobs list
```

#### Backup Retention Policy

| Backup Type | Retention | Storage |
|-------------|-----------|---------|
| Daily | 30 days | GCS: `gs://slacklite-prod.appspot.com/backups/daily/` |
| Weekly | 12 weeks | GCS: `gs://slacklite-prod.appspot.com/backups/weekly/` |
| Pre-deploy | 7 days | GCS: `gs://slacklite-prod.appspot.com/backups/pre-deploy/` |

---

## 3. Restoring Firestore Data

⚠️ **WARNING: Restore operations overwrite existing data. Always create a backup before restoring.**

### Full Restore

```bash
# List available backups
gsutil ls gs://slacklite-prod.appspot.com/backups/

# Restore from a specific backup
gcloud firestore import gs://slacklite-prod.appspot.com/backups/daily/2026-02-18-020000 \
  --project slacklite-prod

# Monitor import progress
gcloud firestore operations list --project slacklite-prod
```

### Partial Restore (Single Collection)

```bash
# Restore only the 'messages' collection
gcloud firestore import gs://slacklite-prod.appspot.com/backups/daily/2026-02-18-020000 \
  --collection-ids=messages \
  --project slacklite-prod
```

---

## 4. RTDB Operations

RTDB data is ephemeral (presence, typing indicators, recent messages for real-time delivery). Loss of RTDB data is low-severity — it self-populates as users interact.

### Clear Stale Presence Data

```bash
# Remove all presence data (users will re-register on next connection)
firebase database:remove --project slacklite-prod /presence --confirm

# Remove stale typing indicators
firebase database:remove --project slacklite-prod /typing --confirm
```

### Clear Old RTDB Messages (if TTL enforcement needs to be manual)

```bash
# The RTDB stores only recent messages for real-time sync.
# Messages older than 1 hour should be purged.
# Architecture: 1-hour TTL enforced by Cloud Functions (if implemented)
# Manual cleanup:
firebase database:remove --project slacklite-prod /messages/old-workspace-id --confirm
```

---

## 5. Security Rules Deployment

```bash
# Validate rules before deploying
firebase firestore:rules:validate firestore.rules

# Deploy rules (dry-run first — verify in console)
firebase deploy --only firestore:rules,database:rules --project slacklite-prod

# To roll back rules, see: Rollback Runbook → Section 2
```

---

## 6. Firestore Indexes

```bash
# Deploy composite indexes (from firestore.indexes.json)
firebase deploy --only firestore:indexes --project slacklite-prod

# List existing indexes
firebase firestore:indexes --project slacklite-prod

# Note: Index creation can take 5–30 minutes; queries may fail during index build
```

---

## 7. Monitoring Database Health

### Firestore

- **Firebase Console → Firestore → Usage**: Read/write/delete operations, storage
- **GCP Console → Firestore → Monitoring**: P50/P95/P99 latency, error rates

### RTDB

- **Firebase Console → Realtime Database → Usage**: Connections, bandwidth, storage
- **Alert thresholds** (from architecture.md Section 3.5.1):
  - Firestore writes > 500k/day: Investigate
  - RTDB connections > 10k simultaneous: Investigate
  - Bandwidth > 10GB/month: Review and optimize

### Cost Monitoring

See [Firestore Cost Estimation](../../_bmad-output/planning-artifacts/architecture.md) Section 3.5.1:

| Scale | Expected Cost |
|-------|--------------|
| 100 workspaces | ~$8/month |
| 1,000 workspaces | ~$81/month |
| 10,000 workspaces | ~$891/month |

```bash
# Check current month's cost
gcloud billing accounts list  # get billing account ID
gcloud billing projects describe slacklite-prod
```

---

## 8. Common Database Issues

### Issue: "PERMISSION_DENIED" errors in Sentry

**Cause:** Firestore/RTDB security rules blocking a legitimate operation  
**Fix:**
1. Check the rules in `firestore.rules` / `database.rules.json`
2. Check the Firestore debug logs in the console (Rules Playground)
3. Adjust rules and redeploy: `firebase deploy --only firestore:rules`

### Issue: Firestore quota exceeded

**Cause:** Too many reads/writes per day (free tier: 50k reads, 20k writes/day)  
**Fix:**
1. Check usage in Firebase Console → Firestore → Usage
2. Identify the high-volume operation in Sentry/logs
3. Add query caching or pagination to reduce reads
4. Upgrade billing plan if legitimately needed

### Issue: RTDB connection drops for users

**Cause:** Network instability, RTDB rule changes, or bandwidth quota  
**Fix:**
1. Check RTDB bandwidth in Firebase Console → Realtime Database → Usage
2. Verify rules allow authenticated reads: `firebase database:get --project slacklite-prod /.settings/rules`
3. Trigger a reconnection test from the browser console:
   ```javascript
   // In browser console on slacklite.app
   firebase.database().goOffline();
   firebase.database().goOnline();
   ```

---

## Related Runbooks

- [Incident Response Runbook](./03-incident-response.md)
- [Monitoring Runbook](./05-monitoring.md)
- [Rollback Runbook](./02-rollback.md)
