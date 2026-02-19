# SlackLite - Technical Architecture

**Architect:** Winston (BMAD Architect)  
**Date:** 2026-02-18  
**Project:** SlackLite - Lightweight Team Messaging  
**Status:** MVP Architecture v1.0

---

## Executive Summary

SlackLite is a real-time team messaging application built on Next.js 14+ App Router with Firebase backend. The architecture prioritizes **sub-500ms message delivery**, **zero-configuration setup**, and **CLI-first deployment**. All infrastructure setup is automated through Firebase CLI and npm scripts—no manual browser console configuration.

**Core Architecture Pattern:** Real-time SPA with optimistic UI, server-side authentication, and hybrid data persistence (Firestore for history + Realtime Database for delivery).

---

## 1. Tech Stack

### 1.1 Frontend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js** | 15.1.5+ | App Router for file-based routing, server components for SEO, API routes for serverless functions, Vercel-optimized deployment |
| **React** | 19+ | Concurrent features, automatic batching for performance, hooks-based architecture |
| **TypeScript** | 5.7+ | Type safety for data models, Firebase SDK types, developer experience, catch errors at compile-time |
| **Tailwind CSS** | 3.4+ | Utility-first styling, consistent design system, small bundle size, responsive design built-in |
| **Firebase SDK** | 11.x (modular) | Real-time database listeners, Firestore persistence, Authentication, modular imports for tree-shaking |

**Rationale:** Next.js 15 provides automatic code splitting, image optimization, and API routes. React 19's concurrent features enable smooth real-time updates. TypeScript catches Firebase data model errors before production. Tailwind's utility classes match the design system perfectly with no custom CSS complexity.

### 1.2 Backend & Database

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Firebase Realtime Database** | Latest | WebSocket-based message delivery, sub-100ms latency, automatic reconnection, offline queue |
| **Firestore** | Latest | Permanent message persistence, complex queries (pagination, filtering), scalable reads/writes |
| **Firebase Auth** | Latest | Email/password authentication, session management, security rules integration, no custom auth logic |
| **Node.js** | 22+ | Firebase Functions runtime (if needed post-MVP), modern ESM support |

**Why Hybrid Database?**
- **Realtime Database:** Optimized for ephemeral data with ultra-low latency. Messages written here first for instant delivery.
- **Firestore:** Optimized for structured data with powerful queries. Messages persisted here for permanent history and pagination.
- **Pattern:** Write to both simultaneously (Cloud Function trigger or client-side dual-write), read from Firestore for history, subscribe to RTDB for real-time.

### 1.3 Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Vercel | Next.js optimization, automatic deployments, preview URLs, edge network, serverless functions |
| **CDN** | Vercel Edge Network | Global low-latency asset delivery, automatic caching, HTTP/3 support |
| **Database** | Firebase (GCP) | Multi-region Firestore, Realtime Database, automatic scaling |
| **Auth** | Firebase Auth | User authentication, token refresh, session persistence |
| **Monitoring** | Vercel Analytics + Sentry | Real User Monitoring, error tracking, performance metrics |
| **CI/CD** | GitHub Actions + Vercel | Automated testing, preview deployments, production rollouts |

**Rationale:** Vercel is purpose-built for Next.js with zero-config deployment. Firebase handles real-time complexity without custom WebSocket infrastructure. Both scale automatically—no server management.

### 1.4 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **pnpm** | 9+ | Fast package manager, efficient monorepo support, strict dependency resolution |
| **ESLint** | 9+ | Code quality, Next.js config, TypeScript rules |
| **Prettier** | 3+ | Code formatting consistency |
| **Vitest** | 2+ | Fast unit tests, compatible with Next.js App Router |
| **Playwright** | 1.50+ | E2E testing, real-time messaging scenarios |
| **Firebase Emulator Suite** | Latest | Local development, offline testing, security rules validation |

---

## 2. Data Models

### 2.1 Firestore Schema

#### Collection: `workspaces`
```typescript
interface Workspace {
  workspaceId: string;           // Auto-generated document ID
  name: string;                  // "Acme Inc", "Dev Team" (1-50 chars)
  ownerId: string;               // userId of creator
  createdAt: Timestamp;          // Server timestamp
  updatedAt: Timestamp;          // Server timestamp
}

// Document path: /workspaces/{workspaceId}
// Indexes: None (small collection, <1000 workspaces expected)
```

#### Collection: `users`
```typescript
interface User {
  userId: string;                // Firebase Auth UID (document ID)
  email: string;                 // Unique, indexed
  displayName: string;           // Derived from email (before @)
  workspaceId: string;           // Single workspace in MVP (indexed)
  avatarUrl?: string;            // Future: profile photo URL
  createdAt: Timestamp;          // Server timestamp
  lastSeenAt: Timestamp;         // Updated on presence change
  isOnline: boolean;             // Updated via Firebase presence
}

// Document path: /users/{userId}
// Indexes:
// - workspaceId (for member list queries)
// - email (for invite lookup)
```

#### Collection: `channels`
```typescript
interface Channel {
  channelId: string;             // Auto-generated document ID
  workspaceId: string;           // Foreign key (indexed)
  name: string;                  // "general", "dev-team" (lowercase, hyphens, 1-50 chars)
  createdBy: string;             // userId of creator
  createdAt: Timestamp;          // Server timestamp
  lastMessageAt?: Timestamp;     // For sorting channels by activity
  messageCount: number;          // Denormalized for display (optional)
}

// Document path: /workspaces/{workspaceId}/channels/{channelId}
// Subcollection of workspace for automatic security scoping
// Indexes:
// - workspaceId + name (unique constraint)
// - workspaceId + lastMessageAt (for sorting)
```

