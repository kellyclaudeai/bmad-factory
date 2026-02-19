# Runbook: Deploying SlackLite to Production

**Last Updated:** 2026-02-19  
**Owner:** Engineering Team  
**Escalation:** See [on-call runbook](./05-on-call.md)

---

## Overview

SlackLite deploys to **Vercel** (Next.js frontend + API routes) backed by **Firebase** (Firestore, Realtime Database, Auth) on the `slacklite-prod` project.

CI/CD is automated via GitHub Actions (`.github/workflows/`). This runbook covers:
- **Normal deploys** (via git push / PR merge)
- **Manual / emergency deploys**
- **Pre/post deploy verification**

---

## 1. Normal Deployment (Recommended Path)

### 1.1 Merge to `main` triggers auto-deploy

```bash
# On your local machine
git checkout main
git pull origin main
git merge dev --no-ff -m "chore: merge dev into main for release vX.Y.Z"
git push origin main
```

GitHub Actions will:
1. Run linting (`pnpm lint`)
2. Run unit + integration tests (`pnpm test`)
3. Build the Next.js app
4. Deploy to Vercel production (auto-promoted)
5. Run smoke tests against production URL

**Monitor the deploy:**
- GitHub → Actions tab → latest workflow run
- Vercel Dashboard → slacklite → Deployments

### 1.2 Expected deploy time

| Phase | Duration |
|-------|----------|
| Tests | 2–4 min |
| Build | 3–5 min |
| Vercel deploy | 1–2 min |
| **Total** | **6–11 min** |

---

## 2. Manual Emergency Deploy

Use only when the CI/CD pipeline is broken and a fix is urgent.

### Prerequisites

```bash
# Required CLIs
node --version          # >= 22
pnpm --version          # >= 9
vercel --version        # >= 40
firebase --version      # >= 13
```

### 2.1 Deploy frontend to Vercel

```bash
cd /path/to/slacklite

# Build locally
pnpm install
pnpm build

# Deploy (will prompt for project link on first run)
vercel --prod
```

### 2.2 Deploy Firebase rules only

```bash
# Switch to production project
firebase use slacklite-prod

# Deploy security rules
firebase deploy --only firestore:rules,database:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 2.3 Full Firebase deploy (functions, rules, indexes)

```bash
firebase deploy --project slacklite-prod
```

---

## 3. Environment Variables

Production env vars live in **Vercel** (project settings → Environment Variables).

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | `slacklite-prod` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | ✅ | Realtime Database URL |
| `FIREBASE_ADMIN_PROJECT_ID` | ✅ | Server-side: `slacklite-prod` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | ✅ | Service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | ✅ | Service account private key |
| `SENTRY_DSN` | ✅ | Sentry error tracking DSN |
| `SENTRY_AUTH_TOKEN` | ✅ | Sentry source map upload token |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session secret |
| `NEXTAUTH_URL` | ✅ | Production URL (https://slacklite.app) |

**To add/update a variable:**

```bash
vercel env add VARIABLE_NAME production
# or via Vercel Dashboard → Settings → Environment Variables
```

After updating env vars, **trigger a redeploy**:

```bash
vercel --prod --force
```

---

## 4. Post-Deploy Verification Checklist

Run these checks within 5 minutes of every production deploy:

```bash
# 1. Health check endpoint
curl -f https://slacklite.app/api/health || echo "FAILED"

# 2. Auth page loads
curl -s -o /dev/null -w "%{http_code}" https://slacklite.app/login
# Expected: 200

# 3. Check Sentry for new errors
# → https://sentry.io/organizations/slacklite/issues/?project=PROD&query=is:unresolved&timefilter=24h

# 4. Check Vercel deployment status
vercel ls --prod
```

Manual smoke test:
- [ ] Login with test account
- [ ] Create a new channel
- [ ] Send a message — verify real-time delivery
- [ ] Open in second browser tab — verify message appears
- [ ] Logout — verify session cleared

---

## 5. Deployment Freeze Windows

Avoid deploying during:
- **Fridays 3pm–Sunday midnight** (weekend freeze)
- **Monday mornings 8–10am** (peak usage)
- **During active incidents** (see incident runbook)

---

## Related Runbooks

- [Rollback Runbook](./02-rollback.md)
- [Incident Response Runbook](./03-incident-response.md)
- [Monitoring Runbook](./04-monitoring.md)
