# Story 3.7: Implement Channel Rename Functionality

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Allow channel creator or workspace owner to rename channels. Show rename modal with validation, update Firestore, and reflect changes in sidebar with real-time updates.

**Acceptance Criteria:**
- [x] Add "Rename Channel" option (accessible from channel context menu or header)
- [x] Only visible to: Channel creator (`createdBy`) or workspace owner
- [x] Rename modal: Similar to Create Channel modal, pre-filled with current name
- [x] Validation: Same as create (lowercase, hyphens, 1-50 chars, unique)
- [x] Update Firestore: `updateDoc(channelRef, { name: newName })`
- [x] Sidebar updates immediately (real-time listener)
- [x] Message view header updates (show new name)
- [x] Cannot rename #general (validation check)

**Dependencies:**
dependsOn: ["3.2", "3.5"]

**Technical Notes:**
- Rename channel function:
  ```typescript
  import { doc, updateDoc, query, where, getDocs } from 'firebase/firestore';

  async function renameChannel(channelId: string, newName: string) {
    const { user } = useAuth();

    // Validate: Cannot rename #general
    if (currentChannel.name === 'general') {
      throw new Error('Cannot rename #general channel');
    }

    // Check for duplicate names
    const channelsRef = collection(firestore, `workspaces/${user.workspaceId}/channels`);
    const duplicateQuery = query(channelsRef, where('name', '==', newName));
    const duplicates = await getDocs(duplicateQuery);

    if (!duplicates.empty) {
      throw new Error('Channel name already exists');
    }

    // Update channel name
    const channelRef = doc(firestore, `workspaces/${user.workspaceId}/channels/${channelId}`);
    await updateDoc(channelRef, { name: newName });
  }
  ```
- RenameChannelModal component (similar to CreateChannelModal):
  ```tsx
  export default function RenameChannelModal({ channel, isOpen, onClose }) {
    const [name, setName] = useState(channel.name);
    // Same validation as CreateChannelModal
    // Pre-fill with current name
    // Submit calls renameChannel(channel.channelId, name)
  }
  ```
- Context menu in channel header (click ⚙️ icon):
  - Show menu with "Rename Channel", "Delete Channel" options
  - Only show if user is channel creator or workspace owner
- Validation (same as Story 3.4):
  - Lowercase, hyphens, 1-50 chars
  - No duplicate names

**Estimated Effort:** 2 hours
