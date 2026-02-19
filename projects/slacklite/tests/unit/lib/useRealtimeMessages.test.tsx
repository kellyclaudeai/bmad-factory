import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => ({
  offMock: vi.fn(),
  onChildAddedMock: vi.fn(),
  onValueMock: vi.fn(),
  pushMock: vi.fn(),
  refMock: vi.fn(),
  setMock: vi.fn(),
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

vi.mock("@/lib/firebase/client", () => ({
  rtdb: {},
}));

import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";

describe("useRealtimeMessages", () => {
  beforeEach(() => {
    Object.values(databaseMocks).forEach((mockFn) => mockFn.mockReset());

    databaseMocks.refMock.mockImplementation((_database: unknown, path: string) => ({ path }));
    databaseMocks.onValueMock.mockImplementation(
      (_reference: unknown, onSuccess: (snapshot: { val: () => boolean }) => void) => {
        onSuccess({ val: () => true });
      },
    );
    databaseMocks.onChildAddedMock.mockImplementation(() => undefined);
    databaseMocks.pushMock.mockReturnValue({ key: "server-message-1" });
    databaseMocks.setMock.mockResolvedValue(undefined);
  });

  it("adds a temp sending message immediately before the network write resolves", async () => {
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

  it("replaces temp id with server id and marks message sent when write succeeds", async () => {
    databaseMocks.pushMock.mockReturnValue({ key: "server-message-2" });
    databaseMocks.setMock.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("ship it");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].messageId).toBe("server-message-2");
    expect(result.current.messages[0].status).toBe("sent");
  });

  it("marks message failed when send fails and can retry to sent", async () => {
    databaseMocks.pushMock
      .mockReturnValueOnce({ key: "server-message-fail" })
      .mockReturnValueOnce({ key: "server-message-retry" });
    databaseMocks.setMock
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() =>
      useRealtimeMessages("workspace-1", "channel-1", {
        userId: "user-1",
        userName: "Austen",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("retry this");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].status).toBe("failed");

    const failedMessageId = result.current.messages[0].messageId;

    await act(async () => {
      await result.current.retryMessage(failedMessageId);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].messageId).toBe("server-message-retry");
    expect(result.current.messages[0].status).toBe("sent");
  });
});
