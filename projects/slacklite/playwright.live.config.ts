/**
 * Playwright config for running E2E tests against the deployed QA URL.
 * Does NOT start a dev server or use Firebase emulators.
 */
import { defineConfig } from "@playwright/test";

const QA_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  "https://slacklite-r3vwdr5la-kelly-1224s-projects.vercel.app";

export default defineConfig({
  testDir: "./tests/e2e/live",
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/e2e-html-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
  ],
  use: {
    baseURL: QA_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  // No webServer — tests run against the pre-deployed QA URL.
});
