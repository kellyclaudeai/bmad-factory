# Story 7.1: Implement Cursor-Based Pagination

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Use Firestore `startAfter` queries to paginate message history. Load 50 messages at a time when user scrolls to top with proper cursor management.

**Acceptance Criteria:**
- [ ] Update `useMessages` hook: Add `loadMore()` function
- [ ] Track last visible document: `useState<DocumentSnapshot | null>(lastVisible)`
- [ ] Query: `query(..., orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(50))`
- [ ] On scroll to top: Call `loadMore()` → fetch next 50 messages
- [ ] Prepend to messages array (oldest messages at top)
- [ ] Maintain scroll position after load (don't jump)
- [ ] Disable loadMore if no more messages (`lastVisible === null` after query returns <50 results)
- [ ] Loading indicator at top of list while fetching

**Dependencies:**
dependsOn: ["4.6"]

**Technical Notes:**
- Cursor-based pagination in useMessages:
  ```typescript
  import { query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

  export function useMessages(channelId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMore = async () => {
      if (!hasMore || loadingMore || !lastVisible) return;

      setLoadingMore(true);

      const messagesRef = collection(
        firestore,
        `workspaces/${user.workspaceId}/channels/${channelId}/messages`
      );

      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible),
        limit(50)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty || snapshot.docs.length < 50) {
        setHasMore(false);
      }

      const newMessages = snapshot.docs.map(doc => ({
        messageId: doc.id,
        ...doc.data(),
      })) as Message[];

      // Prepend to existing messages (oldest first)
      setMessages(prev => [...newMessages.reverse(), ...prev]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoadingMore(false);
    };

    return { messages, loadMore, hasMore, loadingMore };
  }
  ```
- Maintain scroll position after load:
  ```tsx
  const messageListRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

  const handleLoadMore = async () => {
    if (!messageListRef.current) return;
    prevScrollHeight.current = messageListRef.current.scrollHeight;

    await loadMore();

    // Restore scroll position
    if (messageListRef.current) {
      const newScrollHeight = messageListRef.current.scrollHeight;
      messageListRef.current.scrollTop = newScrollHeight - prevScrollHeight.current;
    }
  };
  ```
- Loading indicator:
  ```tsx
  {loadingMore && (
    <div className="text-center py-2">
      <Spinner size="small" /> Loading older messages...
    </div>
  )}
  ```

**Estimated Effort:** 2-3 hours
