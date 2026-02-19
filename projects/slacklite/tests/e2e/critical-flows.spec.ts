import { expect, test, type Page } from "@playwright/test";

const TEST_PASSWORD = "password123";
const APP_CHANNEL_PATH_PATTERN = /\/app\/channels\/[^/?#]+/;

interface TestAccount {
  email: string;
  password: string;
  workspaceName: string;
}

function buildUniqueSuffix(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}

function createTestAccount(prefix: string): TestAccount {
  const suffix = buildUniqueSuffix();

  return {
    email: `${prefix}-${suffix}@example.com`,
    password: TEST_PASSWORD,
    workspaceName: `Workspace ${suffix}`,
  };
}

function createUniqueChannelName(): string {
  const suffix = buildUniqueSuffix().replace(/[^a-z0-9-]/g, "");
  return `channel-${suffix}`.slice(0, 50);
}

async function signUpAndCreateWorkspace(page: Page, account: TestAccount): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("Email Address").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/create-workspace/);
  await page.getByLabel("Workspace name").fill(account.workspaceName);
  await page.getByRole("button", { name: "Create Workspace" }).click();

  await expect(page).toHaveURL(APP_CHANNEL_PATH_PATTERN);
  await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
}

async function signIn(page: Page, account: TestAccount): Promise<void> {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(APP_CHANNEL_PATH_PATTERN);
}

async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign Out" }).first().click();
  const confirmationDialog = page.getByRole("dialog", { name: "Sign Out" });
  await expect(confirmationDialog).toBeVisible();
  await confirmationDialog.getByRole("button", { name: "Sign Out" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test.describe("Critical User Flows", () => {
  test.use({ baseURL: "http://localhost:3000" });

  test("new user signup flow redirects through workspace creation to app", async ({ page }) => {
    const account = createTestAccount("signup");

    await signUpAndCreateWorkspace(page, account);
    await expect(page.getByRole("heading", { name: /# general/i })).toBeVisible();
  });

  test("existing user login flow redirects to app", async ({ page }) => {
    const account = createTestAccount("login");

    await signUpAndCreateWorkspace(page, account);
    await signOut(page);
    await signIn(page, account);

    await expect(page.getByRole("link", { name: /Channel general/i })).toBeVisible();
  });

  test("channel creation flow creates a new channel and redirects to it", async ({ page }) => {
    const account = createTestAccount("channel");
    const channelName = createUniqueChannelName();

    await signUpAndCreateWorkspace(page, account);
    await page.getByRole("button", { name: "+ New Channel" }).click();
    await page.getByLabel("Name").fill(channelName);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(APP_CHANNEL_PATH_PATTERN);
    await expect(page.getByRole("heading", { name: `# ${channelName}` })).toBeVisible();
    await expect(page.getByRole("link", { name: new RegExp(`Channel ${channelName}`, "i") })).toBeVisible();
  });

  test("message sending flow posts message when Enter is pressed", async ({ page }) => {
    const account = createTestAccount("message");
    const messageText = `E2E message ${Date.now()}`;

    await signUpAndCreateWorkspace(page, account);
    const messageInput = page.getByPlaceholder("Type a message...");
    await messageInput.fill(messageText);
    await messageInput.press("Enter");

    await expect(page.getByText(messageText, { exact: true })).toBeVisible();
  });

  test("sign out flow redirects to landing page after confirmation", async ({ page }) => {
    const account = createTestAccount("signout");

    await signUpAndCreateWorkspace(page, account);
    await signOut(page);

    await expect(page.getByRole("heading", { name: "Lightweight Team Messaging" })).toBeVisible();
  });

  test("protected routes redirect unauthenticated users to signin", async ({ page }) => {
    await page.goto("/app");

    await expect(page).toHaveURL(/\/signin(?:\?|$)/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
