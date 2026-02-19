# Story 3.10: Implement Workspace Invite System

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Generate unique invite links per workspace, handle invite acceptance flow (sign up/in → join workspace), and store invite tokens in Firestore for validation. Email sending deferred to Phase 2.

**Acceptance Criteria:**
- [ ] Generate invite link: `/invite/{workspaceId}/{token}` (token = unique random string)
- [ ] Store invites in Firestore `/workspaceInvites/{inviteId}`:
  - [ ] inviteId: auto-generated
  - [ ] workspaceId: target workspace
  - [ ] token: unique random string
  - [ ] createdBy: current user UID
  - [ ] expiresAt: 7 days from now (or unlimited for MVP simplicity)
- [ ] Invite link page: `/invite/[workspaceId]/[token]/page.tsx`
  - [ ] Show workspace name: "You've been invited to join {workspaceName}"
  - [ ] CTAs: "Sign Up" (if not authenticated) or "Join Workspace" (if authenticated)
- [ ] Join flow: Update user document `workspaceId` = invited workspace ID
- [ ] Redirect to `/app` after joining
- [ ] Email invites: Optional (use Firebase Extensions or Cloud Functions post-MVP)

**Dependencies:**
dependsOn: ["3.9", "1.4"]

**Technical Notes:**
- Generate invite token:
  ```typescript
  import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { randomBytes } from 'crypto';

  async function generateInviteLink(workspaceId: string, userId: string) {
    const token = randomBytes(16).toString('hex'); // 32-char hex string
    
    const inviteRef = doc(collection(firestore, 'workspaceInvites'));
    await setDoc(inviteRef, {
      inviteId: inviteRef.id,
      workspaceId,
      token,
      createdBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: serverTimestamp(),
    });

    return `https://slacklite.app/invite/${workspaceId}/${token}`;
  }
  ```
- Invite acceptance page (app/invite/[workspaceId]/[token]/page.tsx):
  ```tsx
  export default async function InvitePage({ params }) {
    const { workspaceId, token } = params;

    // Verify token exists and is valid
    const inviteQuery = query(
      collection(firestore, 'workspaceInvites'),
      where('workspaceId', '==', workspaceId),
      where('token', '==', token)
    );
    const inviteSnapshot = await getDocs(inviteQuery);

    if (inviteSnapshot.empty) {
      return <div>Invalid or expired invite link.</div>;
    }

    // Fetch workspace name
    const workspaceDoc = await getDoc(doc(firestore, 'workspaces', workspaceId));
    const workspaceName = workspaceDoc.data()?.name;

    return (
      <div className="text-center">
        <h2>You've been invited to join {workspaceName}</h2>
        {user ? (
          <Button onClick={() => joinWorkspace(workspaceId)}>Join Workspace</Button>
        ) : (
          <>
            <Button onClick={() => router.push('/signup')}>Sign Up</Button>
            <Button onClick={() => router.push('/signin')}>Sign In</Button>
          </>
        )}
      </div>
    );
  }
  ```
- Join workspace function:
  ```typescript
  async function joinWorkspace(workspaceId: string) {
    const { user } = useAuth();
    await updateDoc(doc(firestore, 'users', user.uid), {
      workspaceId,
    });
    router.push('/app');
  }
  ```
- Email invites (Phase 2): Firebase Extensions or Cloud Functions to send emails

**Estimated Effort:** 3 hours
