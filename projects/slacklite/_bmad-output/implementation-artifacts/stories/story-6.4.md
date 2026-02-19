# Story 6.4: Implement Unread Message Counts

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Track unread messages per channel/DM with client-side increment strategy. Display badge in sidebar, clear count when user views channel with real-time updates.

**Acceptance Criteria:**
- [ ] **Data Structure:** Create `/unreadCounts/{userId}_{targetId}` collection:
  - [ ] userId, targetId (channelId or dmId), targetType ('channel' | 'dm')
  - [ ] count: number
  - [ ] lastReadAt: Timestamp
  - [ ] updatedAt: Timestamp
- [ ] **Increment Strategy (Client-Side):**
  - [ ] Each user's client subscribes to RTDB `/messages/{workspaceId}/{channelId}` for ALL channels they're a member of
  - [ ] On `child_added` event (new message received):
    - [ ] Check: Is this channel/DM the currently active view? (`channelId !== currentChannelId`)
    - [ ] If NOT current channel: Increment unread count in Firestore
    - [ ] Call: `updateDoc(unreadCountRef, { count: increment(1), updatedAt: serverTimestamp() })`
  - [ ] If IS current channel: Do NOT increment (user is viewing it)
- [ ] **Clear Strategy:**
  - [ ] On channel/DM switch: Write `updateDoc(unreadCountRef, { count: 0, lastReadAt: serverTimestamp() })`
  - [ ] Clear happens when channel becomes active (not on every message view)
- [ ] **Security:**
  - [ ] Firestore security rules: User can only read/write their own unread counts
  - [ ] Rule: `allow read, write: if request.auth.uid == resource.data.userId;`
- [ ] **Display:**
  - [ ] Badge: Right-aligned in channel/DM list item, Primary Brand background, white text
  - [ ] Badge shows number (e.g., "[3]"), hidden if count = 0
  - [ ] Real-time updates: Subscribe to `/unreadCounts/{userId}_*` for current user

**Dependencies:**
dependsOn: ["4.5", "3.2", "5.3"]

**Technical Notes:**
- Unread count tracking:
  ```typescript
  import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

  export function useUnreadCounts() {
    const { user } = useAuth();
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const currentChannelId = useCurrentChannelId(); // From URL

    // Subscribe to RTDB for ALL channels (detect new messages)
    useEffect(() => {
      if (!user?.workspaceId) return;

      const channels = getAllChannels(); // From useChannels hook

      channels.forEach(channel => {
        const rtdbRef = ref(rtdb, `messages/${user.workspaceId}/${channel.channelId}`);

        onChildAdded(rtdbRef, async (snapshot) => {
          const message = snapshot.val();

          // Skip if user sent the message
          if (message.userId === user.uid) return;

          // Skip if currently viewing this channel
          if (channel.channelId === currentChannelId) return;

          // Increment unread count
          const unreadCountRef = doc(
            firestore,
            `unreadCounts/${user.uid}_${channel.channelId}`
          );

          await updateDoc(unreadCountRef, {
            count: increment(1),
            updatedAt: serverTimestamp(),
          });
        });
      });
    }, [user?.workspaceId, currentChannelId]);

    // Subscribe to unread counts for current user
    useEffect(() => {
      if (!user) return;

      const q = query(
        collection(firestore, 'unreadCounts'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const counts = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          counts[data.targetId] = data.count;
        });
        setUnreadCounts(counts);
      });

      return unsubscribe;
    }, [user]);

    return { unreadCounts };
  }
  ```
- Clear unread count on channel switch:
  ```typescript
  useEffect(() => {
    if (!currentChannelId || !user) return;

    const unreadCountRef = doc(
      firestore,
      `unreadCounts/${user.uid}_${currentChannelId}`
    );

    updateDoc(unreadCountRef, {
      count: 0,
      lastReadAt: serverTimestamp(),
    });
  }, [currentChannelId, user]);
  ```
- Badge display in ChannelList:
  ```tsx
  <Link href={`/app/channels/${channel.channelId}`} className="flex items-center justify-between">
    <span># {channel.name}</span>
    {unreadCounts[channel.channelId] > 0 && (
      <span className="bg-primary-brand text-white text-xs font-bold px-2 py-1 rounded-full">
        {unreadCounts[channel.channelId]}
      </span>
    )}
  </Link>
  ```

**Estimated Effort:** 3 hours
