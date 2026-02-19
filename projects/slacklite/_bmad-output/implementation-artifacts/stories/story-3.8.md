# Story 3.8: Implement Channel Deletion

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Allow channel creator or workspace owner to delete channels (except #general). Show confirmation dialog, remove from Firestore including all messages, and update sidebar with user redirect.

**Acceptance Criteria:**
- [x] Add "Delete Channel" option (accessible from context menu)
- [x] Only visible to: Channel creator or workspace owner
- [x] Confirmation modal: "Are you sure you want to delete #{channelName}? This cannot be undone."
- [x] Buttons: Cancel (Secondary), Delete (Destructive red button)
- [x] On confirm: Delete Firestore document: `deleteDoc(channelRef)`
- [x] Firestore cascade: Delete all messages in channel (subcollection deletion)
- [x] Sidebar updates (channel removed via real-time listener)
- [x] If user is in deleted channel: Redirect to #general
- [x] #general cannot be deleted (show error if attempted)

**Dependencies:**
dependsOn: ["3.2", "3.5"]

**Technical Notes:**
- Delete channel function:
  ```typescript
  import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

  async function deleteChannel(channelId: string) {
    const { user } = useAuth();
    const router = useRouter();

    const channelRef = doc(firestore, `workspaces/${user.workspaceId}/channels/${channelId}`);
    const channelDoc = await getDoc(channelRef);

    // Validate: Cannot delete #general
    if (channelDoc.data()?.name === 'general') {
      throw new Error('Cannot delete #general channel');
    }

    // Delete all messages in channel (subcollection)
    const messagesRef = collection(channelRef, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    
    const batch = writeBatch(firestore);
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete channel document
    await deleteDoc(channelRef);

    // Redirect to #general if user is in deleted channel
    if (currentChannelId === channelId) {
      const generalChannel = channels.find(c => c.name === 'general');
      router.push(`/app/channels/${generalChannel.channelId}`);
    }
  }
  ```
- Confirmation dialog (use Modal component):
  ```tsx
  <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
    <h3 className="text-xl font-semibold mb-4">Delete Channel</h3>
    <p className="mb-6">
      Are you sure you want to delete <strong>#{channel.name}</strong>? 
      This cannot be undone.
    </p>
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  </Modal>
  ```
- Error handling for #general:
  - Show error toast: "Cannot delete #general channel"

**Estimated Effort:** 2 hours
