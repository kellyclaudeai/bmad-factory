# Story 5.3: Fetch and Display DM List

**Epic:** Epic 5 - Direct Messages (1-on-1)

**Description:**
Query all DMs for current user, display in sidebar under "Direct Messages" section with other user's name and real-time updates.

**Acceptance Criteria:**
- [x] Create `lib/hooks/useDirectMessages.ts`
- [x] Query: `query(collection(db, 'workspaces/{workspaceId}/directMessages'), where('userIds', 'array-contains', currentUserId))`
- [x] Real-time listener: `onSnapshot`
- [x] Sort: By lastMessageAt DESC (most recent first)
- [x] Resolve other user's name: For each DM, filter userIds to get other user, fetch their displayName
- [x] Render: Other user's name (no `#` prefix, unlike channels)
- [x] Active state: Highlight current DM with same styling as channels
- [x] Empty state: "No direct messages yet. Click a team member to start chatting."

**Dependencies:**
dependsOn: ["5.2", "1.4"]

**Technical Notes:**
- useDirectMessages hook:
  ```typescript
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

  export function useDirectMessages() {
    const { user } = useAuth();
    const [dms, setDms] = useState<DirectMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user?.workspaceId) return;

      const q = query(
        collection(firestore, `workspaces/${user.workspaceId}/directMessages`),
        where('userIds', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const dmData = await Promise.all(
          snapshot.docs.map(async (dmDoc) => {
            const data = dmDoc.data();
            
            // Get other user ID
            const otherUserId = data.userIds.find(id => id !== user.uid);
            
            // Fetch other user's name
            const otherUserDoc = await getDoc(doc(firestore, 'users', otherUserId));
            const otherUserName = otherUserDoc.data()?.displayName || 'Unknown';

            return {
              dmId: dmDoc.id,
              ...data,
              otherUserName,
            } as DirectMessage & { otherUserName: string };
          })
        );

        setDms(dmData);
        setLoading(false);
      });

      return unsubscribe;
    }, [user?.workspaceId]);

    return { dms, loading };
  }
  ```
- DMList component:
  ```tsx
  export default function DMList() {
    const { dms, loading } = useDirectMessages();
    const pathname = usePathname();

    if (loading) return <Spinner />;

    if (dms.length === 0) {
      return (
        <div className="p-4 text-gray-700 text-sm">
          No direct messages yet. Click a team member to start chatting.
        </div>
      );
    }

    return (
      <ul className="space-y-1">
        {dms.map(dm => {
          const isActive = pathname === `/app/dms/${dm.dmId}`;
          
          return (
            <li key={dm.dmId}>
              <Link
                href={`/app/dms/${dm.dmId}`}
                className={`
                  block w-full text-left px-3 py-2 rounded
                  ${isActive 
                    ? 'bg-gray-300 border-l-4 border-primary-brand font-semibold' 
                    : 'hover:bg-gray-200'
                  }
                `}
              >
                {dm.otherUserName}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  ```

**Estimated Effort:** 2 hours
