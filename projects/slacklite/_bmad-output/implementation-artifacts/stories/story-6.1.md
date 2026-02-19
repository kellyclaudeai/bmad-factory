# Story 6.1: Implement Firebase Presence System

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Use Firebase RTDB `.info/connected` to track online/offline status. Update user presence in RTDB, sync to Firestore for persistence with automatic disconnect handling.

**Acceptance Criteria:**
- [x] Create `lib/hooks/usePresence.ts`
- [x] On auth: Subscribe to `ref(rtdb, '.info/connected')`
- [x] If connected: Write to `/presence/{userId}`:
  - [x] online: true
  - [x] lastSeen: serverTimestamp()
- [x] Set onDisconnect hook: Automatically set `online: false` when user disconnects
- [x] Update Firestore `/users/{userId}`: Sync `isOnline` field for persistence
- [x] Create TypeScript types for presence data
- [x] Add hook for subscribing to presence updates for other users
- [x] Add connection state monitoring
- [x] Test: Open app → online indicator appears, close tab → offline after disconnect

**Dependencies:**
dependsOn: ["1.4"]

**Technical Notes:**
- usePresence hook (lib/hooks/usePresence.ts):
  ```typescript
  import { ref, onValue, set, onDisconnect, serverTimestamp as rtdbTimestamp } from 'firebase/database';
  import { doc, updateDoc } from 'firebase/firestore';
  import { rtdb, firestore } from '@/lib/firebase/client';

  export function usePresence() {
    const { user } = useAuth();

    useEffect(() => {
      if (!user) return;

      const connectedRef = ref(rtdb, '.info/connected');
      const userPresenceRef = ref(rtdb, `presence/${user.uid}`);

      const unsubscribe = onValue(connectedRef, async (snapshot) => {
        if (snapshot.val() === true) {
          // User is connected
          await set(userPresenceRef, {
            online: true,
            lastSeen: rtdbTimestamp(),
          });

          // Set onDisconnect hook (auto-set offline when disconnected)
          onDisconnect(userPresenceRef).set({
            online: false,
            lastSeen: rtdbTimestamp(),
          });

          // Sync to Firestore
          await updateDoc(doc(firestore, 'users', user.uid), {
            isOnline: true,
            lastSeenAt: new Date(),
          });
        }
      });

      return unsubscribe;
    }, [user]);
  }
  ```
- Call in app layout (app/app/layout.tsx):
  ```tsx
  export default function AppLayout({ children }) {
    usePresence(); // Initialize presence tracking
    return <div>{children}</div>;
  }
  ```
- Firestore sync on disconnect (Cloud Function - Phase 2):
  - RTDB trigger → Update Firestore isOnline field
  - For MVP: Client-side sync is acceptable

**Estimated Effort:** 2 hours
