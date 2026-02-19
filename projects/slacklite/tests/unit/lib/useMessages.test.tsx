import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  limitMock: vi.fn(),
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
    limit: mocks.limitMock,
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

import { useMessages } from "@/lib/hooks/useMessages";

describe("useMessages", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mockFn) => mockFn.mockReset());

    mocks.collectionMock.mockReturnValue("MESSAGES_COLLECTION");
    mocks.orderByMock.mockReturnValue("ORDER_BY_TIMESTAMP_DESC");
    mocks.limitMock.mockReturnValue("LIMIT_50");
    mocks.queryMock.mockReturnValue("MESSAGES_QUERY");
    mocks.onSnapshotMock.mockReturnValue(mocks.unsubscribeMock);
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
    expect(mocks.onSnapshotMock).not.toHaveBeenCalled();
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
      {},
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
