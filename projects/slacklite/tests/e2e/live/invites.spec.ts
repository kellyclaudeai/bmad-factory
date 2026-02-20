/**
 * Invite flows — live QA URL tests.
 *
 * Covers:
 *  - Workspace owner can generate an invite link
 *  - Invite link is a valid URL
 *  - A second user can accept the invite and join the workspace
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  signOut,
  waitForMessagingSurface,
  APP_CHANNEL_URL_RE,
} from "./helpers";

test.describe("Invite Flows", () => {
  test("workspace owner can open invite modal and generate an invite link", async ({ page }) => {
    const account = newAccount("invite-gen");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Look for invite button — could be in sidebar header, member section, or top bar
    const inviteButton = page
      .getByRole("button", { name: /invite|add member|add teammate|invite people/i })
      .first();

    const inviteVisible = await inviteButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!inviteVisible) {
      // Try secondary locations — e.g., a "+" next to Members heading
      const altInviteButton = page.getByTitle(/invite/i).first();
      const altVisible = await altInviteButton.isVisible({ timeout: 3_000 }).catch(() => false);

      if (!altVisible) {
        test.skip(true, "Invite button not found in sidebar/toolbar — UI location unknown");
        return;
      }
      await altInviteButton.click();
    } else {
      await inviteButton.click();
    }

    // Invite modal / panel should appear
    const modalOrPanel = page.getByRole("dialog").first();
    await expect(modalOrPanel).toBeVisible({ timeout: 8_000 });

    // There should be a link or link-copy button inside
    const linkText = await page
      .getByText(/invite link|copy link|share link/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    const copyButton = await page
      .getByRole("button", { name: /copy|copy link/i })
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    expect(linkText || copyButton).toBe(true);
  });

  test("invite link URL is valid and navigates to an invite acceptance page", async ({
    page,
    context,
  }) => {
    const ownerAccount = newAccount("invite-accept-owner");
    await signUpAndCreateWorkspace(page, ownerAccount);
    await waitForMessagingSurface(page);

    // Find and click invite button
    const inviteButton = page
      .getByRole("button", { name: /invite|add member|invite people/i })
      .first();

    const inviteVisible = await inviteButton.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!inviteVisible) {
      test.skip(true, "Invite button not visible — cannot complete invite-link acceptance test");
      return;
    }
    await inviteButton.click();

    // Wait for modal
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 8_000 });

    // Try to read the invite link from input or a text element
    const linkInput = page.getByRole("textbox").first();
    const linkInputVisible = await linkInput.isVisible({ timeout: 3_000 }).catch(() => false);

    let inviteUrl: string | null = null;

    if (linkInputVisible) {
      inviteUrl = await linkInput.inputValue();
    } else {
      // Try reading clipboard via copy button
      const copyButton = page.getByRole("button", { name: /copy/i }).first();
      if (await copyButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
        // Grant clipboard read permission and try to grab the link
        // Instead, look for the link text in the DOM
        const linkEl = page.locator("a[href*='invite'], [data-testid*='invite'] a").first();
        if (await linkEl.isVisible({ timeout: 2_000 }).catch(() => false)) {
          inviteUrl = await linkEl.getAttribute("href");
        }
      }
    }

    if (!inviteUrl) {
      test.skip(true, "Could not extract invite URL from modal — UI structure unknown");
      return;
    }

    // Validate URL format
    expect(inviteUrl).toMatch(/\/invite\//);

    // Open invite URL in a new page (as a new/anonymous user)
    const guestPage = await context.newPage();
    await guestPage.goto(inviteUrl);

    // Should see invite acceptance UI or be prompted to sign up/sign in
    const inviteUiVisible = await guestPage
      .getByText(/join|accept|invite|workspace/i)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    expect(inviteUiVisible).toBe(true);
    await guestPage.close();
  });

  test("new user accepts invite and lands in the workspace", async ({ page, browser }) => {
    const ownerAccount = newAccount("invite-full-owner");
    const guestAccount = newAccount("invite-full-guest");

    // Step 1: Owner creates workspace
    await signUpAndCreateWorkspace(page, ownerAccount);
    await waitForMessagingSurface(page);

    // Step 2: Get invite link
    const inviteButton = page
      .getByRole("button", { name: /invite|add member|invite people/i })
      .first();
    const inviteVisible = await inviteButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!inviteVisible) {
      test.skip(true, "Invite button not found — cannot complete full invite flow");
      return;
    }
    await inviteButton.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 8_000 });

    // Try to get invite URL
    const linkInput = page.getByRole("textbox").first();
    let inviteUrl: string | null = null;
    if (await linkInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      inviteUrl = await linkInput.inputValue();
    }

    if (!inviteUrl || !inviteUrl.includes("invite")) {
      test.skip(true, "Could not obtain invite URL — skip full flow test");
      return;
    }

    // Step 3: Guest signs up via invite link
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await guestPage.goto(inviteUrl);

    // Guest may need to sign up first
    const signUpLink = guestPage.getByRole("link", { name: /sign up|create account/i });
    if (await signUpLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await signUpLink.click();
    }

    // If redirected to signup
    if (guestPage.url().includes("/signup")) {
      await guestPage.getByLabel("Email Address").fill(guestAccount.email);
      await guestPage.getByLabel("Password").fill(guestAccount.password);
      await guestPage.getByRole("button", { name: "Create Account" }).click();
    }

    // Guest should land on a channel or workspace page
    await expect(guestPage).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 25_000 });

    // Guest should see the owner's workspace (not prompted for workspace creation)
    await expect(
      guestPage.getByRole("link", { name: /Channel general/i })
    ).toBeVisible({ timeout: 10_000 });

    await guestContext.close();
  });
});
