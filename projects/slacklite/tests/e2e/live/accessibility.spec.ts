/**
 * Accessibility scans — live QA URL tests (v2).
 *
 * Uses axe-core (injected via page.addScriptTag) to scan key pages for WCAG 2.1 AA violations.
 *
 * v2 note: Oxide Dark introduces very dark backgrounds. Color-contrast rule is disabled
 * in headless because it's unreliable without layout APIs. A separate visual QA pass
 * with real browsers should verify contrast ratios against the Oxide Dark palette.
 *
 * Pass criteria: zero critical or serious violations per page.
 *
 * Pages covered:
 *  A11Y-01: Landing page (/)
 *  A11Y-02: Sign Up (/signup)
 *  A11Y-03: Sign In (/signin)
 *  A11Y-04: Workspace Creation (/create-workspace) — requires auth
 *  A11Y-05: Channel View (/app/channels/:id) — requires auth
 *  A11Y-06: Keyboard navigation on sign-in/sign-up pages
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
  // -------------------------------------------------------------------------
  // A11Y-01: Landing page
  // -------------------------------------------------------------------------
  test("A11Y-01 landing page (/) has no critical/serious axe violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error(`A11y violations on /:\n  ${formatViolations(critical)}`);
    }

    expect(critical, `Critical/serious violations on /:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // A11Y-02: Sign-up page
  // -------------------------------------------------------------------------
  test("A11Y-02 sign-up page (/signup) has no critical/serious axe violations", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /sign up|create account/i })
    ).toBeVisible({ timeout: 10_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error(`A11y violations on /signup:\n  ${formatViolations(critical)}`);
    }

    expect(critical, `Critical/serious violations on /signup:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // A11Y-03: Sign-in page
  // -------------------------------------------------------------------------
  test("A11Y-03 sign-in page (/signin) has no critical/serious axe violations", async ({
    page,
  }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error(`A11y violations on /signin:\n  ${formatViolations(critical)}`);
    }

    expect(critical, `Critical/serious violations on /signin:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // A11Y-04: Create workspace page
  // -------------------------------------------------------------------------
  test("A11Y-04 workspace creation page has no critical/serious axe violations", async ({
    page,
  }) => {
    // Sign up → lands on create-workspace — scan before workspace is created
    await page.goto("/signup");
    const account = newAccount("a11y-workspace");
    await page.getByLabel("Email Address").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/create-workspace/, { timeout: 20_000 });

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error(`A11y violations on /create-workspace:\n  ${formatViolations(critical)}`);
    }

    expect(critical, `Critical/serious violations on /create-workspace:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // A11Y-05: Channel view (authenticated)
  // -------------------------------------------------------------------------
  test("A11Y-05 channel view has no critical/serious axe violations", async ({ page }) => {
    const account = newAccount("a11y-channel");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Populate with a message so the list is not empty
    await sendMessage(page, `a11y-test-msg-${Date.now()}`);
    await page.waitForTimeout(1_000);

    const results = await runAxe(page);
    const critical = criticalOrSeriousViolations(results);

    if (critical.length > 0) {
      console.error(`A11y violations on channel view:\n  ${formatViolations(critical)}`);
    }

    // Annotate all violations (including non-critical) for reporting
    if (results.violations.length > 0) {
      test.info().annotations.push({
        type: "a11y-all-violations",
        description: results.violations
          .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
          .join("; "),
      });
    }

    expect(critical, `Critical/serious violations on channel view:\n  ${formatViolations(critical)}`).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // A11Y-06: Keyboard navigation (sign-in and sign-up pages)
  // -------------------------------------------------------------------------
  test("A11Y-06 sign-in page is keyboard navigable (interactive elements reachable via Tab)", async ({
    page,
  }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 10_000 });

    // Tab through interactive elements — focus must land on form fields/buttons
    const interactiveTags = ["INPUT", "BUTTON", "A", "TEXTAREA", "SELECT"];

    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(
      interactiveTags,
      `First Tab press should focus an interactive element, got: ${firstFocused}`
    ).toContain(firstFocused);

    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(
      interactiveTags,
      `Second Tab press should focus an interactive element, got: ${secondFocused}`
    ).toContain(secondFocused);

    // Verify focus ring is visible (Oxide Dark uses emerald focus ring)
    const focusedElement = page.locator(":focus");
    const focusRingStyle = await focusedElement.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
      };
    }).catch(() => null);

    if (focusRingStyle) {
      console.log(`[a11y] Focus ring style on /signin:`, focusRingStyle);
      // Focus indicator must be visible (outline or box-shadow present)
      const hasVisibleFocusIndicator =
        (focusRingStyle.outlineWidth && focusRingStyle.outlineWidth !== "0px") ||
        (focusRingStyle.boxShadow && focusRingStyle.boxShadow !== "none");

      expect(
        hasVisibleFocusIndicator,
        `Focused element on /signin has no visible focus ring. ` +
        `Oxide Dark should show emerald focus rings for keyboard users. ` +
        `Got: outline=${focusRingStyle.outlineWidth} ${focusRingStyle.outlineColor}, shadow=${focusRingStyle.boxShadow}`
      ).toBe(true);
    }
  });

  test("A11Y-06b sign-up page is keyboard navigable", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /sign up|create account/i })
    ).toBeVisible({ timeout: 10_000 });

    const interactiveTags = ["INPUT", "BUTTON", "A", "TEXTAREA", "SELECT"];

    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(
      interactiveTags,
      `Tab on /signup should focus an interactive element, got: ${focused}`
    ).toContain(focused);
  });

  // -------------------------------------------------------------------------
  // A11Y-BONUS: Verify dark-mode doesn't introduce ARIA landmark gaps
  // -------------------------------------------------------------------------
  test("A11Y-BONUS authenticated channel view has proper ARIA landmarks", async ({ page }) => {
    const account = newAccount("a11y-landmarks");
    await signUpAndCreateWorkspace(page, account);
    await waitForMessagingSurface(page);

    // Check for key ARIA landmarks
    const landmarkCounts = await page.evaluate(() => {
      return {
        main: document.querySelectorAll('[role="main"], main').length,
        nav: document.querySelectorAll('[role="navigation"], nav').length,
        banner: document.querySelectorAll('[role="banner"], header').length,
        complementary: document.querySelectorAll('[role="complementary"], aside').length,
      };
    });

    console.log(`[a11y] ARIA landmark counts:`, landmarkCounts);

    // At minimum, a `main` landmark should be present
    expect(
      landmarkCounts.main,
      `Page should have at least one <main> or role="main" element for screen reader navigation`
    ).toBeGreaterThanOrEqual(1);
  });
});