#### Subcollection: `channels/{channelId}/messages`
```typescript
interface Message {
  messageId: string;             // Auto-generated document ID
  channelId: string;             // Parent channel (implicit in path)
  workspaceId: string;           // Denormalized for security rules
  userId: string;                // Author userId
  userName: string;              // Denormalized for display (avoids join)
  text: string;                  // Message content (1-4000 chars)
  timestamp: Timestamp;          // Server timestamp (for ordering)
  createdAt: Timestamp;          // Client timestamp (for optimistic UI)
  status?: 'sending' | 'sent' | 'failed'; // Client-side only
}

// Document path: /workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}
// Indexes:
// - channelId + timestamp DESC (for pagination)
// - workspaceId (for security rules)
```

#### Collection: `directMessages`
```typescript
interface DirectMessage {
  dmId: string;                  // Auto-generated document ID
  workspaceId: string;           // Foreign key (indexed)
  userIds: [string, string];     // Sorted array [userId1, userId2]
  createdAt: Timestamp;          // Server timestamp
  lastMessageAt?: Timestamp;     // For sorting DM list
}

// Document path: /workspaces/{workspaceId}/directMessages/{dmId}
// Indexes:
// - workspaceId + userIds (for finding DM by participants)
// - workspaceId + lastMessageAt (for sorting)

// Messages stored in subcollection: /directMessages/{dmId}/messages/{messageId}
// Same schema as channel messages
```

#### Collection: `unreadCounts`
```typescript
interface UnreadCount {
  id: string;                    // "{userId}_{channelId}" or "{userId}_{dmId}"
  userId: string;                // User who has unread messages
  targetId: string;              // channelId or dmId
  targetType: 'channel' | 'dm';  // Type of conversation
  count: number;                 // Number of unread messages
  lastReadAt: Timestamp;         // Last time user viewed this conversation
  updatedAt: Timestamp;          // Server timestamp
}

// Document path: /unreadCounts/{userId}_{targetId}
// Indexes:
// - userId (for fetching all unreads for sidebar)
```

### 2.2 Firebase Realtime Database Schema

**Purpose:** Ultra-low latency message delivery. Messages written here first, then mirrored to Firestore.

```json
{
  "messages": {
    "{workspaceId}": {
      "{channelId}": {
        "{messageId}": {
          "userId": "user123",
          "userName": "Sarah Johnson",
          "text": "Hey team!",
          "timestamp": 1708321234567,
          "ttl": 1708324834567  // 1 hour expiry
        }
      }
    }
  },
  "presence": {
    "{userId}": {
      "online": true,
      "lastSeen": 1708321234567,
      "connections": {
        "{connectionId}": true  // Firebase manages cleanup
      }
    }
  },
  "typing": {
    "{channelId}": {
      "{userId}": {
        "userName": "Alex Smith",
        "timestamp": 1708321234567  // Auto-expire after 3s
      }
    }
  }
}
```

**TTL Strategy:** Realtime Database messages auto-delete after 1 hour (reduces storage costs). Firestore is source of truth for history.

### 2.3 Data Model Relationships

```
Workspace (1) ──< (many) Channels
Workspace (1) ──< (many) Users
Workspace (1) ──< (many) DirectMessages
Channel (1) ──< (many) Messages
DirectMessage (1) ──< (many) Messages
User (1) ──< (many) Messages (as author)
User (many) ──< (many) UnreadCounts
```

### 2.4 Data Consistency Strategy

**Dual-Write Pattern (MVP):**
1. Client writes message to Realtime Database (instant delivery)
2. Client writes same message to Firestore (permanent history)
3. If RTDB write fails: Show error, don't write to Firestore
4. If Firestore write fails: Message delivered but not persisted (warn user)

**Future Optimization (Post-MVP):**
- Cloud Function trigger: RTDB write → automatic Firestore mirror
- Benefits: Single write operation, guaranteed consistency, reduced client complexity

---

## 3. Real-Time Messaging Architecture

### 3.1 Message Flow (End-to-End)

