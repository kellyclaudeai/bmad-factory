# Story 4.4: Implement Dual-Write Message Persistence

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Implement coordinated dual-write pattern: Write messages to RTDB first (instant delivery), then Firestore (permanent storage). Handle errors appropriately for each write to maintain data consistency. **CRITICAL: This story merges Stories 4.4 and 4.5 as recommended in Gate Check response.**

**Acceptance Criteria:**
- [x] **Step 1: Write to Realtime Database (RTDB) first:**
  - [x] Path: `/messages/{workspaceId}/{channelId}/{messageId}`
  - [x] Generate messageId: `push(ref(...)).key` (auto-generated)
  - [x] Write data: `{ userId, userName, text, timestamp: Date.now(), ttl: Date.now() + 3600000 }`
  - [x] TTL: 1 hour expiry (RTDB auto-deletes after 1 hour)
  - [x] Use `set(ref(...), { ... })` for write
  - [x] **Error handling: If RTDB write fails → Abort entire operation**
    - [x] Show error banner: "Message failed to send. Retry?" (red banner with retry button)
    - [x] Do NOT proceed to Firestore write
    - [x] Return error to caller for optimistic UI rollback
- [x] **Step 2: Write to Firestore (after RTDB succeeds):**
  - [x] Path: `/workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}`
  - [x] Use SAME messageId from RTDB (consistency)
  - [x] Write data: `{ messageId, channelId, workspaceId, userId, userName, text, timestamp: serverTimestamp(), createdAt: serverTimestamp() }`
  - [x] Use `setDoc(doc(...), { ... })` for write (explicit ID)
  - [x] **Error handling: If Firestore write fails → Warning (message delivered but not persisted)**
    - [x] Show warning banner: "Message sent but not saved. It will disappear in 1 hour." (gray/yellow banner)
    - [x] Log error to Sentry for investigation
    - [x] Add retry mechanism: Store failed Firestore writes in local queue, retry in background
    - [x] Retry button: User can manually retry Firestore write with same messageId
- [x] **Return:** Promise<string> (messageId) on success, throw error on RTDB failure
- [x] **Testing:**
  - [x] Send message → Verify appears in RTDB console
  - [x] Verify same message appears in Firestore console with same messageId
  - [x] Simulate RTDB failure → Verify error banner, no Firestore write
  - [x] Simulate Firestore failure (after RTDB success) → Verify warning banner, message still delivered via RTDB
  - [x] Verify TTL: Message auto-deletes from RTDB after 1 hour

**Dependencies:**
dependsOn: ["4.1", "4.3"]

**Technical Notes:**
- **CRITICAL: Addresses Gate Check Concern 2.3.1 (dual-write pattern coordination)**
- Write order (RTDB first, then Firestore):
  ```typescript
  import { ref, push, set, serverTimestamp as rtdbTimestamp } from 'firebase/database';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { rtdb, firestore } from '@/lib/firebase/client';

  async function sendMessage(channelId: string, text: string): Promise<string> {
    const { user } = useAuth();

    try {
      // Step 1: Write to RTDB (instant delivery)
      const rtdbRef = ref(rtdb, `messages/${user.workspaceId}/${channelId}`);
      const newMessageRef = push(rtdbRef);
      const messageId = newMessageRef.key!;

      await set(newMessageRef, {
        userId: user.uid,
        userName: user.displayName,
        text,
        timestamp: Date.now(),
        ttl: Date.now() + 3600000, // 1 hour expiry
      });

      // Step 2: Write to Firestore (permanent storage)
      try {
        const firestoreRef = doc(
          firestore,
          `workspaces/${user.workspaceId}/channels/${channelId}/messages/${messageId}`
        );

        await setDoc(firestoreRef, {
          messageId,
          channelId,
          workspaceId: user.workspaceId,
          userId: user.uid,
          userName: user.displayName,
          text,
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        return messageId;
      } catch (firestoreError) {
        // Firestore write failed - message delivered but not persisted
        console.error('Firestore write failed:', firestoreError);
        
        // Show warning banner
        showWarning('Message sent but not saved. It will disappear in 1 hour.');
        
        // Add to retry queue
        addToRetryQueue({ messageId, channelId, text });
        
        return messageId;
      }
    } catch (rtdbError) {
      // RTDB write failed - abort entire operation
      console.error('RTDB write failed:', rtdbError);
      throw new Error('Message failed to send. Retry?');
    }
  }
  ```
- Error handling flow:
  - RTDB fails → Throw error, optimistic UI rollback (Story 4.3)
  - Firestore fails → Log warning, show banner, add to retry queue
- Retry mechanism:
  ```typescript
  const [retryQueue, setRetryQueue] = useState<{messageId: string, channelId: string, text: string}[]>([]);

  async function retryFirestoreWrite(messageId: string, channelId: string, text: string) {
    const { user } = useAuth();
    const firestoreRef = doc(firestore, `workspaces/${user.workspaceId}/channels/${channelId}/messages/${messageId}`);

    await setDoc(firestoreRef, {
      messageId,
      channelId,
      workspaceId: user.workspaceId,
      userId: user.uid,
      userName: user.displayName,
      text,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  ```
- Testing with Firebase Emulators:
  - Verify RTDB write in http://localhost:9000
  - Verify Firestore write in http://localhost:8080

**Estimated Effort:** 3 hours
