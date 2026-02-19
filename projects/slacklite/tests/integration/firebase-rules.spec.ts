// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { get, ref, set } from "firebase/database";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

const FIRESTORE_RULES_PATH = resolve(process.cwd(), "firestore.rules");
const RTDB_RULES_PATH = resolve(process.cwd(), "database.rules.json");
const TEST_PROJECT_ID = "slacklite-firebase-rules-integration";
const DEFAULT_CHANNEL_ID = "general";
const DEFAULT_FIRESTORE_TIMESTAMP = new Date("2026-01-01T00:00:00.000Z");
const DEFAULT_RTDB_TIMESTAMP = 1700000000000;

const hasFirestoreEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const hasRtdbEmulator = Boolean(process.env.FIREBASE_DATABASE_EMULATOR_HOST);
const hasRequiredEmulators = hasFirestoreEmulator && hasRtdbEmulator;

let testEnv: RulesTestEnvironment;

type RtdbMessage = {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
};

function firestoreMessagePayload(userId: string, workspaceId: string, text = "Hello world") {
  return {
    messageId: `msg-${userId}-${workspaceId}`,
    channelId: DEFAULT_CHANNEL_ID,
    workspaceId,
    userId,
    userName: userId,
    text,
    timestamp: DEFAULT_FIRESTORE_TIMESTAMP,
    createdAt: DEFAULT_FIRESTORE_TIMESTAMP,
  };
}

function rtdbMessagePayload(userId: string, text = "Hello world"): RtdbMessage {
  return {
    userId,
    userName: userId,
    text,
    timestamp: DEFAULT_RTDB_TIMESTAMP,
  };
}

function rtdbMessagePath(workspaceId: string, channelId: string, messageId: string): string {
  return `messages/${workspaceId}/${channelId}/${messageId}`;
}

async function seedFirestoreUser(userId: string, workspaceId: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users", userId), {
      userId,
      workspaceId,
      email: `${userId}@example.com`,
      displayName: userId,
    });
  });
}

async function seedFirestoreWorkspace(workspaceId: string, ownerId: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, "workspaces", workspaceId), {
      workspaceId,
      name: `Workspace ${workspaceId}`,
      ownerId,
    });
    await setDoc(doc(adminDb, "users", ownerId), {
      userId: ownerId,
      workspaceId,
      email: `${ownerId}@example.com`,
      displayName: ownerId,
    });
  });
}

async function seedFirestoreChannel(
  workspaceId: string,
  channelId: string,
  createdBy: string
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "workspaces", workspaceId, "channels", channelId), {
      channelId,
      workspaceId,
      name: channelId,
      createdBy,
    });
  });
}

async function seedRtdbMembership(userId: string, workspaceId: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), `users/${userId}`), { workspaceId });
  });
}

async function seedRtdbMessage(
  workspaceId: string,
  channelId: string,
  messageId: string,
  message: RtdbMessage
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), rtdbMessagePath(workspaceId, channelId, messageId)), message);
  });
}

