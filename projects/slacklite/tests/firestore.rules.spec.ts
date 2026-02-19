import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

const RULES_PATH = resolve(process.cwd(), "firestore.rules");
const TEST_PROJECT_ID = "slacklite-firestore-rules";
const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

let testEnv: RulesTestEnvironment;

async function seedWorkspaceMembership(userId: string, workspaceId: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "users", userId), {
      userId,
      workspaceId,
      email: `${userId}@example.com`,
      displayName: userId,
    });

    await setDoc(doc(adminDb, "workspaces", workspaceId), {
      workspaceId,
      name: `Workspace ${workspaceId}`,
      ownerId: userId,
    });
  });
}

async function seedWorkspaceMember(userId: string, workspaceId: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "users", userId), {
      userId,
      workspaceId,
      email: `${userId}@example.com`,
      displayName: userId,
    });

  });
}

async function seedChannel(workspaceId: string, channelId: string, createdBy: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "workspaces", workspaceId, "channels", channelId), {
      channelId,
      workspaceId,
      name: channelId,
      createdBy,
    });
  });
}

async function seedChannelMessage(
  workspaceId: string,
  channelId: string,
  messageId: string,
  userId: string,
) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(
      doc(
        adminDb,
        "workspaces",
        workspaceId,
        "channels",
        channelId,
        "messages",
        messageId,
      ),
      {
        messageId,
        channelId,
        workspaceId,
        userId,
        userName: userId,
        text: "seed message",
        timestamp: new Date(),
        createdAt: new Date(),
      },
    );
  });
}

