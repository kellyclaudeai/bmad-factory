# SlackLite — Test Strategy Document

**Author:** Murat (TEA — Test Engineering Agent)  
**Date:** 2026-02-19  
**Workflow:** `test-generate`  
**Project:** SlackLite — Lightweight Team Messaging  
**QA URL:** https://slacklite-r3vwdr5la-kelly-1224s-projects.vercel.app  
**Branch:** dev

---

## 1. Overview

This document defines the comprehensive test strategy for SlackLite, a Next.js 14 + Firebase real-time messaging application. The strategy covers E2E automation, accessibility, real-time behaviour, and security boundary testing.

### 1.1 Scope

| Layer | Tooling | Owner | Status |
|-------|---------|-------|--------|
| E2E (live URL) | Playwright | Murat | ✅ Generated |
| Unit | Vitest | Amelia (Dev) | Existing |
| Firestore Rules | `@firebase/rules-unit-testing` | Amelia | Existing |
| Database Rules | `@firebase/rules-unit-testing` | Amelia | Existing |
| Accessibility | axe-core (injected in Playwright) | Murat | ✅ Generated |
| NFR / Performance | Lighthouse (Phase 2) | Murat | Planned |

### 1.2 Test Environment

- **Primary target:** Deployed Vercel QA URL (live Firebase backend)
- **Auth:** Real Firebase Auth (email/password)
- **Data:** Created on-the-fly by each test using the app UI (signup flow)
- **Cleanup:** Each test generates unique email addresses (`test-<uuid>@slacklite-e2e.dev`) — no teardown required; test accounts accumulate in QA Firebase project

---

## 2. Risk Matrix & Prioritisation

| Risk Area | Severity | Priority | Test Coverage |
|-----------|----------|----------|---------------|
| Auth (signup/signin) failure | Critical | P0 | `auth.spec.ts` |
| Message not delivered to recipient | Critical | P0 | `realtime.spec.ts` |
| Workspace data leakage between users | Critical | P0 | `auth.spec.ts` (protected routes) |
| Channel CRUD broken | High | P1 | `channels.spec.ts` |
| DM flow broken | High | P1 | `dms.spec.ts` |
| Invite link non-functional | High | P1 | `invites.spec.ts` |
| Unread counts inaccurate | Medium | P2 | `realtime.spec.ts` |
| Accessibility violations | Medium | P2 | `accessibility.spec.ts` |
| Character limit not enforced | Low | P3 | `messaging.spec.ts` |
| Mobile layout issues | Low | P3 | (visual / manual) |

---

## 3. Critical User Flows

### 3.1 Authentication Flows
1. **Sign Up** — New user creates account with email/password → redirected to workspace creation
2. **Workspace Creation** — User creates named workspace → auto-routed to #general channel
3. **Sign In** — Existing user logs in → redirected back into their workspace
4. **Sign Out** — User triggers sign out → confirmation dialog → redirected to landing page
5. **Session Persistence** — Page reload maintains auth state, user stays logged in
6. **Protected Route Guard** — Unauthenticated user visiting `/app` → redirected to `/signin`

### 3.2 Channel Management Flows
1. **Create Channel** — User opens modal, enters unique name, submits → navigated to new channel
2. **Channel Rename** — User renames channel → UI reflects updated name everywhere
3. **Channel Delete** — User deletes channel → removed from sidebar, fallback navigation
4. **Channel Switching** — Clicking a channel loads its messages, clears unread indicator

### 3.3 Messaging Flows
1. **Send Message** — Type and press Enter → message appears in list (optimistic UI)
2. **Message Persistence** — Reload page → message still present
3. **Character Limit** — Messages >1000 chars are blocked (frontend validation)
4. **Real-time Delivery** — Message sent by User A appears for User B in <500ms

### 3.4 Direct Message Flows
1. **Start DM** — Click workspace member name → DM conversation opens
2. **Send DM** — Send message in DM → appears for recipient in real-time
3. **DM Navigation** — DM appears in sidebar for recipient

