# SlackLite - Epics & Stories

**Project:** SlackLite - Lightweight Team Messaging  
**Product Manager:** John (BMAD PM)  
**Date:** 2026-02-18  
**Status:** Ready for Implementation

---

## Overview

This document breaks down the SlackLite MVP into **11 epics** with **68 implementable stories**. Each story follows the BMAD format with clear acceptance criteria and 1-3 hour estimates.

**Estimated Total Effort:** 102-153 hours (3-4 weeks for 1-2 developers)

**Implementation Order:**
1. Epic 1: Foundation (project setup)
2. Epic 2: Authentication
3. Epic 3: Workspaces & Channels
4. Epic 4: Real-Time Messaging
5. Epic 5-11: Parallel development (DMs, presence, history, mobile, security, testing, deployment)

---

## Epic 1: Foundation - Project Setup & Infrastructure

**Goal:** Initialize Next.js project with Firebase backend, establish development environment, and configure core tooling.

**Success Criteria:** Developers can run app locally with Firebase emulators, deploy to Vercel staging, and follow CLI-first setup process.

**Dependencies:** None (starting point)

---

### Story 1.1: Initialize Next.js Project with TypeScript

**Epic:** Epic 1 - Foundation

**Description:**
Create new Next.js 15+ project with App Router, TypeScript, and Tailwind CSS. Configure project structure following BMAD architecture conventions.

**Acceptance Criteria:**
- [ ] Run `npx create-next-app@latest slacklite --typescript --tailwind --app --eslint --no-src-dir` to initialize project
- [ ] Project structure includes `app/`, `components/`, `lib/`, `public/` directories
- [ ] TypeScript configured with strict mode in `tsconfig.json`
- [ ] Tailwind CSS configured with design system tokens (colors, spacing from UX spec)
- [ ] ESLint and Prettier configured for code quality
- [ ] `pnpm` set as package manager (create `pnpm-workspace.yaml`)
- [ ] Git repository initialized with `.gitignore` (node_modules, .env.local, .next)
- [ ] Development server runs: `pnpm dev` → http://localhost:3000

**Estimated Effort:** 1 hour

---

### Story 1.2: Configure Firebase Project via CLI

**Epic:** Epic 1 - Foundation

**Description:**
Create Firebase project and enable required services (Firestore, Realtime Database, Authentication) using Firebase CLI. Generate config files for local development.

**Acceptance Criteria:**
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Firebase login completed: `firebase login`
- [ ] New Firebase project created: `firebase projects:create slacklite-dev` (development project)
- [ ] Firestore enabled: `firebase init firestore`
- [ ] Realtime Database enabled: `firebase init database`
- [ ] Firebase Authentication enabled with Email/Password provider via CLI
- [ ] Web app created: `firebase apps:create web "SlackLite Web"` → capture App ID
- [ ] Firebase config saved to `.env.local` (apiKey, authDomain, projectId, etc.)
- [ ] `.env.example` template created with placeholder values
- [ ] `firebase.json` configuration file generated

**Estimated Effort:** 2 hours

---

### Story 1.3: Set Up Firebase Emulator Suite

**Epic:** Epic 1 - Foundation

**Description:**
Configure Firebase Emulator Suite for local development (Firestore, RTDB, Auth emulators) to enable offline testing without production Firebase calls.

**Acceptance Criteria:**
- [ ] Run `firebase init emulators` to configure Auth, Firestore, Realtime Database, and Emulator UI
- [ ] `firebase.json` includes emulator ports: Auth (9099), Firestore (8080), RTDB (9000), UI (4000)
- [ ] Start emulators: `firebase emulators:start` → UI accessible at http://localhost:4000
- [ ] Firebase SDK client connects to emulators in development mode (check `NODE_ENV === 'development'`)
- [ ] Test data seeded in emulator (1 test workspace, 1 test user, 1 test channel)
- [ ] npm script added: `"emulators": "firebase emulators:start"`
- [ ] Documentation added to README: "Run `pnpm emulators` for local Firebase"

**Estimated Effort:** 1-2 hours

---

### Story 1.4: Initialize Firebase SDK in Next.js

**Epic:** Epic 1 - Foundation

**Description:**
Create Firebase client configuration in Next.js project, initialize Auth, Firestore, and Realtime Database SDKs with TypeScript types.

**Acceptance Criteria:**
- [ ] Install Firebase SDK: `pnpm add firebase@11`
- [ ] Create `lib/firebase/client.ts` with Firebase app initialization
- [ ] Environment variables loaded from `.env.local` (NEXT_PUBLIC_FIREBASE_*)
- [ ] Export initialized `auth`, `firestore`, `rtdb` instances
- [ ] Connect to emulators in development mode (connectAuthEmulator, connectFirestoreEmulator, connectDatabaseEmulator)
- [ ] TypeScript types imported from Firebase SDK (@firebase/auth, @firebase/firestore, @firebase/database)
- [ ] Test: Call `getAuth()` in a test component → no errors, auth instance created

**Estimated Effort:** 1 hour

---

### Story 1.5: Set Up Vercel Project via CLI

**Epic:** Epic 1 - Foundation

**Description:**
Link Next.js project to Vercel, configure environment variables for staging and production, enable preview deployments for pull requests.

**Acceptance Criteria:**
- [ ] Vercel CLI installed: `pnpm add -g vercel`
- [ ] Vercel project linked: `vercel link` → connect to GitHub repository
- [ ] Environment variables added to Vercel (staging + production): Firebase config, Sentry DSN (if using)
- [ ] Preview deployments enabled for all pull requests
- [ ] Production domain configured (e.g., slacklite.app)
- [ ] First deployment successful: `vercel --prod` → app accessible at production URL
- [ ] Deployment status visible in Vercel dashboard
- [ ] GitHub Actions workflow created for automated deployments (`.github/workflows/deploy.yml`)

**Estimated Effort:** 2 hours

---

### Story 1.6: Create Design System Foundation in Tailwind

**Epic:** Epic 1 - Foundation

**Description:**
Configure Tailwind CSS with SlackLite design tokens (colors, typography, spacing from UX spec). Create reusable UI components (Button, Input, Modal).

**Acceptance Criteria:**
- [ ] `tailwind.config.ts` includes design system colors (Primary Brand, Success, Error, Gray scale)
- [ ] Typography scale configured (fontFamily: Inter, fontSize: 12px-32px, fontWeight: 400-700)
- [ ] Spacing scale configured (base 4px unit, 1-12 scale)
- [ ] UI component library created in `components/ui/`:
  - [ ] `Button.tsx` (Primary, Secondary, Destructive variants)
  - [ ] `Input.tsx` (with error states, focus styles)
  - [ ] `Modal.tsx` (with overlay, focus trap, ESC to close)
  - [ ] `Badge.tsx` (for unread counts)
  - [ ] `Avatar.tsx` (with initials fallback)
- [ ] Storybook setup (optional for MVP) or test page at `/design-system` showing all components
- [ ] Components follow WCAG 2.1 AA contrast ratios (4.5:1 minimum)

**Estimated Effort:** 3 hours

---

## Epic 2: Authentication & User Management

**Goal:** Implement email/password authentication with Firebase Auth, session management, and user profile creation.

**Success Criteria:** Users can sign up, sign in, sign out, and maintain persistent sessions across browser restarts.

**Dependencies:** Epic 1 (Firebase SDK initialized)

---

### Story 2.1: Create Landing Page

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Build static landing page with hero section, product pitch, and CTAs for Sign Up / Sign In. Server-side rendered for SEO.

**Acceptance Criteria:**
- [ ] Create `app/(marketing)/page.tsx` (Server Component for SEO)
- [ ] Hero section: "Lightweight Team Messaging" headline, "Slack's simplicity. None of the bloat." subtitle
- [ ] Primary CTA button: "Get Started Free" → links to `/signup`
- [ ] Secondary CTA button: "Sign In" → links to `/signin`
- [ ] Header with logo ("SlackLite") and auth buttons (Sign In, Sign Up)
- [ ] Features section (3-column grid): Real-Time Messages, Simple Setup, Free to Start
- [ ] Footer with About, Privacy, Terms links (placeholder pages)
- [ ] Fully responsive (desktop + mobile breakpoints)
- [ ] Meta tags for SEO (title, description, Open Graph)

**Estimated Effort:** 2 hours

---

### Story 2.2: Build Sign Up Form UI

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create sign-up page with email/password form, client-side validation, and error handling UI (no backend integration yet).

