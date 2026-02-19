# Story 2.6: Implement Sign Out Functionality

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Add sign-out button in app header/settings. Clear user session and redirect to landing page with confirmation dialog for destructive action.

**Acceptance Criteria:**
- [ ] Sign Out button in Settings modal or app header (Destructive button styling)
- [ ] Click triggers: `signOut(auth)`
- [ ] On success: Clear user state in AuthContext
- [ ] Redirect to landing page (`/`)
- [ ] Confirmation dialog: "Are you sure you want to sign out?" (Modal with Cancel/Sign Out buttons)
- [ ] Firebase listeners cleaned up (unsubscribe from Firestore/RTDB)
- [ ] Local state cleared (messages, channels, etc.)

**Dependencies:**
dependsOn: ["2.5"]

**Technical Notes:**
- Sign out implementation:
  ```typescript
  import { signOut as firebaseSignOut } from 'firebase/auth';
  import { auth } from '@/lib/firebase/client';

  async function handleSignOut() {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    await firebaseSignOut(auth);
    router.push('/');
  }
  ```
- Settings modal location: Click ⚙️ icon in top bar → Settings modal opens
- Confirmation dialog (use Modal component from 1.6):
  - Title: "Sign Out" (H3)
  - Message: "Are you sure you want to sign out?" (Body Regular)
  - Buttons: "Cancel" (Secondary), "Sign Out" (Destructive)
- Cleanup in AuthContext on sign out:
  - Unsubscribe from all Firebase listeners
  - Clear user state
  - Clear local storage (message drafts, etc.)
- Button styling: Error background (#E01E5A), white text

**Estimated Effort:** 1 hour
