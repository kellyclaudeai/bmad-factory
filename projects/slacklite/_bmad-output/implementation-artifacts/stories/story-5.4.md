# Story 5.4: Build DM View (Reuse Channel Message UI)

**Epic:** Epic 5 - Direct Messages (1-on-1)

**Description:**
Create DM-specific page that reuses message list, input, and real-time updates from channel view. Only differences: Header shows user name instead of channel name.

**Acceptance Criteria:**
- [x] Create `app/app/dms/[dmId]/page.tsx`
- [x] Reuse: `MessageList`, `MessageInput` components from channels
- [x] Fetch DM data: `useDocument(doc(db, 'workspaces/{workspaceId}/directMessages/{dmId}'))`
- [x] Header: Show other user's name + online indicator (green/gray dot)
- [x] Messages subcollection: `/workspaces/{workspaceId}/directMessages/{dmId}/messages/{messageId}`
- [x] Same real-time updates: RTDB path = `/messages/{workspaceId}/dm-{dmId}/{messageId}`
- [x] Same send logic: Write to Firestore + RTDB (dual-write)
- [x] Empty state: "No messages yet. Say hello!"

**Dependencies:**
dependsOn: ["5.3", "4.7", "4.2"]

**Technical Notes:**
- DM page (app/app/dms/[dmId]/page.tsx):
  ```tsx
  import MessageList from '@/components/features/messages/MessageList';
  import MessageInput from '@/components/features/messages/MessageInput';
  import { useDocument } from '@/lib/hooks/useDocument';

  export default function DMPage({ params }: { params: { dmId: string } }) {
    const { dmId } = params;
    const { user } = useAuth();

    // Fetch DM data
    const { data: dm, loading } = useDocument(
      doc(firestore, `workspaces/${user.workspaceId}/directMessages/${dmId}`)
    );

    // Get other user
    const otherUserId = dm?.userIds.find(id => id !== user.uid);
    const { data: otherUser } = useDocument(
      doc(firestore, 'users', otherUserId)
    );

    if (loading) return <Spinner />;

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b-2 border-gray-300 p-4 flex items-center gap-2">
          <div className="relative">
            <Avatar user={otherUser} />
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${otherUser?.isOnline ? 'bg-success' : 'bg-gray-600'}`} />
          </div>
          <h2 className="text-xl font-semibold">{otherUser?.displayName}</h2>
        </div>

        {/* Message List (reuse from channels) */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            loading={messagesLoading}
            emptyText="No messages yet. Say hello!"
          />
        </div>

        {/* Message Input (reuse from channels) */}
        <MessageInput onSend={(text) => sendMessage(dmId, text)} />
      </div>
    );
  }
  ```
- Messages path (same as channels, just different parent):
  - Firestore: `/workspaces/{workspaceId}/directMessages/{dmId}/messages/{messageId}`
  - RTDB: `/messages/{workspaceId}/dm-{dmId}/{messageId}`
- Send message logic (reuse from Story 4.4):
  - Dual-write to RTDB + Firestore
  - Same message structure as channels

**Estimated Effort:** 2 hours