```
┌──────────────────────────────────────────────────────────────┐
│ User A (Sender)                                               │
├──────────────────────────────────────────────────────────────┤
│ 1. Type message, press Enter                                 │
│ 2. Optimistic UI: Show message immediately (gray timestamp)  │
│ 3. Write to RTDB: /messages/{workspaceId}/{channelId}/       │
│ 4. Write to Firestore: /channels/{channelId}/messages/       │
│ 5. Update timestamp: Server confirms → black timestamp       │
└──────────────────────────────────────────────────────────────┘
                            ↓ (WebSocket via Firebase SDK)
┌──────────────────────────────────────────────────────────────┐
│ Firebase Realtime Database                                    │
├──────────────────────────────────────────────────────────────┤
│ - Receives message write                                     │
│ - Broadcasts to all connected clients (sub-100ms)            │
│ - Returns confirmation to sender                             │
└──────────────────────────────────────────────────────────────┘
                            ↓ (WebSocket via Firebase SDK)
┌──────────────────────────────────────────────────────────────┐
│ User B, C, D (Recipients)                                     │
├──────────────────────────────────────────────────────────────┤
│ 1. RTDB listener triggers: onChildAdded                      │
│ 2. Render new message in UI (<500ms from send)               │
│ 3. If current channel: Append to message list                │
│ 4. If different channel: Increment unread count              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Listener Management Strategy

**Active Listeners Per User:**
- **1 Firestore listener:** Current channel message history (query: last 50 messages)
- **1 RTDB listener:** Current channel real-time updates (path: `/messages/{workspaceId}/{channelId}`)
- **1 Firestore listener:** Sidebar data (channels list, DMs list, workspace members)
- **1 RTDB listener:** Presence updates (path: `/presence/{userId}`)
- **Total:** 4 concurrent listeners (well within Firebase limits)

**Listener Lifecycle:**
```typescript
useEffect(() => {
  // Subscribe to current channel
  const unsubscribeFirestore = onSnapshot(
    query(
      collection(db, `workspaces/${workspaceId}/channels/${channelId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(50)
    ),
    (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    }
  );

  const rtdbRef = ref(rtdb, `messages/${workspaceId}/${channelId}`);
  const unsubscribeRTDB = onChildAdded(rtdbRef, (snapshot) => {
    const newMessage = snapshot.val();
    // Only add if not already in Firestore list (deduplication)
    if (!messages.some(m => m.messageId === snapshot.key)) {
      setMessages(prev => [...prev, newMessage]);
    }
  });

  // Cleanup on unmount or channel switch
  return () => {
    unsubscribeFirestore();
    off(rtdbRef, 'child_added', unsubscribeRTDB);
  };
}, [channelId]); // Re-subscribe when channel changes
```

### 3.3 Optimistic UI Pattern

**Goal:** User sees message instantly (perceived 0ms latency), then server confirms.

```typescript
async function sendMessage(text: string) {
  const tempId = `temp_${Date.now()}`;
  const tempMessage: Message = {
    messageId: tempId,
    channelId: currentChannelId,
    userId: currentUser.uid,
    userName: currentUser.displayName,
    text,
    timestamp: Timestamp.now(),
    createdAt: Timestamp.now(),
    status: 'sending'
  };

  // 1. Immediately show in UI
  setMessages(prev => [...prev, tempMessage]);

  try {
    // 2. Write to RTDB (fast delivery)
    const rtdbRef = ref(rtdb, `messages/${workspaceId}/${currentChannelId}`);
    const newRTDBMessage = push(rtdbRef);
    await set(newRTDBMessage, {
      userId: tempMessage.userId,
      userName: tempMessage.userName,
      text: tempMessage.text,
      timestamp: serverTimestamp(),
      ttl: Date.now() + 3600000 // 1 hour expiry
    });

    // 3. Write to Firestore (permanent history)
    const firestoreRef = collection(db, `workspaces/${workspaceId}/channels/${currentChannelId}/messages`);
    const newFirestoreMessage = await addDoc(firestoreRef, {
      ...tempMessage,
      messageId: newRTDBMessage.key, // Use RTDB key for consistency
      timestamp: serverTimestamp(),
      status: 'sent'
    });

    // 4. Update local state: Replace temp message with confirmed message
    setMessages(prev => 
      prev.map(m => m.messageId === tempId 
        ? { ...m, messageId: newRTDBMessage.key, status: 'sent', timestamp: serverTimestamp() }
        : m
      )
    );

  } catch (error) {
    // 5. Handle failure: Mark message as failed
    setMessages(prev => 
      prev.map(m => m.messageId === tempId 
        ? { ...m, status: 'failed' }
        : m
      )
    );
    console.error('Failed to send message:', error);
  }
}
```

### 3.4 Presence System

**Online/Offline Indicators:**
```typescript
// Firebase presence detection (built-in)
const userPresenceRef = ref(rtdb, `presence/${userId}`);
const connectedRef = ref(rtdb, '.info/connected');

onValue(connectedRef, (snapshot) => {
  if (snapshot.val() === true) {
    // When connected: Set online status
    set(userPresenceRef, {
      online: true,
      lastSeen: serverTimestamp()
    });

    // When disconnected: Set offline status (automatic cleanup)
    onDisconnect(userPresenceRef).set({
      online: false,
      lastSeen: serverTimestamp()
    });
  }
});

// Listen to other users' presence
const workspaceMembersRef = ref(rtdb, 'presence');
onValue(workspaceMembersRef, (snapshot) => {
  const presenceData = snapshot.val();
  // Update sidebar UI with online/offline indicators
  updateMemberStatus(presenceData);
});
```

### 3.5 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| **Message Delivery Latency** | <500ms | RTDB WebSocket + client-side listeners |
| **Optimistic UI Response** | <50ms | Immediate local state update before network |
| **Channel Switch Latency** | <200ms | Firestore query caching + indexed queries |
| **Unread Count Update** | <100ms | RTDB listener triggers React state update |
| **Reconnection Time** | <3s | Firebase automatic reconnect with exponential backoff |
| **Presence Update** | <1s | RTDB presence system with `.info/connected` |

---

## 4. Authentication & Authorization

### 4.1 Authentication Flow

**Sign Up:**
```typescript
// Client-side (Next.js API route or Firebase SDK direct)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function signUp(email: string, password: string) {
  // 1. Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    userId: user.uid,
    email: user.email,
    displayName: email.split('@')[0], // Derive from email
    workspaceId: null, // Set during workspace creation
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    isOnline: false
  });

  // 3. Redirect to workspace creation
  router.push('/create-workspace');
}
```

**Sign In:**
```typescript
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';

async function signIn(email: string, password: string) {
  // Enable persistent sessions (survives browser restart)
  await setPersistence(auth, browserLocalPersistence);
  
  // Sign in
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Redirect to app
  router.push('/app');
}
```

**Session Management:**
- Firebase Auth handles token refresh automatically
- Tokens stored in browser localStorage (persistent)
- Server-side: Verify token in Next.js middleware or API routes

```typescript
// middleware.ts (Next.js 14+ App Router)
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin'; // Admin SDK

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseToken')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const decodedToken = await verifyIdToken(token);
    // Attach user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decodedToken.uid);
    
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: '/app/:path*' // Protect all /app routes
};
```

### 4.2 Firestore Security Rules

**Critical:** All data scoped by `workspaceId`. Users can only access their workspace's data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isWorkspaceMember(workspaceId) {
      return isAuthenticated() && getUserData().workspaceId == workspaceId;
    }
    
    function isWorkspaceOwner(workspaceId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.ownerId == request.auth.uid;
    }
    
    // Workspaces: Users can read/update their own workspace
    match /workspaces/{workspaceId} {
      allow read: if isWorkspaceMember(workspaceId);
      allow create: if isAuthenticated(); // Any user can create workspace
      allow update: if isWorkspaceOwner(workspaceId);
      allow delete: if isWorkspaceOwner(workspaceId);
      
      // Channels: All workspace members can read/create, creator/owner can update/delete
      match /channels/{channelId} {
        allow read: if isWorkspaceMember(workspaceId);
        allow create: if isWorkspaceMember(workspaceId);
        allow update, delete: if isWorkspaceOwner(workspaceId) || 
                                  resource.data.createdBy == request.auth.uid;
        
        // Messages: All workspace members can read/create, author can update/delete
        match /messages/{messageId} {
          allow read: if isWorkspaceMember(workspaceId);
          allow create: if isWorkspaceMember(workspaceId) && 
                          request.resource.data.userId == request.auth.uid &&
                          request.resource.data.workspaceId == workspaceId;
          allow update, delete: if resource.data.userId == request.auth.uid;
        }
      }
      
      // Direct Messages: Participants only
      match /directMessages/{dmId} {
        allow read: if isWorkspaceMember(workspaceId) && 
                      request.auth.uid in resource.data.userIds;
        allow create: if isWorkspaceMember(workspaceId) && 
                        request.auth.uid in request.resource.data.userIds;
        
        match /messages/{messageId} {
          allow read: if isWorkspaceMember(workspaceId) && 
                        request.auth.uid in get(/databases/$(database)/documents/workspaces/$(workspaceId)/directMessages/$(dmId)).data.userIds;
          allow create: if isWorkspaceMember(workspaceId) && 
                          request.resource.data.userId == request.auth.uid;
        }
      }
    }
    
    // Users: Users can read all workspace members, update only themselves
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && userId == request.auth.uid;
      allow update: if userId == request.auth.uid;
      allow delete: if userId == request.auth.uid; // Self-deletion only
    }
    
    // Unread counts: Users can only access their own
    match /unreadCounts/{countId} {
      allow read, write: if isAuthenticated() && 
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4.3 Realtime Database Security Rules

```json
{
  "rules": {
    "messages": {
      "$workspaceId": {
        "$channelId": {
          ".read": "auth != null && root.child('users').child(auth.uid).child('workspaceId').val() == $workspaceId",
          ".write": "auth != null && root.child('users').child(auth.uid).child('workspaceId').val() == $workspaceId",
          "$messageId": {
            ".validate": "newData.hasChildren(['userId', 'userName', 'text', 'timestamp']) && newData.child('text').val().length > 0 && newData.child('text').val().length <= 4000"
          }
        }
      }
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "typing": {
      "$channelId": {
        ".read": "auth != null",
        "$userId": {
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    }
  }
}
```

---

## 5. Frontend Architecture

### 5.1 Next.js 14+ App Router Structure

```
slacklite/
├── app/                          # Next.js 14+ App Router
│   ├── (auth)/                  # Auth route group (no layout)
│   │   ├── signin/
│   │   │   └── page.tsx         # Sign In page
│   │   ├── signup/
│   │   │   └── page.tsx         # Sign Up page
│   │   └── create-workspace/
│   │       └── page.tsx         # Workspace creation
│   │
│   ├── (marketing)/             # Public route group
│   │   ├── layout.tsx           # Marketing layout (header/footer)
│   │   ├── page.tsx             # Landing page (/)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── privacy/
│   │       └── page.tsx
│   │
│   ├── app/                     # Protected app route group
│   │   ├── layout.tsx           # App layout (sidebar + main)
│   │   ├── page.tsx             # Redirect to last channel
│   │   ├── channels/
│   │   │   └── [channelId]/
│   │   │       └── page.tsx     # Channel view
│   │   └── dms/
│   │       └── [dmId]/
│   │           └── page.tsx     # DM view
│   │
│   ├── api/                     # API routes (serverless functions)
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   └── signin/route.ts
│   │   └── webhooks/
│   │       └── firebase/route.ts
│   │
│   ├── layout.tsx               # Root layout (providers, fonts)
│   ├── globals.css              # Tailwind imports
│   └── not-found.tsx            # 404 page
│
├── components/                  # React components
│   ├── ui/                     # Design system components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   └── Badge.tsx
│   │
│   ├── features/               # Feature-specific components
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx
│   │   │   └── SignUpForm.tsx
│   │   ├── channels/
│   │   │   ├── ChannelList.tsx
│   │   │   ├── CreateChannelModal.tsx
│   │   │   └── ChannelHeader.tsx
│   │   ├── messages/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── TypingIndicator.tsx
│   │   └── sidebar/
│   │       ├── Sidebar.tsx
│   │       ├── WorkspaceSelector.tsx
│   │       └── MemberList.tsx
│   │
│   └── layout/                 # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── AppShell.tsx        # Sidebar + Main layout
│
├── lib/                        # Utilities & configurations
│   ├── firebase/
│   │   ├── client.ts           # Firebase client SDK init
│   │   ├── admin.ts            # Firebase Admin SDK (server-side)
│   │   ├── auth.ts             # Auth helpers
│   │   ├── firestore.ts        # Firestore helpers
│   │   └── realtime.ts         # RTDB helpers
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication state
│   │   ├── useMessages.ts      # Real-time message subscription
│   │   ├── useChannels.ts      # Channel list subscription
│   │   ├── usePresence.ts      # User presence tracking
│   │   └── useUnreadCounts.ts  # Unread message counts
│   │
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # User authentication state
│   │   ├── WorkspaceContext.tsx # Current workspace
│   │   └── ChannelContext.tsx   # Current channel
│   │
│   ├── types/                  # TypeScript types
│   │   ├── models.ts           # Data model interfaces
│   │   ├── api.ts              # API request/response types
│   │   └── ui.ts               # UI component prop types
│   │
│   └── utils/                  # Helper functions
│       ├── formatting.ts       # Date formatting, text truncation
│       ├── validation.ts       # Input validation (email, channel names)
│       └── constants.ts        # App constants (limits, timeouts)
│
├── public/                     # Static assets
│   ├── favicon.ico
│   └── images/
│
├── tests/                      # Tests
│   ├── unit/
│   │   └── components/
│   ├── integration/
│   │   └── firebase-rules/
│   └── e2e/
│       └── playwright/
│
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Template for env vars
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── database.rules.json         # RTDB security rules
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # Project documentation
```

### 5.2 State Management Strategy

**Global State (React Context + Hooks):**

No external state management library (Redux, Zustand). Use React Context for global state, hooks for local state.

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        getDoc(doc(db, 'users', firebaseUser.uid)).then(userDoc => {
          setUser({ ...firebaseUser, ...userDoc.data() } as User);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage:
const { user, signIn } = useAuth(); // Custom hook wrapping useContext
```

**Real-Time Data (Custom Hooks):**

```typescript
// hooks/useMessages.ts
export function useMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !channelId) return;

    setLoading(true);

    // Subscribe to Firestore for message history
    const firestoreQuery = query(
      collection(db, `workspaces/${user.workspaceId}/channels/${channelId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribeFirestore = onSnapshot(firestoreQuery, 
      (snapshot) => {
        const firestoreMessages = snapshot.docs.map(doc => ({
          messageId: doc.id,
          ...doc.data()
        } as Message));
        setMessages(firestoreMessages.reverse()); // Oldest first for display
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Subscribe to RTDB for real-time updates
    const rtdbRef = ref(rtdb, `messages/${user.workspaceId}/${channelId}`);
    const rtdbListener = onChildAdded(rtdbRef, (snapshot) => {
      const newMessage = {
        messageId: snapshot.key!,
        ...snapshot.val()
      } as Message;

      // Deduplication: Only add if not already from Firestore
      setMessages(prev => {
        if (prev.some(m => m.messageId === newMessage.messageId)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    // Cleanup
    return () => {
      unsubscribeFirestore();
      off(rtdbRef, 'child_added', rtdbListener);
    };
  }, [channelId, user]);

  return { messages, loading, error };
}
```

**Local State (useState):**
- Form inputs (message composition, channel creation)
- UI toggles (modals open/closed, sidebar collapsed)
- Optimistic UI (temporary message during send)

### 5.3 Component Patterns

**Composition over Inheritance:**
```typescript
// Bad: Large monolithic component
function ChannelView() {
  // 500 lines of channel logic, message rendering, input handling
}

// Good: Composed from smaller components
function ChannelView() {
  return (
    <div className="flex flex-col h-screen">
      <ChannelHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}
```

**Server Components vs Client Components (Next.js 14+):**
```typescript
// Server Component (default in App Router)
// - Rendered on server, no JavaScript sent to client
// - Can fetch data directly (async/await)
// - Use for static layouts, SEO content

// app/page.tsx (Landing page)
export default async function LandingPage() {
  // Fetch data on server (no useEffect needed)
  const stats = await getAppStats();
  
  return (
    <div>
      <h1>SlackLite</h1>
      <p>{stats.totalWorkspaces} teams using SlackLite</p>
    </div>
  );
}

// Client Component (use 'use client' directive)
// - Interactive components with hooks, state, effects
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, WebSocket)

// components/messages/MessageInput.tsx
'use client';

export function MessageInput() {
  const [text, setText] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(text);
    setText('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## 6. Performance Optimizations

### 6.1 Message List Virtualization

**Problem:** Channels with 10,000+ messages cause DOM bloat (slow rendering, high memory).

**Solution:** Render only visible messages using `react-window`.

```typescript
import { FixedSizeList as List } from 'react-window';

function MessageList({ messages }: { messages: Message[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  );

  return (
    <List
      height={600}            // Viewport height
      itemCount={messages.length}
      itemSize={80}           // Approximate message height
      width="100%"
    >
      {Row}
    </List>
  );
}
```

**Impact:** 10,000 messages: Render ~10 DOM nodes instead of 10,000 → 100x memory reduction.

### 6.2 Debounced Typing Indicators

**Problem:** Sending typing event on every keystroke floods RTDB.

**Solution:** Debounce typing events (send max once per 2 seconds).

```typescript
import { debounce } from 'lodash-es';

const sendTypingIndicator = debounce((channelId: string, userId: string, userName: string) => {
  const typingRef = ref(rtdb, `typing/${channelId}/${userId}`);
  set(typingRef, { userName, timestamp: Date.now() });
  
  // Auto-expire after 3 seconds
  setTimeout(() => {
    remove(typingRef);
  }, 3000);
}, 2000); // Max once per 2 seconds
```

### 6.3 Firestore Query Optimization

**Indexes Required:**
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "channelId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "channels",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "isOnline", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Pagination with Cursors:**
```typescript
function useMessagePagination(channelId: string, pageSize = 50) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  
  const loadMore = async () => {
    const q = query(
      collection(db, `workspaces/${workspaceId}/channels/${channelId}/messages`),
      orderBy('timestamp', 'desc'),
      startAfter(lastVisible),
      limit(pageSize)
    );
    
    const snapshot = await getDocs(q);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setMessages(prev => [...prev, ...snapshot.docs.map(d => d.data() as Message)]);
  };
  
  return { messages, loadMore, hasMore: lastVisible !== null };
}
```

### 6.4 Image Optimization (Future)

**Next.js Image Component:**
```typescript
import Image from 'next/image';

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="rounded"
      loading="lazy" // Lazy load below fold
      placeholder="blur" // Blur-up effect
    />
  );
}
```

**Benefits:** Automatic WebP conversion, responsive sizes, lazy loading.

### 6.5 Code Splitting

**Dynamic Imports for Modals:**
```typescript
import dynamic from 'next/dynamic';

const CreateChannelModal = dynamic(() => import('@/components/features/channels/CreateChannelModal'), {
  loading: () => <Spinner />,
  ssr: false // No SSR for modals (client-only)
});

function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>+ New Channel</button>
      {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
```

**Impact:** Modal code not loaded until user clicks "+ New Channel" → smaller initial bundle.

---

## 7. CLI-First Setup & Deployment

### 7.1 Firebase Project Setup (CLI-Based)

**Prerequisites:**
```bash
# Install Firebase CLI globally
npm install -g firebase-tools@latest

# Login to Firebase
firebase login
```

**Project Initialization Script:**
```bash
#!/bin/bash
# setup-firebase.sh

set -e # Exit on error

PROJECT_ID="slacklite-prod"
PROJECT_NAME="SlackLite Production"
REGION="us-central1"

echo "🔥 Setting up Firebase project..."

# 1. Create Firebase project (requires manual confirmation in browser)
echo "Creating project $PROJECT_ID..."
firebase projects:create "$PROJECT_ID" --display-name "$PROJECT_NAME"

# 2. Add Firebase to project
firebase projects:addfirebase "$PROJECT_ID"

# 3. Enable required APIs
echo "Enabling Firebase APIs..."
gcloud services enable \
  firebase.googleapis.com \
  firestore.googleapis.com \
  identitytoolkit.googleapis.com \
  firebasedatabase.googleapis.com \
  --project "$PROJECT_ID"

# 4. Create web app
echo "Creating web app..."
APP_ID=$(firebase apps:create web "SlackLite Web" --project "$PROJECT_ID" --json | jq -r '.result.appId')
echo "Web app created: $APP_ID"

# 5. Get Firebase config (save to .env.local)
echo "Fetching Firebase config..."
firebase apps:sdkconfig web "$APP_ID" --project "$PROJECT_ID" --json > firebase-config.json

# Parse config and create .env.local
echo "NEXT_PUBLIC_FIREBASE_API_KEY=$(jq -r '.result.sdkConfig.apiKey' firebase-config.json)" > .env.local
echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$(jq -r '.result.sdkConfig.authDomain' firebase-config.json)" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$(jq -r '.result.sdkConfig.projectId' firebase-config.json)" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$(jq -r '.result.sdkConfig.storageBucket' firebase-config.json)" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(jq -r '.result.sdkConfig.messagingSenderId' firebase-config.json)" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_APP_ID=$(jq -r '.result.sdkConfig.appId' firebase-config.json)" >> .env.local
echo "NEXT_PUBLIC_FIREBASE_DATABASE_URL=$(jq -r '.result.sdkConfig.databaseURL' firebase-config.json)" >> .env.local

# 6. Initialize Firestore
echo "Initializing Firestore..."
firebase init firestore --project "$PROJECT_ID" --non-interactive

# 7. Initialize Realtime Database
echo "Initializing Realtime Database..."
firebase init database --project "$PROJECT_ID" --non-interactive

# 8. Initialize Firebase Auth
echo "Enabling Email/Password authentication..."
firebase auth:enable emailPassword --project "$PROJECT_ID"

# 9. Deploy security rules
echo "Deploying security rules..."
firebase deploy --only firestore:rules,database:rules --project "$PROJECT_ID"

# 10. Create Firestore indexes
echo "Creating Firestore indexes..."
firebase deploy --only firestore:indexes --project "$PROJECT_ID"

echo "✅ Firebase setup complete!"
echo "📝 Config saved to .env.local"
echo "🔗 Console: https://console.firebase.google.com/project/$PROJECT_ID"
```

**Usage:**
```bash
chmod +x setup-firebase.sh
./setup-firebase.sh
```

### 7.2 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/slacklite.git
cd slacklite

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start Firebase Emulators (local testing)
firebase emulators:start

# 5. Run Next.js dev server (separate terminal)
pnpm dev
```

**Firebase Emulator Configuration:**
```json
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "database": {
      "port": 9000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

**Connect to Emulators (dev mode):**
```typescript
// lib/firebase/client.ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectDatabaseEmulator } from 'firebase/database';

if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectDatabaseEmulator(database, 'localhost', 9000);
}
```

### 7.3 Vercel Deployment (CLI-Based)

```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Link to Vercel project
vercel link

# 3. Add environment variables (production)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL production

# Or bulk import from .env.local
vercel env pull .env.production.local

# 4. Deploy to production
vercel --prod
```

**Automated Deployment (GitHub Actions):**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.4 Monitoring & Analytics Setup (CLI)

**Sentry (Error Tracking):**
```bash
# 1. Create Sentry project (via CLI)
sentry-cli projects create \
  --org your-org \
  --team your-team \
  --name slacklite-web \
  --platform javascript-nextjs

# 2. Get DSN
SENTRY_DSN=$(sentry-cli projects list --format json | jq -r '.[0].dsn')

# 3. Add to Vercel environment
vercel env add NEXT_PUBLIC_SENTRY_DSN production
echo $SENTRY_DSN | vercel env add NEXT_PUBLIC_SENTRY_DSN production
```

**Vercel Analytics (Built-in):**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

**Test Firebase Hooks:**
```typescript
// tests/unit/hooks/useMessages.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMessages } from '@/lib/hooks/useMessages';
import { mockFirestore } from '@/tests/mocks/firebase';

describe('useMessages', () => {
  it('loads messages from Firestore', async () => {
    const { result } = renderHook(() => useMessages('channel-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.messages).toHaveLength(50);
    expect(result.current.messages[0].text).toBe('Hello world');
  });
  
  it('handles real-time updates from RTDB', async () => {
    const { result } = renderHook(() => useMessages('channel-123'));
    
    // Simulate RTDB message push
    mockRTDB.push('messages/workspace-1/channel-123', {
      userId: 'user-1',
      text: 'New message',
      timestamp: Date.now()
    });
    
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(51);
    });
  });
});
```

### 8.2 Integration Tests (Firebase Rules)

**Test Security Rules:**
```typescript
// tests/integration/firestore-rules.test.ts
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv: any;
  
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8')
      }
    });
  });
  
  it('allows workspace members to read messages', async () => {
    const db = testEnv.authenticatedContext('user-1', {
      workspaceId: 'workspace-1'
    }).firestore();
    
    await assertSucceeds(
      db.collection('workspaces/workspace-1/channels/channel-1/messages').get()
    );
  });
  
  it('denies non-members from reading messages', async () => {
    const db = testEnv.authenticatedContext('user-2', {
      workspaceId: 'workspace-2' // Different workspace
    }).firestore();
    
    await assertFails(
      db.collection('workspaces/workspace-1/channels/channel-1/messages').get()
    );
  });
});
```

### 8.3 E2E Tests (Playwright)

**Test Real-Time Messaging:**
```typescript
// tests/e2e/messaging.spec.ts
import { test, expect } from '@playwright/test';