**Acceptance Criteria:**
- [ ] Create `app/(auth)/signup/page.tsx` (Client Component with 'use client')
- [ ] Form fields: Email (type="email"), Password (type="password", min 8 chars)
- [ ] Real-time validation: Email format, password length
- [ ] Error messages displayed below inputs (red border + text)
- [ ] Submit button: "Create Account" (Primary button, disabled if validation fails)
- [ ] Link to Sign In: "Already have an account? Sign In"
- [ ] Form state managed with useState (email, password, errors, loading)
- [ ] Accessible: ARIA labels, keyboard navigation (Tab, Enter to submit)
- [ ] Mobile responsive (full-width form on mobile)

**Estimated Effort:** 2 hours

---

### Story 2.3: Implement Firebase Auth Sign Up

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Integrate Firebase Auth `createUserWithEmailAndPassword` to create user accounts. Create user document in Firestore after successful sign-up.

**Acceptance Criteria:**
- [ ] Sign Up form calls Firebase Auth: `createUserWithEmailAndPassword(auth, email, password)`
- [ ] On success: Create user document in Firestore `/users/{userId}`:
  - [ ] userId: Firebase Auth UID
  - [ ] email: user email
  - [ ] displayName: derived from email (before @)
  - [ ] workspaceId: null (set later)
  - [ ] createdAt: serverTimestamp()
  - [ ] lastSeenAt: serverTimestamp()
  - [ ] isOnline: false
- [ ] Handle errors: Email already exists → show error "Email already in use. Sign in instead?"
- [ ] On success: Redirect to `/create-workspace`
- [ ] Loading state: Show spinner in button during async operation
- [ ] Session persists: Use `setPersistence(auth, browserLocalPersistence)`

**Estimated Effort:** 2-3 hours

---

### Story 2.4: Build Sign In Form with Firebase Auth

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create sign-in page with email/password authentication using Firebase Auth. Redirect authenticated users to `/app`.

