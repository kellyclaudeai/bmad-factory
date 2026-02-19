import { expect, test, type Browser, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { deleteApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getDatabase, type Database } from "firebase-admin/database";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID?.trim() ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
  "slacklite-prod";

const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim() || "127.0.0.1:9099";
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST?.trim() || "127.0.0.1:8080";
const DATABASE_EMULATOR_HOST =
  process.env.FIREBASE_DATABASE_EMULATOR_HOST?.trim() || "127.0.0.1:9000";
const DATABASE_NAMESPACE =
  process.env.PLAYWRIGHT_FIREBASE_DATABASE_NAMESPACE?.trim() || FIREBASE_PROJECT_ID;

const ADMIN_APP_NAME = "unread-counts-e2e";
const TEST_PASSWORD = "password123";
const WORKSPACE_ID = "workspace-unread-e2e";
const GENERAL_CHANNEL_ID = "general";
const DEV_TEAM_CHANNEL_ID = "dev-team";
const DIRECT_MESSAGE_ID = "dm-usera-userb";
const OTHER_USER_LABEL = "userb";

const USER_A = {
  uid: "e2e-user-a",
  email: "usera@test.com",
  displayName: "usera",
};

const USER_B = {
  uid: "e2e-user-b",
  email: "userb@test.com",
  displayName: OTHER_USER_LABEL,
};

interface UserSession {
  context: BrowserContext;
  page: Page;
}

let adminApp: App;
let adminAuth: Auth;
let adminFirestore: Firestore;
let adminDatabase: Database;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function channelLink(page: Page, channelName: string): Locator {
  return page.getByRole("link", {
    name: new RegExp(`^Channel ${escapeRegExp(channelName)}(?:, \\d+ unread messages)?$`),
  });
}

function channelBadge(page: Page, channelName: string): Locator {
  return channelLink(page, channelName).locator("span.bg-primary-brand.text-white.rounded-full");
}

function directMessageLink(page: Page, otherUserLabel: string): Locator {
  return page
    .locator('section[aria-labelledby="dms-title"]')
    .locator("a", { hasText: otherUserLabel });
}

function directMessageBadge(page: Page, otherUserLabel: string): Locator {
  return directMessageLink(page, otherUserLabel).locator(
    "span.bg-primary-brand.text-white.rounded-full",
  );
}

async function readBadgeCount(badge: Locator): Promise<number> {
  if ((await badge.count()) === 0) {
    return 0;
  }

  const value = Number.parseInt((await badge.first().innerText()).trim(), 10);
  return Number.isFinite(value) ? value : 0;
}

async function readChannelUnreadCount(page: Page, channelName: string): Promise<number> {
  return readBadgeCount(channelBadge(page, channelName));
}

async function readDirectMessageUnreadCount(page: Page, otherUserLabel: string): Promise<number> {
  return readBadgeCount(directMessageBadge(page, otherUserLabel));
}

async function closeSessions(sessions: UserSession[]): Promise<void> {
  await Promise.all(
    sessions.map(async (session) => {
      await session.context.close();
    }),
  );
}

async function signInAs(browser: Browser, email: string): Promise<UserSession> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(TEST_PASSWORD);

  await Promise.all([
    page.waitForURL("**/app/**"),
    page.getByRole("button", { name: "Sign In" }).click(),
  ]);

  await expect(channelLink(page, "general")).toBeVisible();
  await expect(channelLink(page, "dev-team")).toBeVisible();

  return {
    context,
    page,
  };
}

async function openChannel(page: Page, channelName: string, channelId: string): Promise<void> {
  await channelLink(page, channelName).click();
  await expect(page).toHaveURL(new RegExp(`/app/channels/${escapeRegExp(channelId)}$`));
}

async function openDirectMessage(page: Page, dmId: string): Promise<void> {
  await page.goto(`/app/dms/${dmId}`);
  await expect(page).toHaveURL(new RegExp(`/app/dms/${escapeRegExp(dmId)}$`));
  await expect(page.getByPlaceholder("Type a message...")).toBeVisible();
}

async function sendMessage(page: Page, text: string): Promise<void> {
  const messageInput = page.getByPlaceholder("Type a message...");
  await expect(messageInput).toBeVisible();
  await messageInput.fill(text);
  await messageInput.press("Enter");
  await expect(page.getByText(text)).toBeVisible();
}

async function retry<T>(fn: () => Promise<T>, attempts = 30, delayMs = 200): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

async function clearAuthEmulator(): Promise<void> {
  const response = await fetch(
    `http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to clear Auth emulator state. HTTP ${response.status}`);
  }
}