test('sends and receives messages in real-time', async ({ page, context }) => {
  // User 1: Sign in and navigate to channel
  await page.goto('/signin');
  await page.fill('input[type="email"]', 'user1@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/app');
  await page.click('text=# general');
  
  // User 2: Open new page (simulate second user)
  const page2 = await context.newPage();
  await page2.goto('/signin');
  await page2.fill('input[type="email"]', 'user2@example.com');
  await page2.fill('input[type="password"]', 'password123');
  await page2.click('button[type="submit"]');
  await page2.waitForURL('/app');
  await page2.click('text=# general');
  
  // User 1: Send message
  await page.fill('textarea[placeholder="Type a message..."]', 'Hello from User 1!');
  await page.press('textarea', 'Enter');
  
  // User 2: Verify message received
  await expect(page2.locator('text=Hello from User 1!')).toBeVisible({ timeout: 1000 });
  
  // Verify latency <500ms
  const messageTimestamp = await page.locator('[data-message-id]:last-child').getAttribute('data-timestamp');
  const receiveTime = Date.now();
  const latency = receiveTime - parseInt(messageTimestamp!);
  expect(latency).toBeLessThan(500);
});
```

---

## 9. Security Best Practices

### 9.1 Environment Variables

**Never Commit Secrets:**
```bash
# .gitignore
.env.local
.env.production.local
firebase-config.json
serviceAccountKey.json
```

**Template for Setup:**
```bash
# .env.example
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Server-side only (no NEXT_PUBLIC_ prefix)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# Optional: Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 9.2 Input Validation