(hasRequiredEmulators ? describe.sequential : describe.skip)(
  "Firebase security rules integration",
  () => {
    beforeAll(async () => {
      testEnv = await initializeTestEnvironment({
        projectId: TEST_PROJECT_ID,
        firestore: {
          rules: readFileSync(FIRESTORE_RULES_PATH, "utf8"),
        },
        database: {
          rules: readFileSync(RTDB_RULES_PATH, "utf8"),
        },
      });
    });

    afterEach(async () => {
      await testEnv.clearFirestore();
      await testEnv.clearDatabase();
    });

    afterAll(async () => {
      await testEnv.cleanup();
    });

    describe("Firestore rules", () => {
      it("enforces workspace isolation and channel access control", async () => {
        await seedFirestoreWorkspace("workspace-a", "owner-a");
        await seedFirestoreWorkspace("workspace-b", "owner-b");
        await seedFirestoreUser("member-a", "workspace-a");
        await seedFirestoreUser("member-b", "workspace-b");
        await seedFirestoreChannel("workspace-a", DEFAULT_CHANNEL_ID, "owner-a");
        await seedFirestoreChannel("workspace-b", DEFAULT_CHANNEL_ID, "owner-b");

        const memberDb = testEnv.authenticatedContext("member-a").firestore();

        await assertSucceeds(getDoc(doc(memberDb, "workspaces", "workspace-a")));
        await assertSucceeds(
          getDoc(doc(memberDb, "workspaces", "workspace-a", "channels", DEFAULT_CHANNEL_ID))
        );
        await assertFails(getDoc(doc(memberDb, "workspaces", "workspace-b")));
        await assertFails(
          getDoc(doc(memberDb, "workspaces", "workspace-b", "channels", DEFAULT_CHANNEL_ID))
        );
      });

      it("allows workspace members to write messages and blocks non-members", async () => {
        await seedFirestoreWorkspace("workspace-a", "owner-a");
        await seedFirestoreWorkspace("workspace-b", "owner-b");
        await seedFirestoreUser("member-a", "workspace-a");
        await seedFirestoreUser("outsider-b", "workspace-b");
        await seedFirestoreChannel("workspace-a", DEFAULT_CHANNEL_ID, "owner-a");

        const memberDb = testEnv.authenticatedContext("member-a").firestore();
        const outsiderDb = testEnv.authenticatedContext("outsider-b").firestore();

        await assertSucceeds(
          setDoc(
            doc(
              memberDb,
              "workspaces",
              "workspace-a",
              "channels",
              DEFAULT_CHANNEL_ID,
              "messages",
              "member-write"
            ),
            firestoreMessagePayload("member-a", "workspace-a")
          )
        );

        await assertFails(
          setDoc(
            doc(
              outsiderDb,
              "workspaces",
              "workspace-a",
              "channels",
              DEFAULT_CHANNEL_ID,
              "messages",
              "outsider-write"
            ),
            firestoreMessagePayload("outsider-b", "workspace-a")
          )
        );
      });

      it("enforces user data access control", async () => {
        await seedFirestoreUser("user-a", "workspace-a");
        await seedFirestoreUser("user-b", "workspace-a");
        await seedFirestoreUser("user-c", "workspace-b");

        const userDb = testEnv.authenticatedContext("user-a").firestore();
        const anonymousDb = testEnv.unauthenticatedContext().firestore();

        await assertSucceeds(getDoc(doc(userDb, "users", "user-a")));
        await assertSucceeds(getDoc(doc(userDb, "users", "user-b")));
        await assertFails(getDoc(doc(userDb, "users", "user-c")));
        await assertFails(getDoc(doc(anonymousDb, "users", "user-a")));
      });

      it("validates message structure and content", async () => {
        await seedFirestoreWorkspace("workspace-a", "owner-a");
        await seedFirestoreUser("member-a", "workspace-a");
        await seedFirestoreChannel("workspace-a", DEFAULT_CHANNEL_ID, "owner-a");

        const memberDb = testEnv.authenticatedContext("member-a").firestore();
        const messageRef = (messageId: string) =>
          doc(
            memberDb,
            "workspaces",
            "workspace-a",
            "channels",
            DEFAULT_CHANNEL_ID,
            "messages",
            messageId
          );

        await assertSucceeds(
          setDoc(messageRef("valid-message"), firestoreMessagePayload("member-a", "workspace-a"))
        );

        await assertFails(
          setDoc(messageRef("wrong-user"), firestoreMessagePayload("spoofed-user", "workspace-a"))
        );

        await assertFails(
          setDoc(messageRef("wrong-workspace"), firestoreMessagePayload("member-a", "workspace-b"))
        );

        await assertFails(
          setDoc(messageRef("empty-text"), firestoreMessagePayload("member-a", "workspace-a", ""))
        );

        await assertFails(
          setDoc(
            messageRef("too-long"),
            firestoreMessagePayload("member-a", "workspace-a", "a".repeat(4001))
          )
        );

        await assertFails(
          setDoc(
            messageRef("blocked-script"),
            firestoreMessagePayload("member-a", "workspace-a", "<script>alert(1)</script>")
          )
        );

        await assertFails(
          setDoc(
            messageRef("blocked-javascript-protocol"),
            firestoreMessagePayload("member-a", "workspace-a", "javascript:alert(1)")
          )
        );

        await assertFails(
          setDoc(
            messageRef("blocked-event-handler"),
            firestoreMessagePayload("member-a", "workspace-a", "<img src=x onerror=alert(1)>")
          )
        );
      });
    });

    describe("Realtime Database rules", () => {
      it("enforces workspace isolation for message delivery", async () => {
        await seedRtdbMembership("member-a", "workspace-a");
        await seedRtdbMembership("member-b", "workspace-b");
        await seedRtdbMessage(
          "workspace-a",
          DEFAULT_CHANNEL_ID,
          "existing-a",
          rtdbMessagePayload("member-a")
        );
        await seedRtdbMessage(
          "workspace-b",
          DEFAULT_CHANNEL_ID,
          "existing-b",
          rtdbMessagePayload("member-b")
        );

        const memberDb = testEnv.authenticatedContext("member-a").database();

        await assertSucceeds(
          get(ref(memberDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "existing-a")))
        );
        await assertSucceeds(
          set(
            ref(memberDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "new-a")),
            rtdbMessagePayload("member-a")
          )
        );
        await assertFails(
          get(ref(memberDb, rtdbMessagePath("workspace-b", DEFAULT_CHANNEL_ID, "existing-b")))
        );
        await assertFails(
          set(
            ref(memberDb, rtdbMessagePath("workspace-b", DEFAULT_CHANNEL_ID, "new-b")),
            rtdbMessagePayload("member-a")
          )
        );
      });

      it("requires authenticated workspace membership for message delivery", async () => {
        await seedRtdbMembership("member-a", "workspace-a");
        const memberDb = testEnv.authenticatedContext("member-a").database();
        const nonMemberDb = testEnv.authenticatedContext("no-membership").database();
        const anonymousDb = testEnv.unauthenticatedContext().database();

        await assertSucceeds(
          set(
            ref(memberDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "member-write")),
            rtdbMessagePayload("member-a")
          )
        );

        await assertFails(
          set(
            ref(
              nonMemberDb,
              rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "non-member-write")
            ),
            rtdbMessagePayload("no-membership")
          )
        );

        await assertFails(
          get(ref(anonymousDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "member-write")))
        );
        await assertFails(
          set(
            ref(anonymousDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, "anonymous-write")),
            rtdbMessagePayload("member-a")
          )
        );
      });

      it("validates RTDB message structure", async () => {
        await seedRtdbMembership("member-a", "workspace-a");
        const memberDb = testEnv.authenticatedContext("member-a").database();
        const basePath = (messageId: string) =>
          ref(memberDb, rtdbMessagePath("workspace-a", DEFAULT_CHANNEL_ID, messageId));
        const validMessage = rtdbMessagePayload("member-a");

        await assertSucceeds(set(basePath("valid"), validMessage));

        for (const field of ["userId", "userName", "text", "timestamp"] as const) {
          const invalidMessage: Partial<RtdbMessage> = { ...validMessage };
          delete invalidMessage[field];

          await assertFails(set(basePath(`missing-${field}`), invalidMessage));
        }

        await assertFails(
          set(basePath("wrong-user-id"), {
            ...validMessage,
            userId: "spoofed-user",
          })
        );

        await assertFails(
          set(basePath("empty-user-name"), {
            ...validMessage,
            userName: "",
          })
        );

        await assertFails(
          set(basePath("empty-text"), {
            ...validMessage,
            text: "",
          })
        );

        await assertFails(
          set(basePath("too-long-text"), {
            ...validMessage,
            text: "a".repeat(4001),
          })
        );

        await assertFails(
          set(basePath("blocked-script"), {
            ...validMessage,
            text: "<script>alert(1)</script>",
          })
        );

        await assertFails(
          set(basePath("blocked-javascript-protocol"), {
            ...validMessage,
            text: "javascript:alert(1)",
          })
        );

        await assertFails(
          set(basePath("blocked-event-handler"), {
            ...validMessage,
            text: "<img src=x onerror=alert(1)>",
          })
        );

        await assertFails(
          set(basePath("invalid-timestamp-type"), {
            ...validMessage,
            timestamp: "invalid",
          })
        );
      });
    });
  }
);
