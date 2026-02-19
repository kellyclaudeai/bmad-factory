# Story 10.3: Write Integration Tests for Firebase Rules

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Write integration tests for Firestore and RTDB security rules using Firebase Emulator with comprehensive coverage of all security scenarios.

**Acceptance Criteria:**
- [ ] Test Firestore security rules (Story 9.1 tests expanded):
  - [ ] Workspace isolation tests
  - [ ] Channel access control tests
  - [ ] Message write permissions tests
  - [ ] User data access tests
- [ ] Test RTDB security rules (Story 9.2 tests expanded):
  - [ ] Message delivery permissions
  - [ ] Workspace isolation in RTDB
  - [ ] Message structure validation
- [ ] All security rules tested with emulator
- [ ] Tests run in CI/CD pipeline
- [ ] 100% coverage of security rules

**Dependencies:**
dependsOn: ["10.1", "9.1", "9.2"]

**Technical Notes:**
- Integration test suite (tests/integration/firebase-rules.spec.ts):
  ```typescript
  import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
  import { readFileSync } from 'fs';

  describe('Firebase Security Rules Integration', () => {
    let testEnv;

    beforeAll(async () => {
      testEnv = await initializeTestEnvironment({
        projectId: 'slacklite-test',
        firestore: {
          rules: readFileSync('firestore.rules', 'utf8'),
        },
        database: {
          rules: readFileSync('database.rules.json', 'utf8'),
        },
      });
    });

    afterAll(async () => {
      await testEnv.cleanup();
    });

    describe('Workspace Isolation', () => {
      it('prevents cross-workspace channel access', async () => {
        // User 1 in workspace A
        const db1 = testEnv.authenticatedContext('user1', { workspaceId: 'workspaceA' }).firestore();
        
        // Attempt to access workspace B's channels
        await assertFails(
          db1.collection('workspaces/workspaceB/channels').get()
        );
      });

      it('allows workspace member to access their channels', async () => {
        const db = testEnv.authenticatedContext('user1', { workspaceId: 'workspaceA' }).firestore();
        
        await assertSucceeds(
          db.collection('workspaces/workspaceA/channels').get()
        );
      });
    });

    describe('Message Permissions', () => {
      it('allows workspace member to write messages', async () => {
        const db = testEnv.authenticatedContext('user1', { workspaceId: 'workspaceA' }).firestore();
        
        await assertSucceeds(
          db.collection('workspaces/workspaceA/channels/channel1/messages').add({
            userId: 'user1',
            userName: 'User One',
            text: 'Test message',
            workspaceId: 'workspaceA',
            channelId: 'channel1',
            timestamp: new Date(),
          })
        );
      });

      it('prevents non-member from writing messages', async () => {
        const db = testEnv.authenticatedContext('user2', { workspaceId: 'workspaceB' }).firestore();
        
        await assertFails(
          db.collection('workspaces/workspaceA/channels/channel1/messages').add({
            userId: 'user2',
            userName: 'User Two',
            text: 'Test message',
          })
        );
      });
    });

    describe('RTDB Message Delivery', () => {
      it('allows workspace member to write to RTDB', async () => {
        const db = testEnv.authenticatedContext('user1', { workspaceId: 'workspaceA' }).database();
        
        await assertSucceeds(
          db.ref('messages/workspaceA/channel1/msg1').set({
            userId: 'user1',
            userName: 'User One',
            text: 'Test',
            timestamp: Date.now(),
          })
        );
      });
    });
  });
  ```
- Run with Firebase Emulator:
  ```bash
  firebase emulators:exec --only firestore,database "npm test -- tests/integration"
  ```

**Estimated Effort:** 2 hours
