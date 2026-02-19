# Story 3.2: Fetch and Display Channel List

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Query Firestore for all channels in current workspace, display in sidebar alphabetically sorted. Subscribe to real-time updates for channel additions, renames, and deletions.

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

**Dependencies:**
dependsOn: ["3.1", "1.4"]

**Technical Notes:**
- useChannels hook (lib/hooks/useChannels.ts):
  ```typescript
  import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
  import { firestore } from '@/lib/firebase/client';
  import { useAuth } from '@/lib/contexts/AuthContext';

  export function useChannels() {
    const { user } = useAuth();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      if (!user?.workspaceId) return;

      const q = query(
        collection(firestore, `workspaces/${user.workspaceId}/channels`),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const channelData = snapshot.docs.map(doc => ({
            channelId: doc.id,
            ...doc.data()
          })) as Channel[];
          setChannels(channelData);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    }, [user?.workspaceId]);

    return { channels, loading, error };
  }
  ```
- ChannelList component (components/features/channels/ChannelList.tsx):
  ```tsx
  export default function ChannelList() {
    const { channels, loading, error } = useChannels();

    if (loading) return <div className="p-4"><Spinner /></div>;
    if (error) return <div className="p-4 text-error">Failed to load channels</div>;
    if (channels.length === 0) {
      return <div className="p-4 text-gray-700">No channels yet. Create one to get started.</div>;
    }

    return (
      <ul className="space-y-1">
        {channels.map(channel => (
          <li key={channel.channelId}>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-200">
              # {channel.name}
            </button>
          </li>
        ))}
      </ul>
    );
  }
  ```
- Channel data model (lib/types/models.ts):
  ```typescript
  interface Channel {
    channelId: string;
    workspaceId: string;
    name: string;
    createdBy: string;
    createdAt: Timestamp;
  }
  ```

**Estimated Effort:** 2 hours
