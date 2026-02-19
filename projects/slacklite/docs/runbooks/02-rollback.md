# Runbook: Rolling Back a Production Deployment

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team  
**Time to execute:** 5–15 minutes  
**Escalation:** See [on-call runbook](./05-on-call.md)

---

## When to Roll Back

Roll back immediately if any of the following are true after a deploy:

- [ ] Error rate in Sentry spikes > 10% of requests
- [ ] `/api/health` returns non-200
- [ ] Real-time messaging is broken (messages not appearing)
- [ ] Authentication is broken (login/signup failing)
- [ ] P95 latency exceeds 3 seconds (from Vercel Analytics)
- [ ] On-call receives > 3 user-reported errors within 10 minutes

---

## 1. Roll Back Vercel Deployment (Frontend + API Routes)

This is the fastest rollback path and should be tried first.

### Option A: Vercel Dashboard (Recommended — 2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com) → **slacklite** project
2. Click **Deployments** tab
3. Find the last known-good deployment (before the broken one)
4. Click the `...` menu → **Promote to Production**
5. Confirm the promotion

### Option B: Vercel CLI

```bash
# List recent deployments
vercel ls --prod

# Promote a specific deployment URL to production
vercel promote <deployment-url>

# Example:
vercel promote https://slacklite-abc123.vercel.app
```

### Option C: Git Revert + Redeploy

```bash
# Find the commit to revert to
git log --oneline -10

# Revert the bad commit
git revert <bad-commit-hash> --no-edit

# Push — triggers automatic CI/CD redeploy
git push origin main
```

---

## 2. Roll Back Firebase Security Rules

If a rules change caused auth or data access issues:

```bash
# Switch to production project
firebase use slacklite-prod

# Check git for the previous rules
git log --oneline -- firestore.rules database.rules.json

# Checkout the previous version
git checkout <previous-commit-hash> -- firestore.rules database.rules.json

# Redeploy rules
firebase deploy --only firestore:rules,database:rules

# Commit the revert
git add firestore.rules database.rules.json
git commit -m "revert: roll back Firebase rules to <previous-commit-hash>"
git push origin main
```

---

## 3. Roll Back Firestore Indexes

```bash
# Checkout the previous index config
git checkout <previous-commit-hash> -- firestore.indexes.json

# Redeploy indexes
firebase deploy --only firestore:indexes

# Note: Index deletions can take 5–30 minutes to propagate
```

---

## 4. Emergency: Disable a Feature Flag

If a specific feature is causing issues but full rollback is risky:

```bash
# Set a feature flag to disabled in Firestore
# (Assuming feature flags are stored in /config/features)

firebase firestore:set /config/features --data '{"realtime_typing_indicators": false}'

# Or via the Firebase Console:
# Firestore → config → features → Edit document
```

---

## 5. Post-Rollback Verification

After completing the rollback:

```bash
# Verify health endpoint
curl -f https://slacklite.app/api/health

# Check error rate in Sentry (should drop back to baseline)
# https://sentry.io/organizations/slacklite/issues/?project=PROD

# Test core user flows
# 1. Login
# 2. Send a message
# 3. Receive real-time message in second tab
```

---

## 6. Post-Incident Actions

After stabilizing:

1. **Create a post-mortem issue** in GitHub:
   - What went wrong?
   - How was it detected?
   - Timeline of events
   - Root cause
   - Action items to prevent recurrence

2. **Update this runbook** if the rollback process revealed gaps

3. **File a bug** for the broken feature so it gets fixed properly before the next deploy attempt

---

## Related Runbooks

- [Deployment Runbook](./01-deployment.md)
- [Incident Response Runbook](./03-incident-response.md)
