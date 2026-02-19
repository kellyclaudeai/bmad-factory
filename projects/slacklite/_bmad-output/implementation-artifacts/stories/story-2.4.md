# Story 2.4: Build Sign In Form with Firebase Auth

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create sign-in page with email/password authentication using Firebase Auth. Redirect authenticated users to `/app` with persistent session management.

**Acceptance Criteria:**
- [x] Create `app/(auth)/signin/page.tsx` (Client Component)
- [x] Form fields: Email, Password
- [x] Submit calls: `signInWithEmailAndPassword(auth, email, password)`
- [x] On success: Redirect to `/app` (last viewed channel or #general)
- [x] Handle errors: Invalid credentials → show error "Invalid email or password"
- [x] Loading state: Disable form during authentication
- [x] Link to Sign Up: "Don't have an account? Sign Up"
- [x] Session persists across browser restarts (browserLocalPersistence)
- [x] Authenticated users auto-redirected from `/signin` to `/app`

**Dependencies:**
dependsOn: ["1.4", "1.6"]

**Technical Notes:**
- URL: `/signin`
- Firebase Auth integration:
  ```typescript
  import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
  import { useRouter } from 'next/navigation';

  async function handleSignIn(email: string, password: string) {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    router.push('/app');
  }
  ```
- Error handling:
  - `auth/user-not-found`: "Invalid email or password"
  - `auth/wrong-password`: "Invalid email or password"
  - `auth/invalid-email`: "Invalid email address"
  - Don't reveal whether email or password is wrong (security)
- Check if already authenticated (useEffect):
  ```typescript
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/app');
      }
    });
    return unsubscribe;
  }, []);
  ```
- Layout: Same as Sign Up page (centered card, 400px max-width)

**Estimated Effort:** 2 hours