async function clearFirestoreEmulator(): Promise<void> {
  const response = await fetch(
    `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to clear Firestore emulator state. HTTP ${response.status}`);
  }
}

async function clearDatabaseEmulator(): Promise<void> {
  await adminDatabase.ref("/").set(null);
}

async function resetEmulatorState(): Promise<void> {
  await retry(async () => {
    await clearFirestoreEmulator();
  });
  await retry(async () => {
    await clearAuthEmulator();
  });
  await retry(async () => {
    await clearDatabaseEmulator();
  });
}

async function seedTestUsers(): Promise<void> {
  await adminAuth.createUser({
    uid: USER_A.uid,
    email: USER_A.email,
    password: TEST_PASSWORD,
    displayName: USER_A.displayName,
  });

  await adminAuth.createUser({
    uid: USER_B.uid,
    email: USER_B.email,
    password: TEST_PASSWORD,
    displayName: USER_B.displayName,
  });
}

async function seedWorkspaceChannelsAndUsers(): Promise<void> {
  await adminFirestore.doc(`workspaces/${WORKSPACE_ID}`).set({
    workspaceId: WORKSPACE_ID,
    name: "Unread Count QA Workspace",
    ownerId: USER_A.uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  await adminFirestore.doc(`workspaces/${WORKSPACE_ID}/channels/${GENERAL_CHANNEL_ID}`).set({
    channelId: GENERAL_CHANNEL_ID,
    workspaceId: WORKSPACE_ID,
    name: "general",
    createdBy: USER_A.uid,
    createdAt: FieldValue.serverTimestamp(),
    lastMessageAt: null,
    messageCount: 0,
  });

  await adminFirestore.doc(`workspaces/${WORKSPACE_ID}/channels/${DEV_TEAM_CHANNEL_ID}`).set({
    channelId: DEV_TEAM_CHANNEL_ID,
    workspaceId: WORKSPACE_ID,
    name: "dev-team",
    createdBy: USER_A.uid,
    createdAt: FieldValue.serverTimestamp(),
    lastMessageAt: null,
    messageCount: 0,
  });

  await adminFirestore.doc(`users/${USER_A.uid}`).set({
    userId: USER_A.uid,
    email: USER_A.email,
    displayName: USER_A.displayName,
    workspaceId: WORKSPACE_ID,
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    isOnline: true,
  });

  await adminFirestore.doc(`users/${USER_B.uid}`).set({
    userId: USER_B.uid,
    email: USER_B.email,
    displayName: USER_B.displayName,
    workspaceId: WORKSPACE_ID,
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
    isOnline: true,
  });

  await adminFirestore.doc(`workspaces/${WORKSPACE_ID}/directMessages/${DIRECT_MESSAGE_ID}`).set({
    dmId: DIRECT_MESSAGE_ID,
    workspaceId: WORKSPACE_ID,
    userIds: [USER_A.uid, USER_B.uid].sort(),
    createdAt: FieldValue.serverTimestamp(),
    lastMessageAt: null,
  });
}

async function seedRealtimeDatabaseMembership(): Promise<void> {
  await adminDatabase.ref(`users/${USER_A.uid}`).set({
    workspaceId: WORKSPACE_ID,
  });
  await adminDatabase.ref(`users/${USER_B.uid}`).set({
    workspaceId: WORKSPACE_ID,
  });
}

async function seedUnreadCountFixture(): Promise<void> {
  await seedTestUsers();
  await seedWorkspaceChannelsAndUsers();
  await seedRealtimeDatabaseMembership();
}

test.describe("Story 6.4.1 - Unread count accuracy", () => {
  test.describe.configure({ mode: "serial" });

  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Shared emulator-state E2E suite runs in Chromium only.",
  );

  test.beforeAll(async () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
    process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = DATABASE_EMULATOR_HOST;

    const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME);
    adminApp =
      existingApp ??
      initializeApp(
        {
          projectId: FIREBASE_PROJECT_ID,
          databaseURL: `http://${DATABASE_EMULATOR_HOST}?ns=${DATABASE_NAMESPACE}`,
        },
        ADMIN_APP_NAME,
      );
    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);
    adminDatabase = getDatabase(adminApp);
  });

  test.afterAll(async () => {
    if (!adminApp) {
      return;
    }

    await deleteApp(adminApp);
  });

  test.beforeEach(async () => {
    await resetEmulatorState();
    await seedUnreadCountFixture();
  });

  test("Scenario 1: basic unread count increment and clear on channel switch", async ({
    browser,
  }) => {
    const sessions: UserSession[] = [];

    try {
      const userASession = await signInAs(browser, USER_A.email);
      sessions.push(userASession);
      const userBSession = await signInAs(browser, USER_B.email);
      sessions.push(userBSession);

      await openChannel(userASession.page, "general", GENERAL_CHANNEL_ID);
      await openChannel(userBSession.page, "dev-team", DEV_TEAM_CHANNEL_ID);

      await userASession.page.waitForTimeout(150);
      await sendMessage(
        userBSession.page,
        `scenario-1-${Date.now()} basic unread increment check`,
      );

      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "dev-team"))
        .toBe(1);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "general"))
        .toBe(0);

      await openChannel(userASession.page, "dev-team", DEV_TEAM_CHANNEL_ID);
      const clearStartedAt = Date.now();
      await expect(channelBadge(userASession.page, "dev-team")).toHaveCount(0, {
        timeout: 200,
      });
      expect(Date.now() - clearStartedAt).toBeLessThanOrEqual(200);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "dev-team"))
        .toBe(0);
    } finally {
      await closeSessions(sessions);
    }
  });

  test("Scenario 2: unread count increments for multiple messages", async ({ browser }) => {
    const sessions: UserSession[] = [];

    try {
      const userASession = await signInAs(browser, USER_A.email);
      sessions.push(userASession);
      const userBSession = await signInAs(browser, USER_B.email);
      sessions.push(userBSession);

      await openChannel(userASession.page, "general", GENERAL_CHANNEL_ID);
      await openChannel(userBSession.page, "dev-team", DEV_TEAM_CHANNEL_ID);

      await userASession.page.waitForTimeout(150);

      for (let messageIndex = 1; messageIndex <= 3; messageIndex += 1) {
        await sendMessage(
          userBSession.page,
          `scenario-2-${Date.now()} unread burst ${messageIndex}`,
        );
      }

      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "dev-team"))
        .toBe(3);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "general"))
        .toBe(0);
    } finally {
      await closeSessions(sessions);
    }
  });

  test("Scenario 3: unread count does not increment for active channel", async ({ browser }) => {
    const sessions: UserSession[] = [];

    try {
      const userASession = await signInAs(browser, USER_A.email);
      sessions.push(userASession);
      const userBSession = await signInAs(browser, USER_B.email);
      sessions.push(userBSession);

      await openChannel(userASession.page, "dev-team", DEV_TEAM_CHANNEL_ID);
      await openChannel(userBSession.page, "dev-team", DEV_TEAM_CHANNEL_ID);

      await userASession.page.waitForTimeout(150);
      const messageText = `scenario-3-${Date.now()} active channel should stay unread=0`;
      await sendMessage(userBSession.page, messageText);
      await expect(userASession.page.getByText(messageText)).toBeVisible();

      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "dev-team"))
        .toBe(0);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "general"))
        .toBe(0);
    } finally {
      await closeSessions(sessions);
    }
  });

  test("Scenario 4: direct message unread count increment and clear", async ({ browser }) => {
    const sessions: UserSession[] = [];

    try {
      const userASession = await signInAs(browser, USER_A.email);
      sessions.push(userASession);
      const userBSession = await signInAs(browser, USER_B.email);
      sessions.push(userBSession);

      await openChannel(userASession.page, "general", GENERAL_CHANNEL_ID);
      await expect(directMessageLink(userASession.page, OTHER_USER_LABEL)).toBeVisible();
      await userASession.page.waitForTimeout(150);

      await openDirectMessage(userBSession.page, DIRECT_MESSAGE_ID);
      await sendMessage(
        userBSession.page,
        `scenario-4-${Date.now()} dm unread increment check`,
      );

      await expect
        .poll(() => readDirectMessageUnreadCount(userASession.page, OTHER_USER_LABEL))
        .toBe(1);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "general"))
        .toBe(0);
      await expect
        .poll(() => readChannelUnreadCount(userASession.page, "dev-team"))
        .toBe(0);

      await directMessageLink(userASession.page, OTHER_USER_LABEL).click();
      await expect(userASession.page).toHaveURL(
        new RegExp(`/app/dms/${escapeRegExp(DIRECT_MESSAGE_ID)}$`),
      );
      const clearStartedAt = Date.now();
      await expect(directMessageBadge(userASession.page, OTHER_USER_LABEL)).toHaveCount(0, {
        timeout: 200,
      });
      expect(Date.now() - clearStartedAt).toBeLessThanOrEqual(200);
      await expect
        .poll(() => readDirectMessageUnreadCount(userASession.page, OTHER_USER_LABEL))
        .toBe(0);
    } finally {
      await closeSessions(sessions);
    }
  });
});
