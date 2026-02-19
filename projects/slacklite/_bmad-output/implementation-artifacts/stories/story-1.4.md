# Story 1.4: Initialize Firebase SDK in Next.js

**Epic:** Epic 1 - Foundation

**Description:**
Create Firebase client configuration in Next.js project, initialize Auth, Firestore, and Realtime Database SDKs with TypeScript types. Connect to emulators in development mode.

**Acceptance Criteria:**
- [ ] Install Firebase SDK: `pnpm add firebase@11`
- [ ] Create `lib/firebase/client.ts` with Firebase app initialization
- [ ] Environment variables loaded from `.env.local` (NEXT_PUBLIC_FIREBASE_*)
- [ ] Export initialized `auth`, `firestore`, `rtdb` instances
- [ ] Connect to emulators in development mode (connectAuthEmulator, connectFirestoreEmulator, connectDatabaseEmulator)
- [ ] TypeScript types imported from Firebase SDK (@firebase/auth, @firebase/firestore, @firebase/database)
- [ ] Test: Call `getAuth()` in a test component → no errors, auth instance created

**Dependencies:**
dependsOn: ["1.2"]

**Technical Notes:**
- Firebase client initialization (lib/firebase/client.ts):
  ```typescript
  import { initializeApp } from 'firebase/app';
  import { getAuth, connectAuthEmulator } from 'firebase/auth';
  import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
  import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const firestore = getFirestore(app);
  export const rtdb = getDatabase(app);

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectDatabaseEmulator(rtdb, 'localhost', 9000);
  }
  ```
- Import Firebase types in lib/types/models.ts
- Test with simple component that calls getAuth()

**Estimated Effort:** 1 hour