**Acceptance Criteria:**
- [ ] Create `app/(auth)/signin/page.tsx` (Client Component)
- [ ] Form fields: Email, Password
- [ ] Submit calls: `signInWithEmailAndPassword(auth, email, password)`
- [ ] On success: Redirect to `/app` (last viewed channel or #general)
- [ ] Handle errors: Invalid credentials → show error "Invalid email or password"
- [ ] Loading state: Disable form during authentication
- [ ] Link to Sign Up: "Don't have an account? Sign Up"
- [ ] Session persists across browser restarts (browserLocalPersistence)
- [ ] Authenticated users auto-redirected from `/signin` to `/app`

**Estimated Effort:** 2 hours

---

### Story 2.5: Create Auth Context Provider

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Build React Context for global authentication state. Provide user data, loading state, and auth methods (signIn, signUp, signOut) to entire app.

**Acceptance Criteria:**
- [ ] Create `lib/contexts/AuthContext.tsx`
- [ ] Context provides: `{ user, loading, signIn, signUp, signOut }`
- [ ] User state synced with Firebase Auth: `onAuthStateChanged` listener
- [ ] On auth change: Fetch user data from Firestore `/users/{uid}` and merge with Firebase Auth user
- [ ] Custom hook: `useAuth()` wraps `useContext(AuthContext)`
- [ ] Loading state: `true` during initial auth check, `false` after resolved
- [ ] Wrap app in AuthProvider in `app/layout.tsx`
- [ ] Protected routes check `user` state: If null, redirect to `/signin`

**Estimated Effort:** 2 hours

---

### Story 2.6: Implement Sign Out Functionality

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Add sign-out button in app header/settings. Clear user session and redirect to landing page.

**Acceptance Criteria:**
- [ ] Sign Out button in Settings modal or app header (Destructive button styling)
- [ ] Click triggers: `signOut(auth)`
- [ ] On success: Clear user state in AuthContext
- [ ] Redirect to landing page (`/`)
- [ ] Confirmation dialog: "Are you sure you want to sign out?" (Modal with Cancel/Sign Out buttons)
- [ ] Firebase listeners cleaned up (unsubscribe from Firestore/RTDB)
- [ ] Local state cleared (messages, channels, etc.)

**Estimated Effort:** 1 hour

---

### Story 2.7: Build Workspace Creation Screen

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create workspace setup page shown after sign-up. User names their workspace and becomes owner. Redirect to main app after creation.

**Acceptance Criteria:**
- [ ] Create `app/(auth)/create-workspace/page.tsx` (Client Component)
- [ ] Form: "What's the name of your team or project?" → Text input
- [ ] Validation: 1-50 characters, required
- [ ] Submit creates workspace in Firestore `/workspaces/{workspaceId}`:
  - [ ] workspaceId: auto-generated
  - [ ] name: user input
  - [ ] ownerId: current user UID
  - [ ] createdAt: serverTimestamp()
- [ ] Update user document: Set `workspaceId` to new workspace ID
- [ ] Create default #general channel in workspace
- [ ] On success: Redirect to `/app` (lands in #general)
- [ ] Only shown once (if user already has workspaceId, redirect to `/app`)

**Estimated Effort:** 2 hours

---

### Story 2.8: Implement Protected Route Middleware

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Add Next.js middleware to protect `/app/*` routes. Verify Firebase Auth token on server-side, redirect unauthenticated users to sign-in.

**Acceptance Criteria:**
- [ ] Create `middleware.ts` in project root
- [ ] Middleware runs on `/app/*` paths (matcher config)
- [ ] Check for Firebase Auth token in cookies
- [ ] Verify token using Firebase Admin SDK: `verifyIdToken(token)`
- [ ] If valid: Allow request, attach user ID to request headers
- [ ] If invalid: Redirect to `/signin`
- [ ] If no token: Redirect to `/signin`
- [ ] Token refresh handled automatically by Firebase SDK

**Estimated Effort:** 2 hours

---

## Epic 3: Workspace & Channel Management

**Goal:** Implement channel creation, listing, switching, and basic workspace operations.

**Success Criteria:** Users can create channels, view channel list in sidebar, switch between channels, and invite team members.

**Dependencies:** Epic 2 (Auth working)

---

### Story 3.1: Create App Layout with Sidebar

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Build main app layout with persistent sidebar (channels, DMs, members) and main content area (message view). Desktop-first responsive design.

**Acceptance Criteria:**
- [ ] Create `app/app/layout.tsx` (App layout wrapping all `/app/*` routes)
- [ ] Layout structure: Sidebar (250px fixed width) + Main View (flex-grow)
- [ ] Sidebar background: Gray 100 (#F8F8F8)
- [ ] Main view background: White (#FFFFFF)
- [ ] Sidebar includes sections: Logo, Workspace Name, Channels, Direct Messages, Members
- [ ] Sidebar scrollable if content overflows
- [ ] Main view takes remaining height (h-screen)
- [ ] Responsive: Desktop (1024px+) shows sidebar, mobile (<768px) sidebar hidden (Epic 8 handles mobile)
- [ ] Component file: `components/layout/AppShell.tsx`

**Estimated Effort:** 2 hours

---

### Story 3.2: Fetch and Display Channel List

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Query Firestore for all channels in current workspace, display in sidebar alphabetically sorted. Subscribe to real-time updates.

**Acceptance Criteria:**
- [ ] Create `lib/hooks/useChannels.ts` custom hook
- [ ] Query: `collection(db, 'workspaces/{workspaceId}/channels').orderBy('name', 'asc')`
- [ ] Real-time listener: `onSnapshot` to detect new channels, renames, deletions
- [ ] Return: `{ channels: Channel[], loading: boolean, error: Error | null }`
- [ ] Create `components/features/channels/ChannelList.tsx`
- [ ] Render list of channels with `#` prefix (e.g., "# general", "# dev-team")
- [ ] Alphabetically sorted
- [ ] No unread counts yet (Story 6.4 adds that)
- [ ] Loading state: Show spinner while fetching
- [ ] Empty state: "No channels yet. Create one to get started."

**Estimated Effort:** 2 hours

---

### Story 3.3: Implement Channel Switching

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Enable users to click a channel in sidebar and navigate to that channel's message view. Update URL and highlight active channel.

**Acceptance Criteria:**
- [ ] Channel list items are clickable buttons/links
- [ ] Click navigates to `/app/channels/{channelId}`
- [ ] Active channel highlighted with Gray 300 background + 3px Primary Brand left border
- [ ] URL updates to reflect current channel
- [ ] Message view clears previous channel's messages
- [ ] Loading indicator in message view during channel switch
- [ ] Channel switch perceived latency <200ms (Firestore query cached)
- [ ] Active state persists on page refresh (read from URL)

**Estimated Effort:** 1-2 hours

---

### Story 3.4: Build Create Channel Modal UI

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Create modal for adding new channels with name validation (lowercase, hyphens only, no spaces). Accessible keyboard navigation and focus trap.

**Acceptance Criteria:**
- [ ] Create `components/features/channels/CreateChannelModal.tsx`
- [ ] Trigger: "+ New Channel" button in sidebar
- [ ] Modal content:
  - [ ] Title: "Create a Channel" (H3)
  - [ ] Input: Text field with `#` prefix (non-editable), placeholder="channel-name"
  - [ ] Helper text: "Lowercase, no spaces. Use - for multiple words."
  - [ ] Buttons: Cancel (Secondary), Create (Primary, disabled if invalid)
- [ ] Validation: Real-time, lowercase only, hyphens allowed, 1-50 chars
- [ ] Auto-format: Convert spaces to hyphens, uppercase to lowercase
- [ ] Error states: Show red border + error message if invalid
- [ ] Focus trap: Tab cycles through input and buttons
- [ ] ESC key closes modal

**Estimated Effort:** 2 hours

---

### Story 3.5: Implement Channel Creation in Firestore

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Connect Create Channel modal to Firestore. Write new channel document, update sidebar list, and auto-switch to new channel.

**Acceptance Criteria:**
- [ ] Submit creates document in `/workspaces/{workspaceId}/channels/{channelId}`:
  - [ ] channelId: auto-generated
  - [ ] workspaceId: current workspace
  - [ ] name: user input (lowercase, hyphens)
  - [ ] createdBy: current user UID
  - [ ] createdAt: serverTimestamp()
  - [ ] lastMessageAt: null
  - [ ] messageCount: 0
- [ ] Check for duplicate names: Query existing channels, show error if exists
- [ ] On success: Modal closes, new channel appears in sidebar (real-time listener picks it up)
- [ ] Auto-switch to new channel: Navigate to `/app/channels/{channelId}`
- [ ] Error handling: Show error banner if creation fails

**Estimated Effort:** 2 hours

---

### Story 3.6: Add Default #general Channel Creation

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Automatically create #general channel when workspace is created. Ensure every workspace has at least one channel on initialization.

**Acceptance Criteria:**
- [ ] During workspace creation (Story 2.7), after workspace document created:
  - [ ] Create #general channel in `/workspaces/{workspaceId}/channels/`
  - [ ] Set name: "general", createdBy: workspace owner, createdAt: serverTimestamp()
- [ ] User lands in #general after workspace creation
- [ ] #general cannot be deleted (add validation in delete flow)
- [ ] If workspace has no channels (edge case), auto-create #general on first app load

**Estimated Effort:** 1 hour

---

### Story 3.7: Implement Channel Rename Functionality

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Allow channel creator or workspace owner to rename channels. Show rename modal with validation, update Firestore and sidebar.

**Acceptance Criteria:**
- [ ] Add "Rename Channel" option (accessible from channel context menu or header)
- [ ] Only visible to: Channel creator (`createdBy`) or workspace owner
- [ ] Rename modal: Similar to Create Channel modal, pre-filled with current name
- [ ] Validation: Same as create (lowercase, hyphens, 1-50 chars, unique)
- [ ] Update Firestore: `updateDoc(channelRef, { name: newName })`
- [ ] Sidebar updates immediately (real-time listener)
- [ ] Message view header updates (show new name)
- [ ] Cannot rename #general (validation check)

**Estimated Effort:** 2 hours

---

### Story 3.8: Implement Channel Deletion

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Allow channel creator or workspace owner to delete channels (except #general). Show confirmation dialog, remove from Firestore, update sidebar.

**Acceptance Criteria:**
- [ ] Add "Delete Channel" option (accessible from context menu)
- [ ] Only visible to: Channel creator or workspace owner
- [ ] Confirmation modal: "Are you sure you want to delete #{channelName}? This cannot be undone."
- [ ] Buttons: Cancel (Secondary), Delete (Destructive red button)
- [ ] On confirm: Delete Firestore document: `deleteDoc(channelRef)`
- [ ] Firestore cascade: Delete all messages in channel (subcollection deletion)
- [ ] Sidebar updates (channel removed via real-time listener)
- [ ] If user is in deleted channel: Redirect to #general
- [ ] #general cannot be deleted (show error if attempted)

**Estimated Effort:** 2 hours

---

### Story 3.9: Build Invite Team Modal UI

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Create modal for inviting users via email addresses. Parse comma-separated emails, validate format, and display invite link for sharing.

**Acceptance Criteria:**
- [ ] Create `components/features/workspace/InviteTeamModal.tsx`
- [ ] Trigger: "Invite Team" button in sidebar
- [ ] Modal content:
  - [ ] Title: "Invite Team Members" (H3)
  - [ ] Input: Textarea for emails (placeholder: "alex@example.com, jordan@example.com")
  - [ ] Helper text: "Separate multiple emails with commas or spaces."
  - [ ] Invite link section: "Or share this invite link:" + read-only input with link + Copy button
  - [ ] Buttons: Cancel, Send Invites (Primary)
- [ ] Email validation: Parse input, check each email format, show errors for invalid
- [ ] Copy button: Copy invite link to clipboard, show "Copied!" feedback (2s)

**Estimated Effort:** 2 hours

---

### Story 3.10: Implement Workspace Invite System

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Generate unique invite links per workspace, handle invite acceptance flow (sign up/in → join workspace), and send invite emails (optional for MVP).

**Acceptance Criteria:**
- [ ] Generate invite link: `/invite/{workspaceId}/{token}` (token = unique random string)
- [ ] Store invites in Firestore `/workspaceInvites/{inviteId}`:
  - [ ] inviteId: auto-generated
  - [ ] workspaceId: target workspace
  - [ ] token: unique random string
  - [ ] createdBy: current user UID
  - [ ] expiresAt: 7 days from now (or unlimited for MVP simplicity)
- [ ] Invite link page: `/invite/[workspaceId]/[token]/page.tsx`
  - [ ] Show workspace name: "You've been invited to join {workspaceName}"
  - [ ] CTAs: "Sign Up" (if not authenticated) or "Join Workspace" (if authenticated)
- [ ] Join flow: Update user document `workspaceId` = invited workspace ID
- [ ] Redirect to `/app` after joining
- [ ] Email invites: Optional (use Firebase Extensions or Cloud Functions post-MVP)

**Estimated Effort:** 3 hours

---

## Epic 4: Real-Time Messaging Core

**Goal:** Implement core messaging functionality with Firestore persistence and Realtime Database delivery. Enable sub-500ms message delivery.

**Success Criteria:** Users can send and receive messages in channels with real-time updates, optimistic UI, and message history.

**Dependencies:** Epic 3 (Channels working)

---

### Story 4.1: Create Message Data Models

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Define TypeScript interfaces for Message, create Firestore schema, and set up dual-write pattern (RTDB + Firestore).

**Acceptance Criteria:**
- [ ] Create `lib/types/models.ts` with Message interface:
  ```typescript
  interface Message {
    messageId: string;
    channelId: string;
    workspaceId: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: Timestamp;
    createdAt: Timestamp;
    status?: 'sending' | 'sent' | 'failed';
  }
  ```
- [ ] Firestore path: `/workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`
- [ ] RTDB path: `/messages/{workspaceId}/{channelId}/{messageId}`
- [ ] Document structure validated (all required fields present)

**Estimated Effort:** 1 hour

---

### Story 4.2: Build Message Input Component

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Create textarea for message composition at bottom of channel view. Handle Enter to send, Shift+Enter for new line, character limit (4000 chars).

**Acceptance Criteria:**
- [ ] Create `components/features/messages/MessageInput.tsx`
- [ ] Textarea: Min height 44px, max height 200px (then scrollable)
- [ ] Placeholder: "Type a message..."
- [ ] Auto-expanding: Grows with content (up to max height)
- [ ] Key handlers:
  - [ ] Enter: Submit message (preventDefault)
  - [ ] Shift+Enter: New line (default behavior)
- [ ] Character counter: Shows count when >3900 chars (red if >4000)
- [ ] Send button: Primary button, disabled if input empty or >4000 chars
- [ ] Input clears after send
- [ ] Focus remains in textarea after send (ready for next message)

**Estimated Effort:** 2 hours

---

### Story 4.3: Implement Optimistic UI Message Sending

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Show message immediately in UI before server confirmation (optimistic rendering). Display gray "Sending..." timestamp, update to server time on confirmation.

**Acceptance Criteria:**
- [ ] On submit: Generate temp message ID (`temp_${Date.now()}`)
- [ ] Immediately add message to local state with status: 'sending', gray timestamp text
- [ ] Message appears at bottom of list instantly (<50ms)
- [ ] No loading spinner (optimistic UI = instant feedback)
- [ ] Scroll to bottom after adding
- [ ] If send succeeds: Replace temp ID with server ID, update timestamp to server time, status: 'sent'
- [ ] If send fails: Show red error text "Failed to send. Retry?" + retry button

**Estimated Effort:** 2 hours

---

### Story 4.4: Write Messages to Firestore

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Persist messages to Firestore for permanent storage and history. Use serverTimestamp for accurate ordering.

**Acceptance Criteria:**
- [ ] Create `lib/firebase/firestore.ts` helper: `sendMessage(channelId, text)`
- [ ] Function writes to `/workspaces/{workspaceId}/channels/{channelId}/messages/`:
  - [ ] messageId: auto-generated (use `addDoc`)
  - [ ] channelId, workspaceId, userId, userName (from auth context)
  - [ ] text: user input (1-4000 chars)
  - [ ] timestamp: serverTimestamp()
  - [ ] createdAt: serverTimestamp()
- [ ] Error handling: Catch Firestore errors, throw with descriptive message
- [ ] Return: Promise<string> (messageId)
- [ ] Test: Send message → verify document created in Firestore console

**Estimated Effort:** 1-2 hours

---

### Story 4.5: Write Messages to Realtime Database

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Simultaneously write messages to RTDB for instant delivery to all connected clients. Set 1-hour TTL for auto-deletion.

**Acceptance Criteria:**
- [ ] Create `lib/firebase/realtime.ts` helper: `sendMessageRTDB(channelId, message)`
- [ ] Function writes to `/messages/{workspaceId}/{channelId}/{messageId}`:
  - [ ] Use same messageId as Firestore (consistency)
  - [ ] Store: userId, userName, text, timestamp, ttl (1 hour from now)
- [ ] Use `set(ref(...), { ... })` for write
- [ ] TTL: `ttl: Date.now() + 3600000` (1 hour expiry, RTDB auto-deletes)
- [ ] Error handling: If RTDB write fails, abort Firestore write (prevent inconsistency)
- [ ] Test: Send message → verify appears in RTDB console, auto-deletes after 1 hour

**Estimated Effort:** 1-2 hours

---

### Story 4.6: Subscribe to Real-Time Message Updates

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Listen to RTDB for new messages in current channel. Update UI instantly when other users send messages (<500ms latency).

**Acceptance Criteria:**
- [ ] Create `lib/hooks/useMessages.ts` custom hook
- [ ] Subscribe to RTDB: `onChildAdded(ref(rtdb, 'messages/{workspaceId}/{channelId}'))`
- [ ] On new message: Add to local state (append to messages array)
- [ ] Deduplication: Check if message already exists (from Firestore) before adding
- [ ] Auto-scroll to bottom if user is already at bottom of list
- [ ] If user scrolled up: Show "New messages ↓" badge (don't auto-scroll)
- [ ] Cleanup: `off(rtdbRef, 'child_added')` when component unmounts or channel changes
- [ ] Measure latency: Log timestamp difference (send time vs receive time) → verify <500ms

**Estimated Effort:** 2-3 hours

---

### Story 4.7: Fetch Message History from Firestore

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Load last 50 messages from Firestore when user switches to a channel. Display in chronological order (oldest first).

**Acceptance Criteria:**
- [ ] Query: `query(collection(db, '...messages'), orderBy('timestamp', 'desc'), limit(50))`
- [ ] Execute on channel switch (useEffect with channelId dependency)
- [ ] Reverse results: Display oldest-first (bottom = newest)
- [ ] Loading state: Show spinner in center of message view while fetching
- [ ] Empty state: If no messages, show "No messages yet. Start the conversation!"
- [ ] Scroll to bottom after load (most recent message visible)
- [ ] Cache query results (Firestore SDK caches automatically)
- [ ] Perceived load time <300ms

**Estimated Effort:** 2 hours

---

### Story 4.8: Display Messages in Message List

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Render messages in main view with author name, timestamp, and text. Use flat Slack-style design (no bubbles).

**Acceptance Criteria:**
- [ ] Create `components/features/messages/MessageList.tsx`
- [ ] Create `components/features/messages/MessageItem.tsx`
- [ ] MessageItem structure:
  - [ ] Line 1: Author name (14px Semibold, Gray 900) + Timestamp (13px, Gray 700, 8px left margin)
  - [ ] Line 2: Message text (16px, Gray 900, 4px top margin)
  - [ ] Border bottom: 1px solid Gray 300 (separator)
  - [ ] Padding: 12px vertical, 16px horizontal
- [ ] Timestamp format: Relative ("2 min ago", "Yesterday", "Jan 15")
- [ ] Word wrap: break-word for long messages
- [ ] Hover state: Gray 200 background (for future actions like copy)
- [ ] Accessible: Each message is <article> with aria-label="Message from {userName} at {timestamp}"

**Estimated Effort:** 2 hours

---

### Story 4.9: Implement Auto-Scroll to Bottom

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Automatically scroll to bottom when new messages arrive (if user is already at bottom). Show "New messages" badge if user scrolled up.

**Acceptance Criteria:**
- [ ] Detect scroll position: Check if scrollTop + clientHeight ≈ scrollHeight (within 100px of bottom)
- [ ] On new message:
  - [ ] If at bottom: Auto-scroll to bottom (`scrollIntoView` or `scrollTo`)
  - [ ] If scrolled up: Show "New messages ↓" badge (Primary Brand background, bottom-right corner, 32px height)
- [ ] Badge click: Scroll to bottom, hide badge
- [ ] Badge auto-hides when user manually scrolls to bottom
- [ ] Smooth scrolling: `behavior: 'smooth'` (optional, depends on UX preference)
- [ ] Works on initial load (scroll to bottom when channel first loaded)

**Estimated Effort:** 1-2 hours

---

### Story 4.10: Add Message Character Limit Validation

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Enforce 4,000 character limit in message input. Show character count when approaching limit, prevent send if exceeded.

**Acceptance Criteria:**
- [ ] Character counter: Displayed below textarea when >3900 characters
- [ ] Counter text: "{count} / 4000" (Gray 700 if under, Error red if over)
- [ ] Send button disabled if >4000 characters
- [ ] Error message: "Message too long. Maximum 4,000 characters."
- [ ] Validation before Firestore/RTDB write (client-side and server-side)
- [ ] Firestore security rule enforces limit: `request.resource.data.text.size() <= 4000`

**Estimated Effort:** 1 hour

---

## Epic 5: Direct Messages (1-on-1)

**Goal:** Enable private 1-on-1 conversations between workspace members with same real-time functionality as channels.

**Success Criteria:** Users can start DMs with any workspace member, see DM list in sidebar, and send/receive messages with <500ms latency.

**Dependencies:** Epic 4 (Messaging core working)

---

### Story 5.1: Display Workspace Members in Sidebar

**Epic:** Epic 5 - Direct Messages

**Description:**
Fetch all users in current workspace, display in collapsible Members section in sidebar with online/offline indicators.

**Acceptance Criteria:**
- [ ] Create `lib/hooks/useWorkspaceMembers.ts`
- [ ] Query: `query(collection(db, 'users'), where('workspaceId', '==', currentWorkspaceId))`
- [ ] Real-time listener: `onSnapshot` to detect new members, removed members
- [ ] Sort: Online users first, then offline, alphabetically within each group
- [ ] Create `components/features/sidebar/MemberList.tsx`
- [ ] Render: 24px avatar + name + online indicator (10px dot)
- [ ] Collapsible section: "Members (8) ▾" (click to expand/collapse)
- [ ] Current user marked: "{name} (You)"
- [ ] Empty state: "No other members yet. Invite your team!"

**Estimated Effort:** 2 hours

---

### Story 5.2: Implement Start DM Functionality

**Epic:** Epic 5 - Direct Messages

**Description:**
Allow users to click a member name to start a DM. Create DM document if doesn't exist, navigate to DM view.

**Acceptance Criteria:**
- [ ] Click member name → call `startDM(otherUserId)`
- [ ] Check if DM already exists: Query `/workspaceInvites/{workspaceId}/directMessages` where `userIds` array contains both user IDs
- [ ] If exists: Navigate to `/app/dms/{dmId}`
- [ ] If doesn't exist: Create new DM document:
  - [ ] dmId: auto-generated
  - [ ] workspaceId: current workspace
  - [ ] userIds: [currentUserId, otherUserId] (sorted alphabetically for consistency)
  - [ ] createdAt: serverTimestamp()
  - [ ] lastMessageAt: null
- [ ] Navigate to `/app/dms/{dmId}` after creation
- [ ] Loading state: Show spinner during check/create

**Estimated Effort:** 2 hours

---

### Story 5.3: Fetch and Display DM List

**Epic:** Epic 5 - Direct Messages

**Description:**
Query all DMs for current user, display in sidebar under "Direct Messages" section with other user's name.

**Acceptance Criteria:**
- [ ] Create `lib/hooks/useDirectMessages.ts`
- [ ] Query: `query(collection(db, 'workspaces/{workspaceId}/directMessages'), where('userIds', 'array-contains', currentUserId))`
- [ ] Real-time listener: `onSnapshot`
- [ ] Sort: By lastMessageAt DESC (most recent first)
- [ ] Resolve other user's name: For each DM, filter userIds to get other user, fetch their displayName
- [ ] Render: Other user's name (no `#` prefix, unlike channels)
- [ ] Active state: Highlight current DM with same styling as channels
- [ ] Empty state: "No direct messages yet. Click a team member to start chatting."

**Estimated Effort:** 2 hours

---

### Story 5.4: Build DM View (Reuse Channel Message UI)

**Epic:** Epic 5 - Direct Messages

**Description:**
Create DM-specific page that reuses message list, input, and real-time updates from channel view. Only differences: Header shows user name instead of channel name.

**Acceptance Criteria:**
- [ ] Create `app/app/dms/[dmId]/page.tsx`
- [ ] Reuse: `MessageList`, `MessageInput` components from channels
- [ ] Fetch DM data: `useDocument(doc(db, 'workspaces/{workspaceId}/directMessages/{dmId}'))`
- [ ] Header: Show other user's name + online indicator (green/gray dot)
- [ ] Messages subcollection: `/workspaces/{workspaceId}/directMessages/{dmId}/messages/{messageId}`
- [ ] Same real-time updates: RTDB path = `/messages/{workspaceId}/dm-{dmId}/{messageId}`
- [ ] Same send logic: Write to Firestore + RTDB (dual-write)
- [ ] Empty state: "No messages yet. Say hello!"

**Estimated Effort:** 2 hours

---

### Story 5.5: Add Unread Counts to DM List (Placeholder)

**Epic:** Epic 5 - Direct Messages

**Description:**
Display unread message counts in DM list (same badge as channels). Full implementation in Epic 6, this story sets up structure.

**Acceptance Criteria:**
- [ ] DM list item includes unread badge (Primary Brand background, white text, right-aligned)
- [ ] Badge shows number: e.g., "[2]"
- [ ] Badge hidden if count = 0
- [ ] Data structure prepared (unread counts stored in `/unreadCounts/{userId}_{dmId}`)
- [ ] Full unread logic implemented in Story 6.4

**Estimated Effort:** 1 hour

---

## Epic 6: User Presence & Indicators

**Goal:** Implement online/offline status, unread message counts, and typing indicators (Phase 2).

**Success Criteria:** Users see real-time online/offline indicators for workspace members, unread counts update instantly, and active channel highlighted.

**Dependencies:** Epic 4 (Messaging working)

---

### Story 6.1: Implement Firebase Presence System

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Use Firebase RTDB `.info/connected` to track online/offline status. Update user presence in RTDB, sync to Firestore for persistence.

**Acceptance Criteria:**
- [ ] Create `lib/hooks/usePresence.ts`
- [ ] On auth: Subscribe to `ref(rtdb, '.info/connected')`
- [ ] If connected: Write to `/presence/{userId}`:
  - [ ] online: true
  - [ ] lastSeen: serverTimestamp()
- [ ] Set onDisconnect hook: Automatically set `online: false` when user disconnects
- [ ] Update Firestore `/users/{userId}`: Sync `isOnline` field for persistence
- [ ] Test: Open app → online indicator appears, close tab → offline after disconnect

**Estimated Effort:** 2 hours

---

### Story 6.2: Display Online/Offline Indicators

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Show 10px colored dots next to usernames in member list and DM headers. Green = online, gray = offline.

**Acceptance Criteria:**
- [ ] Create `components/ui/OnlineIndicator.tsx`
- [ ] Props: `isOnline: boolean`
- [ ] Render: 10px circle, green (#2EB67D) if online, gray (#868686) if offline
- [ ] 2px white border (separation from background)
- [ ] Positioned: Bottom-right of avatar or inline before name
- [ ] Member list: Show indicator next to each member's name
- [ ] DM header: Show indicator next to other user's name
- [ ] Updates in real-time (subscribe to `/presence/{userId}`)

**Estimated Effort:** 1 hour

---

### Story 6.3: Implement Active Channel Highlighting

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Highlight currently selected channel/DM in sidebar with background color and left border. Update when user switches channels.

**Acceptance Criteria:**
- [ ] Active channel: Gray 300 (#E8E8E8) background + 3px Primary Brand (#4A154B) left border
- [ ] Hover (non-active): Gray 200 (#F2F2F2) background
- [ ] Default (non-active, no hover): Transparent background
- [ ] Channel name: Bold when active (font-weight: 600)
- [ ] Active state synced with URL: `/app/channels/{channelId}` or `/app/dms/{dmId}`
- [ ] Persists on page refresh (read from URL params)
- [ ] Keyboard navigation: Arrow keys move active highlight, Enter switches channel

**Estimated Effort:** 1 hour

---

### Story 6.4: Implement Unread Message Counts

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Track unread messages per channel/DM, display badge in sidebar, clear count when user views channel.

**Acceptance Criteria:**
- [ ] Create `/unreadCounts/{userId}_{targetId}` collection:
  - [ ] userId, targetId (channelId or dmId), targetType ('channel' | 'dm')
  - [ ] count: number
  - [ ] lastReadAt: Timestamp
  - [ ] updatedAt: Timestamp
- [ ] Increment count: When new message received AND target not currently active
- [ ] Clear count: When user switches to channel/DM (`updateDoc(unreadRef, { count: 0, lastReadAt: serverTimestamp() })`)
- [ ] Display badge: Right-aligned in channel/DM list item, Primary Brand background, white text
- [ ] Badge shows number (e.g., "[3]"), hidden if count = 0
- [ ] Real-time updates: Subscribe to unread counts for current user

**Estimated Effort:** 3 hours

---

### Story 6.5: Add Last Seen Timestamp

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Store and display "last seen" timestamp for offline users. Show in member list tooltip on hover.

**Acceptance Criteria:**
- [ ] Update `/users/{userId}`: Field `lastSeenAt` updated on every presence change
- [ ] onDisconnect: Set `lastSeenAt: serverTimestamp()` in RTDB
- [ ] Member list: Hover over offline user → tooltip shows "Last seen: 2 hours ago"
- [ ] Format: Relative time (formatDistanceToNow from date-fns)
- [ ] If never seen: Show "Last seen: Never" (edge case for newly invited users)

**Estimated Effort:** 1 hour

---

## Epic 7: Message History & Pagination

**Goal:** Implement infinite scroll to load older messages, handle large channels (10,000+ messages), and optimize rendering performance.

**Success Criteria:** Users can scroll up to load message history, channels with 10,000+ messages perform well, pagination uses cursor-based queries.

**Dependencies:** Epic 4 (Messaging core working)

---

### Story 7.1: Implement Cursor-Based Pagination

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Use Firestore `startAfter` queries to paginate message history. Load 50 messages at a time when user scrolls to top.

**Acceptance Criteria:**
- [ ] Update `useMessages` hook: Add `loadMore()` function
- [ ] Track last visible document: `useState<DocumentSnapshot | null>(lastVisible)`
- [ ] Query: `query(..., orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(50))`
- [ ] On scroll to top: Call `loadMore()` → fetch next 50 messages
- [ ] Prepend to messages array (oldest messages at top)
- [ ] Maintain scroll position after load (don't jump)
- [ ] Disable loadMore if no more messages (`lastVisible === null` after query returns <50 results)
- [ ] Loading indicator at top of list while fetching

**Estimated Effort:** 2-3 hours

---

### Story 7.2: Add Infinite Scroll Trigger

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Detect when user scrolls to top of message list, automatically trigger pagination to load older messages.

**Acceptance Criteria:**
- [ ] Scroll listener: Detect `scrollTop === 0` (reached top)
- [ ] Debounce: Prevent multiple simultaneous loads (use `useRef` to track loading state)
- [ ] Trigger: Call `loadMore()` when top reached
- [ ] Show loading indicator: "Loading older messages..." at top (Spinner + text)
- [ ] Intersection Observer alternative: Use sentinel div at top, trigger when visible (more performant)
- [ ] Stop triggering when all messages loaded (hasMore = false)

**Estimated Effort:** 2 hours

---

### Story 7.3: Optimize Message List Rendering with Virtualization

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Implement virtual scrolling (react-window) to render only visible messages. Reduces DOM nodes and memory usage for large channels.

**Acceptance Criteria:**
- [ ] Install: `pnpm add react-window`
- [ ] Wrap MessageList in `FixedSizeList` or `VariableSizeList`
- [ ] Render only visible messages (~10-20 DOM nodes regardless of total message count)
- [ ] Estimate message height: 80px (adjust based on average)
- [ ] Dynamic height support: Calculate actual height per message (for multi-line messages)
- [ ] Scroll position maintained during pagination
- [ ] Performance: 10,000 messages → <200MB memory, smooth scrolling (60fps)

**Estimated Effort:** 2-3 hours

---

### Story 7.4: Add Timestamp Formatting Helpers

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Create utility functions for relative timestamps ("2 min ago", "Yesterday", "Jan 15"). Use throughout app (messages, sidebar, tooltips).

**Acceptance Criteria:**
- [ ] Install: `pnpm add date-fns`
- [ ] Create `lib/utils/formatting.ts`
- [ ] Function: `formatRelativeTime(timestamp: Timestamp): string`
- [ ] Logic:
  - [ ] <1 hour: "X min ago" (e.g., "2 min ago")
  - [ ] <24 hours: "Today at HH:MM AM/PM" (e.g., "Today at 2:45 PM")
  - [ ] Yesterday: "Yesterday at HH:MM AM/PM"
  - [ ] <7 days: "Monday at HH:MM AM/PM"
  - [ ] Older: "Jan 15" or "Jan 15, 2026" (include year if different)
- [ ] Use in MessageItem, DM list, channel list (lastMessageAt)
- [ ] Update every minute (useEffect interval) for "X min ago" to stay current

**Estimated Effort:** 1-2 hours

---

### Story 7.5: Handle Large Messages with Truncation

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Truncate very long messages (>2000 characters) with "Show more" link. Full text revealed on click.

**Acceptance Criteria:**
- [ ] MessageItem: Check if `text.length > 2000`
- [ ] If >2000: Show first 2000 chars + "... Show more" link (Primary Brand color)
- [ ] Click "Show more" → reveal full text, replace with "Show less" link
- [ ] State: `useState<boolean>(isExpanded)` per message
- [ ] Collapsed by default (prevent UI clutter)
- [ ] Accessibility: Keyboard accessible (Tab + Enter to toggle)

**Estimated Effort:** 1 hour

---

## Epic 8: Mobile Responsiveness

**Goal:** Adapt UI for mobile devices (<768px) with collapsible sidebar, touch-optimized interactions, and mobile-friendly message composition.

**Success Criteria:** App works smoothly on mobile web (iOS Safari, Chrome Android), sidebar becomes overlay menu, message input works with virtual keyboard.

**Dependencies:** Epic 3, 4 (Core UI built)

---

### Story 8.1: Implement Responsive Sidebar (Hamburger Menu)

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Convert sidebar to overlay menu on mobile. Add hamburger menu icon in top bar, sidebar slides in from left on tap.

**Acceptance Criteria:**
- [ ] Desktop (≥1024px): Sidebar always visible (250px fixed width)
- [ ] Tablet (768-1023px): Sidebar collapsible, hamburger menu in top-left
- [ ] Mobile (<768px): Sidebar hidden by default, hamburger menu in top-left
- [ ] Hamburger icon: 3 horizontal lines (☰), 44x44px tap target
- [ ] Tap hamburger → Sidebar slides in from left (280px width, covers main view)
- [ ] Overlay: Semi-transparent backdrop (rgba(0,0,0,0.5))
- [ ] Close: Tap outside sidebar or tap channel/DM (auto-close after selection)
- [ ] Animation: 200ms slide transition (transform: translateX(-280px) → translateX(0))

**Estimated Effort:** 2-3 hours

---

### Story 8.2: Optimize Message Input for Mobile

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Adjust message input for mobile: Larger textarea, optimized for virtual keyboard, send button always visible.

**Acceptance Criteria:**
- [ ] Mobile (<768px): Textarea min height 60px (larger than desktop)
- [ ] Virtual keyboard triggers on tap (autofocus disabled on mobile to prevent auto-open)
- [ ] Textarea expands to 60% of screen height when focused (keyboard visible)
- [ ] Send button: Always visible on mobile (not hidden when empty)
- [ ] Send button: 44x44px tap target (touch-friendly)
- [ ] Shift+Enter: Not applicable on mobile (Enter always sends)
- [ ] Scroll behavior: Auto-scroll to bottom when keyboard opens

**Estimated Effort:** 2 hours

---

### Story 8.3: Mobile-Friendly Top Bar

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Adjust top bar layout for mobile: Hamburger left, channel name center, settings icon right. Ensure all tap targets are 44x44px minimum.

**Acceptance Criteria:**
- [ ] Mobile layout: [☰] [Channel Name] [⚙]
- [ ] Hamburger: 44x44px, left-aligned, 16px left padding
- [ ] Channel name: Centered, truncate with ellipsis if too long
- [ ] Settings icon: 44x44px, right-aligned, 16px right padding
- [ ] Height: 56px (consistent with desktop)
- [ ] Fixed position: Stays at top during scroll
- [ ] No hover states on mobile (touch-only)

**Estimated Effort:** 1 hour

---

### Story 8.4: Touch Gesture Support

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Add swipe gestures for mobile: Swipe right to open sidebar, swipe left to close sidebar (if open).

**Acceptance Criteria:**
- [ ] Swipe right (from left edge): Open sidebar
- [ ] Swipe left (on sidebar): Close sidebar
- [ ] Gesture threshold: 50px horizontal movement
- [ ] Velocity-based: Fast swipe triggers immediately
- [ ] Visual feedback: Sidebar follows finger during swipe (drag effect)
- [ ] Cancel: Release before threshold → sidebar returns to original state
- [ ] Library: Use `react-swipeable` or similar

**Estimated Effort:** 2 hours

---

### Story 8.5: Test Mobile Web on Real Devices

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Manual testing on iOS Safari and Chrome Android. Verify touch targets, virtual keyboard behavior, and scroll performance.

**Acceptance Criteria:**
- [ ] Test devices: iPhone (iOS Safari), Android phone (Chrome)
- [ ] Checklist:
  - [ ] Sidebar opens/closes smoothly
  - [ ] Hamburger menu tap target works
  - [ ] Message input focuses correctly
  - [ ] Virtual keyboard doesn't obscure input
  - [ ] Send button tap target works (44x44px minimum)
  - [ ] Channel switching works (tap to switch, sidebar closes)
  - [ ] Scroll performance smooth (60fps)
  - [ ] No horizontal scrolling (viewport width 100%)
- [ ] Document issues in GitHub (create bug tickets)
- [ ] Retest after fixes

**Estimated Effort:** 2 hours

---

## Epic 9: Security & Access Control

**Goal:** Implement Firestore and RTDB security rules, enforce workspace-scoped access, validate inputs, and prevent data leaks.

**Success Criteria:** Users can only access their workspace's data, all inputs validated, security rules tested, zero cross-workspace data leaks.

**Dependencies:** Epic 2, 3, 4 (Auth, workspaces, messaging built)

---

### Story 9.1: Write Firestore Security Rules

**Epic:** Epic 9 - Security & Access Control

**Description:**
Define Firestore security rules to enforce workspace-scoped access. Users can only read/write data in their workspace.

**Acceptance Criteria:**
- [ ] Create `firestore.rules` with workspace-scoped rules:
  - [ ] Helper functions: `isAuthenticated()`, `isWorkspaceMember(workspaceId)`, `isWorkspaceOwner(workspaceId)`
  - [ ] Workspaces: Read/update if member, delete if owner
  - [ ] Channels: Read/create if member, update/delete if creator or owner
  - [ ] Messages: Read if member, create if member + author, delete if author
  - [ ] DirectMessages: Read/create if participant (userId in userIds array)
  - [ ] Users: Read all members, write only own document
  - [ ] UnreadCounts: Read/write only own counts
- [ ] Deploy: `firebase deploy --only firestore:rules`
- [ ] Verify: Run security rules tests (Story 10.4)

**Estimated Effort:** 3 hours

---

### Story 9.2: Write Realtime Database Security Rules

**Epic:** Epic 9 - Security & Access Control

**Description:**
Define RTDB security rules for messages, presence, and typing indicators. Enforce workspace membership checks.

**Acceptance Criteria:**
- [ ] Create `database.rules.json`:
  - [ ] Messages: Read/write if user's workspaceId matches path workspaceId
  - [ ] Presence: Read all, write only own userId
  - [ ] Typing: Read all in workspace, write only own userId
  - [ ] Validate message structure: Required fields (userId, userName, text, timestamp)
  - [ ] Text length: max 4000 characters
- [ ] Deploy: `firebase deploy --only database:rules`
- [ ] Test: Attempt cross-workspace access → verify denied

**Estimated Effort:** 2 hours

---

### Story 9.3: Add Input Validation (Client & Server)

**Epic:** Epic 9 - Security & Access Control

**Description:**
Create validation helpers for all user inputs (channel names, messages, emails). Validate on client and enforce in security rules.

**Acceptance Criteria:**
- [ ] Create `lib/utils/validation.ts`:
  - [ ] `validateChannelName(name: string)`: lowercase, hyphens, 1-50 chars
  - [ ] `validateMessageText(text: string)`: 1-4000 chars
  - [ ] `validateEmail(email: string)`: valid email format
  - [ ] `validateWorkspaceName(name: string)`: 1-50 chars
- [ ] Client-side: Call validators before Firestore writes, show error messages
- [ ] Security rules: Duplicate validation logic (server-side enforcement)
- [ ] Error messages: Clear and actionable ("Channel names must be lowercase and use hyphens instead of spaces")

**Estimated Effort:** 2 hours

---

### Story 9.4: Implement Rate Limiting (Basic)

**Epic:** Epic 9 - Security & Access Control

**Description:**
Prevent spam by limiting message send rate. Client-side throttle (1 message per second) and security rule validation.

**Acceptance Criteria:**
- [ ] Client-side: Throttle `sendMessage()` function (max 1 call per second)
- [ ] Show error: "You're sending messages too quickly. Please wait."
- [ ] Security rule: Check message timestamp vs last message timestamp (reject if <1 second apart)
- [ ] Edge case: Allow burst of 3 messages, then enforce 1/second limit
- [ ] Future: Firebase App Check for advanced rate limiting (post-MVP)

**Estimated Effort:** 1-2 hours

---

### Story 9.5: Add XSS Protection (Sanitize Inputs)

**Epic:** Epic 9 - Security & Access Control

**Description:**
Prevent XSS attacks by sanitizing message text. Escape HTML, block JavaScript injection, allow safe text formatting (Phase 2).

**Acceptance Criteria:**
- [ ] Install: `pnpm add dompurify`
- [ ] Sanitize all message text before rendering: `DOMPurify.sanitize(text)`
- [ ] Allow: Plain text only (MVP, no HTML)
- [ ] Block: <script>, <iframe>, event handlers (onclick, onerror, etc.)
- [ ] Future: Whitelist safe HTML tags (bold, italic) for Phase 2 formatting
- [ ] Test: Attempt to send `<script>alert('XSS')</script>` → renders as plain text

**Estimated Effort:** 1 hour

---

## Epic 10: Testing & Quality Assurance

**Goal:** Implement unit tests for hooks, integration tests for Firebase rules, E2E tests for critical user flows, and performance testing.

**Success Criteria:** 80% code coverage, all security rules tested, critical flows E2E tested, performance benchmarks met.

**Dependencies:** Epic 1-9 (All features built)

---

### Story 10.1: Set Up Testing Infrastructure

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Configure Vitest for unit tests, Playwright for E2E tests, and Firebase Emulator Suite for integration tests.

**Acceptance Criteria:**
- [ ] Install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] Install: `pnpm add -D playwright @playwright/test`
- [ ] Configure: `vitest.config.ts` with React Testing Library
- [ ] Configure: `playwright.config.ts` with test projects (chromium, firefox, webkit)
- [ ] Create test directories: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- [ ] npm scripts:
  - [ ] `"test": "vitest"`
  - [ ] `"test:e2e": "playwright test"`
  - [ ] `"test:rules": "firebase emulators:exec --only firestore,database 'pnpm test:rules:run'"`
- [ ] CI: Add GitHub Actions workflow to run tests on PR

**Estimated Effort:** 2 hours

---

### Story 10.2: Write Unit Tests for Custom Hooks

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Test custom hooks (useAuth, useMessages, useChannels, usePresence) with mocked Firebase SDK.

**Acceptance Criteria:**
- [ ] Test `useAuth`:
  - [ ] Returns user after sign-in
  - [ ] Loading state during auth check
  - [ ] Sign out clears user
- [ ] Test `useMessages`:
  - [ ] Loads messages from Firestore
  - [ ] Updates on new RTDB message
  - [ ] Handles errors gracefully
- [ ] Test `useChannels`:
  - [ ] Loads channel list
  - [ ] Sorts alphabetically
  - [ ] Updates on channel creation/deletion
- [ ] Test `usePresence`:
  - [ ] Sets online status on connect
  - [ ] Sets offline on disconnect
- [ ] Mock Firebase SDK: Use `@testing-library/react-hooks` + mock `firebase` module
- [ ] Coverage: Aim for 80%+ on hooks

**Estimated Effort:** 4 hours

---

### Story 10.3: Write Unit Tests for UI Components

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Test UI components (Button, Input, Modal, MessageItem, ChannelList) for rendering, interactions, and accessibility.

**Acceptance Criteria:**
- [ ] Test `Button`:
  - [ ] Renders with correct variant (Primary, Secondary, Destructive)
  - [ ] Disabled state works
  - [ ] onClick handler called
- [ ] Test `Modal`:
  - [ ] Renders with overlay
  - [ ] ESC key closes
  - [ ] Focus trap works (Tab cycles through elements)
- [ ] Test `MessageItem`:
  - [ ] Renders author, timestamp, text
  - [ ] Formats timestamp correctly
  - [ ] Handles long messages
- [ ] Test `ChannelList`:
  - [ ] Renders channels
  - [ ] Highlights active channel
  - [ ] Shows unread badges
- [ ] Accessibility: Run axe-core tests on all components

**Estimated Effort:** 4 hours

---

### Story 10.4: Write Integration Tests for Security Rules

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Use Firebase Rules Unit Testing library to test Firestore and RTDB security rules. Verify workspace isolation, access control, and data validation.

**Acceptance Criteria:**
- [ ] Install: `pnpm add -D @firebase/rules-unit-testing`
- [ ] Create `tests/integration/firestore-rules.test.ts`
- [ ] Test scenarios:
  - [ ] User can read messages in their workspace
  - [ ] User cannot read messages in other workspaces
  - [ ] User can create message only with their userId
  - [ ] User can delete only their own messages
  - [ ] Channel creator can delete channel
  - [ ] Non-creator cannot delete channel
  - [ ] #general channel cannot be deleted
- [ ] Run with emulator: `firebase emulators:exec --only firestore 'pnpm vitest tests/integration'`
- [ ] Coverage: All security rules tested

**Estimated Effort:** 3 hours

---

### Story 10.5: Write E2E Tests for Critical Flows

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Use Playwright to test end-to-end user flows: Sign up → Create workspace → Send message → Receive message (multi-user).

**Acceptance Criteria:**
- [ ] Test: Sign Up Flow
  - [ ] Fill email/password → Submit → Redirects to workspace creation
- [ ] Test: Sign In Flow
  - [ ] Fill credentials → Submit → Redirects to /app
- [ ] Test: Create Channel
  - [ ] Click "+ New Channel" → Fill name → Submit → Channel appears in sidebar
- [ ] Test: Send Message
  - [ ] Type message → Press Enter → Message appears in list
- [ ] Test: Real-Time Message Delivery (Multi-User)
  - [ ] User 1 sends message → User 2 receives within 1s
  - [ ] Measure latency: Verify <500ms
- [ ] Test: Channel Switching
  - [ ] Click channel → Messages load → Active highlight updates
- [ ] Run in CI: `playwright test --project=chromium`

**Estimated Effort:** 4 hours

---

### Story 10.6: Performance Testing & Benchmarking

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Measure performance metrics: Initial load time, message delivery latency, channel switch latency, memory usage. Verify meets targets.

**Acceptance Criteria:**
- [ ] Lighthouse audit: Performance score >90
- [ ] Measure: Time to First Byte (TTFB) <200ms
- [ ] Measure: First Contentful Paint (FCP) <1.5s
- [ ] Measure: Time to Interactive (TTI) <2s on 3G
- [ ] Measure: Message delivery latency (send timestamp vs receive timestamp) <500ms (95th percentile)
- [ ] Measure: Channel switch latency <200ms (95th percentile)
- [ ] Load test: 50 concurrent users in one workspace → verify no performance degradation
- [ ] Memory profiling: Long session (8 hours) → <500MB memory usage
- [ ] Document results in `docs/performance-report.md`

**Estimated Effort:** 3 hours

---

## Epic 11: Deployment & Monitoring

**Goal:** Deploy app to production (Vercel + Firebase), set up monitoring (Sentry, Vercel Analytics), configure CI/CD pipeline, and create runbooks.

**Success Criteria:** Production app accessible at custom domain, errors tracked in Sentry, CI/CD pipeline deploys on every commit to main, monitoring alerts configured.

**Dependencies:** Epic 1-10 (All features built and tested)

---

### Story 11.1: Deploy Firebase to Production

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Create production Firebase project, deploy Firestore rules, RTDB rules, and indexes. Configure environment variables for production.

**Acceptance Criteria:**
- [ ] Create production Firebase project: `firebase projects:create slacklite-prod`
- [ ] Enable services: Firestore, RTDB, Authentication
- [ ] Deploy security rules: `firebase deploy --only firestore:rules,database:rules --project slacklite-prod`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes --project slacklite-prod`
- [ ] Configure billing: Set up Firebase billing alerts ($100, $500, $1000)
- [ ] Save production config to Vercel environment variables (encrypted)
- [ ] Test: Create test workspace in production → verify rules work

**Estimated Effort:** 2 hours

---

### Story 11.2: Deploy Next.js App to Vercel Production

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Deploy Next.js app to Vercel production with custom domain (slacklite.app), configure environment variables, enable automatic deployments.

**Acceptance Criteria:**
- [ ] Link domain: `vercel domains add slacklite.app` → configure DNS
- [ ] Set production environment variables (Firebase config, Sentry DSN)
- [ ] Deploy: `vercel --prod`
- [ ] Verify: App accessible at https://slacklite.app
- [ ] SSL certificate: Automatic via Vercel (Let's Encrypt)
- [ ] Preview deployments: Enabled for all PRs (automatic)
- [ ] Rollback plan: Document how to revert to previous deployment

**Estimated Effort:** 1-2 hours

---

### Story 11.3: Set Up Error Tracking with Sentry

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Integrate Sentry for error tracking. Capture client-side errors, API route errors, and Firebase errors. Set up alerts for critical errors.

**Acceptance Criteria:**
- [ ] Install: `pnpm add @sentry/nextjs`
- [ ] Run: `npx @sentry/wizard -i nextjs` → auto-configure
- [ ] Create `sentry.client.config.ts` and `sentry.server.config.ts`
- [ ] Environment: NEXT_PUBLIC_SENTRY_DSN from .env.local
- [ ] Capture: Unhandled errors, Promise rejections, Firebase errors
- [ ] Source maps: Upload to Sentry for readable stack traces
- [ ] Alerts: Configure Slack/email alerts for critical errors (>10/hour)
- [ ] Test: Throw test error → verify appears in Sentry dashboard

**Estimated Effort:** 2 hours

---

### Story 11.4: Configure Vercel Analytics & Monitoring

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Enable Vercel Analytics for Real User Monitoring (RUM), track Core Web Vitals, and set up performance budgets.

**Acceptance Criteria:**
- [ ] Enable Vercel Analytics in project settings
- [ ] Add `<Analytics />` component to `app/layout.tsx`
- [ ] Track: Core Web Vitals (LCP, FID, CLS)
- [ ] Custom events: Track "message_sent", "channel_created", "user_invited"
- [ ] Performance budgets: Warn if bundle size >500KB, TTI >2s
- [ ] Dashboard: Review metrics daily (first week), weekly thereafter
- [ ] Alerts: Set up alerts for performance regressions (LCP >3s)

**Estimated Effort:** 1 hour

---

### Story 11.5: Create CI/CD Pipeline (GitHub Actions)

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Automate testing and deployment with GitHub Actions. Run tests on every PR, deploy to staging on merge to develop, deploy to production on merge to main.

**Acceptance Criteria:**
- [ ] Create `.github/workflows/ci.yml`:
  - [ ] Trigger: on push to any branch, on pull_request
  - [ ] Steps: Install deps, run linter, run unit tests, run E2E tests, build
  - [ ] Fail if any step fails (block merge)
- [ ] Create `.github/workflows/deploy-staging.yml`:
  - [ ] Trigger: on push to develop branch
  - [ ] Deploy to Vercel staging environment
- [ ] Create `.github/workflows/deploy-production.yml`:
  - [ ] Trigger: on push to main branch
  - [ ] Deploy to Vercel production
  - [ ] Run smoke tests after deployment
- [ ] Branch protection: Require CI passing before merge
- [ ] Auto-deploy: Enabled for main and develop branches

**Estimated Effort:** 2-3 hours

---

### Story 11.6: Write Production Runbooks

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Document operational procedures: deployment process, rollback, incident response, Firebase cost monitoring, and troubleshooting common issues.

**Acceptance Criteria:**
- [ ] Create `docs/runbooks/` directory
- [ ] Runbook: `deployment.md` (how to deploy, rollback, hotfix)
- [ ] Runbook: `incident-response.md` (on-call procedures, escalation)
- [ ] Runbook: `monitoring.md` (what to monitor, alert thresholds)
- [ ] Runbook: `firebase-costs.md` (track reads/writes, set budgets, optimize queries)
- [ ] Runbook: `common-issues.md` (troubleshooting guide):
  - [ ] Messages not delivering → check RTDB rules, user presence
  - [ ] Slow channel switching → check Firestore indexes
  - [ ] High Firebase costs → audit query patterns
- [ ] Share with team in Slack or Notion

**Estimated Effort:** 2 hours

---

### Story 11.7: Production Launch Checklist

**Epic:** Epic 11 - Deployment & Monitoring

**Description:**
Final pre-launch checklist: verify all features work in production, test with real users (beta), confirm monitoring alerts, and prepare support plan.

**Acceptance Criteria:**
- [ ] Feature smoke tests in production:
  - [ ] Sign up / Sign in works
  - [ ] Workspace creation works
  - [ ] Channel creation, switching works
  - [ ] Messages send/receive in <500ms
  - [ ] DMs work
  - [ ] Unread counts update
  - [ ] Mobile responsive (test on iPhone + Android)
- [ ] Beta user testing: Invite 5-10 users, collect feedback
- [ ] Monitoring: Verify Sentry captures errors, Vercel Analytics tracks traffic
- [ ] Alerts: Verify Slack/email alerts work (trigger test error)
- [ ] Support: Set up support email (support@slacklite.app)
- [ ] Launch: Announce on Twitter, Product Hunt, Hacker News
- [ ] Document launch date and initial user count

**Estimated Effort:** 3 hours

---

## Summary

**Total Stories:** 68  
**Total Estimated Effort:** 102-153 hours (3-4 weeks for 1-2 developers)

**Epic Breakdown:**
- Epic 1: Foundation (6 stories, 10-12 hours)
- Epic 2: Authentication (8 stories, 15-18 hours)
- Epic 3: Workspaces & Channels (10 stories, 19-22 hours)
- Epic 4: Real-Time Messaging (10 stories, 17-22 hours)
- Epic 5: Direct Messages (5 stories, 9-10 hours)
- Epic 6: User Presence (5 stories, 8-9 hours)
- Epic 7: Message History (5 stories, 8-11 hours)
- Epic 8: Mobile Responsiveness (5 stories, 9-11 hours)
- Epic 9: Security (5 stories, 9-11 hours)
- Epic 10: Testing (6 stories, 20-22 hours)
- Epic 11: Deployment (7 stories, 13-17 hours)

**Next Steps:**
1. Bob (Sprint Manager) creates story files from this epic list
2. Stories assigned to Carlos, Dana, Emily (Implementation Agents)
3. Daily standups to track progress, blockers
4. Winston (Architect) reviews PRs for architecture compliance
5. Sally (UX Designer) reviews UI implementation for design system adherence
6. Gate check after Epic 4 (core messaging working) before continuing to Epic 5-11
