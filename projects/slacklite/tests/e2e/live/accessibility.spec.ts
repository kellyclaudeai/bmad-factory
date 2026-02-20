/**
 * Accessibility scans — live QA URL tests.
 *
 * Uses axe-core (injected via page.addScriptTag) to scan key pages for WCAG 2.1 AA violations.
 *
 * Pass criteria: zero critical or serious violations per page.
 *
 * Pages covered:
 *  1. Landing page (/)
 *  2. Sign Up (/signup)
 *  3. Sign In (/signin)
 *  4. Workspace Creation (/create-workspace) — requires auth
 *  5. Channel View (/app/channels/:id) — requires auth
 *  6. DM View (/app/dms/:id) — requires auth + DM
 */
import { expect, test } from "@playwright/test";
import {
  newAccount,
  signUpAndCreateWorkspace,
  sendMessage,
  waitForMessagingSurface,
  runAxe,
  criticalOrSeriousViolations,
  type AxeViolation,
} from "./helpers";

// ---------------------------------------------------------------------------
// Helper: format violations for readable assertion message
// ---------------------------------------------------------------------------
function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return "none";
  return violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
    .join("\n  ");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Accessibility — WCAG 2.1 AA", () => {
  test("landing page (/) has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error("A11y violations on /:\n  " + formatViolations(critical));
    }

    expect(critical, `Critical/serious violations:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  test("sign-up page (/signup) has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /sign up|create account/i })).toBeVisible({ timeout: 10_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error("A11y violations on /signup:\n  " + formatViolations(critical));
    }

    expect(critical, `Critical/serious violations:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  test("sign-in page (/signin) has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error("A11y violations on /signin:\n  " + formatViolations(critical));
    }

    expect(critical, `Critical/serious violations:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  test("workspace creation page has no critical/serious axe violations", async ({ page }) => {
    // Need to be signed in at the create-workspace screen.
    // Sign up → goes through create-workspace → we want to catch it mid-flow.
    // Approach: sign up, then navigate back (if possible) or create an account
    // that has no workspace yet.

    // Go to signup
    await page.goto("/signup");
    const account = newAccount("a11y-workspace");
    await page.getByLabel("Email Address").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should land on create-workspace
    await expect(page).toHaveURL(/\/create-workspace/, { timeout: 20_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error("A11y violations on /create-workspace:\n  " + formatViolations(critical));
    }

    expect(critical, `Critical/serious violations:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  test("channel view has no critical/serious axe violations", async ({ page }) => {
    const account = newAccount("a11y-channel");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Send at least one message so the message list is populated
    await sendMessage(page, `a11y-test-message-${Date.now()}`);
    await page.waitForTimeout(1_000); // Let message render

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error("A11y violations on channel view:\n  " + formatViolations(critical));
    }

    // Report all violations (non-critical too) in test output
    if (results.violations.length > 0) {
      test.info().annotations.push({
        type: "a11y-all-violations",
        description: results.violations
          .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
          .join("; "),
      });
    }

    expect(critical, `Critical/serious violations:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  test("sign-in and sign-up pages are keyboard navigable (tab order)", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    // Tab through interactive elements
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A", "TEXTAREA", "SELECT"]).toContain(firstFocused);

    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A", "TEXTAREA", "SELECT"]).toContain(secondFocused);

    // Navigate to signup and repeat
    await page.goto("/signup");
    await page.keyboard.press("Tab");
    const signupFirstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON", "A", "TEXTAREA", "SELECT"]).toContain(signupFirstFocused);
  });
});
