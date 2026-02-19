import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  collectionMock: vi.fn(),
  firestoreMock: {},
  limitMock: vi.fn(),
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
    limit: mocks.limitMock,
    onSnapshot: mocks.onSnapshotMock,
    orderBy: mocks.orderByMock,
    query: mocks.queryMock,
  };
});

import { useMessages } from "@/lib/hooks/useMessages";

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
    mocks.limitMock.mockReturnValue("LIMIT_50");
    mocks.queryMock.mockReturnValue("MESSAGES_QUERY");
    mocks.onSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<unknown> }) => void) => {
        onNext({ docs: [] });
        return mocks.unsubscribeMock;
      },
    );
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
    expect(mocks.onSnapshotMock).not.toHaveBeenCalled();
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

  it("cleans up the Firestore subscription on unmount", async () => {
    const { unmount } = renderHook(() => useMessages("general"));

    await waitFor(() => {
      expect(mocks.onSnapshotMock).toHaveBeenCalled();
    });

    unmount();

    expect(mocks.unsubscribeMock).toHaveBeenCalled();
  });
});
