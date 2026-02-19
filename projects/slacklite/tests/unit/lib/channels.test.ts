import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  collectionGroupMock: vi.fn(),
  deleteDocMock: vi.fn(),
  docMock: vi.fn(),
  getDocsMock: vi.fn(),
  limitMock: vi.fn(),
  queryMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  setDocMock: vi.fn(),
  updateDocMock: vi.fn(),
  writeBatchMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collectionMock,
  collectionGroup: firestoreMocks.collectionGroupMock,
  deleteDoc: firestoreMocks.deleteDocMock,
  doc: firestoreMocks.docMock,
  getDocs: firestoreMocks.getDocsMock,
  limit: firestoreMocks.limitMock,
  query: firestoreMocks.queryMock,
  serverTimestamp: firestoreMocks.serverTimestampMock,
  setDoc: firestoreMocks.setDocMock,
  updateDoc: firestoreMocks.updateDocMock,
  writeBatch: firestoreMocks.writeBatchMock,
  where: firestoreMocks.whereMock,
}));

import { createChannel, deleteChannel, renameChannel } from "@/lib/utils/channels";

describe("channel utilities", () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockReset());
    firestoreMocks.serverTimestampMock.mockReturnValue("SERVER_TIMESTAMP");
  });

  it("throws when a channel with the same name already exists in the workspace", async () => {
    const firestore = {} as never;

    firestoreMocks.collectionGroupMock.mockReturnValue("CHANNELS_GROUP");
    firestoreMocks.whereMock
      .mockReturnValueOnce("WORKSPACE_FILTER")
      .mockReturnValueOnce("NAME_FILTER");
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("EXISTING_CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({ empty: false, docs: [{}] });

    await expect(
      createChannel(firestore, "workspace-123", "engineering", "user-1"),
    ).rejects.toThrow("Channel name already exists");

    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("creates a new channel when no duplicate exists", async () => {
    const firestore = {} as never;
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };
    const channelRef = { id: "channel-123" };

    firestoreMocks.collectionGroupMock.mockReturnValue("CHANNELS_GROUP");
    firestoreMocks.whereMock
      .mockReturnValueOnce("WORKSPACE_FILTER")
      .mockReturnValueOnce("NAME_FILTER");
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("EXISTING_CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({ empty: true, docs: [] });
    firestoreMocks.collectionMock.mockReturnValue(channelsCollectionRef);
    firestoreMocks.docMock.mockReturnValue(channelRef);
    firestoreMocks.setDocMock.mockResolvedValue(undefined);

    const channelId = await createChannel(
      firestore,
      "  workspace-123  ",
      "  engineering  ",
      "  user-1  ",
    );

    expect(channelId).toBe("channel-123");
    expect(firestoreMocks.collectionGroupMock).toHaveBeenCalledWith(
      firestore,
      "channels",
    );
    expect(firestoreMocks.whereMock).toHaveBeenNthCalledWith(
      1,
      "workspaceId",
      "==",
      "workspace-123",
    );
    expect(firestoreMocks.whereMock).toHaveBeenNthCalledWith(
      2,
      "name",
      "==",
      "engineering",
    );
    expect(firestoreMocks.collectionMock).toHaveBeenCalledWith(
      firestore,
      "workspaces",
      "workspace-123",
      "channels",
    );
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(channelRef, {
      channelId: "channel-123",
      workspaceId: "workspace-123",
      name: "engineering",
      createdBy: "user-1",
      createdAt: "SERVER_TIMESTAMP",
      lastMessageAt: null,
      messageCount: 0,
    });
  });

  it("blocks renaming #general channels", async () => {
    const firestore = {} as never;

    await expect(
      renameChannel({
        firestore,
        workspaceId: "workspace-123",
        channelId: "channel-general",
        currentName: "general",
        newName: "engineering",
        userId: "user-1",
        channelCreatedBy: "user-1",
        workspaceOwnerId: "user-1",
      }),
    ).rejects.toThrow("Cannot rename #general channel");

    expect(firestoreMocks.getDocsMock).not.toHaveBeenCalled();
    expect(firestoreMocks.updateDocMock).not.toHaveBeenCalled();
  });

  it("blocks renaming when the user is not the channel creator or workspace owner", async () => {
    const firestore = {} as never;

    await expect(
      renameChannel({
        firestore,
        workspaceId: "workspace-123",
        channelId: "channel-123",
        currentName: "engineering",
        newName: "eng-platform",
        userId: "user-1",
        channelCreatedBy: "user-2",
        workspaceOwnerId: "user-3",
      }),
    ).rejects.toThrow("You do not have permission to rename this channel");

    expect(firestoreMocks.getDocsMock).not.toHaveBeenCalled();
    expect(firestoreMocks.updateDocMock).not.toHaveBeenCalled();
  });

  it("blocks renaming when the new channel name already exists", async () => {
    const firestore = {} as never;
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };

    firestoreMocks.collectionMock.mockReturnValue(channelsCollectionRef);
    firestoreMocks.whereMock.mockReturnValue("NAME_FILTER");
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("EXISTING_CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({
      empty: false,
      docs: [{ id: "channel-999" }],
    });

    await expect(
      renameChannel({
        firestore,
        workspaceId: "workspace-123",
        channelId: "channel-123",
        currentName: "engineering",
        newName: "eng-platform",
        userId: "user-1",
        channelCreatedBy: "user-1",
        workspaceOwnerId: "user-9",
      }),
    ).rejects.toThrow("Channel name already exists");

    expect(firestoreMocks.updateDocMock).not.toHaveBeenCalled();
  });

  it("updates the channel name when rename validation passes", async () => {
    const firestore = {} as never;
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };
    const channelRef = { id: "channel-123" };

    firestoreMocks.collectionMock.mockReturnValue(channelsCollectionRef);
    firestoreMocks.whereMock.mockReturnValue("NAME_FILTER");
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("EXISTING_CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({
      empty: true,
      docs: [],
    });
    firestoreMocks.docMock.mockReturnValue(channelRef);
    firestoreMocks.updateDocMock.mockResolvedValue(undefined);

    await renameChannel({
      firestore,
      workspaceId: "  workspace-123  ",
      channelId: "  channel-123  ",
      currentName: "  engineering  ",
      newName: "  eng-platform  ",
      userId: "  user-1  ",
      channelCreatedBy: "  user-1  ",
      workspaceOwnerId: "  user-9  ",
    });

    expect(firestoreMocks.collectionMock).toHaveBeenCalledWith(
      firestore,
      "workspaces",
      "workspace-123",
      "channels",
    );
    expect(firestoreMocks.whereMock).toHaveBeenCalledWith(
      "name",
      "==",
      "eng-platform",
    );
    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      channelsCollectionRef,
      "channel-123",
    );
    expect(firestoreMocks.updateDocMock).toHaveBeenCalledWith(channelRef, {
      name: "eng-platform",
    });
  });

  it("blocks deleting #general channels", async () => {
    const firestore = {} as never;

    await expect(
      deleteChannel({
        firestore,
        workspaceId: "workspace-123",
        channelId: "channel-general",
        channelName: "general",
        userId: "user-1",
        channelCreatedBy: "user-1",
        workspaceOwnerId: "user-1",
      }),
    ).rejects.toThrow("Cannot delete #general channel");

    expect(firestoreMocks.getDocsMock).not.toHaveBeenCalled();
    expect(firestoreMocks.deleteDocMock).not.toHaveBeenCalled();
  });

  it("blocks deleting channels when the user lacks permissions", async () => {
    const firestore = {} as never;

    await expect(
      deleteChannel({
        firestore,
        workspaceId: "workspace-123",
        channelId: "channel-123",
        channelName: "engineering",
        userId: "user-1",
        channelCreatedBy: "user-2",
        workspaceOwnerId: "user-3",
      }),
    ).rejects.toThrow("You do not have permission to delete this channel");

    expect(firestoreMocks.getDocsMock).not.toHaveBeenCalled();
    expect(firestoreMocks.deleteDocMock).not.toHaveBeenCalled();
  });

  it("deletes messages in batches before deleting the channel document", async () => {
    const firestore = {} as never;
    const channelRef = { path: "workspaces/workspace-123/channels/channel-123" };
    const messageCollectionRef = { path: "workspaces/workspace-123/channels/channel-123/messages" };
    const messageOneRef = { path: "messages/message-1" };
    const messageTwoRef = { path: "messages/message-2" };
    const batchDeleteMock = vi.fn();
    const batchCommitMock = vi.fn().mockResolvedValue(undefined);

    firestoreMocks.docMock.mockReturnValue(channelRef);
    firestoreMocks.collectionMock.mockReturnValue(messageCollectionRef);
    firestoreMocks.limitMock.mockReturnValue("LIMIT_500");
    firestoreMocks.queryMock.mockReturnValue("MESSAGES_QUERY");
    firestoreMocks.writeBatchMock.mockReturnValue({
      delete: batchDeleteMock,
      commit: batchCommitMock,
    });
    firestoreMocks.getDocsMock
      .mockResolvedValueOnce({
        empty: false,
        docs: [{ ref: messageOneRef }, { ref: messageTwoRef }],
      })
      .mockResolvedValueOnce({
        empty: true,
        docs: [],
      });
    firestoreMocks.deleteDocMock.mockResolvedValue(undefined);

    await deleteChannel({
      firestore,
      workspaceId: " workspace-123 ",
      channelId: " channel-123 ",
      channelName: " engineering ",
      userId: " user-1 ",
      channelCreatedBy: " user-1 ",
      workspaceOwnerId: " user-9 ",
    });

    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      firestore,
      "workspaces",
      "workspace-123",
      "channels",
      "channel-123",
    );
    expect(firestoreMocks.collectionMock).toHaveBeenCalledWith(channelRef, "messages");
    expect(batchDeleteMock).toHaveBeenCalledWith(messageOneRef);
    expect(batchDeleteMock).toHaveBeenCalledWith(messageTwoRef);
    expect(batchCommitMock).toHaveBeenCalledTimes(1);
    expect(firestoreMocks.deleteDocMock).toHaveBeenCalledWith(channelRef);
  });
});
