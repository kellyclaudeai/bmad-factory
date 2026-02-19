import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getDatabase, type Database } from "firebase-admin/database";
import { Timestamp, getFirestore, type Firestore } from "firebase-admin/firestore";

const EMULATOR_PROJECT_ID =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "demo-slacklite";
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
const DATABASE_NAMESPACE =
  process.env.PLAYWRIGHT_FIREBASE_DATABASE_NAMESPACE ?? EMULATOR_PROJECT_ID;
const USER_PASSWORD = "password123";
const ADMIN_APP_NAME = "playwright-messaging-e2e";

interface SeededUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
}

interface SeededWorkspace {
  workspaceId: string;
  generalChannelId: string;
  devTeamChannelId: string;
  users: {
    userA: SeededUser;
    userB: SeededUser;
  };
}

interface SignedInSession {
  context: BrowserContext;
  page: Page;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLoopbackHost(hostWithPort: string): boolean {
  const [host] = hostWithPort.split(":");
  const normalizedHost = host?.trim().toLowerCase() ?? "";

  return normalizedHost === "127.0.0.1" || normalizedHost === "localhost";
}

function assertEmulatorConfiguration(): void {
  const configuredHosts = [AUTH_EMULATOR_HOST, FIRESTORE_EMULATOR_HOST, DATABASE_EMULATOR_HOST];

  if (!configuredHosts.every(isLoopbackHost)) {
    throw new Error(
      "E2E messaging tests must run against local Firebase emulators (localhost / 127.0.0.1)."
    );
  }
}

function configureAdminEmulatorEnvironment(): void {
  process.env.GCLOUD_PROJECT = EMULATOR_PROJECT_ID;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
  process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = DATABASE_EMULATOR_HOST;
}

function getAdminApp(): App {
  configureAdminEmulatorEnvironment();

  const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME);

  if (existingApp) {
    return existingApp;
  }

  return initializeApp(
    {
      projectId: EMULATOR_PROJECT_ID,
      databaseURL: `http://${DATABASE_EMULATOR_HOST}/?ns=${DATABASE_NAMESPACE}`,
    },
    ADMIN_APP_NAME
  );
}

function getAdminServices(): { auth: Auth; firestore: Firestore; database: Database } {
  const app = getAdminApp();

  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    database: getDatabase(app),
  };
}

async function requireOk(response: Response, requestLabel: string): Promise<void> {
  if (response.ok) {
    return;
  }

  const body = await response.text().catch(() => "");
  throw new Error(
    `${requestLabel} failed (${response.status} ${response.statusText}). ${body}`.trim()
  );
}

async function waitForFirebaseEmulators(timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const [authResponse, firestoreResponse, databaseResponse] = await Promise.all([
        fetch(`http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/accounts`),
        fetch(
          `http://${FIRESTORE_EMULATOR_HOST}/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents?pageSize=1`
        ),
        fetch(`http://${DATABASE_EMULATOR_HOST}/.json?ns=${DATABASE_NAMESPACE}`),
      ]);

      if (authResponse.ok && firestoreResponse.ok && databaseResponse.ok) {
        return;
      }
    } catch {
      // Keep retrying until timeout.
    }

    await sleep(250);
  }

  throw new Error("Timed out waiting for Firebase emulators to become ready.");
}

async function resetFirebaseEmulators(): Promise<void> {
  const [authResponse, firestoreResponse, databaseResponse] = await Promise.all([
    fetch(`http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/accounts`, {
      method: "DELETE",
    }),
    fetch(
      `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${EMULATOR_PROJECT_ID}/databases/(default)/documents`,
      {
        method: "DELETE",
      }
    ),
    fetch(`http://${DATABASE_EMULATOR_HOST}/.json?ns=${DATABASE_NAMESPACE}`, {
      method: "DELETE",
    }),
  ]);

  await Promise.all([
    requireOk(authResponse, "Auth emulator reset"),
    requireOk(firestoreResponse, "Firestore emulator reset"),
    requireOk(databaseResponse, "Realtime Database emulator reset"),
  ]);
}

