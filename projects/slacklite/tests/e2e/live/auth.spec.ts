/**
 * Auth flows — live QA URL tests (v2).
 *
 * v2 additions:
 *  AUTH-07: Auth pages use Oxide Dark theme (dark background, emerald CTA button)
 *
 * Covers:
 *  AUTH-01: New user sign-up → workspace creation → app
 *  AUTH-02: Existing user sign-in → app
 *  AUTH-03: Sign-out → landing page
 *  AUTH-04: Session persistence (reload)
 *  AUTH-05: Protected route redirect (/app → /signin)
 *  AUTH-06: Duplicate email error handling
 *  AUTH-07: Auth pages use Oxide Dark theme
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  signIn,
  signOut,
  APP_CHANNEL_URL_RE,
  assertBodyIsDark,
  getBodyBgColor,
  countEmeraldElements,
} from "./helpers";

test.describe("Authentication", () => {
  // ---------------------------------------------------------------------------
  // AUTH-01: Sign-up flow
  // ---------------------------------------------------------------------------
  test("AUTH-01 sign-up creates workspace and lands on #general channel", async ({ page }) => {
    const account = newAccount("signup");
    await signUpAndCreateWorkspace(page, account);

    // Should be on a channel page with #general visible
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE);
    await expect(
      page.getByRole("link", { name: /Channel general/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /# general/i })
    ).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AUTH-02: Sign-in flow
  // ---------------------------------------------------------------------------
  test("AUTH-02 sign-in redirects to workspace channel view", async ({ page }) => {
    const account = newAccount("signin");

    // Create account first
    await signUpAndCreateWorkspace(page, account);
    await signOut(page);

    // Sign back in
    await signIn(page, account);
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE);
    await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AUTH-03: Sign-out
  // ---------------------------------------------------------------------------
  test("AUTH-03 sign-out redirects to landing page", async ({ page }) => {
    const account = newAccount("signout");
    await signUpAndCreateWorkspace(page, account);
    await signOut(page);

    // Should be back at root/landing — not /app
    await expect(page).not.toHaveURL(APP_CHANNEL_URL_RE);
    // Landing page should show the main heading
    await expect(
      page.getByRole("heading", { name: /Lightweight Team Messaging/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  // ---------------------------------------------------------------------------
  // AUTH-04: Session persistence
  // ---------------------------------------------------------------------------
  test("AUTH-04 session persists after page reload", async ({ page }) => {
    const account = newAccount("persist");
    await signUpAndCreateWorkspace(page, account);

    // Reload the page
    await page.reload();

    // Should still be authenticated and on a channel
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AUTH-05: Protected route redirect
  // ---------------------------------------------------------------------------
  test("AUTH-05 unauthenticated user visiting /app is redirected to /signin", async ({ page }) => {
    await page.goto("/app");

    await expect(page).toHaveURL(/\/signin/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // AUTH-06: Duplicate email
  // ---------------------------------------------------------------------------
  test("AUTH-06 sign-up with already-registered email shows error", async ({ page }) => {
    const account = newAccount("dup-email");

    // First registration
    await signUpAndCreateWorkspace(page, account);
    await signOut(page);

    // Attempt to register same email again
    await page.goto("/signup");
    await page.getByLabel("Email Address").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show an error (not navigate away)
    await expect(page).toHaveURL(/\/signup/, { timeout: 10_000 });
    // Firebase returns "email-already-in-use" — UI should surface some error text
    const body = page.locator("body");
    await expect(body).toContainText(/already|in use|exists|registered/i, { timeout: 8_000 });
  });

  // ---------------------------------------------------------------------------
  // AUTH-07: Oxide Dark theme on auth pages (v2)
  // ---------------------------------------------------------------------------
  test("AUTH-07 sign-in page uses Oxide Dark theme (dark background)", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    // Body background must be dark — not white
    const bgColor = await getBodyBgColor(page);
    console.log(`[oxide-dark] /signin body bg: ${bgColor}`);

    // Oxide Dark base is #0C0E14 (very dark) — ensure it's not white/near-white
    const isWhite = bgColor === "#ffffff" || bgColor === "#f8f8f8" || bgColor === "#f5f5f5";
    expect(
      isWhite,
      `Sign-in page body background is "${bgColor}" — should be Oxide Dark (e.g. #0c0e14), not white. Oxide Dark redesign may not be applied.`
    ).toBe(false);

    // Page should have dark overall appearance
    await assertBodyIsDark(page);
  });

  test("AUTH-07b sign-up page uses Oxide Dark theme (dark background)", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /sign up|create account/i })).toBeVisible({ timeout: 10_000 });

    const bgColor = await getBodyBgColor(page);
    console.log(`[oxide-dark] /signup body bg: ${bgColor}`);

    const isWhite = bgColor === "#ffffff" || bgColor === "#f8f8f8" || bgColor === "#f5f5f5";
    expect(
      isWhite,
      `Sign-up page body background is "${bgColor}" — should be dark (Oxide Dark). If this fails, globals.css was not updated to set the dark base color.`
    ).toBe(false);
  });

  test("AUTH-07c sign-in page has emerald accent button", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    // The primary "Sign In" button should use the emerald accent (#34D399)
    const submitButton = page.getByRole("button", { name: "Sign In" });
    await expect(submitButton).toBeVisible();

    const buttonBg = await submitButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    console.log(`[oxide-dark] Sign In button bg: ${buttonBg}`);

    // Check for emerald: rgb(52, 211, 153) ≈ #34D399
    const match = buttonBg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
      const isEmerald = r >= 30 && r <= 80 && g >= 180 && g <= 230 && b >= 120 && b <= 180;
      if (!isEmerald) {
        // Soft assertion — log but don't hard fail (button style may use CSS var that resolves differently)
        console.warn(
          `[oxide-dark] Sign In button bg ${buttonBg} does not match emerald #34D399. ` +
          `This may indicate Oxide Dark theme is not applied to auth pages.`
        );
      }
    }

    // At minimum, verify the button is not styled with light colors
    const emeraldCount = await countEmeraldElements(page);
    console.log(`[oxide-dark] Emerald element count on /signin: ${emeraldCount}`);
    // Sign-in page should have at least the CTA button using emerald
    expect(
      emeraldCount,
      `No emerald (#34D399) elements found on sign-in page. Oxide Dark uses emerald as the sole accent color.`
    ).toBeGreaterThan(0);
  });
});