### 3.5 Invite Flows
1. **Generate Invite Link** — Workspace owner generates invite URL
2. **Accept Invite** — New user accesses invite URL → joins workspace

### 3.6 Presence & Unread Flows
1. **Unread Badge** — Message sent to channel User A is not viewing → unread count appears
2. **Clear Unread** — User opens channel → unread count clears

---

## 4. Accessibility Strategy

### 4.1 Tool
- `axe-core` v4.11.x injected via `page.addScriptTag` into each Playwright browser context
- WCAG 2.1 AA ruleset (excluding color-contrast for now — requires visual rendering checks)

### 4.2 Pages Scanned
| Page | Route |
|------|-------|
| Landing (marketing) | `/` |
| Sign Up | `/signup` |
| Sign In | `/signin` |
| Workspace Creation | `/create-workspace` |
| Channel View | `/app/channels/:id` |
| DM View | `/app/dms/:id` |

### 4.3 Pass Criteria
- Zero `critical` or `serious` axe violations
- `moderate` and `minor` violations are reported but non-blocking for initial release

---

## 5. Real-Time Test Strategy

Real-time tests require two separate browser contexts (two users logged in simultaneously).

```
User A context (sender) → sends message → 
Firebase RTDB → 
User B context (listener, different channel/tab) → receives within 500ms
```

**Implementation:** `browser` fixture from Playwright, two `BrowserContext` instances, each with their own cookies/session. No shared state.

---

## 6. Test Data Strategy

### 6.1 Account Creation
Each test creates a unique account via the signup flow using:
```
email: test-<timestamp>-<random>@slacklite-e2e.dev
password: Playwright#2026!
```
This avoids any dependency on pre-seeded data or emulators.

### 6.2 Shared Auth State (Performance Optimisation)
For test groups that don't mutate auth state, a `storageState` fixture is used:
- One sign-up is performed in `globalSetup`
- `storageState` saved to `test-results/auth-state.json`
- Subsequent tests load the saved state instead of re-authenticating

### 6.3 Isolation
- Each test that creates channels or messages generates unique names with `Date.now()` + random suffix
- No test depends on data created by another test (no test ordering dependency)

---

## 7. E2E Test Files

| File | Flows Covered | Count |
|------|---------------|-------|
| `auth.spec.ts` | Signup, signin, signout, session persistence, protected routes | 6 |
| `channels.spec.ts` | Create, rename, delete, switch channels | 5 |
| `messaging.spec.ts` | Send, persist, character limit, input validation | 4 |
| `dms.spec.ts` | Start DM, send message, DM sidebar | 3 |
| `invites.spec.ts` | Generate invite link, accept invite | 2 |
| `realtime.spec.ts` | Real-time delivery, unread counts | 3 |
| `accessibility.spec.ts` | axe-core scans on all key pages | 6 |

**Total: 29 test cases across 7 files**

---

## 8. Playwright Configuration for Live URL

The live E2E tests use a separate playwright config (`playwright.live.config.ts`) that:
- Sets `baseURL` to the QA deployment URL
- Does NOT spin up a `webServer`
- Does NOT configure Firebase emulator env vars
- Sets `timeout: 30000` for real network calls
- Uses `--retries 1` to handle transient network flakiness

---

## 9. Pass/Fail Criteria

| Metric | Target |
|--------|--------|
| Auth flows | 100% pass |
| Channel CRUD | 100% pass |
| Message send | 100% pass |
| Real-time delivery | 100% pass |
| DM flows | 100% pass |
| Accessibility critical/serious violations | 0 |
| Overall pass rate | ≥ 90% |

---

## 10. Out of Scope (MVP)

- File uploads (not implemented in MVP per PRD)
- Message edit/delete (not implemented in MVP per PRD — "No reactions, no threads")
- Emoji reactions (not implemented in MVP)
- Thread replies (not implemented in MVP)
- Performance/Lighthouse scoring (Phase 2)
- Security scanning / npm audit (Phase 2)
- Mobile native apps (web only)

---

*Generated by Murat — BMAD TEA (Test Engineering Agent)*
