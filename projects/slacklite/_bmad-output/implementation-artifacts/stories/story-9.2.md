# Story 9.2: Validate RTDB Security Rules via CLI

**Epic:** Epic 9 - Security & Validation

**Description:**
Test Realtime Database security rules using Firebase Emulator and CLI validation. Ensure message delivery security and workspace isolation with automated tests.

**Acceptance Criteria:**
- [x] Create RTDB rules test file: `tests/database.rules.spec.ts`
- [x] Run tests: `firebase emulators:exec --only database "npm test -- tests/database.rules.spec.ts"`
- [x] Test scenarios:
  - [x] User can write messages to their workspace channels
  - [x] User CANNOT write messages to other workspace channels
  - [x] User can read messages from their workspace channels
  - [x] User CANNOT read messages from other workspace channels
  - [x] Message text length validation (1-4000 chars)
  - [x] Message structure validation (all required fields)
- [x] All tests pass with 100% coverage
- [x] CI/CD integration: RTDB security tests run on every PR

**Dependencies:**
dependsOn: ["1.2"]

**Technical Notes:**
- RTDB security rules tests (tests/database.rules.spec.ts):
  ```typescript
  import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
  import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

  describe('RTDB Security Rules', () => {
    let testEnv;

    beforeAll(async () => {
      testEnv = await initializeTestEnvironment({
        projectId: 'slacklite-test',
        database: {
          rules: fs.readFileSync('database.rules.json', 'utf8'),
        },
      });
    });

    test('User can write messages to their workspace channel', async () => {
      const db = testEnv.authenticatedContext('user1').database();
      await assertSucceeds(
        db.ref('messages/workspace1/channel1/msg1').set({
          userId: 'user1',
          userName: 'User One',
          text: 'Test message',
          timestamp: Date.now(),
        })
      );
    });

    test('User CANNOT write messages to other workspace', async () => {
      const db = testEnv.authenticatedContext('user1').database();
      await assertFails(
        db.ref('messages/workspace2/channel1/msg1').set({
          userId: 'user1',
          userName: 'User One',
          text: 'Test message',
          timestamp: Date.now(),
        })
      );
    });

    test('Message text length validation', async () => {
      const db = testEnv.authenticatedContext('user1').database();
      
      // Too long (>4000 chars)
      await assertFails(
        db.ref('messages/workspace1/channel1/msg1').set({
          userId: 'user1',
          userName: 'User One',
          text: 'a'.repeat(4001),
          timestamp: Date.now(),
        })
      );

      // Empty text
      await assertFails(
        db.ref('messages/workspace1/channel1/msg1').set({
          userId: 'user1',
          userName: 'User One',
          text: '',
          timestamp: Date.now(),
        })
      );
    });
  });
  ```
- Run tests:
  ```bash
  firebase emulators:exec --only database "npm test -- tests/database.rules.spec.ts"
  ```

**Estimated Effort:** 2 hours
