# Story 1.3: Set Up Firebase Emulator Suite

**Epic:** Epic 1 - Foundation

**Description:**
Configure Firebase Emulator Suite for local development (Firestore, RTDB, Auth emulators) to enable offline testing without production Firebase calls. Seed test data for development workflow.

**Acceptance Criteria:**
- [ ] Run `firebase init emulators` to configure Auth, Firestore, Realtime Database, and Emulator UI
- [ ] `firebase.json` includes emulator ports: Auth (9099), Firestore (8080), RTDB (9000), UI (4000)
- [ ] Start emulators: `firebase emulators:start` → UI accessible at http://localhost:4000
- [ ] Firebase SDK client connects to emulators in development mode (check `NODE_ENV === 'development'`)
- [ ] Test data seeded in emulator (1 test workspace, 1 test user, 1 test channel)
- [ ] npm script added: `"emulators": "firebase emulators:start"`
- [ ] Documentation added to README: "Run `pnpm emulators` for local Firebase"

**Dependencies:**
dependsOn: ["1.2"]

**Technical Notes:**
- Emulator ports (firebase.json):
  ```json
  {
    "emulators": {
      "auth": { "port": 9099 },
      "firestore": { "port": 8080 },
      "database": { "port": 9000 },
      "ui": { "enabled": true, "port": 4000 }
    }
  }
  ```
- Connect SDK to emulators (lib/firebase/client.ts):
  ```typescript
  if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectDatabaseEmulator(rtdb, 'localhost', 9000);
  }
  ```
- Seed test data script (scripts/seed-emulator.ts):
  - Workspace: "Test Workspace"
  - User: test@example.com / password123
  - Channel: #general
  - Message: "Welcome to SlackLite!"

**Estimated Effort:** 1-2 hours
