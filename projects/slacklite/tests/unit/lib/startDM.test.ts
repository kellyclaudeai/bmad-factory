import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  docMock: vi.fn(),
  getDocsMock: vi.fn(),
  queryMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  setDocMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collectionMock,
  doc: firestoreMocks.docMock,
  getDocs: firestoreMocks.getDocsMock,
  query: firestoreMocks.queryMock,
  serverTimestamp: firestoreMocks.serverTimestampMock,
  setDoc: firestoreMocks.setDocMock,
  where: firestoreMocks.whereMock,
}));

import { startDM } from "@/lib/actions/startDM";

describe("startDM action", () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockReset());
    firestoreMocks.serverTimestampMock.mockReturnValue("SERVER_TIMESTAMP");
  });

  it("returns an existing DM id when a matching DM already exists", async () => {
    const firestore = {} as never;
    const directMessagesCollectionRef = {
      path: "workspaces/workspace-1/directMessages",
    };

    firestoreMocks.collectionMock.mockReturnValue(directMessagesCollectionRef);
    firestoreMocks.whereMock
      .mockReturnValueOnce("WORKSPACE_FILTER")
      .mockReturnValueOnce("USER_FILTER");
    firestoreMocks.queryMock.mockReturnValue("DM_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({
      docs: [
        {
          id: "existing-dm-id",
          data: () => ({
            userIds: ["user-1", "user-2"],
          }),
        },
      ],
    });

    const dmId = await startDM({
      firestore,
      workspaceId: "  workspace-1  ",
      currentUserId: "  user-1  ",
      otherUserId: "  user-2  ",
    });

    expect(dmId).toBe("existing-dm-id");
    expect(firestoreMocks.collectionMock).toHaveBeenCalledWith(
      firestore,
      "workspaces",
      "workspace-1",
      "directMessages",
    );
    expect(firestoreMocks.whereMock).toHaveBeenNthCalledWith(
      1,
      "workspaceId",
      "==",
      "workspace-1",
    );
    expect(firestoreMocks.whereMock).toHaveBeenNthCalledWith(
      2,
      "userIds",
      "array-contains",
      "user-1",
    );
    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("creates a new DM when no existing DM contains both users", async () => {
    const firestore = {} as never;
    const directMessagesCollectionRef = {
      path: "workspaces/workspace-1/directMessages",
    };
    const newDirectMessageRef = { id: "new-dm-id" };

    firestoreMocks.collectionMock.mockReturnValue(directMessagesCollectionRef);
    firestoreMocks.whereMock
      .mockReturnValueOnce("WORKSPACE_FILTER")
      .mockReturnValueOnce("USER_FILTER");
    firestoreMocks.queryMock.mockReturnValue("DM_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({
      docs: [
        {
          id: "non-matching-dm-id",
          data: () => ({
            userIds: ["user-1", "user-3"],
          }),
        },
      ],
    });
    firestoreMocks.docMock.mockReturnValue(newDirectMessageRef);
    firestoreMocks.setDocMock.mockResolvedValue(undefined);

    const dmId = await startDM({
      firestore,
      workspaceId: "workspace-1",
      currentUserId: "user-2",
      otherUserId: "user-1",
    });

    expect(dmId).toBe("new-dm-id");
    expect(firestoreMocks.docMock).toHaveBeenCalledWith(directMessagesCollectionRef);
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(newDirectMessageRef, {
      dmId: "new-dm-id",
      workspaceId: "workspace-1",
      userIds: ["user-1", "user-2"],
      createdAt: "SERVER_TIMESTAMP",
      lastMessageAt: null,
    });
  });

  it("throws when attempting to start a DM with the current user", async () => {
    await expect(
      startDM({
        firestore: {} as never,
        workspaceId: "workspace-1",
        currentUserId: "user-1",
        otherUserId: "user-1",
      }),
    ).rejects.toThrow("Cannot start a DM with yourself.");
  });
});