**Client-Side Validation:**
```typescript
// lib/utils/validation.ts
export function validateChannelName(name: string): { valid: boolean; error?: string } {
  if (name.length < 1 || name.length > 50) {
    return { valid: false, error: 'Channel name must be 1-50 characters' };
  }
  
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: 'Channel name must be lowercase letters, numbers, and hyphens only' };
  }
  
  return { valid: true };
}

export function validateMessageText(text: string): { valid: boolean; error?: string } {
  if (text.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (text.length > 4000) {
    return { valid: false, error: 'Message too long (max 4000 characters)' };
  }
  
  return { valid: true };
}
```

**Server-Side Validation (Firebase Rules):**
```javascript
// Firestore rules validate on write
match /messages/{messageId} {
  allow create: if request.resource.data.text is string &&
                  request.resource.data.text.size() > 0 &&
                  request.resource.data.text.size() <= 4000 &&
                  request.resource.data.userId == request.auth.uid;
}
```

### 9.3 XSS Prevention

**React Auto-Escaping:**
```typescript
// React automatically escapes text content
function MessageItem({ message }: { message: Message }) {
  // Safe: React escapes HTML entities
  return <p>{message.text}</p>;
  
  // Dangerous: Bypasses escaping (NEVER do this with user input)
  // return <p dangerouslySetInnerHTML={{ __html: message.text }} />;
}
```

