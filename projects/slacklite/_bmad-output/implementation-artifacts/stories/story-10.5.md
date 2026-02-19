# Story 10.5: Write E2E Tests for Critical Flows

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Write end-to-end tests for critical user flows (signup, login, channel creation, message sending) using Playwright. Ensure core user journeys work from start to finish.

**Acceptance Criteria:**
- [x] ✅ E2E test: New user signup flow (email/password → workspace creation → redirects to app)
- [x] ✅ E2E test: Existing user login flow (email/password → redirects to app)
- [x] ✅ E2E test: Channel creation flow (click "+ New Channel" → enter name → channel created → redirects to channel)
- [x] ✅ E2E test: Message sending flow (type message → press Enter → message appears)
- [x] ✅ E2E test: Sign out flow (click sign out → confirm → redirects to landing page)
- [x] ✅ E2E test: Protected route enforcement (unauthenticated user → redirects to signin)
- [x] ✅ All tests run against Firebase Emulator (not production)
- [x] ✅ Tests run in CI/CD pipeline

**Dependencies:**
dependsOn: ["10.1"]

**Technical Notes:**
- E2E test suite (tests/e2e/critical-flows.spec.ts):
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('Critical User Flows', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const workspaceName = 'Test Workspace';

    test('complete signup flow', async ({ page }) => {
      // Navigate to signup
      await page.goto('http://localhost:3000/signup');

      // Fill signup form
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button:has-text("Create Account")');

      // Should redirect to workspace creation
      await page.waitForURL('/create-workspace');

      // Create workspace
      await page.fill('[name="workspaceName"]', workspaceName);
      await page.click('button:has-text("Create Workspace")');

      // Should redirect to app with #general channel
      await page.waitForURL('/app/**');
      await expect(page.locator('text=# general')).toBeVisible();
    });

    test('existing user login flow', async ({ page }) => {
      await page.goto('http://localhost:3000/signin');

      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');

      await page.waitForURL('/app/**');
      await expect(page.locator('text=# general')).toBeVisible();
    });

    test('channel creation flow', async ({ page }) => {
      // Sign in first
      await page.goto('http://localhost:3000/signin');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('/app/**');

      // Create channel
      await page.click('button:has-text("+ New Channel")');
      await page.fill('input[placeholder="channel-name"]', 'test-channel');
      await page.click('button:has-text("Create")');

      // Should redirect to new channel
      await page.waitForURL('/app/channels/**');
      await expect(page.locator('text=# test-channel')).toBeVisible();
    });

    test('message sending flow', async ({ page }) => {
      // Sign in
      await page.goto('http://localhost:3000/signin');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('/app/**');

      // Navigate to channel
      await page.click('text=# general');

      // Send message
      const testMessage = `Test message ${Date.now()}`;
      await page.fill('[placeholder="Type a message..."]', testMessage);
      await page.press('[placeholder="Type a message..."]', 'Enter');

      // Verify message appears
      await expect(page.locator(`text=${testMessage}`)).toBeVisible();
    });

    test('sign out flow', async ({ page }) => {
      // Sign in
      await page.goto('http://localhost:3000/signin');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('/app/**');

      // Sign out
      await page.click('button:has-text("Sign Out")');
      await page.click('button:has-text("Sign Out")'); // Confirm in modal

      // Should redirect to landing page
      await page.waitForURL('/');
    });

    test('protected route enforcement', async ({ page }) => {
      // Try to access protected route without auth
      await page.goto('http://localhost:3000/app');

      // Should redirect to signin
      await page.waitForURL('/signin');
    });
  });
  ```
- Run E2E tests:
  ```bash
  # Start Firebase Emulator
  firebase emulators:start &

  # Start Next.js dev server
  pnpm dev &

  # Run Playwright tests
  pnpm test:e2e
  ```

**Estimated Effort:** 4 hours
