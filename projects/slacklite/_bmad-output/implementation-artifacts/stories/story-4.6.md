# Story 4.6: Fetch Message History from Firestore

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Load last 50 messages from Firestore when user switches to a channel. Display in chronological order (oldest first) with proper loading states and error handling.

**Acceptance Criteria:**
- [x] ✅ Query: `query(collection(db, '...messages'), orderBy('timestamp', 'desc'), limit(50))`
- [x] ✅ Execute on channel switch (useEffect with channelId dependency)
- [x] ✅ Reverse results: Display oldest-first (bottom = newest)
- [x] ✅ Loading state: Show spinner in center of message view while fetching
- [x] ✅ Empty state: If no messages, show "No messages yet. Start the conversation!"
- [x] ✅ Scroll to bottom after load (most recent message visible)
- [x] ✅ Cache query results (Firestore SDK caches automatically)
- [x] ✅ Perceived load time <300ms

**Dependencies:**
dependsOn: ["4.1", "3.3"]

**Technical Notes:**
- Fetch message history from Firestore:
  ```typescript
  import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
  import { firestore } from '@/lib/firebase/client';

  export function useMessages(channelId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    useEffect(() => {
      if (!user?.workspaceId || !channelId) return;

      setLoading(true);
      setMessages([]);
      setSeenMessageIds(new Set()); // Clear seen IDs on channel switch

      // Firestore query for message history
      const messagesRef = collection(
        firestore,
        `workspaces/${user.workspaceId}/channels/${channelId}/messages`
      );
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

      const unsubscribeFirestore = onSnapshot(q,
        (snapshot) => {
          const firestoreMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              messageId: doc.id,
              ...data,
            } as Message;
          });

          // Reverse for chronological order (oldest first)
          const sortedMessages = firestoreMessages.reverse();

          // Add all to seen set
          const newSeenIds = new Set<string>();
          sortedMessages.forEach(m => newSeenIds.add(m.messageId));
          setSeenMessageIds(newSeenIds);

          setMessages(sortedMessages);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      // Cleanup
      return () => {
        unsubscribeFirestore();
      };
    }, [channelId, user?.workspaceId]);

    return { messages, loading, error };
  }
  ```
- Loading state UI:
  ```tsx
  {loading && (
    <div className="flex items-center justify-center h-full">
      <Spinner size="large" />
    </div>
  )}
  ```
- Empty state UI:
  ```tsx
  {!loading && messages.length === 0 && (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-gray-600 text-lg">No messages yet</div>
      <div className="text-gray-500 text-sm mt-2">Start the conversation!</div>
    </div>
  )}
  ```
- Error state UI:
  ```tsx
  {error && (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-error text-lg">Failed to load messages</div>
      <Button variant="secondary" onClick={retryLoad}>Try Again</Button>
    </div>
  )}
  ```
- Scroll to bottom after load:
  ```tsx
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    }
  }, [loading, messages]);
  ```
- Firestore query optimization:
  - Index: `timestamp` DESC
  - Limit: 50 messages (pagination in Story 7.1)
  - Caching: Automatic (Firestore SDK)

**Estimated Effort:** 2 hours
