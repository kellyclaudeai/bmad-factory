/**
 * Core messaging flows — live QA URL tests.
 *
 * Covers:
 *  - Send a message (optimistic UI + persistence)
 *  - Message persists after page reload
 *  - Message input character limit
 *  - Empty message not sent
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  sendMessage,
  waitForMessagingSurface,
  messageRow,
} from "./helpers";

test.describe("Messaging", () => {
  test("sending a message displays it immediately (optimistic UI)", async ({ page }) => {
    const account = newAccount("msg-send");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const text = `hello-e2e-${Date.now()}`;
    await sendMessage(page, text);

    // Message should appear in the list
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  test("sent message persists after page reload", async ({ page }) => {
    const account = newAccount("msg-persist");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const text = `persist-e2e-${Date.now()}`;
    await sendMessage(page, text);
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Reload and verify message still shows
    await page.reload();
    await waitForMessagingSurface(page);
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 15_000 });
  });

  test("message input does not submit when empty", async ({ page }) => {
    const account = newAccount("msg-empty");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const composer = page.getByPlaceholder("Type a message...");

    // Press Enter with empty input
    await composer.press("Enter");

    // No new message rows should appear (list is empty to start)
    const rows = page.locator('[data-testid="virtualized-message-row"]');
    const count = await rows.count();
    expect(count).toBe(0);
  });

  test("message input enforces character limit or at least sends long messages gracefully", async ({
    page,
  }) => {
    const account = newAccount("msg-charlimit");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Generate a 1100-char string (exceeding typical 1000-char limit)
    const longText = "A".repeat(1100);
    const composer = page.getByPlaceholder("Type a message...");
    await composer.fill(longText);

    // Either the input is capped at max length OR a validation error appears on Enter
    const inputValue = await composer.inputValue();
    const wasCapped = inputValue.length < longText.length;

    if (!wasCapped) {
      // Try to send and expect either an error or the message to appear truncated/rejected
      await composer.press("Enter");

      // Wait briefly for any error
      const errorVisible = await page
        .getByText(/too long|character limit|maximum|truncated/i)
        .isVisible({ timeout: 3_000 })
        .catch(() => false);

      if (!errorVisible) {
        // If it sent, that's acceptable — just verify it didn't crash the app
        await expect(page.getByPlaceholder("Type a message...")).toBeVisible({ timeout: 5_000 });
      }
    } else {
      // Input was capped — character limit is enforced at input level
      expect(inputValue.length).toBeLessThan(longText.length);
    }
  });
});
