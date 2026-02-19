# Story 10.4: Write E2E Tests for Real-Time Messaging

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Write end-to-end tests for real-time messaging scenarios using Playwright. Test multi-user message delivery, channel switching, and real-time updates.

**Acceptance Criteria:**
- [ ] E2E test: User sends message, appears immediately (optimistic UI)
- [ ] E2E test: Message delivered to other users in <500ms
- [ ] E2E test: Channel switching loads messages correctly
- [ ] E2E test: Unread counts update in real-time
- [ ] E2E test: User can create channel and send first message
- [ ] E2E test: Direct messages work end-to-end
- [ ] All tests run against Firebase Emulator (not production)
- [ ] Tests run in CI/CD pipeline

**Dependencies:**
dependsOn: ["10.1", "4.4", "4.5"]

**Technical Notes:**
- E2E test suite (tests/e2e/messaging.spec.ts):
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Real-Time Messaging', () => {
    test.beforeEach(async ({ page }) => {
      // Start Firebase Emulator
      await page.goto('http://localhost:3000');
      
      // Sign in test user
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'password123');
      await page.click('[type="submit"]');
      await page.waitForURL('/app/**');
    });

    test('sends message and displays optimistic UI', async ({ page }) => {
      // Navigate to #general
      await page.click('text=# general');

      // Type and send message
      await page.fill('[placeholder="Type a message..."]', 'Hello world!');
      await page.press('[placeholder="Type a message..."]', 'Enter');

      // Verify message appears immediately
      await expect(page.locator('text=Hello world!')).toBeVisible();
      await expect(page.locator('text=Sending...')).toBeVisible();

      // Wait for server confirmation
      await expect(page.locator('text=Sending...')).toBeHidden({ timeout: 2000 });
    });

    test('delivers message to other users in real-time', async ({ context }) => {
      // User A
      const pageA = await context.newPage();
      await pageA.goto('http://localhost:3000/app/channels/general');

      // User B
      const pageB = await context.newPage();
      await pageB.goto('http://localhost:3000/app/channels/general');

      // User A sends message
      await pageA.fill('[placeholder="Type a message..."]', 'Test from A');
      await pageA.press('[placeholder="Type a message..."]', 'Enter');

      // User B sees message within 500ms
      await expect(pageB.locator('text=Test from A')).toBeVisible({ timeout: 500 });
    });

    test('channel switching loads correct messages', async ({ page }) => {
      // Send message in #general
      await page.click('text=# general');
      await page.fill('[placeholder="Type a message..."]', 'General message');
      await page.press('[placeholder="Type a message..."]', 'Enter');

      // Switch to #dev-team
      await page.click('text=# dev-team');

      // Verify general message not visible
      await expect(page.locator('text=General message')).not.toBeVisible();

      // Send message in #dev-team
      await page.fill('[placeholder="Type a message..."]', 'Dev team message');
      await page.press('[placeholder="Type a message..."]', 'Enter');

      // Verify dev-team message visible
      await expect(page.locator('text=Dev team message')).toBeVisible();

      // Switch back to #general
      await page.click('text=# general');

      // Verify general message visible again
      await expect(page.locator('text=General message')).toBeVisible();
    });

    test('unread counts update in real-time', async ({ context }) => {
      const pageA = await context.newPage();
      const pageB = await context.newPage();

      // User A in #general
      await pageA.goto('http://localhost:3000/app/channels/general');

      // User B in #dev-team
      await pageB.goto('http://localhost:3000/app/channels/dev-team');

      // User B sends message in #dev-team
      await pageB.fill('[placeholder="Type a message..."]', 'Unread test');
      await pageB.press('[placeholder="Type a message..."]', 'Enter');

      // User A sees unread badge on #dev-team
      await expect(pageA.locator('text=# dev-team')).toContainText('[1]');

      // User A switches to #dev-team
      await pageA.click('text=# dev-team');

      // Badge clears
      await expect(pageA.locator('text=# dev-team')).not.toContainText('[1]');
    });
  });
  ```
- Run E2E tests:
  ```bash
  # Start Firebase Emulator
  firebase emulators:start &

  # Run Playwright tests
  pnpm test:e2e
  ```

**Estimated Effort:** 3 hours