function createRunId(prefix: string): string {
  const normalizedPrefix = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  return `${normalizedPrefix || "e2e"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function createSeedUser(auth: Auth, alias: string, runId: string): Promise<SeededUser> {
  const email = `${alias}+${runId}@example.com`;
  const displayName = `${alias}-${runId.slice(0, 8)}`;
  const userRecord = await auth.createUser({
    email,
    password: USER_PASSWORD,
    displayName,
    emailVerified: true,
  });

  return {
    uid: userRecord.uid,
    email,
    password: USER_PASSWORD,
    displayName,
  };
}

async function seedMessagingWorkspace(prefix: string): Promise<SeededWorkspace> {
  const { auth, firestore, database } = getAdminServices();
  const runId = createRunId(prefix);
  const userA = await createSeedUser(auth, "alpha", runId);
  const userB = await createSeedUser(auth, "bravo", runId);
  const workspaceId = `workspace-${runId}`;
  const generalChannelId = `general-${runId}`;
  const devTeamChannelId = `dev-team-${runId}`;
  const now = Timestamp.now();
  const writeBatch = firestore.batch();

  writeBatch.set(firestore.doc(`workspaces/${workspaceId}`), {
    workspaceId,
    name: `E2E Workspace ${runId}`,
    ownerId: userA.uid,
    createdAt: now,
  });

  for (const user of [userA, userB]) {
    writeBatch.set(firestore.doc(`users/${user.uid}`), {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      workspaceId,
      createdAt: now,
      isOnline: false,
      lastSeenAt: now,
    });
  }

  writeBatch.set(firestore.doc(`workspaces/${workspaceId}/channels/${generalChannelId}`), {
    channelId: generalChannelId,
    workspaceId,
    name: "general",
    createdBy: userA.uid,
    createdAt: now,
    messageCount: 0,
    lastMessageAt: null,
  });

  writeBatch.set(firestore.doc(`workspaces/${workspaceId}/channels/${devTeamChannelId}`), {
    channelId: devTeamChannelId,
    workspaceId,
    name: "dev-team",
    createdBy: userA.uid,
    createdAt: now,
    messageCount: 0,
    lastMessageAt: null,
  });

  await writeBatch.commit();

  await database.ref(`users/${userA.uid}`).set({ workspaceId });
  await database.ref(`users/${userB.uid}`).set({ workspaceId });

  return {
    workspaceId,
    generalChannelId,
    devTeamChannelId,
    users: {
      userA,
      userB,
    },
  };
}

async function signIn(page: Page, user: SeededUser): Promise<void> {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);

  await Promise.all([
    page.waitForURL(/\/app(\/.*)?$/, { timeout: 20_000 }),
    page.getByRole("button", { name: "Sign In" }).click(),
  ]);
}

async function waitForMessagingSurface(page: Page): Promise<void> {
  await expect(page.getByPlaceholder("Type a message...")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Loading messages...")).toHaveCount(0);
}

async function openSignedInSession(
  browser: Browser,
  user: SeededUser,
  targetPath: string
): Promise<SignedInSession> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, user);
  await page.goto(targetPath);
  await waitForMessagingSurface(page);

  return { context, page };
}

function messageRow(page: Page, messageText: string) {
  return page.locator('[data-testid="virtualized-message-row"]', {
    hasText: messageText,
  });
}

async function sendMessage(page: Page, messageText: string): Promise<void> {
  const composer = page.getByPlaceholder("Type a message...");
  await composer.fill(messageText);
  await composer.press("Enter");
}

async function openChannel(page: Page, channelName: string): Promise<void> {
  await page
    .getByRole("link", { name: new RegExp(`Channel ${escapeRegExp(channelName)}`, "i") })
    .click();
  await expect(
    page.getByRole("heading", { name: new RegExp(`# ${escapeRegExp(channelName)}`, "i") })
  ).toBeVisible();
  await waitForMessagingSurface(page);
}