**Sanitize User HTML (if rich text added in Phase 2):**
```typescript
import DOMPurify from 'isomorphic-dompurify';

function MessageWithHTML({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'a', 'code'],
    ALLOWED_ATTR: ['href']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 9.4 Rate Limiting

**Firestore Rate Limits (Built-in):**
- Realtime Database: 1000 simultaneous connections per database (ample for MVP)
- Firestore: 10,000 writes/second per database (far exceeds MVP needs)

**Custom Rate Limiting (Post-MVP):**
```typescript
// API route rate limiting (if using Next.js API routes)
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per minute per IP
  message: 'Too many requests, please try again later.'
});

export default async function handler(req: NextRequest) {
  await limiter(req);
  // Handle request
}
```

---

## 10. Monitoring & Observability

### 10.1 Performance Metrics

**Custom Metrics (Vercel Analytics + Sentry):**
```typescript
// lib/monitoring/metrics.ts
export function trackMessageLatency(sendTime: number, receiveTime: number) {
  const latency = receiveTime - sendTime;
  
  // Log to Sentry
  Sentry.metrics.distribution('message.delivery.latency', latency, {
    unit: 'millisecond',
    tags: { channel: 'general' }
  });
  
  // Alert if >500ms
  if (latency > 500) {
    Sentry.captureMessage(`Message latency exceeded threshold: ${latency}ms`, 'warning');
  }
}

