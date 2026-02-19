# Story 1.4: Initialize Firebase SDK in Next.js

**Epic:** Epic 1 - Foundation

**Description:**
Create Firebase client configuration in Next.js project, initialize Auth, Firestore, and Realtime Database SDKs with TypeScript types. Connect to emulators in development mode.

**Acceptance Criteria:**
- [x] Install Firebase SDK: `pnpm add firebase@11`
- [x] Create `lib/firebase/client.ts` with Firebase app initialization
- [x] Environment variables loaded from `.env.local` (NEXT_PUBLIC_FIREBASE_*)
- [x] Export initialized `auth`, `firestore`, `rtdb` instances
- [x] Connect to emulators in development mode (connectAuthEmulator, connectFirestoreEmulator, connectDatabaseEmulator)
- [x] TypeScript types imported from Firebase SDK (@firebase/auth, @firebase/firestore, @firebase/database)
- [x] Test: Call `getAuth()` in a test component → no errors, auth instance created

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

---

## Implementation Summary

**Status:** ✅ COMPLETE  
**Completed:** 2026-02-19 10:50 CST  
**Developer:** Amelia  
**Commit:** ee323ba

### What Was Implemented

1. **Firebase SDK Installation:**
   - Installed `firebase@11` via pnpm
   - Added explicit dependencies: `@firebase/auth`, `@firebase/firestore`, `@firebase/database`
   - Updated `package.json` and `pnpm-lock.yaml`

2. **Firebase Client Configuration:**
   - Created `lib/firebase/client.ts` with:
     - Firebase app initialization using `initializeApp()`
     - Environment variable configuration (NEXT_PUBLIC_FIREBASE_* pattern)
     - Exported `auth`, `firestore`, `rtdb` instances
     - Development mode emulator connection:
       - Auth emulator: http://localhost:9099
       - Firestore emulator: localhost:8080
       - Database emulator: localhost:9000

3. **TypeScript Type Definitions:**
   - Created `lib/types/models.ts` with Firebase SDK type imports
   - Defined `FirebaseClientInstances` interface
   - Imported types from `@firebase/auth`, `@firebase/firestore`, `@firebase/database`

4. **Environment Configuration:**
   - Created `.env.local.example` with all required variables:
     - NEXT_PUBLIC_FIREBASE_API_KEY
     - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     - NEXT_PUBLIC_FIREBASE_PROJECT_ID
     - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     - NEXT_PUBLIC_FIREBASE_APP_ID
     - NEXT_PUBLIC_FIREBASE_DATABASE_URL

5. **Build Verification:**
   - Ran `pnpm build` successfully
   - No TypeScript errors
   - No build errors
   - All Firebase imports resolved correctly

### Files Created

- `lib/firebase/client.ts` - Firebase SDK initialization
- `lib/types/models.ts` - TypeScript type definitions
- `.env.local.example` - Environment variable template

### Files Modified

- `package.json` - Added Firebase dependencies
- `pnpm-lock.yaml` - Updated lockfile

### Testing

✅ **Build Test:** `pnpm build` completed successfully with no errors  
✅ **Type Check:** TypeScript compilation passed  
✅ **Import Resolution:** All Firebase SDK imports resolved correctly  
✅ **Emulator Configuration:** Development mode connection logic implemented

### Next Steps

- Story 1.3: Set up Firebase Emulator Suite (ready to start)
- Story 1.5: Vercel deployment (already complete)
- Story 2.5: Create Auth Context Provider (can now import from `lib/firebase/client.ts`)