test.describe("Real-Time Messaging", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    assertEmulatorConfiguration();
    await waitForFirebaseEmulators();
  });

  test.beforeEach(async () => {
    await resetFirebaseEmulators();
  });

  test("sends message and displays optimistic UI immediately", async ({ browser }) => {
    const scenario = await seedMessagingWorkspace("optimistic-ui");
    const session = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );

    try {
      const messageText = `optimistic-message-${Date.now()}`;
      const sendStartedAt = Date.now();
      await sendMessage(session.page, messageText);
      await expect(messageRow(session.page, messageText)).toBeVisible({ timeout: 400 });
      const optimisticUiLatencyMs = Date.now() - sendStartedAt;
      expect(optimisticUiLatencyMs).toBeLessThan(400);

      await expect(messageRow(session.page, messageText).getByText("Sending...")).toBeHidden({
        timeout: 2_000,
      });
    } finally {
      await session.context.close();
    }
  });

  test("delivers message to another user in less than 500ms", async ({ browser }) => {
    const scenario = await seedMessagingWorkspace("delivery-latency");
    const sessionA = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );
    const sessionB = await openSignedInSession(
      browser,
      scenario.users.userB,
      `/app/channels/${scenario.generalChannelId}`
    );

    try {
      const messageText = `latency-check-${Date.now()}`;
      const sendStartedAt = Date.now();
      await sendMessage(sessionA.page, messageText);
      await expect(messageRow(sessionB.page, messageText)).toBeVisible({ timeout: 500 });
      const deliveryLatencyMs = Date.now() - sendStartedAt;
      expect(deliveryLatencyMs).toBeLessThan(500);
    } finally {
      await Promise.all([sessionA.context.close(), sessionB.context.close()]);
    }
  });

  test("channel switching loads the correct messages", async ({ browser }) => {
    const scenario = await seedMessagingWorkspace("channel-switching");
    const session = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );

    try {
      const generalMessageText = `general-message-${Date.now()}`;
      await sendMessage(session.page, generalMessageText);
      await expect(messageRow(session.page, generalMessageText)).toBeVisible();

      await openChannel(session.page, "dev-team");
      await expect(messageRow(session.page, generalMessageText)).toHaveCount(0);

      const devMessageText = `dev-team-message-${Date.now()}`;
      await sendMessage(session.page, devMessageText);
      await expect(messageRow(session.page, devMessageText)).toBeVisible();

      await openChannel(session.page, "general");
      await expect(messageRow(session.page, generalMessageText)).toBeVisible();
      await expect(messageRow(session.page, devMessageText)).toHaveCount(0);
    } finally {
      await session.context.close();
    }
  });

  test("unread counts update in real-time and clear after opening the channel", async ({
    browser,
  }) => {
    const scenario = await seedMessagingWorkspace("unread-counts");
    const sessionA = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );
    const sessionB = await openSignedInSession(
      browser,
      scenario.users.userB,
      `/app/channels/${scenario.devTeamChannelId}`
    );

    try {
      const unreadMessage = `unread-check-${Date.now()}`;
      await sendMessage(sessionB.page, unreadMessage);
      const unreadLink = sessionA.page.getByRole("link", {
        name: /Channel dev-team,\s*1 unread messages/i,
      });
      await expect(unreadLink).toBeVisible({ timeout: 5_000 });

      await openChannel(sessionA.page, "dev-team");
      await expect(
        sessionA.page.getByRole("link", {
          name: /Channel dev-team,\s*1 unread messages/i,
        })
      ).toHaveCount(0);
      await expect(messageRow(sessionA.page, unreadMessage)).toBeVisible();
    } finally {
      await Promise.all([sessionA.context.close(), sessionB.context.close()]);
    }
  });

  test("creates a channel and sends the first message", async ({ browser }) => {
    const scenario = await seedMessagingWorkspace("create-channel");
    const session = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );

    try {
      const channelName = `new-channel-${Date.now().toString(36)}`;
      await session.page.getByRole("button", { name: /\+ New Channel/i }).click();
      await session.page.getByLabel("Name").fill(channelName);
      await session.page.getByRole("button", { name: "Create", exact: true }).click();

      await expect(
        session.page.getByRole("heading", {
          name: new RegExp(`# ${escapeRegExp(channelName)}`, "i"),
        })
      ).toBeVisible({ timeout: 10_000 });
      await waitForMessagingSurface(session.page);

      const messageText = `first-message-${Date.now()}`;
      await sendMessage(session.page, messageText);
      await expect(messageRow(session.page, messageText)).toBeVisible();
    } finally {
      await session.context.close();
    }
  });

  test("sends direct messages end-to-end between two users", async ({ browser }) => {
    const scenario = await seedMessagingWorkspace("direct-messages");
    const sessionA = await openSignedInSession(
      browser,
      scenario.users.userA,
      `/app/channels/${scenario.generalChannelId}`
    );
    const sessionB = await openSignedInSession(
      browser,
      scenario.users.userB,
      `/app/channels/${scenario.generalChannelId}`
    );

    try {
      await sessionA.page.getByRole("button", { name: scenario.users.userB.displayName }).click();
      await sessionA.page.waitForURL(/\/app\/dms\/[^/]+$/, { timeout: 10_000 });
      await waitForMessagingSurface(sessionA.page);

      const dmId = new URL(sessionA.page.url()).pathname.split("/").pop() ?? "";
      expect(dmId).not.toHaveLength(0);

      const dmLinkForUserB = sessionB.page.getByRole("link", {
        name: new RegExp(escapeRegExp(scenario.users.userA.displayName), "i"),
      });
      await expect(dmLinkForUserB).toBeVisible({ timeout: 10_000 });
      await dmLinkForUserB.click();
      await sessionB.page.waitForURL(new RegExp(`/app/dms/${escapeRegExp(dmId)}`), {
        timeout: 10_000,
      });
      await waitForMessagingSurface(sessionB.page);

      const dmMessageText = `dm-message-${Date.now()}`;
      await sendMessage(sessionA.page, dmMessageText);
      await expect(messageRow(sessionB.page, dmMessageText)).toBeVisible({ timeout: 5_000 });
    } finally {
      await Promise.all([sessionA.context.close(), sessionB.context.close()]);
    }
  });
});
