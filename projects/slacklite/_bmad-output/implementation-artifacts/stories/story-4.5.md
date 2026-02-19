# Story 4.5: Subscribe to Real-Time Message Updates

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Listen to RTDB for new messages in current channel. Update UI instantly when other users send messages (<500ms latency) with proper deduplication and cleanup.

**Acceptance Criteria:**
- [ ] Subscribe to RTDB: `onChildAdded(ref(rtdb, 'messages/{workspaceId}/{channelId}'))`
- [ ] On new message: Add to local state (append to messages array)
- [ ] Deduplication: Check if message already exists (from Firestore) before adding
- [ ] Auto-scroll to bottom if user is already at bottom of list
- [ ] If user scrolled up: Show "New messages ↓" badge (don't auto-scroll)
- [ ] Cleanup: `off(rtdbRef, 'child_added')` when component unmounts or channel changes
- [ ] Measure latency: Log timestamp difference (send time vs receive time) → verify <500ms

**Dependencies:**
dependsOn: ["4.1", "1.4"]

**Technical Notes:**
- **CRITICAL: Implements deduplication strategy from architecture.md Section 3.1.1**
- Real-time message subscription:
  ```typescript
  import { ref, onChildAdded, off } from 'firebase/database';
  import { rtdb } from '@/lib/firebase/client';

  export function useMessages(channelId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();

    useEffect(() => {
      if (!user?.workspaceId || !channelId) return;

      const rtdbRef = ref(rtdb, `messages/${user.workspaceId}/${channelId}`);

      const handleNewMessage = (snapshot: DataSnapshot) => {
        const messageId = snapshot.key!;

        // Deduplication: Skip if already seen from Firestore
        if (seenMessageIds.has(messageId)) {
          return; // Already rendered
        }

        const rtdbData = snapshot.val();
        const message: Message = {
          messageId,
          channelId,
          workspaceId: user.workspaceId,
          userId: rtdbData.userId,
          userName: rtdbData.userName,
          text: rtdbData.text,
          timestamp: Timestamp.fromMillis(rtdbData.timestamp),
          createdAt: Timestamp.fromMillis(rtdbData.timestamp),
        };

        // Add to seen set
        setSeenMessageIds(prev => new Set(prev).add(messageId));

        // Add to UI
        setMessages(prev => [...prev, message]);

        // Measure latency
        const latency = Date.now() - rtdbData.timestamp;
        console.log(`Message delivery latency: ${latency}ms`);
      };

      // Subscribe to new messages
      onChildAdded(rtdbRef, handleNewMessage);

      // Cleanup on unmount or channel change
      return () => {
        off(rtdbRef, 'child_added', handleNewMessage);
      };
    }, [channelId, user?.workspaceId]);

    return { messages };
  }
  ```
- Deduplication logic (from architecture.md Section 3.1.1):
  - Maintain Set<messageId> for seen messages
  - RTDB listener skips messages already in seenMessageIds
  - Clear seenMessageIds when switching channels
- Auto-scroll logic:
  ```tsx
  const messageListRef = useRef<HTMLDivElement>(null);
  const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);

  useEffect(() => {
    if (!messageListRef.current) return;

    const isAtBottom = messageListRef.current.scrollHeight - messageListRef.current.scrollTop <= messageListRef.current.clientHeight + 100;

    if (isAtBottom) {
      messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    } else {
      setShowNewMessagesBadge(true);
    }
  }, [messages]);
  ```
- "New messages ↓" badge:
  - Positioned: bottom-right corner, 32px height, Primary Brand background
  - Click: Scroll to bottom, hide badge

**Estimated Effort:** 2-3 hours
