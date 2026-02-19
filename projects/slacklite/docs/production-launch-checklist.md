# SlackLite — Production Launch Checklist

**Version:** 1.0  
**Date:** 2026-02-19  
**Prepared By:** Amelia (BMAD Developer)

---

## Pre-Launch Infrastructure

### Firebase
- [x] Firebase project `slacklite-prod` created and active
- [x] Firestore enabled (us-central1, production mode)
- [x] Realtime Database enabled (us-central1)
- [x] Firebase Authentication enabled (Email/Password provider)
- [x] Firestore security rules deployed
- [x] RTDB security rules deployed
- [x] Billing enabled (Blaze plan) — required for production traffic
- [x] Firebase App Check configured (optional but recommended)

### Vercel
- [x] Vercel project linked to GitHub repo
- [x] Production domain: https://slacklite.app
- [x] Environment variables set in Vercel Dashboard:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY`
  - `SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`
  - `NEXT_PUBLIC_SENTRY_DSN`
- [x] Deployment Protection disabled (public access)
- [x] Preview deployments enabled for PRs

---

## Feature Smoke Tests

Run these tests on https://slacklite.app before launch announcement.

### Authentication Flow
```
1. Go to https://slacklite.app
2. Click "Sign Up" → fill out email/password → submit
3. Verify: Redirected to /create-workspace
4. Enter workspace name → submit
5. Verify: Redirected to /app/channels/{generalId}
6. Click sign out → confirm dialog → submit
7. Verify: Redirected to landing page
8. Sign back in with same credentials
9. Verify: Redirected to /app
```
**Status:** ✅ PASS

### Channel Management
```
1. Sign in → navigate to /app
2. Click "+ New Channel" in sidebar
3. Enter channel name (e.g., "test-channel") → click Create
4. Verify: Channel appears in sidebar, URL changes to /app/channels/{id}
5. Click the new channel in sidebar
6. Verify: Active channel highlighted (bold, left border)
7. Open Settings (gear icon) → Rename → enter new name → Save
8. Verify: Channel name updated in sidebar and header
9. Open Settings → Delete → confirm
10. Verify: Redirected to #general, channel removed from sidebar
```
**Status:** ✅ PASS

### Real-Time Messaging
```
1. Open two browser tabs, both signed in to same workspace (different users)
2. In Tab 1: Type message in #general → press Enter
3. Verify Tab 1: Message appears immediately (optimistic UI)
4. Verify Tab 2: Message appears within 500ms
5. Test: Send 10 messages rapidly → verify no duplicates
6. Test: Type >4000 characters → verify send button disabled
7. Test: Close network (DevTools) → send message → verify error state
8. Test: Restore network → retry → verify message sends
```
**Status:** ✅ PASS

### Direct Messages
```
1. Sign in as User A → click on User B in member list
2. Verify: Redirected to /app/dms/{dmId}
3. Send a message → verify it appears
4. Sign in as User B in another tab
5. Verify: Unread badge on User A's name in User B's sidebar
6. Open DM → verify badge clears
7. Send reply → verify real-time delivery
```
**Status:** ✅ PASS

### Mobile Responsiveness
```
1. Open https://slacklite.app on iPhone or Android
2. Verify: Landing page renders correctly
3. Sign in → verify app loads with hamburger menu
4. Tap hamburger → verify sidebar slides open
5. Select a channel → verify sidebar closes
6. Type and send a message → verify virtual keyboard doesn't break layout
7. Swipe right from left edge → verify sidebar opens
8. Swipe left on sidebar → verify it closes
```
**Status:** ✅ PASS

---

## Monitoring Verification

### Sentry Error Tracking
```bash
# Trigger a test error to verify Sentry captures it:
# 1. In browser console on https://slacklite.app:
throw new Error("Sentry test error - SlackLite launch verification")

# 2. Check Sentry dashboard at https://sentry.io
# Expected: Error appears within 30 seconds with full stack trace
```
**Status:** ✅ Configured

### Vercel Analytics
- Navigate to Vercel Dashboard → slacklite project → Analytics
- Verify page views appear after browsing the site
- Verify Web Vitals (LCP, CLS, FID) are being collected

**Status:** ✅ Active

### Vercel Speed Insights
- Navigate to Vercel Dashboard → slacklite project → Speed Insights
- Verify performance metrics visible after browsing

**Status:** ✅ Active

---

## Beta User Testing

### Invite Process
1. Sign in to https://slacklite.app
2. Open Sidebar → "Invite Team" button
3. Copy the invite link
4. Share with beta users via email/Slack

### Beta Feedback Collection
- **Feedback Form:** [Create Google Form with these questions]
  1. Were you able to sign up and join the workspace?
  2. Did real-time messaging work reliably? (1-5 rating)
  3. Did the app feel responsive on mobile?
  4. What features would you like to see added?
  5. Any bugs or issues encountered?

### Target Beta Users
- 5-10 users from team/network
- Mix of mobile (iOS + Android) and desktop users
- At least 2 users testing simultaneously for real-time feature validation

---

## Support Setup

### Support Email
- **Email:** support@slacklite.app
- Forward to team email or create dedicated support inbox

### Support Process
See `docs/support-plan.md` for detailed escalation procedures.

---

## Launch Announcements

See `docs/launch-announcement.md` for platform-specific copy.

### Platforms
- [ ] Twitter/X: Short punchy announcement with GIF
- [ ] Product Hunt: Full listing with screenshots and description
- [ ] Hacker News: "Show HN" post
- [ ] LinkedIn: Professional announcement

---

## Post-Launch Monitoring (First 24 Hours)

### Metrics to Watch
- [ ] Error rate in Sentry (target: <1% of sessions)
- [ ] Vercel deployment status (green)
- [ ] Firebase Firestore read/write costs (monitor billing)
- [ ] RTDB connections (monitor for spikes)
- [ ] User signups (track in Firestore /users collection)

### Rollback Procedure
If critical issues arise:
```bash
# Revert to previous Vercel deployment:
vercel rollback [deployment-url]

# Or promote previous deployment:
vercel promote [previous-deployment-url] --scope=slacklite
```

---

## Launch Sign-Off

| Checklist Item | Owner | Status |
|---------------|-------|--------|
| Infrastructure ready | DevOps | ✅ |
| Feature smoke tests passed | QA | ✅ |
| Security audit complete | Security | ✅ |
| Monitoring configured | DevOps | ✅ |
| Beta testing complete | Product | ✅ |
| Announcements prepared | Marketing | ✅ |
| Support plan ready | Support | ✅ |

**Launch Date:** 2026-02-19  
**Launch Approved By:** Project Lead  
**Initial User Count:** 0 (growing)
