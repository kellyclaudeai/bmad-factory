/**
 * Core messaging flows — live QA URL tests (v2).
 *
 * v2 focus: Message persistence is the core bug that was fixed in v2.
 *   - RTDB security rules were corrected
 *   - Channel page now subscribes to both RTDB and Firestore
 *   - Firestore rules updated
 *
 * Covers:
 *  MSG-01: Send a message (optimistic UI + persistence)
 *  MSG-02: Message persists after SINGLE reload  ← core v1 bug fix
 *  MSG-03: Message persists after MULTIPLE reloads  ← durability check
 *  MSG-04: Multiple messages maintain order after reload
 *  MSG-05: Empty message not sent
 *  MSG-06: Long message handled gracefully
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  sendMessage,
  waitForMessagingSurface,
  messageRow,
  uniqueChannelName,
  APP_CHANNEL_URL_RE,
} from "./helpers";

test.describe("Messaging", () => {
  // ---------------------------------------------------------------------------
  // MSG-01: Optimistic UI
  // ---------------------------------------------------------------------------
  test("MSG-01 sending a message displays it immediately (optimistic UI)", async ({ page }) => {
    const account = newAccount("msg-send");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const text = `hello-e2e-${Date.now()}`;
    await sendMessage(page, text);

    // Message should appear in the list without requiring a reload
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  // ---------------------------------------------------------------------------
  // MSG-02: Persistence after single reload — CORE BUG FIX VERIFICATION
  // ---------------------------------------------------------------------------
  test("MSG-02 sent message persists after page reload [core v2 fix]", async ({ page }) => {
    const account = newAccount("msg-persist");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const text = `persist-v2-${Date.now()}`;
    await sendMessage(page, text);

    // Confirm immediate display
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Reload the page
    await page.reload();
    await waitForMessagingSurface(page);

    // Message MUST still be present — this was broken in v1
    await expect(
      page.getByText(text, { exact: true }),
      `Message "${text}" must persist after page reload. If this fails, the RTDB/Firestore persistence fix has regressed.`
    ).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // MSG-03: Persistence after MULTIPLE reloads — durability
  // ---------------------------------------------------------------------------
  test("MSG-03 sent message persists after multiple reloads [durability]", async ({ page }) => {
    const account = newAccount("msg-durable");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const text = `durable-v2-${Date.now()}`;
    await sendMessage(page, text);
    await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Reload #1
    await page.reload();
    await waitForMessagingSurface(page);
    await expect(
      page.getByText(text, { exact: true }),
      "Message must persist after first reload"
    ).toBeVisible({ timeout: 15_000 });

    // Reload #2
    await page.reload();
    await waitForMessagingSurface(page);
    await expect(
      page.getByText(text, { exact: true }),
      "Message must persist after second reload"
    ).toBeVisible({ timeout: 15_000 });

    // Reload #3
    await page.reload();
    await waitForMessagingSurface(page);
    await expect(
      page.getByText(text, { exact: true }),
      "Message must persist after third reload"
    ).toBeVisible({ timeout: 15_000 });
  });

  // ---------------------------------------------------------------------------
  // MSG-04: Multiple messages maintain correct order after reload
  // ---------------------------------------------------------------------------
  test("MSG-04 multiple messages maintain order after reload", async ({ page }) => {
    const account = newAccount("msg-order");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const ts = Date.now();
    const msg1 = `order-first-${ts}`;
    const msg2 = `order-second-${ts}`;
    const msg3 = `order-third-${ts}`;

    await sendMessage(page, msg1);
    await expect(page.getByText(msg1, { exact: true })).toBeVisible({ timeout: 5_000 });

    await sendMessage(page, msg2);
    await expect(page.getByText(msg2, { exact: true })).toBeVisible({ timeout: 5_000 });

    await sendMessage(page, msg3);
    await expect(page.getByText(msg3, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Reload
    await page.reload();
    await waitForMessagingSurface(page);

    // All three messages should persist
    await expect(page.getByText(msg1, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(msg2, { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(msg3, { exact: true })).toBeVisible({ timeout: 15_000 });

    // Verify order: msg1 appears before msg2 appears before msg3 in the DOM
    const positions = await page.evaluate(([t1, t2, t3]) => {
      const all = document.querySelectorAll("*");
      const pos: Record<string, number> = {};
      let i = 0;
      for (const el of all) {
        const text = el.textContent ?? "";
        if (text.includes(t1) && !pos[t1]) pos[t1] = i;
        if (text.includes(t2) && !pos[t2]) pos[t2] = i;
        if (text.includes(t3) && !pos[t3]) pos[t3] = i;
        i++;
      }
      return pos;
    }, [msg1, msg2, msg3]);

    expect(
      positions[msg1] < positions[msg2],
      `msg1 (pos ${positions[msg1]}) should appear before msg2 (pos ${positions[msg2]})`
    ).toBe(true);
    expect(
      positions[msg2] < positions[msg3],
      `msg2 (pos ${positions[msg2]}) should appear before msg3 (pos ${positions[msg3]})`
    ).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // MSG-05: Empty message not sent
  // ---------------------------------------------------------------------------
  test("MSG-05 message input does not submit when empty", async ({ page }) => {
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

  // ---------------------------------------------------------------------------
  // MSG-06: Long message handled gracefully
  // ---------------------------------------------------------------------------
  test("MSG-06 long message (1100+ chars) is handled gracefully", async ({ page }) => {
    const account = newAccount("msg-long");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    const longText = "A".repeat(1100);
    const composer = page.getByPlaceholder("Type a message...");
    await composer.fill(longText);

    const inputValue = await composer.inputValue();
    const wasCapped = inputValue.length < longText.length;

    if (!wasCapped) {
      await composer.press("Enter");

      // Either error OR message sent — app must not crash
      const errorVisible = await page
        .getByText(/too long|character limit|maximum|truncated/i)
        .isVisible({ timeout: 3_000 })
        .catch(() => false);

      if (!errorVisible) {
        // If it sent without error, verify the app is still functional
        await expect(page.getByPlaceholder("Type a message...")).toBeVisible({ timeout: 5_000 });
      }
    } else {
      // Character limit enforced at input level — that's fine
      expect(inputValue.length).toBeLessThan(longText.length);
    }
  });

  // ---------------------------------------------------------------------------
  // Bonus: Messages persist across channel navigation
  // ---------------------------------------------------------------------------
  test("messages in channel A survive navigation to channel B and back", async ({ page }) => {
    const account = newAccount("msg-channel-nav");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Send in #general
    const generalMsg = `general-persist-${Date.now()}`;
    await sendMessage(page, generalMsg);
    await expect(page.getByText(generalMsg, { exact: true })).toBeVisible({ timeout: 5_000 });

    // Create a second channel and navigate to it
    const newChanName = uniqueChannelName();
    await page.getByRole("button", { name: "+ New Channel" }).click();
    await page.getByLabel("Name").fill(newChanName);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 15_000 });
    await waitForMessagingSurface(page);

    // Navigate back to #general
    await page.getByRole("link", { name: /Channel general/i }).click();
    await expect(page.getByRole("heading", { name: /# general/i })).toBeVisible({ timeout: 10_000 });
    await waitForMessagingSurface(page);

    // Original message must still be visible
    await expect(
      page.getByText(generalMsg, { exact: true }),
      `Message in #general must survive navigation away and back`
    ).toBeVisible({ timeout: 10_000 });
  });
});
