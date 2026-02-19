import { beforeEach, describe, expect, it, vi } from "vitest";

const firestoreMocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  docMock: vi.fn(),
  getDocsMock: vi.fn(),
  limitMock: vi.fn(),
  queryMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  setDocMock: vi.fn(),
  updateDocMock: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: firestoreMocks.collectionMock,
  doc: firestoreMocks.docMock,
  getDocs: firestoreMocks.getDocsMock,
  limit: firestoreMocks.limitMock,
  query: firestoreMocks.queryMock,
  serverTimestamp: firestoreMocks.serverTimestampMock,
  setDoc: firestoreMocks.setDocMock,
  updateDoc: firestoreMocks.updateDocMock,
}));

import {
  canDeleteChannel,
  createWorkspace,
  ensureWorkspaceHasDefaultChannel,
  getWorkspaceLandingChannelId,
  isGeneralChannelName,
} from "@/lib/utils/workspace";

describe("workspace utilities", () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockReset());
    firestoreMocks.serverTimestampMock.mockReturnValue("SERVER_TIMESTAMP");
  });

  it("creates a workspace, user linkage, and default #general channel", async () => {
    const firestore = {} as never;
    const workspaceCollectionRef = { path: "workspaces" };
    const workspaceRef = { id: "workspace-123" };
    const userRef = { id: "user-123" };
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };
    const generalChannelRef = { id: "channel-general" };

    firestoreMocks.collectionMock
      .mockReturnValueOnce(workspaceCollectionRef)
      .mockReturnValueOnce(channelsCollectionRef);
    firestoreMocks.docMock
      .mockReturnValueOnce(workspaceRef)
      .mockReturnValueOnce(userRef)
      .mockReturnValueOnce(generalChannelRef);
    firestoreMocks.setDocMock.mockResolvedValue(undefined);
    firestoreMocks.updateDocMock.mockResolvedValue(undefined);

    const result = await createWorkspace({
      firestore,
      name: "  Product Team  ",
      userId: "  user-1  ",
    });

    expect(result).toEqual({
      workspaceId: "workspace-123",
      defaultChannelId: "channel-general",
    });

    expect(firestoreMocks.setDocMock).toHaveBeenNthCalledWith(1, workspaceRef, {
      workspaceId: "workspace-123",
      name: "Product Team",
      ownerId: "user-1",
      createdAt: "SERVER_TIMESTAMP",
    });
    expect(firestoreMocks.updateDocMock).toHaveBeenCalledWith(userRef, {
      workspaceId: "workspace-123",
    });
    expect(firestoreMocks.setDocMock).toHaveBeenNthCalledWith(2, generalChannelRef, {
      channelId: "channel-general",
      workspaceId: "workspace-123",
      name: "general",
      createdBy: "user-1",
      createdAt: "SERVER_TIMESTAMP",
      lastMessageAt: null,
      messageCount: 0,
    });
  });

  it("returns existing channel id when workspace already has channels", async () => {
    const firestore = {} as never;
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };

    firestoreMocks.collectionMock.mockReturnValue(channelsCollectionRef);
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({
      empty: false,
      docs: [{ id: "existing-channel-id" }],
    });

    const channelId = await ensureWorkspaceHasDefaultChannel({
      firestore,
      workspaceId: "workspace-123",
      userId: "user-1",
    });

    expect(channelId).toBe("existing-channel-id");
    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("creates #general when workspace has no channels", async () => {
    const firestore = {} as never;
    const channelsCollectionRef = { path: "workspaces/workspace-123/channels" };
    const newGeneralChannelRef = { id: "new-general-id" };

    firestoreMocks.collectionMock
      .mockReturnValueOnce(channelsCollectionRef)
      .mockReturnValueOnce(channelsCollectionRef);
    firestoreMocks.limitMock.mockReturnValue("LIMIT_1");
    firestoreMocks.queryMock.mockReturnValue("CHANNEL_QUERY");
    firestoreMocks.getDocsMock.mockResolvedValue({ empty: true, docs: [] });
    firestoreMocks.docMock.mockReturnValue(newGeneralChannelRef);
    firestoreMocks.setDocMock.mockResolvedValue(undefined);

    const channelId = await ensureWorkspaceHasDefaultChannel({
      firestore,
      workspaceId: "workspace-123",
      userId: "user-1",
    });

    expect(channelId).toBe("new-general-id");
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(newGeneralChannelRef, {
      channelId: "new-general-id",
      workspaceId: "workspace-123",
      name: "general",
      createdBy: "user-1",
      createdAt: "SERVER_TIMESTAMP",
      lastMessageAt: null,
      messageCount: 0,
    });
  });

  it("prefers #general as landing channel", () => {
    const channelId = getWorkspaceLandingChannelId([
      { channelId: "random", name: "random" },
      { channelId: "general", name: "general" },
    ]);

    expect(channelId).toBe("general");
  });

  it("falls back to first channel when #general is missing", () => {
    const channelId = getWorkspaceLandingChannelId([
      { channelId: "engineering", name: "engineering" },
      { channelId: "design", name: "design" },
    ]);

    expect(channelId).toBe("engineering");
  });

  it("treats general channel names case-insensitively and blocks deletion", () => {
    expect(isGeneralChannelName("General")).toBe(true);
    expect(() => canDeleteChannel({ name: "  GENERAL  " })).toThrow("Cannot delete #general channel");
  });

  it("allows non-general channel deletion", () => {
    expect(canDeleteChannel({ name: "random" })).toBe(true);
  });
});
