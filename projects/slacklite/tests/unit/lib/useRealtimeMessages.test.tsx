import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({
  offMock: vi.fn(),
  onChildAddedMock: vi.fn(),
  onValueMock: vi.fn(),
  pushMock: vi.fn(),
  refMock: vi.fn(),
  setMock: vi.fn(),
}));

const firestoreMocks = vi.hoisted(() => ({
  docMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  setDocMock: vi.fn(),
}));

const sentryMocks = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
}));

vi.mock("firebase/database", async () => {
  const actual = await vi.importActual<typeof import("firebase/database")>("firebase/database");

  return {
    ...actual,
    off: databaseMocks.offMock,
    onChildAdded: databaseMocks.onChildAddedMock,
    onValue: databaseMocks.onValueMock,
    push: databaseMocks.pushMock,
    ref: databaseMocks.refMock,
    set: databaseMocks.setMock,
  };
});

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual<typeof import("firebase/firestore")>("firebase/firestore");

  return {
    ...actual,
    doc: firestoreMocks.docMock,
    serverTimestamp: firestoreMocks.serverTimestampMock,
    setDoc: firestoreMocks.setDocMock,
  };
});

vi.mock("@sentry/nextjs", () => ({
  captureException: sentryMocks.captureExceptionMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: {},
  rtdb: {},
}));

import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";