export function trackChannelSwitch(startTime: number, endTime: number) {
  const duration = endTime - startTime;
  
  Sentry.metrics.distribution('channel.switch.duration', duration, {
    unit: 'millisecond'
  });
}
```

**Usage in Components:**
```typescript
async function sendMessage(text: string) {
  const sendTime = Date.now();
  
  await writeMessage(text);
  
  // Track when recipient receives (via RTDB listener callback)
  onMessageReceived((receiveTime) => {
    trackMessageLatency(sendTime, receiveTime);
  });
}
```

### 10.2 Error Tracking

**Sentry Integration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // Filter out expected errors
    if (event.exception?.values?.[0]?.type === 'NetworkError') {
      return null; // Don't report network errors (user offline)
    }
    return event;
  }
});
```

**Custom Error Boundaries:**
```typescript
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.captureException(error, {
      contexts: { react: errorInfo }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 10.3 Firebase Monitoring

**Firebase Performance Monitoring:**
```typescript
// lib/firebase/performance.ts
import { getPerformance, trace } from 'firebase/performance';

const perf = getPerformance(app);

export async function measureChannelLoad(channelId: string, fn: () => Promise<void>) {
  const t = trace(perf, 'channel_load');
  t.putAttribute('channel_id', channelId);
  t.start();
  
  try {
    await fn();
  } finally {
    t.stop();
  }
}

