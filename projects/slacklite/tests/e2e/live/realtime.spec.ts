/**
 * Real-time messaging tests — live QA URL.
 *
 * Tests message delivery between browser contexts.
 *
 * Strategy A (primary): Same user, two browser contexts (same session cookie) —
 *   simulates the same user having two tabs open. Tests RTDB → UI sync.
 *
 * Strategy B (bonus): Two different users in the same workspace — requires invite flow.
 *   Attempted if invite link is obtainable; skipped gracefully if not.
 *
 * Covers:
 *  - Messages appear in real-time in a second tab of the same user
 *  - Unread counts update in real-time (cross-user, if achievable)
 *  - Message delivery across browser contexts < 5s (generous for live Firebase)
 */
import { expect, test, type Page } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  sendMessage,
  waitForMessagingSurface,
  messageRow,
  APP_CHANNEL_URL_RE,
  APP_DM_URL_RE,
} from "./helpers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getCurrentChannelUrl(page: Page): Promise<string> {
  return page.url();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Real-Time Messaging", () => {
  test(
    "message sent in tab A appears in tab B of the same user (same-user RTDB sync)",
    async ({ browser }) => {
      const account = newAccount("rt-sameuser");

      // --- Tab A: sign up and create workspace ---
      const ctxA = await browser.newContext();
      const pageA = await ctxA.newPage();
      await signUpAndCreateWorkspace(pageA, account);
      await waitForMessagingSurface(pageA);

      const channelUrl = await getCurrentChannelUrl(pageA);

      // --- Tab B: same user, new context (different cookie jar = fresh sign-in needed) ---
      // We sign in with same credentials in a second context
      const ctxB = await browser.newContext();
      const pageB = await ctxB.newPage();
      await pageB.goto("/signin");
      await pageB.getByLabel("Email").fill(account.email);
      await pageB.getByLabel("Password").fill(account.password);
      await pageB.getByRole("button", { name: "Sign In" }).click();
      await expect(pageB).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 25_000 });
      await pageB.goto(channelUrl);
      await waitForMessagingSurface(pageB);

      try {
        // Send from Tab A
        const text = `rt-sync-${Date.now()}`;
        const sendStartMs = Date.now();
        await sendMessage(pageA, text);

        // Expect to appear in Tab A immediately (optimistic UI)
        await expect(pageA.getByText(text, { exact: true })).toBeVisible({ timeout: 2_000 });

        // Expect to appear in Tab B within 5s (live Firebase — generous budget)
        await expect(pageB.getByText(text, { exact: true })).toBeVisible({ timeout: 5_000 });
        const deliveryMs = Date.now() - sendStartMs;
        console.log(`[realtime] Same-user delivery: ${deliveryMs}ms`);

        // Assert reasonably fast delivery
        expect(deliveryMs).toBeLessThan(8_000);
      } finally {
        await ctxA.close();
        await ctxB.close();
      }
    }
  );

  test(
    "message from user A in channel is received by user B on same channel (cross-user)",
    async ({ browser }) => {
      // This test requires two users in the same workspace.
      // Strategy: User A creates workspace → gets invite link → User B accepts.

      const accountA = newAccount("rt-userA");
      const accountB = newAccount("rt-userB");

      // === Setup User A ===
      const ctxA = await browser.newContext();
      const pageA = await ctxA.newPage();
      await signUpAndCreateWorkspace(pageA, accountA);
      await waitForMessagingSurface(pageA);

      const channelUrlA = await getCurrentChannelUrl(pageA);

      // === Try to get invite link ===
      const inviteButton = pageA
        .getByRole("button", { name: /invite|add member|invite people/i })
        .first();

      const inviteVisible = await inviteButton.isVisible({ timeout: 5_000 }).catch(() => false);

      if (!inviteVisible) {
        await ctxA.close();
        test.skip(true, "Invite button not found — cannot create second user in same workspace");
        return;
      }

      await inviteButton.click();
      await expect(pageA.getByRole("dialog")).toBeVisible({ timeout: 8_000 });

      const linkInput = pageA.getByRole("textbox").first();
      let inviteUrl: string | null = null;
      if (await linkInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        inviteUrl = await linkInput.inputValue();
      }

      if (!inviteUrl || !inviteUrl.includes("invite")) {
        await ctxA.close();
        test.skip(true, "Could not retrieve invite URL — skipping cross-user real-time test");
        return;
      }

      // Close the dialog
      const closeBtn = pageA.getByRole("button", { name: /close|cancel/i }).first();
      if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await closeBtn.click();

      // === Setup User B via invite ===
      const ctxB = await browser.newContext();
      const pageB = await ctxB.newPage();

      await pageB.goto(inviteUrl);

      // User B may need to sign up first
      if (pageB.url().includes("/signup") || await pageB.getByRole("button", { name: "Create Account" }).isVisible({ timeout: 3_000 }).catch(() => false)) {
        await pageB.getByLabel("Email Address").fill(accountB.email);
        await pageB.getByLabel("Password").fill(accountB.password);
        await pageB.getByRole("button", { name: "Create Account" }).click();
      } else if (pageB.url().includes("/signin") || await pageB.getByRole("button", { name: "Sign In" }).isVisible({ timeout: 3_000 }).catch(() => false)) {
        await pageB.getByLabel("Email").fill(accountB.email);
        await pageB.getByLabel("Password").fill(accountB.password);
        await pageB.getByRole("button", { name: "Sign In" }).click();
      }

      // User B should land in the workspace channel
      await expect(pageB).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 25_000 });

      // Navigate User B to same channel as User A
      await pageB.goto(channelUrlA);
      await waitForMessagingSurface(pageB);

      try {
        // User A sends a message
        const text = `cross-user-rt-${Date.now()}`;
        const sendStartMs = Date.now();
        await sendMessage(pageA, text);

        // User B should receive it
        await expect(pageB.getByText(text, { exact: true })).toBeVisible({ timeout: 6_000 });
        const deliveryMs = Date.now() - sendStartMs;
        console.log(`[realtime] Cross-user delivery: ${deliveryMs}ms`);

        // Assert delivery within 6s (live Firebase SLA)
        expect(deliveryMs).toBeLessThan(6_000);
      } finally {
        await ctxA.close();
        await ctxB.close();
      }
    }
  );

  test("unread count badge appears for user A when user B sends in another channel", async ({
    browser,
  }) => {
    // Requires two users in same workspace — attempt invite flow, skip if unavailable
    const accountA = newAccount("unread-A");
    const accountB = newAccount("unread-B");

    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await signUpAndCreateWorkspace(pageA, accountA);
    await waitForMessagingSurface(pageA);

    // Create a second channel
    const secondChannelName = `second-${Date.now().toString(36)}`;
    await pageA.getByRole("button", { name: "+ New Channel" }).click();
    await pageA.getByLabel("Name").fill(secondChannelName);
    await pageA.getByRole("button", { name: "Create", exact: true }).click();
    await expect(
      pageA.getByRole("heading", { name: new RegExp(`# ${secondChannelName}`, "i") })
    ).toBeVisible({ timeout: 10_000 });

    // User A goes back to #general
    await pageA.getByRole("link", { name: /Channel general/i }).click();
    await expect(pageA.getByRole("heading", { name: /# general/i })).toBeVisible();
    await waitForMessagingSurface(pageA);

    // Get invite link for User B
    const inviteButton = pageA.getByRole("button", { name: /invite|add member|invite people/i }).first();
    const inviteVisible = await inviteButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!inviteVisible) {
      await ctxA.close();
      test.skip(true, "Invite not available — cannot run unread count cross-user test");
      return;
    }

    await inviteButton.click();
    await expect(pageA.getByRole("dialog")).toBeVisible({ timeout: 8_000 });
    const linkInput = pageA.getByRole("textbox").first();
    let inviteUrl: string | null = null;
    if (await linkInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      inviteUrl = await linkInput.inputValue();
    }

    if (!inviteUrl) {
      await ctxA.close();
      test.skip(true, "Cannot get invite URL for unread test");
      return;
    }

    const closeBtn = pageA.getByRole("button", { name: /close|cancel/i }).first();
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await closeBtn.click();

    // User B joins via invite
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto(inviteUrl);

    if (pageB.url().includes("/signup") || await pageB.getByRole("button", { name: "Create Account" }).isVisible({ timeout: 3_000 }).catch(() => false)) {
      await pageB.getByLabel("Email Address").fill(accountB.email);
      await pageB.getByLabel("Password").fill(accountB.password);
      await pageB.getByRole("button", { name: "Create Account" }).click();
    } else {
      await pageB.getByLabel("Email").fill(accountB.email);
      await pageB.getByLabel("Password").fill(accountB.password);
      await pageB.getByRole("button", { name: "Sign In" }).click();
    }

    await expect(pageB).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 25_000 });

    // User B navigates to the second channel and sends a message
    await pageB.getByRole("link", { name: new RegExp(`Channel ${secondChannelName}`, "i") }).click();
    await waitForMessagingSurface(pageB);
    const unreadText = `unread-marker-${Date.now()}`;
    await sendMessage(pageB, unreadText);

    try {
      // User A (on #general) should see an unread badge on the second channel
      const unreadBadge = pageA.getByRole("link", {
        name: new RegExp(`Channel ${secondChannelName}.*(unread|1)`, "i"),
      });
      await expect(unreadBadge).toBeVisible({ timeout: 8_000 });

      // User A switches to the channel — badge should clear
      await unreadBadge.click();
      await expect(pageA.getByRole("heading", { name: new RegExp(`# ${secondChannelName}`, "i") })).toBeVisible();
      await waitForMessagingSurface(pageA);

      // Badge should be gone
      await expect(
        pageA.getByRole("link", { name: new RegExp(`Channel ${secondChannelName}.*(unread|1)`, "i") })
      ).toHaveCount(0, { timeout: 5_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
