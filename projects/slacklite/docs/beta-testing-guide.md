# SlackLite — Beta Testing Guide

**Version:** 1.0  
**Date:** 2026-02-19  
**Target:** 5-10 beta users

---

## Overview

This guide outlines how to invite and manage beta users for the SlackLite production launch. Beta testing validates real-world usage before full public launch.

---

## Inviting Beta Users

### Using the In-App Invite System

1. Sign in to https://slacklite.app as the workspace admin
2. In the sidebar, click **"Invite Team"**
3. Copy the generated invite link (valid for 7 days)
4. Share via email, Slack, or other channels

### Invite Link Format
```
https://slacklite.app/invite/{workspaceId}/{token}
```

The link allows users to:
- Sign up (if new) → automatically join workspace
- Sign in (if existing) → automatically join workspace

---

## Beta Test Scenarios

### Scenario 1: Sign Up & Onboarding (5 min)
```
1. Visit invite link
2. Create account with email/password
3. Join workspace (auto-join from invite)
4. Explore #general channel
```
**Expected:** Seamless onboarding, land in #general within 10 seconds of signup.

### Scenario 2: Real-Time Messaging (10 min)
```
1. Open app in two browser tabs (different users)
2. Send messages back and forth
3. Measure perceived delivery speed
4. Send 5 messages rapidly (rate limit test)
```
**Expected:** Messages appear in <500ms cross-browser. Rate limit kicks in after 10 msgs/10s.

### Scenario 3: Channel Management (5 min)
```
1. Create a new channel (#test-channel)
2. Switch between #general and #test-channel
3. Rename the channel
4. Delete the channel (verify redirect to #general)
```
**Expected:** All operations work smoothly. #general cannot be deleted.

### Scenario 4: Direct Messages (5 min)
```
1. Click on another workspace member
2. Send a direct message
3. Verify the DM appears in sidebar
4. Switch away and back — verify unread count
```
**Expected:** DMs work end-to-end with real-time delivery.

### Scenario 5: Mobile Experience (10 min)
```
1. Open https://slacklite.app on phone
2. Sign in
3. Test hamburger menu (sidebar opens/closes)
4. Test swipe gestures (swipe right to open, left to close)
5. Send a message on mobile keyboard
6. Verify no layout issues with keyboard visible
```
**Expected:** Fully functional mobile experience.

---

## Feedback Collection

### Feedback Form Questions

**Required:**
1. What device/browser did you use? (e.g., iPhone 15 / Safari)
2. Were you able to complete all test scenarios? (Yes / Mostly / No)
3. Rate overall experience: 1 (broken) to 5 (excellent)
4. Rate message delivery speed: 1 (slow) to 5 (instant)
5. Rate mobile experience: 1 (broken) to 5 (excellent)

**Optional:**
6. What worked really well?
7. What was confusing or frustrating?
8. What feature would you most want added next?
9. Compared to Slack, how would you rate SlackLite? (1-5)
10. Any other feedback?

---

## Bug Report Template

If beta users find issues, ask them to report:

```
**Bug Summary:** [One-line description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** What should have happened
**Actual:** What actually happened

**Device/Browser:** e.g., MacBook Pro / Chrome 120
**Screenshot/Video:** [attach if possible]
**Sentry Error ID:** [if visible in console]
```

File issues at: https://github.com/kelly-1224s-projects/slacklite/issues

---

## Beta Testing Timeline

| Day | Activity |
|-----|---------|
| Day 0 | Send invites to 5-10 users |
| Day 1-2 | Users explore the app (async) |
| Day 3 | Send reminder + feedback form |
| Day 5 | Close beta period, collect all feedback |
| Day 6 | Triage feedback, prioritize fixes |
| Day 7+ | Implement critical fixes, public launch |

---

## Success Criteria

Beta testing is successful if:
- ✅ All 5 test scenarios completed by ≥3 beta users
- ✅ Average experience rating ≥3.5/5
- ✅ No P0/P1 bugs discovered
- ✅ Real-time messaging confirmed working across devices
- ✅ Mobile experience validated on iOS + Android

---

## Post-Beta Debrief Template

```
BETA TEST DEBRIEF
Date: YYYY-MM-DD
Users invited: N
Users who tested: N

Top Positives:
1. 
2.
3.

Top Issues Found:
1. [Severity] [Description]
2. [Severity] [Description]

Feature Requests (ranked by frequency):
1. 
2.
3.

Average Ratings:
- Overall: X/5
- Message delivery: X/5
- Mobile experience: X/5

Decision: [Proceed to launch / Fix issues first]
```
