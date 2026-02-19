import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  firestoreMock: {},
  onSnapshotMock: vi.fn(),
  orderByMock: vi.fn(),
  queryMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: mocks.firestoreMock,
}));

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual<typeof import("firebase/firestore")>(
    "firebase/firestore",
  );

  return {
    ...actual,
    collection: mocks.collectionMock,
    onSnapshot: mocks.onSnapshotMock,
    orderBy: mocks.orderByMock,
    query: mocks.queryMock,
  };
});

import { Timestamp } from "firebase/firestore";

import { useChannels } from "@/lib/hooks/useChannels";

describe("useChannels", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: " workspace-1 ",
      },
    });
    mocks.collectionMock.mockReturnValue("CHANNELS_COLLECTION");
    mocks.orderByMock.mockReturnValue("ORDER_BY_NAME");
    mocks.queryMock.mockReturnValue("CHANNELS_QUERY");
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<unknown> }) => void) => {
        onNext({ docs: [] });
        return mocks.unsubscribeMock;
      },
    );
  });

  it("returns an empty settled state when user/workspace context is missing", async () => {
    mocks.useAuthMock.mockReturnValue({ user: null });

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.channels).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mocks.onSnapshotMock).not.toHaveBeenCalled();
  });

  it("subscribes to channels and filters malformed documents", async () => {
    const createdAt = Timestamp.fromDate(new Date(2026, 1, 19, 10, 0, 0));
    const lastMessageAt = Timestamp.fromDate(new Date(2026, 1, 19, 10, 15, 0));

    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => void) => {
        onNext({
          docs: [
            {
              id: "general",
              data: () => ({
                name: "general",
                createdBy: "user-1",
                createdAt,
                workspaceId: "   ",
                lastMessageAt,
                messageCount: 12,
              }),
            },
            {
              id: "random",
              data: () => ({
                name: "random",
                createdBy: "user-2",
                createdAt,
                workspaceId: "workspace-2",
                lastMessageAt: "not-a-timestamp",
                messageCount: Number.POSITIVE_INFINITY,
              }),
            },
            {
              id: "invalid",
              data: () => ({
                name: "invalid",
                createdBy: "user-2",
              }),
            },
          ],
        });

        return mocks.unsubscribeMock;
      },
    );

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mocks.collectionMock).toHaveBeenCalledWith(
      mocks.firestoreMock,
      "workspaces/workspace-1/channels",
    );
    expect(mocks.orderByMock).toHaveBeenCalledWith("name", "asc");
    expect(mocks.queryMock).toHaveBeenCalledWith(
      "CHANNELS_COLLECTION",
      "ORDER_BY_NAME",
    );

    expect(result.current.channels).toHaveLength(2);
    expect(result.current.channels[0]).toEqual({
      channelId: "general",
      workspaceId: "workspace-1",
      name: "general",
      createdBy: "user-1",
      createdAt,
      lastMessageAt,
      messageCount: 12,
    });
    expect(result.current.channels[1]).toEqual(
      expect.objectContaining({
        channelId: "random",
        workspaceId: "workspace-2",
        name: "random",
        createdBy: "user-2",
        createdAt,
      }),
    );
    expect(result.current.channels[1].lastMessageAt).toBeUndefined();
    expect(result.current.channels[1].messageCount).toBeUndefined();
  });

  it("surfaces Firestore subscription errors", async () => {
    const snapshotError = new Error("Unable to load channels");
    mocks.onSnapshotMock.mockImplementation(
      (
        _queryRef: unknown,
        _onNext: (snapshot: { docs: Array<unknown> }) => void,
        onError: (error: Error) => void,
      ) => {
        onError(snapshotError);
        return mocks.unsubscribeMock;
      },
    );

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.error).toBe(snapshotError);
    });
    expect(result.current.loading).toBe(false);
  });

  it("cleans up the Firestore subscription on unmount", async () => {
    const { unmount } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(mocks.onSnapshotMock).toHaveBeenCalled();
    });

    unmount();

    expect(mocks.unsubscribeMock).toHaveBeenCalled();
  });
});
