# Story 5.2: Implement Start DM Functionality

**Epic:** Epic 5 - Direct Messages (1-on-1)

**Description:**
Allow users to click a member name to start a DM. Create DM document if doesn't exist, navigate to DM view with proper duplicate checking.

**Acceptance Criteria:**
- [ ] Click member name → call `startDM(otherUserId)`
- [ ] Check if DM already exists: Query `/workspaces/{workspaceId}/directMessages` where `userIds` array contains both user IDs
- [ ] If exists: Navigate to `/app/dms/{dmId}`
- [ ] If doesn't exist: Create new DM document:
  - [ ] dmId: auto-generated
  - [ ] workspaceId: current workspace
  - [ ] userIds: [currentUserId, otherUserId] (sorted alphabetically for consistency)
  - [ ] createdAt: serverTimestamp()
  - [ ] lastMessageAt: null
- [ ] Navigate to `/app/dms/{dmId}` after creation
- [ ] Loading state: Show spinner during check/create

**Dependencies:**
dependsOn: ["5.1"]

**Technical Notes:**
- Start DM function:
  ```typescript
  import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

  async function startDM(otherUserId: string) {
    const { user } = useAuth();
    const router = useRouter();

    // Sort user IDs alphabetically for consistency
    const userIds = [user.uid, otherUserId].sort();

    // Check if DM already exists
    const dmRef = collection(firestore, `workspaces/${user.workspaceId}/directMessages`);
    const dmQuery = query(
      dmRef,
      where('userIds', '==', userIds)
    );
    const dmSnapshot = await getDocs(dmQuery);

    if (!dmSnapshot.empty) {
      // DM exists, navigate to it
      const dmId = dmSnapshot.docs[0].id;
      router.push(`/app/dms/${dmId}`);
      return;
    }

    // Create new DM
    const newDMRef = doc(dmRef);
    await setDoc(newDMRef, {
      dmId: newDMRef.id,
      workspaceId: user.workspaceId,
      userIds,
      createdAt: serverTimestamp(),
      lastMessageAt: null,
    });

    router.push(`/app/dms/${newDMRef.id}`);
  }
  ```
- MemberList click handler:
  ```tsx
  <li onClick={() => startDM(member.userId)}>
    {member.displayName}
  </li>
  ```
- Firestore index (firestore.indexes.json):
  ```json
  {
    "collectionGroup": "directMessages",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userIds", "arrayConfig": "CONTAINS" },
      { "fieldPath": "workspaceId", "order": "ASCENDING" }
    ]
  }
  ```

**Estimated Effort:** 2 hours
