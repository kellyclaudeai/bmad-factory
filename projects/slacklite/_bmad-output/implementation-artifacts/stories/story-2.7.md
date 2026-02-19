# Story 2.7: Build Workspace Creation Screen

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create workspace setup page shown after sign-up. User names their workspace and becomes owner. Automatically create default #general channel and redirect to main app.

**Acceptance Criteria:**
- [x] Create `app/(auth)/create-workspace/page.tsx` (Client Component)
- [x] Form: "What's the name of your team or project?" → Text input
- [x] Validation: 1-50 characters, required
- [x] Submit creates workspace in Firestore `/workspaces/{workspaceId}`:
  - [x] workspaceId: auto-generated
  - [x] name: user input
  - [x] ownerId: current user UID
  - [x] createdAt: serverTimestamp()
- [x] Update user document: Set `workspaceId` to new workspace ID
- [x] Create default #general channel in workspace
- [x] On success: Redirect to `/app` (lands in #general)
- [x] Only shown once (if user already has workspaceId, redirect to `/app`)

**Dependencies:**
dependsOn: ["2.3", "1.4"]

**Technical Notes:**
- URL: `/create-workspace`
- Workspace creation flow:
  ```typescript
  import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

  async function createWorkspace(name: string, userId: string) {
    // 1. Create workspace
    const workspaceRef = doc(collection(firestore, 'workspaces'));
    await setDoc(workspaceRef, {
      workspaceId: workspaceRef.id,
      name,
      ownerId: userId,
      createdAt: serverTimestamp(),
    });

    // 2. Update user with workspaceId
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
    });

    router.push('/app');
  }
  ```
- Validation:
  - Name length: 1-50 characters
  - No special characters required (any text allowed)
- Layout (from UX spec):
  - Centered card, 480px max-width
  - Title: "Create Your Workspace" (H3)
  - Input: Placeholder "e.g., Acme Inc"
  - Helper text: "e.g., 'Acme Inc', 'Dev Team', 'Friend Group'"
  - Button: "Create Workspace" (Primary, full-width)

**Estimated Effort:** 2 hours
