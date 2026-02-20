/**
 * Shared helpers for live-URL Playwright E2E tests.
 *
 * These tests run against the deployed Vercel QA URL and use real Firebase Auth.
 * No emulators, no local dev server.
 */
import { expect, type Page, type BrowserContext, type Browser } from "@playwright/test";

export const TEST_PASSWORD = "Playwright#2026!";
export const APP_CHANNEL_URL_RE = /\/app\/channels\/[^/?#]+/;
export const APP_DM_URL_RE = /\/app\/dms\/[^/?#]+/;

// ---------------------------------------------------------------------------
// Unique ID helpers
// ---------------------------------------------------------------------------

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface TestAccount {
  email: string;
  password: string;
  displayName: string;
  workspaceName: string;
}

export function newAccount(prefix = "test"): TestAccount {
  const id = uid();
  return {
    email: `${prefix}-${id}@slacklite-e2e.dev`,
    password: TEST_PASSWORD,
    displayName: `${prefix}-${id.slice(0, 8)}`,
    workspaceName: `WS-${prefix}-${id.slice(0, 8)}`,
  };
}

export function uniqueChannelName(): string {
  return `ch-${uid().replace(/[^a-z0-9-]/g, "")}`.slice(0, 50);
}

// ---------------------------------------------------------------------------
// Auth flows
// ---------------------------------------------------------------------------

/**
 * Signs up a brand-new account and creates a workspace, ending on the
 * default #general channel page.
 */
export async function signUpAndCreateWorkspace(page: Page, account: TestAccount): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("Email Address").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/create-workspace/, { timeout: 20_000 });
  await page.getByLabel("Workspace name").fill(account.workspaceName);
  await page.getByRole("button", { name: "Create Workspace" }).click();

  await expect(page).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 20_000 });
}

/**
 * Signs in an existing account and waits for the app channel URL.
 */
export async function signIn(page: Page, account: Pick<TestAccount, "email" | "password">): Promise<void> {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(APP_CHANNEL_URL_RE, { timeout: 25_000 });
}

/**
 * Signs out via the button + confirmation dialog.
 */
export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign Out" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Sign Out" });
  await expect(dialog).toBeVisible({ timeout: 5_000 });
  await dialog.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/^\/?$|\/(?!app)/, { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Messaging helpers
// ---------------------------------------------------------------------------

export async function sendMessage(page: Page, text: string): Promise<void> {
  const composer = page.getByPlaceholder("Type a message...");
  await composer.fill(text);
  await composer.press("Enter");
}

export async function waitForMessagingSurface(page: Page): Promise<void> {
  await expect(page.getByPlaceholder("Type a message...")).toBeVisible({ timeout: 15_000 });
}

export function messageRow(page: Page, text: string) {
  return page.locator('[data-testid="virtualized-message-row"]', { hasText: text });
}

// ---------------------------------------------------------------------------
// Channel helpers
// ---------------------------------------------------------------------------

export async function openChannel(page: Page, channelName: string): Promise<void> {
  await page
    .getByRole("link", { name: new RegExp(`Channel ${channelName}`, "i") })
    .click();
  await expect(
    page.getByRole("heading", { name: new RegExp(`# ${channelName}`, "i") })
  ).toBeVisible({ timeout: 10_000 });
  await waitForMessagingSurface(page);
}

// ---------------------------------------------------------------------------
// Multi-context helpers
// ---------------------------------------------------------------------------

export interface UserSession {
  context: BrowserContext;
  page: Page;
}

/**
 * Opens a new browser context, signs in the given account, navigates to path.
 */
export async function openSession(
  browser: Browser,
  account: Pick<TestAccount, "email" | "password">,
  path: string
): Promise<UserSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, account);
  await page.goto(path);
  await waitForMessagingSurface(page);
  return { context, page };
}

// ---------------------------------------------------------------------------
// Accessibility helper (axe-core via addScriptTag)
// ---------------------------------------------------------------------------

export interface AxeResult {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
}

export interface AxeViolation {
  id: string;
  impact: string | null;
  description: string;
  nodes: unknown[];
}

export async function runAxe(page: Page): Promise<AxeResult> {
  const axePath = require.resolve("axe-core");
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => {
    // @ts-ignore — axe injected via addScriptTag
    const r = await window.axe.run(document, {
      rules: {
        // color-contrast requires visual rendering layout APIs not reliable in headless
        "color-contrast": { enabled: false },
      },
    });
    return {
      violations: r.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n: any) => n.target),
      })),
      incomplete: r.incomplete.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n: any) => n.target),
      })),
    };
  });
  return results as AxeResult;
}

export function criticalOrSeriousViolations(result: AxeResult): AxeViolation[] {
  return result.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
}