describe("useRealtimeMessages", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T14:00:00.000Z"));

    Object.values(databaseMocks).forEach((mockFn) => mockFn.mockReset());
    Object.values(firestoreMocks).forEach((mockFn) => mockFn.mockReset());
    sentryMocks.captureExceptionMock.mockReset();

    firestoreMocks.serverTimestampMock.mockReturnValue("SERVER_TIMESTAMP");
    firestoreMocks.docMock.mockImplementation((_firestore: unknown, path: string) => ({ path }));
    firestoreMocks.setDocMock.mockResolvedValue(undefined);

    databaseMocks.refMock.mockImplementation((_database: unknown, path: string) => ({ path }));
    databaseMocks.onValueMock.mockImplementation(
      (_reference: unknown, onSuccess: (snapshot: { val: () => boolean }) => void) => {
        onSuccess({ val: () => true });
      },
    );
    databaseMocks.onChildAddedMock.mockImplementation(() => undefined);
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-1",
      path: `${messagePathRef.path}/server-message-1`,
    }));
    databaseMocks.setMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds a temp sending message immediately before RTDB write resolves", async () => {
    let resolveSet: (() => void) | null = null;

    databaseMocks.setMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSet = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    act(() => {
      void result.current.sendMessage("hello world");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].messageId).toMatch(/^temp_\d+$/);
    expect(result.current.messages[0].status).toBe("sending");

    await act(async () => {
      resolveSet?.();
      await Promise.resolve();
    });
  });

  it("rejects messages over 4000 characters before attempting RTDB/Firestore writes", async () => {
    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.sendMessage("a".repeat(4001));
      } catch (error) {
        thrownError = error instanceof Error ? error : new Error(String(error));
      }
    });

    expect(thrownError?.message).toBe("Message too long. Maximum 4,000 characters.");
    expect(result.current.messages).toEqual([]);
    expect(databaseMocks.pushMock).not.toHaveBeenCalled();
    expect(databaseMocks.setMock).not.toHaveBeenCalled();
    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("blocks messages with XSS patterns before attempting RTDB/Firestore writes", async () => {
    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    let messageId = "not-set";
    await act(async () => {
      messageId = await result.current.sendMessage("javascript:alert(1)");
    });

    expect(messageId).toBe("");
    expect(result.current.messages).toEqual([]);
    expect(databaseMocks.pushMock).not.toHaveBeenCalled();
    expect(databaseMocks.setMock).not.toHaveBeenCalled();
    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("writes RTDB first, then Firestore, with shared messageId and 1-hour RTDB ttl", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-2",
      path: `${messagePathRef.path}/server-message-2`,
    }));

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    let messageId = "";
    await act(async () => {
      messageId = await result.current.sendMessage("ship it");
    });

    expect(messageId).toBe("server-message-2");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].messageId).toBe("server-message-2");
    expect(result.current.messages[0].status).toBe("sent");

    expect(databaseMocks.refMock).toHaveBeenCalledWith({}, "messages/workspace-1/channel-1");
    expect(databaseMocks.setMock).toHaveBeenCalledTimes(1);
    const rtdbPayload = databaseMocks.setMock.mock.calls[0][1] as { timestamp: number; ttl: number };
    expect(rtdbPayload.ttl - rtdbPayload.timestamp).toBe(60 * 60 * 1000);

    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      {},
      "workspaces/workspace-1/channels/channel-1/messages/server-message-2",
    );
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(
      { path: "workspaces/workspace-1/channels/channel-1/messages/server-message-2" },
      {
        messageId: "server-message-2",
        channelId: "channel-1",
        workspaceId: "workspace-1",
        userId: "user-1",
        userName: "Austen",
        text: "ship it",
        timestamp: "SERVER_TIMESTAMP",
        createdAt: "SERVER_TIMESTAMP",
      },
    );

    expect(databaseMocks.setMock.mock.invocationCallOrder[0]).toBeLessThan(
      firestoreMocks.setDocMock.mock.invocationCallOrder[0],
    );
  });

  it("uses DM-specific RTDB and Firestore paths in dm mode", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "dm-message-1",
      path: `${messagePathRef.path}/dm-message-1`,
    }));

    const { result } = renderHook(() =>
      useRealtimeMessages(
        "workspace-1",
        "dm-1",
        {
          userId: "user-1",
          userName: "Austen",
        },
        {
          targetType: "dm",
          firestoreThreadId: "dm-1",
          rtdbThreadId: "dm-dm-1",
        },
      ),
    );

    await act(async () => {
      await result.current.sendMessage("hello dm");
    });

    expect(databaseMocks.refMock).toHaveBeenCalledWith({}, "messages/workspace-1/dm-dm-1");
    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      {},
      "workspaces/workspace-1/directMessages/dm-1/messages/dm-message-1",
    );
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(
      { path: "workspaces/workspace-1/directMessages/dm-1/messages/dm-message-1" },
      {
        messageId: "dm-message-1",
        channelId: "dm-1",
        workspaceId: "workspace-1",
        userId: "user-1",
        userName: "Austen",
        text: "hello dm",
        timestamp: "SERVER_TIMESTAMP",
        createdAt: "SERVER_TIMESTAMP",
      },
    );
  });

  it("writes DM messages to dm-{dmId} RTDB path and directMessages Firestore path", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-dm",
      path: `${messagePathRef.path}/server-message-dm`,
    }));

    const { result } = renderHook(() =>
      useRealtimeMessages(
        "workspace-1",
        "dm-123",
        {
          userId: "user-1",
          userName: "Austen",
        },
        {
          targetType: "dm",
          rtdbThreadId: "dm-dm-123",
          firestoreThreadId: "dm-123",
        },
      ),
    );

    let messageId = "";
    await act(async () => {
      messageId = await result.current.sendMessage("dm hello");
    });

    expect(messageId).toBe("server-message-dm");
    expect(databaseMocks.refMock).toHaveBeenCalledWith({}, "messages/workspace-1/dm-dm-123");
    expect(firestoreMocks.docMock).toHaveBeenCalledWith(
      {},
      "workspaces/workspace-1/directMessages/dm-123/messages/server-message-dm",
    );
    expect(firestoreMocks.setDocMock).toHaveBeenCalledWith(
      { path: "workspaces/workspace-1/directMessages/dm-123/messages/server-message-dm" },
      {
        messageId: "server-message-dm",
        channelId: "dm-123",
        workspaceId: "workspace-1",
        userId: "user-1",
        userName: "Austen",
        text: "dm hello",
        timestamp: "SERVER_TIMESTAMP",
        createdAt: "SERVER_TIMESTAMP",
      },
    );
  });

  it("aborts on RTDB failure, rolls back optimistic UI, shows error banner, and skips Firestore", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-rtdb-fail",
      path: `${messagePathRef.path}/server-message-rtdb-fail`,
    }));
    databaseMocks.setMock.mockRejectedValueOnce(new Error("RTDB unavailable"));

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.sendMessage("retry this");
      } catch (error) {
        thrownError = error instanceof Error ? error : new Error(String(error));
      }
    });

    expect(thrownError?.message).toBe("RTDB unavailable");
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.sendErrorBanner).toBe("Message failed to send. Retry?");
    expect(firestoreMocks.setDocMock).not.toHaveBeenCalled();
  });

  it("continues on Firestore failure, shows warning banner, and retries manually with same messageId", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-firestore-fail",
      path: `${messagePathRef.path}/server-message-firestore-fail`,
    }));
    firestoreMocks.setDocMock.mockRejectedValueOnce(new Error("Firestore unavailable"));

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    let messageId = "";
    await act(async () => {
      messageId = await result.current.sendMessage("persist me");
    });

    expect(messageId).toBe("server-message-firestore-fail");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].messageId).toBe("server-message-firestore-fail");
    expect(result.current.messages[0].status).toBe("sent");
    expect(result.current.firestoreWarningBanner).toEqual({
      message: "Message sent but not saved. It will disappear in 1 hour.",
      messageId: "server-message-firestore-fail",
      pendingCount: 1,
    });
    expect(sentryMocks.captureExceptionMock).toHaveBeenCalledTimes(1);

    firestoreMocks.setDocMock.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.retryFirestoreWrite("server-message-firestore-fail");
    });

    expect(firestoreMocks.docMock).toHaveBeenNthCalledWith(
      1,
      {},
      "workspaces/workspace-1/channels/channel-1/messages/server-message-firestore-fail",
    );
    expect(firestoreMocks.docMock).toHaveBeenNthCalledWith(
      2,
      {},
      "workspaces/workspace-1/channels/channel-1/messages/server-message-firestore-fail",
    );
    expect(result.current.firestoreWarningBanner).toBeNull();
  });

  it("retries queued Firestore writes in the background", async () => {
    databaseMocks.pushMock.mockImplementation((messagePathRef: { path: string }) => ({
      key: "server-message-background-retry",
      path: `${messagePathRef.path}/server-message-background-retry`,
    }));
    firestoreMocks.setDocMock.mockRejectedValueOnce(new Error("Transient Firestore outage"));

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("background retry");
    });

    expect(result.current.firestoreWarningBanner?.messageId).toBe("server-message-background-retry");
    expect(firestoreMocks.setDocMock).toHaveBeenCalledTimes(1);

    firestoreMocks.setDocMock.mockResolvedValueOnce(undefined);

    await act(async () => {
      vi.advanceTimersByTime(15_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(firestoreMocks.setDocMock).toHaveBeenCalledTimes(2);
    expect(result.current.firestoreWarningBanner).toBeNull();
  });
});
