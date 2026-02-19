// @vitest-environment node

import { readFileSync } from "node:fs";
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { get, ref, set } from "firebase/database";

const USER_ID = "user-1";
const WORKSPACE_ID = "workspace-1";
const OTHER_WORKSPACE_ID = "workspace-2";
const CHANNEL_ID = "channel-1";

const rules = readFileSync("database.rules.json", "utf8");

const baseMessage = {
  userId: USER_ID,
  userName: "Test User",
  text: "Hello world",
  timestamp: 1700000000000,
};

let testEnv: RulesTestEnvironment;

function messagePath(workspaceId: string, channelId: string, messageId: string): string {
  return `messages/${workspaceId}/${channelId}/${messageId}`;
}

async function seedWorkspaceMembership(userId: string, workspaceId: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), `users/${userId}`), { workspaceId });
  });
}

async function seedMessage(
  workspaceId: string,
  channelId: string,
  messageId: string,
  message = baseMessage,
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), messagePath(workspaceId, channelId, messageId)), message);
  });
}

describe("Realtime Database security rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "slacklite-rtdb-security-rules",
      database: { rules },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearDatabase();
  });

  it("allows users to write messages to channels in their workspace", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    const db = testEnv.authenticatedContext(USER_ID).database();

    await assertSucceeds(set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-own-write")), baseMessage));
  });

  it("denies users from writing messages to channels in another workspace", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    const db = testEnv.authenticatedContext(USER_ID).database();

    await assertFails(
      set(ref(db, messagePath(OTHER_WORKSPACE_ID, CHANNEL_ID, "msg-cross-workspace-write")), baseMessage),
    );
  });

  it("allows users to read messages from channels in their workspace", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    await seedMessage(WORKSPACE_ID, CHANNEL_ID, "msg-own-read");
    const db = testEnv.authenticatedContext(USER_ID).database();

    await assertSucceeds(get(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-own-read"))));
  });

  it("denies users from reading messages in another workspace", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    await seedMessage(OTHER_WORKSPACE_ID, CHANNEL_ID, "msg-cross-workspace-read");
    const db = testEnv.authenticatedContext(USER_ID).database();

    await assertFails(get(ref(db, messagePath(OTHER_WORKSPACE_ID, CHANNEL_ID, "msg-cross-workspace-read"))));
  });

  it("enforces message text length between 1 and 4000 characters", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    const db = testEnv.authenticatedContext(USER_ID).database();

    await assertSucceeds(
      set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-text-min")), { ...baseMessage, text: "a" }),
    );
    await assertSucceeds(
      set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-text-max")), {
        ...baseMessage,
        text: "a".repeat(4000),
      }),
    );
    await assertFails(
      set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-text-empty")), { ...baseMessage, text: "" }),
    );
    await assertFails(
      set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-text-too-long")), {
        ...baseMessage,
        text: "a".repeat(4001),
      }),
    );
  });

  it("requires all message fields: userId, userName, text, and timestamp", async () => {
    await seedWorkspaceMembership(USER_ID, WORKSPACE_ID);
    const db = testEnv.authenticatedContext(USER_ID).database();

    const requiredFields = ["userId", "userName", "text", "timestamp"] as const;

    for (const field of requiredFields) {
      const invalidMessage: Record<string, unknown> = { ...baseMessage };
      delete invalidMessage[field];

      await assertFails(
        set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, `msg-missing-${field}`)), invalidMessage),
      );
    }
  });

  it("denies unauthenticated reads and writes for messages", async () => {
    await seedMessage(WORKSPACE_ID, CHANNEL_ID, "msg-auth-required");
    const db = testEnv.unauthenticatedContext().database();

    await assertFails(
      set(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-auth-required-write")), baseMessage),
    );
    await assertFails(get(ref(db, messagePath(WORKSPACE_ID, CHANNEL_ID, "msg-auth-required"))));
  });
});
