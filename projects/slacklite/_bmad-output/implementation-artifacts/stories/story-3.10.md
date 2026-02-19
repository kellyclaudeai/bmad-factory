# Story 3.10: Implement Workspace Invite System

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Generate unique invite links per workspace, handle invite acceptance flow (sign up/in → join workspace), and store invite tokens in Firestore for validation. Email sending deferred to Phase 2.

**Acceptance Criteria:**
- [x] Generate invite link: `/invite/{workspaceId}/{token}` (token = unique random string)
- [x] Store invites in Firestore `/workspaceInvites/{inviteId}`:
  - [x] inviteId: auto-generated
  - [x] workspaceId: target workspace
  - [x] token: unique random string
  - [x] createdBy: current user UID
  - [x] expiresAt: 7 days from now (or unlimited for MVP simplicity)
- [x] Invite link page: `/invite/[workspaceId]/[token]/page.tsx`
  - [x] Show workspace name: "You've been invited to join {workspaceName}"
  - [x] CTAs: "Sign Up" (if not authenticated) or "Join Workspace" (if authenticated)
- [x] Join flow: Update user document `workspaceId` = invited workspace ID
- [x] Redirect to `/app` after joining
- [x] Email invites: Optional (deferred to Phase 2 by story scope)

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
