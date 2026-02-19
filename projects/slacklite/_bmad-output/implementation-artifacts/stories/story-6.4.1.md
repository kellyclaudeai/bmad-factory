# Story 6.4.1: Test Unread Count Accuracy (E2E)

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
End-to-end test to verify unread count accuracy with multi-user simulation. Ensure counts increment correctly when user is in different channels using Playwright.

**Acceptance Criteria:**
- [x] ✅ **Test Scenario 1: Basic unread count increment**
  - [x] User A is in #general channel
  - [x] User B sends message in #dev-team channel
  - [x] Verify: User A's sidebar shows [1] unread badge on #dev-team
  - [x] User A switches to #dev-team
  - [x] Verify: Badge clears, count = 0
- [x] ✅ **Test Scenario 2: Multiple unread messages**
  - [x] User A is in #general
  - [x] User B sends 3 messages in #dev-team
  - [x] Verify: User A's sidebar shows [3] unread badge on #dev-team
- [x] ✅ **Test Scenario 3: No increment when viewing channel**
  - [x] User A is in #dev-team (actively viewing)
  - [x] User B sends message in #dev-team
  - [x] Verify: No unread badge appears (User A is viewing the channel)
- [x] ✅ **Test Scenario 4: Direct message unread counts**
  - [x] User A is in #general
  - [x] User B sends DM to User A
  - [x] Verify: User A's sidebar shows [1] unread badge on User B's DM
  - [x] User A opens DM with User B
  - [x] Verify: Badge clears
- [x] ✅ **Test Setup:**
  - [x] Use Playwright with Firebase Emulators
  - [x] Simulate two browser contexts (User A and User B)
  - [x] Coordinate actions via test orchestration
- [x] ✅ **Assertions:**
  - [x] Badge count matches expected number
  - [x] Badge clears immediately on channel switch (<200ms)
  - [x] No phantom unread counts (badges don't appear when they shouldn't)

**Dependencies:**
dependsOn: ["6.4"]

**Technical Notes:**
- Playwright E2E test (tests/e2e/unread-counts.spec.ts):
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Unread Counts', () => {
    test('should increment unread count when message sent in different channel', async ({ context }) => {
      // Create two browser contexts for User A and User B
      const pageA = await context.newPage();
      const pageB = await context.newPage();

      // User A signs in and goes to #general
      await pageA.goto('http://localhost:3000/signin');
      await pageA.fill('[name="email"]', 'usera@test.com');
      await pageA.fill('[name="password"]', 'password123');
      await pageA.click('[type="submit"]');
      await pageA.waitForURL('/app/channels/**');

      // User B signs in and goes to #dev-team
      await pageB.goto('http://localhost:3000/signin');
      await pageB.fill('[name="email"]', 'userb@test.com');
      await pageB.fill('[name="password"]', 'password123');
      await pageB.click('[type="submit"]');
      await pageB.click('text=# dev-team');

      // User B sends message in #dev-team
      await pageB.fill('[placeholder="Type a message..."]', 'Test message');
      await pageB.press('[placeholder="Type a message..."]', 'Enter');

      // Verify User A sees unread badge on #dev-team
      await expect(pageA.locator('text=# dev-team')).toContainText('[1]');

      // User A switches to #dev-team
      await pageA.click('text=# dev-team');

      // Verify badge clears
      await expect(pageA.locator('text=# dev-team')).not.toContainText('[1]');
    });

    test('should not increment unread count when viewing channel', async ({ context }) => {
      const pageA = await context.newPage();
      const pageB = await context.newPage();

      // User A is in #dev-team
      await pageA.goto('http://localhost:3000/app/channels/dev-team');

      // User B sends message in #dev-team
      await pageB.goto('http://localhost:3000/app/channels/dev-team');
      await pageB.fill('[placeholder="Type a message..."]', 'Test message');
      await pageB.press('[placeholder="Type a message..."]', 'Enter');

      // Verify no unread badge on #dev-team for User A
      await expect(pageA.locator('text=# dev-team')).not.toContainText('[');
    });
  });
  ```
- Test setup:
  - Run Firebase Emulators: `firebase emulators:start`
  - Seed test users and channels
  - Run Playwright: `pnpm exec playwright test`

**Estimated Effort:** 2 hours
