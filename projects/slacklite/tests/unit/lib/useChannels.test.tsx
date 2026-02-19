import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  onSnapshotMock: vi.fn(),
  orderByMock: vi.fn(),
  queryMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("firebase/firestore", async () => {
  const actual =
    await vi.importActual<typeof import("firebase/firestore")>(
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

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: {},
}));

import { Timestamp } from "firebase/firestore";

import { useChannels } from "@/lib/hooks/useChannels";

describe("useChannels", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mockFn) => mockFn.mockReset());

    mocks.collectionMock.mockReturnValue("CHANNELS_COLLECTION");
    mocks.orderByMock.mockReturnValue("ORDER_BY_NAME_ASC");
    mocks.queryMock.mockReturnValue("CHANNELS_QUERY");
    mocks.onSnapshotMock.mockReturnValue(mocks.unsubscribeMock);
  });

  it("returns an empty, non-loading state when auth context has no workspace", async () => {
    mocks.useAuthMock.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.channels).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mocks.onSnapshotMock).not.toHaveBeenCalled();
  });

  it("subscribes to workspace channels and parses valid documents", async () => {
    let onSnapshotSuccess:
      | ((snapshot: {
          docs: Array<{ id: string; data: () => Record<string, unknown> }>;
        }) => void)
      | null = null;

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: " workspace-1 ",
      },
    });
    mocks.onSnapshotMock.mockImplementation(
      (
        _query: unknown,
        onSuccess: (snapshot: {
          docs: Array<{ id: string; data: () => Record<string, unknown> }>;
        }) => void,
      ) => {
        onSnapshotSuccess = onSuccess;
        return mocks.unsubscribeMock;
      },
    );

    const createdAt = Timestamp.fromMillis(1700000000000);
    const lastMessageAt = Timestamp.fromMillis(1700000001000);

    const { result } = renderHook(() => useChannels());

    expect(mocks.collectionMock).toHaveBeenCalledWith(
      {},
      "workspaces/workspace-1/channels",
    );
    expect(mocks.orderByMock).toHaveBeenCalledWith("name", "asc");
    expect(mocks.queryMock).toHaveBeenCalledWith(
      "CHANNELS_COLLECTION",
      "ORDER_BY_NAME_ASC",
    );

    act(() => {
      onSnapshotSuccess?.({
        docs: [
          {
            id: "general",
            data: () => ({
              workspaceId: "   ",
              name: "general",
              createdBy: "user-1",
              createdAt,
              lastMessageAt,
              messageCount: 12,
            }),
          },
          {
            id: "invalid-created-at",
            data: () => ({
              name: "invalid-created-at",
              createdBy: "user-1",
              createdAt: "not-a-timestamp",
            }),
          },
          {
            id: "invalid-created-by",
            data: () => ({
              name: "invalid-created-by",
              createdBy: "   ",
              createdAt,
            }),
          },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.channels).toEqual([
      {
        channelId: "general",
        workspaceId: "workspace-1",
        name: "general",
        createdBy: "user-1",
        createdAt,
        lastMessageAt,
        messageCount: 12,
      },
    ]);
  });

  it("surfaces subscription errors", async () => {
    let onSnapshotError: ((error: Error) => void) | null = null;

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });
    mocks.onSnapshotMock.mockImplementation(
      (
        _query: unknown,
        _onSuccess: unknown,
        onError: (error: Error) => void,
      ) => {
        onSnapshotError = onError;
        return mocks.unsubscribeMock;
      },
    );

    const { result } = renderHook(() => useChannels());
    const snapshotError = new Error("Channel read failed");

    act(() => {
      onSnapshotError?.(snapshotError);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe(snapshotError);
    expect(result.current.channels).toEqual([]);
  });

  it("unsubscribes from firestore when unmounted", () => {
    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });

    const { unmount } = renderHook(() => useChannels());
    unmount();

    expect(mocks.unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
