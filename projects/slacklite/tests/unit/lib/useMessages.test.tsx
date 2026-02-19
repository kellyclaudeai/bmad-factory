import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  firestoreMock: {},
  getDocsMock: vi.fn(),
  limitMock: vi.fn(),
  onSnapshotMock: vi.fn(),
  orderByMock: vi.fn(),
  queryMock: vi.fn(),
  startAfterMock: vi.fn(),
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
    getDocs: mocks.getDocsMock,
    limit: mocks.limitMock,
    onSnapshot: mocks.onSnapshotMock,
    orderBy: mocks.orderByMock,
    query: mocks.queryMock,
    startAfter: mocks.startAfterMock,
  };
});

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: mocks.firestoreMock,
}));

import { useMessages } from "@/lib/hooks/useMessages";

function createDescendingDocs(from: number, to: number) {
  return Array.from({ length: from - to + 1 }, (_, index) => {
    const value = from - index;

    return {
      id: `message-${value}`,
      data: () => ({ text: `message-${value}` }),
    };
  });
}

describe("useMessages", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.collectionMock.mockReturnValue("MESSAGES_COLLECTION");
    mocks.orderByMock.mockReturnValue("ORDER_BY_TIMESTAMP_DESC");
    mocks.limitMock.mockImplementation((amount: number) => `LIMIT_${amount}`);
    mocks.startAfterMock.mockImplementation((cursor: unknown) => ["START_AFTER", cursor]);
    mocks.queryMock.mockImplementation((...constraints: unknown[]) => constraints);
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<unknown> }) => void) => {
        onNext({ docs: [] });
        return mocks.unsubscribeMock;
      },
    );
    mocks.getDocsMock.mockResolvedValue({
      empty: true,
      docs: [],
    });
  });

  it("returns an empty, non-loading state when channel or workspace is missing", async () => {
    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "",
      },
    });

    const { result } = renderHook(() => useMessages("channel-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingMore).toBe(false);
    expect(mocks.onSnapshotMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.loadMore();
    });
    expect(mocks.getDocsMock).not.toHaveBeenCalled();
  });

  it("subscribes to channel messages, de-duplicates by id, and returns ascending order", async () => {
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

    const { result } = renderHook(() => useMessages(" channel-1 "));

    expect(mocks.collectionMock).toHaveBeenCalledWith(
      mocks.firestoreMock,
      "workspaces/workspace-1/channels/channel-1/messages",
    );
    expect(mocks.orderByMock).toHaveBeenCalledWith("timestamp", "desc");
    expect(mocks.limitMock).toHaveBeenCalledWith(50);
    expect(mocks.queryMock).toHaveBeenCalledWith(
      "MESSAGES_COLLECTION",
      "ORDER_BY_TIMESTAMP_DESC",
      "LIMIT_50",
    );

    act(() => {
      onSnapshotSuccess?.({
        docs: [
          {
            id: "message-3",
            data: () => ({
              text: "latest",
              userId: "user-1",
            }),
          },
          {
            id: "message-2",
            data: () => ({
              text: "middle",
              userId: "user-2",
            }),
          },
          {
            id: "message-2",
            data: () => ({
              text: "duplicate",
              userId: "user-2",
            }),
          },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages.map((message) => message.messageId)).toEqual([
      "message-2",
      "message-3",
    ]);
    expect(result.current.messages.map((message) => message.text)).toEqual([
      "middle",
      "latest",
    ]);
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(mocks.getDocsMock).not.toHaveBeenCalled();
  });

  it("loads older messages with startAfter cursor and prepends them", async () => {
    const newestPageDocs = createDescendingDocs(100, 51);
    const olderPageDocs = createDescendingDocs(50, 21);

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<unknown> }) => void) => {
        onNext({ docs: newestPageDocs });
        return mocks.unsubscribeMock;
      },
    );
    mocks.getDocsMock.mockResolvedValue({
      empty: false,
      docs: olderPageDocs,
    });

    const { result } = renderHook(() => useMessages("channel-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.hasMore).toBe(true);

    const lastVisibleDoc = newestPageDocs[newestPageDocs.length - 1];

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mocks.startAfterMock).toHaveBeenCalledWith(lastVisibleDoc);
    expect(mocks.limitMock).toHaveBeenCalledWith(50);
    expect(mocks.getDocsMock).toHaveBeenCalledTimes(1);
    expect(result.current.messages[0].messageId).toBe("message-21");
    expect(result.current.messages[result.current.messages.length - 1]?.messageId).toBe("message-100");
    expect(result.current.loadingMore).toBe(false);
    expect(result.current.hasMore).toBe(false);
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

    const { result } = renderHook(() => useMessages("channel-1"));
    const snapshotError = new Error("Message read failed");

    act(() => {
      onSnapshotError?.(snapshotError);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe(snapshotError);
    expect(result.current.messages).toEqual([]);
  });

  it("surfaces loadMore errors and resets loadingMore state", async () => {
    const newestPageDocs = createDescendingDocs(100, 51);
    const loadMoreError = new Error("Unable to load older messages");

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<unknown> }) => void) => {
        onNext({ docs: newestPageDocs });
        return mocks.unsubscribeMock;
      },
    );
    mocks.getDocsMock.mockRejectedValue(loadMoreError);

    const { result } = renderHook(() => useMessages("channel-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe(loadMoreError);
    expect(result.current.loadingMore).toBe(false);
  });

  it("unsubscribes from firestore when unmounted", () => {
    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });

    const { unmount } = renderHook(() => useMessages("channel-1"));
    unmount();

    expect(mocks.unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
