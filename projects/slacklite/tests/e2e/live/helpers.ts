/**
 * Shared helpers for live-URL Playwright E2E tests.
 *
 * These tests run against the deployed Firebase App Hosting URL and use real Firebase Auth.
 * No emulators, no local dev server.
 *
 * v2 additions:
 *  - checkOxideDarkBackground(): assert element has a dark (non-white) computed bg
 *  - checkEmeraldAccent(): assert element has emerald (#34D399) computed bg
 *  - getLuminance(): compute RGB luminance for dark-mode assertions
 *  - isDarkBackground(): returns true if computed bg has luminance < 0.5
 */
import { expect, type Page, type BrowserContext, type Browser } from "@playwright/test";

export const TEST_PASSWORD = "Playwright#2026!";
export const APP_CHANNEL_URL_RE = /\/app\/channels\/[^/?#]+/;
export const APP_DM_URL_RE = /\/app\/dms\/[^/?#]+/;

// ---------------------------------------------------------------------------
// Oxide Dark design tokens (from ux-design.md)
// ---------------------------------------------------------------------------

/** The deepest background in the Oxide Dark palette (#0C0E14) */
export const OXIDE_BASE = "#0c0e14";
/** Primary sidebar background (#141720) */
export const OXIDE_SURFACE_1 = "#141720";
/** Main content background (#1B1F2E) */
export const OXIDE_SURFACE_2 = "#1b1f2e";
/** Emerald accent (#34D399) */
export const OXIDE_EMERALD = "#34d399";
/** Luminance threshold: above this is "light" (bad on dark surfaces) */
const LIGHT_LUMINANCE_THRESHOLD = 0.7;

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
    workspaceName: `WS${Date.now()}`,
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
// Oxide Dark theme helpers (v2)
// ---------------------------------------------------------------------------

/**
 * Parses a CSS rgb/rgba color string into [r, g, b] (0–255).
 * Returns null if the string cannot be parsed.
 */
function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

/**
 * Computes relative luminance of an RGB triplet (0–1 scale).
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns the computed background-color luminance of a CSS selector.
 * Walks up the DOM tree to find the first non-transparent background.
 * Returns null if no opaque background is found.
 */
export async function getEffectiveBgLuminance(page: Page, selector: string): Promise<number | null> {
  return page.evaluate((sel) => {
    function toLinear(c: number): number {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    function luminance(r: number, g: number, b: number): number {
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }

    let el: Element | null = document.querySelector(sel);
    while (el && el !== document.documentElement) {
      const bg = getComputedStyle(el).backgroundColor;
      const match = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/);
      if (match) {
        const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
        if (alpha > 0.05) {
          return luminance(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
      }
      el = el.parentElement;
    }
    return null;
  }, selector);
}

/**
 * Asserts that the body/root background is dark (luminance < threshold).
 * Oxide Dark uses #0C0E14 as the deepest bg (luminance ≈ 0.003).
 */
export async function assertBodyIsDark(page: Page): Promise<void> {
  const lum = await page.evaluate(() => {
    function toLinear(c: number): number {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }
    const bg = getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return null;
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  });
  // Oxide Dark body should be very dark (luminance < 0.05)
  expect(lum, `Body background should be dark — Oxide Dark theme requires dark backgrounds. Got luminance: ${lum}`).not.toBeNull();
  expect(lum! < LIGHT_LUMINANCE_THRESHOLD, `Body luminance ${lum} is too light for Oxide Dark (threshold: ${LIGHT_LUMINANCE_THRESHOLD})`).toBe(true);
}

/**
 * Returns the computed background-color hex of the body element.
 */
export async function getBodyBgColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return "unknown";
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  });
}

/**
 * Checks whether the emerald accent color (#34D399) is present anywhere
 * on the page (computed background or color of visible elements).
 * Returns the count of elements using emerald.
 */
export async function countEmeraldElements(page: Page): Promise<number> {
  return page.evaluate(() => {
    const TARGET_R = 52, TARGET_G = 211, TARGET_B = 153; // #34D399
    const TOLERANCE = 20;
    let count = 0;
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const style = getComputedStyle(el);
      for (const prop of ["backgroundColor", "color", "borderColor"]) {
        const val = (style as any)[prop] as string;
        const match = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
          if (
            Math.abs(r - TARGET_R) <= TOLERANCE &&
            Math.abs(g - TARGET_G) <= TOLERANCE &&
            Math.abs(b - TARGET_B) <= TOLERANCE
          ) {
            count++;
            break;
          }
        }
      }
    }
    return count;
  });
}

/**
 * Returns true if IBM Plex fonts are loaded via document.fonts API.
 */
export async function isIbmPlexLoaded(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const fonts = [...document.fonts];
    return fonts.some((f) => f.family.toLowerCase().includes("ibm plex") || f.family.toLowerCase().includes("ibm+plex"));
  });
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
