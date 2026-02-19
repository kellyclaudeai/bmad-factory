# Story 3.6: Add Default #general Channel Creation

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Automatically create #general channel when workspace is created. Ensure every workspace has at least one channel on initialization with protection against deletion.

**Acceptance Criteria:**
- [ ] During workspace creation (Story 2.7), after workspace document created:
  - [ ] Create #general channel in `/workspaces/{workspaceId}/channels/`
  - [ ] Set name: "general", createdBy: workspace owner, createdAt: serverTimestamp()
- [ ] User lands in #general after workspace creation
- [ ] #general cannot be deleted (add validation in delete flow)
- [ ] If workspace has no channels (edge case), auto-create #general on first app load

**Dependencies:**
dependsOn: ["2.7", "3.5"]

**Technical Notes:**
- Update workspace creation (lib/utils/workspace.ts):
  ```typescript
  async function createWorkspace(name: string, userId: string) {
    // 1. Create workspace
    const workspaceRef = doc(collection(firestore, 'workspaces'));
    await setDoc(workspaceRef, {
      workspaceId: workspaceRef.id,
      name,
      ownerId: userId,
      createdAt: serverTimestamp(),
    });

    // 2. Update user
    await updateDoc(doc(firestore, 'users', userId), {
      workspaceId: workspaceRef.id,
    });

    // 3. Create #general channel
    const channelRef = doc(collection(firestore, `workspaces/${workspaceRef.id}/channels`));
    await setDoc(channelRef, {
      channelId: channelRef.id,
      workspaceId: workspaceRef.id,
      name: 'general',
      createdBy: userId,
      createdAt: serverTimestamp(),
      lastMessageAt: null,
      messageCount: 0,
    });

    // 4. Navigate to #general
    return channelRef.id;
  }
  ```
- Deletion protection (Story 3.8):
  ```typescript
  function canDeleteChannel(channel: Channel): boolean {
    if (channel.name === 'general') {
      throw new Error('Cannot delete #general channel');
    }
    return true;
  }
  ```
- Edge case handler (app/app/layout.tsx):
  ```typescript
  useEffect(() => {
    // If no channels exist, create #general
    if (channels.length === 0 && !loading) {
      createChannel('general');
    }
  }, [channels, loading]);
  ```

**Estimated Effort:** 1 hour