// Usage:
await measureChannelLoad(channelId, async () => {
  await loadMessages(channelId);
});
```

**Firebase Analytics (User Behavior):**
```typescript
import { logEvent } from 'firebase/analytics';

export function trackUserAction(action: string, params?: Record<string, any>) {
  logEvent(analytics, action, params);
}

// Usage:
trackUserAction('channel_created', { channelName: 'dev-team' });
trackUserAction('message_sent', { channelId: 'channel-123', length: text.length });
```

---

## 11. Scalability Considerations

### 11.1 Current Capacity (MVP)

**Firebase Limits:**
- Firestore: 1 million reads/day (free tier), 10,000 writes/second (paid)
- Realtime Database: 100 concurrent connections (free tier), unlimited (paid)
- Authentication: 10,000 monthly sign-ups (free tier)

**Estimated MVP Usage:**
- 100 workspaces × 8 users = 800 total users
- 20 messages/user/day = 16,000 messages/day
- 16,000 writes (Firestore) + 16,000 writes (RTDB) = 32,000 total writes/day
- **Verdict:** Well within free tier limits

### 11.2 Growth Scaling Path

**500 Workspaces (4,000 Users):**
- 80,000 messages/day
- Firestore: 160,000 writes/day (~$0.48/day = $14.40/month)
- Realtime Database: 4,000 concurrent connections (switch to paid plan: $1/GB storage)
- **Action:** Upgrade to Firebase Blaze plan (pay-as-you-go)

**5,000 Workspaces (40,000 Users):**
- 800,000 messages/day
- Firestore: 1.6M writes/day (~$4.80/day = $144/month)
- Realtime Database: 40,000 concurrent connections (consider sharding)
- **Action:** Implement RTDB sharding (split workspaces across multiple RTDB instances)

**50,000 Workspaces (400,000 Users):**
- 8M messages/day
- Firestore: 16M writes/day (~$480/day = $14,400/month)
- **Action:** Consider Firestore multi-region replication for latency, optimize writes (batch operations)

### 11.3 Database Sharding Strategy (Future)

**Problem:** Single RTDB instance has connection limits.

**Solution:** Shard workspaces across multiple RTDB instances.

```typescript
// lib/firebase/realtime-sharding.ts
const RTDB_INSTANCES = [
  'https://slacklite-1.firebaseio.com',
  'https://slacklite-2.firebaseio.com',
  'https://slacklite-3.firebaseio.com'
];

function getShardForWorkspace(workspaceId: string): string {
  const hash = hashCode(workspaceId);
  const index = hash % RTDB_INSTANCES.length;
  return RTDB_INSTANCES[index];
}

export function getRTDBForWorkspace(workspaceId: string) {
  const url = getShardForWorkspace(workspaceId);
  return getDatabase(app, url);
}

// Usage:
const rtdb = getRTDBForWorkspace(currentWorkspaceId);
const messagesRef = ref(rtdb, `messages/${currentWorkspaceId}/${channelId}`);
```

---

## 12. Future Enhancements (Post-MVP)

### 12.1 Phase 2: Enhanced Features

**Message Editing & Deletion:**
- Add `editedAt` timestamp to message schema
- Security rule: Only author can edit/delete within 5 minutes
- UI: Show "Edited" indicator on modified messages

**Search Functionality:**
- Integrate Algolia or Meilisearch for full-text search
- Index messages on write (Cloud Function trigger)
- Search API: `/api/search?q=query&channelId=channel-123`

**Desktop Notifications:**
- Browser Notification API for new messages
- Request permission on first visit
- Only notify if channel not active (avoid spam)

**Rich Text Formatting:**
- Markdown support (bold, italic, code blocks, links)
- Library: `react-markdown` for rendering
- Security: Sanitize HTML with DOMPurify

### 12.2 Phase 3: Enterprise Features

**Multi-Workspace Support:**
- User can join multiple workspaces
- Workspace switcher in sidebar
- Schema change: `users.workspaceIds: string[]` (array)

**Admin Dashboard:**
- View workspace analytics (message counts, active users)
- Manage users (remove, change roles)
- Export workspace data (JSON)

**Workspace Invitations System:**
- Generate invite links with expiration
- Email invitations via SendGrid or Resend
- Track invite acceptance rates

**Custom Integrations (Minimal):**
- Webhook incoming messages (POST to channel)
- GitHub/GitLab commit notifications
- Simple bot framework (respond to keywords)

---

## 13. Auto-Announce Summary

✅ **Architecture complete — SlackLite**

**Tech Stack:**
- Frontend: Next.js 15 + React 19 + TypeScript 5.7 + Tailwind CSS 3.4
- Backend: Firebase (Firestore + Realtime Database + Auth)
- Hosting: Vercel (automatic deployments, edge network)

**Data Models:** 8 collections (workspaces, users, channels, messages, directMessages, unreadCounts, presence, typing)

**API Endpoints:** Firebase SDK (no custom REST API in MVP)

**File Structure:** Next.js 14+ App Router with route groups, server/client components, modular hooks

**Security:** Firestore/RTDB security rules enforce workspace-scoped access, Firebase Auth for sessions, input validation client + server

**Performance Optimizations:** Message virtualization (react-window), optimistic UI, debounced typing indicators, Firestore cursor pagination, indexed queries

**CLI-First Setup:** Complete automation via Firebase CLI + npm scripts — zero browser console steps

**Ready for:** Epic/Story creation (John - Project Lead)

---

**Next Steps:**
1. John (Project Lead): Create epics and stories from this architecture
2. Amelia (Developer): Implement stories using this architecture as blueprint
3. Sally (UX Designer): Collaborate on component implementation with design system

**Architecture Owner:** Winston (BMAD Architect)  
**Contact:** Available for architecture clarifications via project channel
