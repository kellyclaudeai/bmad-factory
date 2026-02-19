import { defineConfig } from "@playwright/test";

const PLAYWRIGHT_FIREBASE_PROJECT_ID =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ?? "demo-slacklite";
const PLAYWRIGHT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ??
  "127.0.0.1:9099";
const FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST ??
  process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST ??
  "127.0.0.1:8080";
const DATABASE_EMULATOR_HOST =
  process.env.FIREBASE_DATABASE_EMULATOR_HOST ??
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST ??
  "127.0.0.1:9000";

process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID = PLAYWRIGHT_FIREBASE_PROJECT_ID;
process.env.PLAYWRIGHT_FIREBASE_DATABASE_NAMESPACE = PLAYWRIGHT_FIREBASE_PROJECT_ID;

process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "true";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
  "AIzaSyDUMMY_KEY_FOR_PLAYWRIGHT_E2E_TESTS_123456";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
  `${PLAYWRIGHT_FIREBASE_PROJECT_ID}.firebaseapp.com`;
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? PLAYWRIGHT_FIREBASE_PROJECT_ID;
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
  `${PLAYWRIGHT_FIREBASE_PROJECT_ID}.appspot.com`;
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1234567890";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID =
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1234567890:web:playwrighte2e";
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
  `https://${PLAYWRIGHT_FIREBASE_PROJECT_ID}.firebaseio.com`;

process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST = DATABASE_EMULATOR_HOST;

process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
process.env.FIREBASE_DATABASE_EMULATOR_HOST = DATABASE_EMULATOR_HOST;
process.env.SKIP_AUTH_MIDDLEWARE = "true";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "pnpm build && pnpm start -- --port 3000",
    url: PLAYWRIGHT_BASE_URL,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
    },
  },
});
