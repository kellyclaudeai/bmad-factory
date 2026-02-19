import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  collectionGroupMock: vi.fn(),
  docMock: vi.fn(),
  getDocsMock: vi.fn(),
  limitMock: vi.fn(),
  queryMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  setDocMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collectionMock,
  collectionGroup: firestoreMocks.collectionGroupMock,
  doc: firestoreMocks.docMock,
  getDocs: firestoreMocks.getDocsMock,
  limit: firestoreMocks.limitMock,
  query: firestoreMocks.queryMock,
  serverTimestamp: firestoreMocks.serverTimestampMock,
  setDoc: firestoreMocks.setDocMock,
  where: firestoreMocks.whereMock,
}));

import { createChannel } from "@/lib/utils/channels";

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
});
