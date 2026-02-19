# Story 9.1: Validate Firestore Security Rules via CLI

**Epic:** Epic 9 - Security & Validation

**Description:**
Test Firestore security rules using Firebase Emulator and CLI-based validation. Ensure workspace isolation and proper access controls with automated testing.

**Acceptance Criteria:**
- [ ] Create security rules test file: `tests/firestore.rules.spec.ts`
- [ ] Run tests: `firebase emulators:exec --only firestore "npm test"`
- [ ] Test scenarios:
  - [ ] User can read their own workspace data
  - [ ] User CANNOT read other workspace data
  - [ ] User can create channels in their workspace
  - [ ] User CANNOT create channels in other workspace
  - [ ] User can write messages in their workspace channels
  - [ ] User CANNOT write messages in other workspace channels
- [ ] All tests pass with 100% coverage of security rules
- [ ] CI/CD integration: Security tests run on every PR

**Dependencies:**
dependsOn: ["1.2"]

**Technical Notes:**
- Firestore security rules tests (tests/firestore.rules.spec.ts):
  ```typescript
  import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
  import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

  describe('Firestore Security Rules', () => {
    let testEnv;

    beforeAll(async () => {
      testEnv = await initializeTestEnvironment({
        projectId: 'slacklite-test',
        firestore: {
          rules: fs.readFileSync('firestore.rules', 'utf8'),
        },
      });
    });

    afterAll(async () => {
      await testEnv.cleanup();
    });

    test('User can read their own workspace data', async () => {
      const db = testEnv.authenticatedContext('user1').firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('user1').set({
          workspaceId: 'workspace1',
        });
      });

      await assertSucceeds(
        db.collection('workspaces').doc('workspace1').get()
      );
    });

    test('User CANNOT read other workspace data', async () => {
      const db = testEnv.authenticatedContext('user1').firestore();
      await assertFails(
        db.collection('workspaces').doc('workspace2').get()
      );
    });

    test('User can create channels in their workspace', async () => {
      const db = testEnv.authenticatedContext('user1').firestore();
      await assertSucceeds(
        db.collection('workspaces/workspace1/channels').add({
          name: 'test-channel',
          workspaceId: 'workspace1',
          createdBy: 'user1',
        })
      );
    });

    test('User CANNOT create channels in other workspace', async () => {
      const db = testEnv.authenticatedContext('user1').firestore();
      await assertFails(
        db.collection('workspaces/workspace2/channels').add({
          name: 'test-channel',
          workspaceId: 'workspace2',
          createdBy: 'user1',
        })
      );
    });
  });
  ```
- Run tests:
  ```bash
  firebase emulators:exec --only firestore "npm test -- tests/firestore.rules.spec.ts"
  ```
- CI/CD integration (.github/workflows/security-tests.yml):
  ```yaml
  name: Security Tests
  on: [pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: npm install -g firebase-tools
        - run: npm install
        - run: firebase emulators:exec --only firestore "npm test"
  ```

**Estimated Effort:** 2 hours
