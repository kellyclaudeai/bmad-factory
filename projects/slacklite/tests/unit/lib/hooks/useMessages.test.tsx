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
    getDocs: mocks.getDocsMock,
    limit: mocks.limitMock,
    onSnapshot: mocks.onSnapshotMock,
    orderBy: mocks.orderByMock,
    query: mocks.queryMock,
    startAfter: mocks.startAfterMock,
  };
});

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

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: " workspace-1 ",
      },
    });
    mocks.collectionMock.mockReturnValue("MESSAGES_COLLECTION");
    mocks.orderByMock.mockReturnValue("ORDER_BY_TIMESTAMP");
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

  it("returns an empty settled state when workspace or channel is missing", async () => {
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

  it("subscribes to channel messages, de-duplicates IDs, and restores ascending order", async () => {
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<{ id: string; data: () => unknown }> }) => void) => {
        onNext({
          docs: [
            {
              id: "message-3",
              data: () => ({ text: "third" }),
            },
            {
              id: "message-2",
              data: () => ({ text: "second" }),
            },
            {
              id: "message-2",
              data: () => ({ text: "duplicate should be dropped" }),
            },
            {
              id: "message-1",
              data: () => ({ text: "first" }),
            },
          ],
        });

        return mocks.unsubscribeMock;
      },
    );

    const { result } = renderHook(() => useMessages(" channel-1 "));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mocks.collectionMock).toHaveBeenCalledWith(
      mocks.firestoreMock,
      "workspaces/workspace-1/channels/channel-1/messages",
    );
    expect(mocks.orderByMock).toHaveBeenCalledWith("timestamp", "desc");
    expect(mocks.limitMock).toHaveBeenCalledWith(50);
    expect(mocks.queryMock).toHaveBeenCalledWith(
      "MESSAGES_COLLECTION",
      "ORDER_BY_TIMESTAMP",
      "LIMIT_50",
    );

    expect(result.current.messages.map((message) => message.messageId)).toEqual([
      "message-1",
      "message-2",
      "message-3",
    ]);
    expect(result.current.messages[1].text).toBe("second");
    expect(result.current.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(mocks.getDocsMock).not.toHaveBeenCalled();
  });

  it("loads older messages with startAfter cursor and prepends them", async () => {
    const newestPageDocs = createDescendingDocs(100, 51);
    const olderPageDocs = createDescendingDocs(50, 21);

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

  it("surfaces Firestore subscription errors", async () => {
    const snapshotError = new Error("Unable to load messages");
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

    const { result } = renderHook(() => useMessages("general"));

    await waitFor(() => {
      expect(result.current.error).toBe(snapshotError);
    });
    expect(result.current.loading).toBe(false);
  });

  it("surfaces loadMore errors and resets loadingMore state", async () => {
    const newestPageDocs = createDescendingDocs(100, 51);
    const loadMoreError = new Error("Unable to load older messages");

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

  it("cleans up the Firestore subscription on unmount", async () => {
    const { unmount } = renderHook(() => useMessages("general"));

    await waitFor(() => {
      expect(mocks.onSnapshotMock).toHaveBeenCalled();
    });

    unmount();

    expect(mocks.unsubscribeMock).toHaveBeenCalled();
  });
});
