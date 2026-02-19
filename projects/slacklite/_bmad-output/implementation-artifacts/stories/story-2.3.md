# Story 2.3: Implement Firebase Auth Sign Up

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Integrate Firebase Auth `createUserWithEmailAndPassword` to create user accounts. Create user document in Firestore after successful sign-up with proper data structure.

**Acceptance Criteria:**
- [ ] Sign Up form calls Firebase Auth: `createUserWithEmailAndPassword(auth, email, password)`
- [ ] On success: Create user document in Firestore `/users/{userId}`:
  - [ ] userId: Firebase Auth UID
  - [ ] email: user email
  - [ ] displayName: derived from email (before @)
  - [ ] workspaceId: null (set later)
  - [ ] createdAt: serverTimestamp()
  - [ ] lastSeenAt: serverTimestamp()
  - [ ] isOnline: false
- [ ] Handle errors: Email already exists → show error "Email already in use. Sign in instead?"
- [ ] On success: Redirect to `/create-workspace`
- [ ] Loading state: Show spinner in button during async operation
- [ ] Session persists: Use `setPersistence(auth, browserLocalPersistence)`

**Dependencies:**
dependsOn: ["2.2", "1.4"]

**Technical Notes:**
- Firebase Auth integration:
  ```typescript
  import { createUserWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, firestore } from '@/lib/firebase/client';

  async function handleSignUp(email: string, password: string) {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document
    await setDoc(doc(firestore, 'users', user.uid), {
      userId: user.uid,
      email: user.email,
      displayName: email.split('@')[0],
      workspaceId: null,
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      isOnline: false,
    });

    router.push('/create-workspace');
  }
  ```
- Error handling:
  - `auth/email-already-in-use`: "Email already in use. Sign in instead?"
  - `auth/weak-password`: "Password is too weak"
  - `auth/invalid-email`: "Invalid email address"
- User data model (lib/types/models.ts):
  ```typescript
  interface User {
    userId: string;
    email: string;
    displayName: string;
    workspaceId: string | null;
    createdAt: Timestamp;
    lastSeenAt: Timestamp;
    isOnline: boolean;
  }
  ```

**Estimated Effort:** 2-3 hours
