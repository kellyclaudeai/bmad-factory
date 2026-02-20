/**
 * Auth flows — live QA URL tests.
 *
 * Covers:
 *  - New user sign-up → workspace creation → app
 *  - Existing user sign-in → app
 *  - Sign-out → landing page
 *  - Session persistence (reload)
 *  - Protected route redirect (/app → /signin)
 *  - Duplicate email error handling
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  signIn,
  signOut,
  APP_CHANNEL_URL_RE,
} from "./helpers";

test.describe("Authentication", () => {
  test("sign-up creates workspace and lands on #general channel", async ({ page }) => {
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

  test("sign-in redirects to workspace channel view", async ({ page }) => {
    const account = newAccount("signin");

    // Create account first
    await signUpAndCreateWorkspace(page, account);
    await signOut(page);

    // Sign back in
    await signIn(page, account);
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE);
    await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
  });

  test("sign-out redirects to landing page", async ({ page }) => {
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

  test("session persists after page reload", async ({ page }) => {
    const account = newAccount("persist");
    await signUpAndCreateWorkspace(page, account);

    // Reload the page
    await page.reload();

    // Should still be authenticated and on a channel
    await expect(page).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
  });

  test("unauthenticated user visiting /app is redirected to /signin", async ({ page }) => {
    await page.goto("/app");

    await expect(page).toHaveURL(/\/signin/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("sign-up with already-registered email shows error", async ({ page }) => {
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
});
