# SlackLite - Lightweight Team Messaging

**Generated:** 2026-02-18 23:10 CST  
**Type:** Manual intake (user request)  
**Platform:** Web app  
**Business Model:** B2C  

---

## Problem Statement

Teams need real-time messaging but Slack is bloated, expensive, and overkill for small teams. Simple use case: small dev teams, startups, friend groups who want persistent chat with channels but don't need enterprise features, integrations, or complex permissions.

---

## Solution

Lightweight Slack clone focused on core messaging only:
- Real-time messaging in channels
- Direct messages
- Channel creation/management
- User authentication
- Message history
- Simple, fast UI

**What we're NOT building:**
- File uploads
- Threads
- Reactions/emoji
- Search
- Integrations
- Video/voice
- Admin roles/permissions beyond basic

---

## Target Audience

- Small dev teams (5-15 people)
- Friend groups
- Small communities
- Anyone who finds Slack too heavy

---

## Key Features

1. **Authentication** - Email/password, Firebase Auth
2. **Channels** - Create, join, leave channels
3. **Real-time messaging** - Send/receive messages instantly
4. **Direct messages** - 1-on-1 chats
5. **Message history** - Scroll back through past messages
6. **User presence** - Online/offline indicators
7. **Notifications** - Unread message counts

---

## Technical Stack

- **Platform:** Web app (Next.js 14+, React, TypeScript)
- **Auth:** Firebase Auth
- **Database:** Firestore (real-time listeners)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## Success Criteria

- Messages delivered < 500ms
- Real-time updates work across tabs/devices
- Clean, distraction-free UI
- Works on mobile browsers

---

## Out of Scope (MVP)

- File uploads
- Threads
- Reactions
- Search
- Integrations
- Admin controls
- Workspaces (single workspace only)
