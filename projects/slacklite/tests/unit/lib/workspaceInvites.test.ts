import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => {
  class MockTimestamp {
    private readonly value: number;

    constructor(value: number) {
      this.value = value;
    }

    toMillis() {
      return this.value;
    }

    toDate() {
      return new Date(this.value);
    }

    static fromMillis(value: number) {
      return new MockTimestamp(value);
    }
  }

  return {
    TimestampMock: MockTimestamp,
    collectionMock: vi.fn(),
    docMock: vi.fn(),
    getDocsMock: vi.fn(),
    limitMock: vi.fn(),
    queryMock: vi.fn(),
    serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
    setDocMock: vi.fn(),
    updateDocMock: vi.fn(),
    whereMock: vi.fn(),
  };
});

vi.mock("firebase/firestore", () => ({
  Timestamp: firestoreMocks.TimestampMock,
  collection: firestoreMocks.collectionMock,
  doc: firestoreMocks.docMock,
  getDocs: firestoreMocks.getDocsMock,
  limit: firestoreMocks.limitMock,
  query: firestoreMocks.queryMock,
  serverTimestamp: firestoreMocks.serverTimestampMock,
  setDoc: firestoreMocks.setDocMock,
  updateDoc: firestoreMocks.updateDocMock,
  where: firestoreMocks.whereMock,
}));

import {
  buildWorkspaceInvitePath,
  buildWorkspaceInviteUrl,
  createWorkspaceInvite,
  generateWorkspaceInviteToken,
  joinWorkspaceFromInvite,
  resolveWorkspaceInvite,
} from "@/lib/utils/workspaceInvites";

describe("workspace invite utilities", () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((value) => {
      if (typeof value === "function" && "mockReset" in value) {
        value.mockReset();
      }
    });
    firestoreMocks.serverTimestampMock.mockReturnValue("SERVER_TIMESTAMP");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a hex invite token", () => {
    const token = generateWorkspaceInviteToken();
    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(token.length).toBe(32);
  });

  it("builds invite path and absolute URL", () => {
    expect(buildWorkspaceInvitePath("workspace-1", "abc123")).toBe(
      "/invite/workspace-1/abc123",
    );
    expect(
      buildWorkspaceInviteUrl("workspace-1", "abc123", "https://local.test/"),
    ).toBe("https://local.test/invite/workspace-1/abc123");
  });

  it("creates a workspace invite document with seven-day expiration", async () => {
    const firestore = {} as never;
    const inviteCollectionRef = { path: "workspaceInvites" };
    const inviteRef = { id: "invite-123" };
    const now = 1_700_000_000_000;

    vi.spyOn(Date, "now").mockReturnValue(now);
    firestoreMocks.collectionMock.mockReturnValue(inviteCollectionRef);
    firestoreMocks.docMock.mockReturnValue(inviteRef);
    firestoreMocks.setDocMock.mockResolvedValue(undefined);

    const result = await createWorkspaceInvite({
      firestore,
      workspaceId: " workspace-1 ",
      createdBy: " user-1 ",
      workspaceName: " Product Team ",
    });

    expect(result).toMatchObject({
      inviteId: "invite-123",
      workspaceId: "workspace-1",
      createdBy: "user-1",
      workspaceName: "Product Team",
    });
    expect(result.token).toMatch(/^[0-9a-f]+$/);
    expect(result.token.length).toBe(32);
    expect(result.expiresAt.toMillis()).toBe(now + 7 * 24 * 60 * 60 * 1000);

    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(
      inviteRef,
      expect.objectContaining({
        inviteId: "invite-123",
        workspaceId: "workspace-1",
        createdBy: "user-1",
        workspaceName: "Product Team",
        createdAt: "SERVER_TIMESTAMP",
      }),
    );
  });

  it("resolves a valid invite by workspace + token", async () => {
    const firestore = {} as never;
    const now = Date.now();
    const expiresAt = firestoreMocks.TimestampMock.fromMillis(now + 10_000);
    const createdAt = firestoreMocks.TimestampMock.fromMillis(now);
    const inviteDoc = {
      id: "invite-1",
      data: () => ({
        inviteId: "invite-1",
        workspaceId: "workspace-1",
        token: "token-abc",
        createdBy: "user-1",
        expiresAt,
        createdAt,
        workspaceName: "Acme",
      }),
    };

    firestoreMocks.whereMock
      .mockReturnValueOnce("where-workspace")
      .mockReturnValueOnce("where-token");
    firestoreMocks.collectionMock.mockReturnValue("workspace-invites");
    firestoreMocks.limitMock.mockReturnValue("limit-1");
    firestoreMocks.queryMock.mockReturnValue("invite-query");
    firestoreMocks.getDocsMock.mockResolvedValue({
      empty: false,
      docs: [inviteDoc],
    });

    const invite = await resolveWorkspaceInvite({
      firestore,
      workspaceId: "workspace-1",
      token: "token-abc",
    });

    expect(invite).toEqual({
      inviteId: "invite-1",
      workspaceId: "workspace-1",
      token: "token-abc",
      createdBy: "user-1",
      expiresAt,
      createdAt,
      workspaceName: "Acme",
    });
    expect(firestoreMocks.queryMock).toHaveBeenCalledWith(
      "workspace-invites",
      "where-workspace",
      "where-token",
      "limit-1",
    );
  });

  it("returns null for expired invites", async () => {
    const firestore = {} as never;
    const expiredAt = firestoreMocks.TimestampMock.fromMillis(Date.now() - 1_000);
    const inviteDoc = {
      id: "invite-1",
      data: () => ({
        inviteId: "invite-1",
        workspaceId: "workspace-1",
        token: "token-abc",
        createdBy: "user-1",
        expiresAt: expiredAt,
      }),
    };

    firestoreMocks.whereMock
      .mockReturnValueOnce("where-workspace")
      .mockReturnValueOnce("where-token");
    firestoreMocks.collectionMock.mockReturnValue("workspace-invites");
    firestoreMocks.limitMock.mockReturnValue("limit-1");
    firestoreMocks.queryMock.mockReturnValue("invite-query");
    firestoreMocks.getDocsMock.mockResolvedValue({
      empty: false,
      docs: [inviteDoc],
    });

    const invite = await resolveWorkspaceInvite({
      firestore,
      workspaceId: "workspace-1",
      token: "token-abc",
    });

    expect(invite).toBeNull();
  });

  it("updates the user's workspace when joining from invite", async () => {
    const firestore = {} as never;
    const userRef = { path: "users/user-1" };

    firestoreMocks.docMock.mockReturnValue(userRef);
    firestoreMocks.updateDocMock.mockResolvedValue(undefined);

    await joinWorkspaceFromInvite({
      firestore,
      userId: " user-1 ",
      workspaceId: " workspace-1 ",
    });

    expect(firestoreMocks.updateDocMock).toHaveBeenCalledWith(userRef, {
      workspaceId: "workspace-1",
    });
  });
});
