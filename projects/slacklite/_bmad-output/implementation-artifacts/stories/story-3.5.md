# Story 3.5: Implement Channel Creation in Firestore

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Connect Create Channel modal to Firestore. Write new channel document, update sidebar list via real-time listener, and auto-switch to new channel with duplicate name validation.

**Acceptance Criteria:**
- [ ] Submit creates document in `/workspaces/{workspaceId}/channels/{channelId}`:
  - [ ] channelId: auto-generated
  - [ ] workspaceId: current workspace
  - [ ] name: user input (lowercase, hyphens)
  - [ ] createdBy: current user UID
  - [ ] createdAt: serverTimestamp()
  - [ ] lastMessageAt: null
  - [ ] messageCount: 0
- [ ] Check for duplicate names: Query existing channels, show error if exists
- [ ] On success: Modal closes, new channel appears in sidebar (real-time listener picks it up)
- [ ] Auto-switch to new channel: Navigate to `/app/channels/{channelId}`
- [ ] Error handling: Show error banner if creation fails

**Dependencies:**
dependsOn: ["3.4", "1.4"]

**Technical Notes:**
- Channel creation function:
  ```typescript
  import { collection, doc, setDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
  import { useAuth } from '@/lib/contexts/AuthContext';
  import { useRouter } from 'next/navigation';

  async function createChannel(name: string) {
    const { user } = useAuth();
    const router = useRouter();

    if (!user?.workspaceId) throw new Error('No workspace');

    // Check for duplicate names
    const channelsRef = collection(firestore, `workspaces/${user.workspaceId}/channels`);
    const duplicateQuery = query(channelsRef, where('name', '==', name));
    const duplicates = await getDocs(duplicateQuery);

    if (!duplicates.empty) {
      throw new Error('Channel name already exists');
    }

    // Create channel
    const channelRef = doc(channelsRef);
    await setDoc(channelRef, {
      channelId: channelRef.id,
      workspaceId: user.workspaceId,
      name,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      lastMessageAt: null,
      messageCount: 0,
    });

    // Navigate to new channel
    router.push(`/app/channels/${channelRef.id}`);
  }
  ```
- Error handling in modal:
  ```tsx
  const handleCreate = async (name: string) => {
    try {
      await createChannel(name);
      onClose(); // Close modal on success
    } catch (error) {
      setError(error.message);
    }
  };
  ```
- Firestore index (firestore.indexes.json):
  ```json
  {
    "indexes": [
      {
        "collectionGroup": "channels",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "workspaceId", "order": "ASCENDING" },
          { "fieldPath": "name", "order": "ASCENDING" }
        ]
      }
    ]
  }
  ```

**Estimated Effort:** 2 hours