(hasFirestoreEmulator ? describe.sequential : describe.skip)(
  "Firestore security rules",
  () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: TEST_PROJECT_ID,
      firestore: {
        rules: readFileSync(RULES_PATH, "utf8"),
      },
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("User can read their own workspace data", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertSucceeds(getDoc(doc(userDb, "workspaces", "workspace-1")));
  });

  it("User CANNOT read other workspace data", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedWorkspaceMembership("user-2", "workspace-2");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(getDoc(doc(userDb, "workspaces", "workspace-2")));
  });

  it("User can create channels in their workspace", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertSucceeds(
      setDoc(doc(userDb, "workspaces", "workspace-1", "channels", "channel-1"), {
        channelId: "channel-1",
        workspaceId: "workspace-1",
        name: "engineering",
        createdBy: "user-1",
      }),
    );
  });

  it("enforces channel name format (lowercase, numbers, hyphens, 1-50 chars)", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-1", "channels", "channel-uppercase"), {
        channelId: "channel-uppercase",
        workspaceId: "workspace-1",
        name: "Engineering Team",
        createdBy: "user-1",
      }),
    );
  });

  it("enforces workspace name characters to letters, numbers, and spaces", async () => {
    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertSucceeds(
      setDoc(doc(userDb, "workspaces", "workspace-valid"), {
        workspaceId: "workspace-valid",
        name: "Team 42",
        ownerId: "user-1",
      }),
    );

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-invalid-symbol"), {
        workspaceId: "workspace-invalid-symbol",
        name: "Team@42",
        ownerId: "user-1",
      }),
    );

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-invalid-empty"), {
        workspaceId: "workspace-invalid-empty",
        name: "   ",
        ownerId: "user-1",
      }),
    );
  });

  it("User CANNOT create channels in other workspace", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedWorkspaceMembership("user-2", "workspace-2");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-2", "channels", "channel-2"), {
        channelId: "channel-2",
        workspaceId: "workspace-2",
        name: "restricted",
        createdBy: "user-1",
      }),
    );
  });

  it("User can write messages in their workspace channels", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedChannel("workspace-1", "general", "user-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertSucceeds(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-1",
        ),
        {
          messageId: "message-1",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "hello",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );
  });

  it("enforces message text length between 1 and 4000 characters", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedChannel("workspace-1", "general", "user-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertSucceeds(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-max",
        ),
        {
          messageId: "message-max",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "a".repeat(4000),
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-too-long",
        ),
        {
          messageId: "message-too-long",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "a".repeat(4001),
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-empty",
        ),
        {
          messageId: "message-empty",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );
  });

  it("blocks script tags and javascript protocol payloads in messages", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedChannel("workspace-1", "general", "user-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-script-tag",
        ),
        {
          messageId: "message-script-tag",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "<script>alert(1)</script>",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-javascript-protocol",
        ),
        {
          messageId: "message-javascript-protocol",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "javascript:alert(1)",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );
  });

  it("enforces workspace name validation on create", async () => {
    const userDb = testEnv.authenticatedContext("owner-1").firestore();

    await assertSucceeds(
      setDoc(doc(userDb, "workspaces", "workspace-valid"), {
        workspaceId: "workspace-valid",
        name: "Acme Team 42",
        ownerId: "owner-1",
      }),
    );

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-invalid-length"), {
        workspaceId: "workspace-invalid-length",
        name: "a".repeat(51),
        ownerId: "owner-1",
      }),
    );

    await assertFails(
      setDoc(doc(userDb, "workspaces", "workspace-invalid-chars"), {
        workspaceId: "workspace-invalid-chars",
        name: "<script>alert(1)</script>",
        ownerId: "owner-1",
      }),
    );
  });

  it("blocks common XSS patterns in message text", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedChannel("workspace-1", "general", "user-1");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-script-tag",
        ),
        {
          messageId: "message-script-tag",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "<script>alert(1)</script>",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-js-protocol",
        ),
        {
          messageId: "message-js-protocol",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "javascript:alert(1)",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-1",
          "channels",
          "general",
          "messages",
          "message-event-handler",
        ),
        {
          messageId: "message-event-handler",
          channelId: "general",
          workspaceId: "workspace-1",
          userId: "user-1",
          userName: "User One",
          text: "<img src=x onerror=alert(1)>",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );
  });

  it("User CANNOT write messages in other workspace channels", async () => {
    await seedWorkspaceMembership("user-1", "workspace-1");
    await seedWorkspaceMembership("user-2", "workspace-2");
    await seedChannel("workspace-2", "general", "user-2");

    const userDb = testEnv.authenticatedContext("user-1").firestore();

    await assertFails(
      setDoc(
        doc(
          userDb,
          "workspaces",
          "workspace-2",
          "channels",
          "general",
          "messages",
          "message-2",
        ),
        {
          messageId: "message-2",
          channelId: "general",
          workspaceId: "workspace-2",
          userId: "user-1",
          userName: "User One",
          text: "blocked",
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ),
    );
  });

  it("Workspace owner can delete a channel message they did not author", async () => {
    await seedWorkspaceMembership("owner-1", "workspace-1");
    await seedChannel("workspace-1", "engineering", "creator-1");
    await seedChannelMessage("workspace-1", "engineering", "message-1", "member-1");

    const ownerDb = testEnv.authenticatedContext("owner-1").firestore();

    await assertSucceeds(
      deleteDoc(
        doc(
          ownerDb,
          "workspaces",
          "workspace-1",
          "channels",
          "engineering",
          "messages",
          "message-1",
        ),
      ),
    );
  });

  it("Channel creator can delete a channel message they did not author", async () => {
    await seedWorkspaceMembership("owner-1", "workspace-1");
    await seedWorkspaceMember("creator-1", "workspace-1");
    await seedChannel("workspace-1", "engineering", "creator-1");
    await seedChannelMessage("workspace-1", "engineering", "message-1", "member-1");

    const channelCreatorDb = testEnv.authenticatedContext("creator-1").firestore();

    await assertSucceeds(
      deleteDoc(
        doc(
          channelCreatorDb,
          "workspaces",
          "workspace-1",
          "channels",
          "engineering",
          "messages",
          "message-1",
        ),
      ),
    );
  });
});
