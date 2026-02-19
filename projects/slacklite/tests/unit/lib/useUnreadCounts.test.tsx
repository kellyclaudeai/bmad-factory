import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Channel } from "@/lib/types/models";

const mocks = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  firestoreMock: {},
  rtdbMock: {},
  firestoreCollectionMock: vi.fn(),
  firestoreDocMock: vi.fn(),
  firestoreIncrementMock: vi.fn((amount: number) => ({ op: "increment", amount })),
  firestoreOnSnapshotMock: vi.fn(),
  firestoreQueryMock: vi.fn(),
  firestoreServerTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
  firestoreSetDocMock: vi.fn(),
  firestoreUpdateDocMock: vi.fn(),
  firestoreWhereMock: vi.fn(),
  databaseOffMock: vi.fn(),
  databaseOnChildAddedMock: vi.fn(),
  databaseOrderByChildMock: vi.fn(),
  databaseQueryMock: vi.fn(),
  databaseRefMock: vi.fn(),
  databaseStartAtMock: vi.fn(),
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: mocks.firestoreMock,
  rtdb: mocks.rtdbMock,
}));

vi.mock("firebase/firestore", () => ({
  collection: mocks.firestoreCollectionMock,
  doc: mocks.firestoreDocMock,
  increment: mocks.firestoreIncrementMock,
  onSnapshot: mocks.firestoreOnSnapshotMock,
  query: mocks.firestoreQueryMock,
  serverTimestamp: mocks.firestoreServerTimestampMock,
  setDoc: mocks.firestoreSetDocMock,
  updateDoc: mocks.firestoreUpdateDocMock,
  where: mocks.firestoreWhereMock,
}));

vi.mock("firebase/database", () => ({
  off: mocks.databaseOffMock,
  onChildAdded: mocks.databaseOnChildAddedMock,
  orderByChild: mocks.databaseOrderByChildMock,
  query: mocks.databaseQueryMock,
  ref: mocks.databaseRefMock,
  startAt: mocks.databaseStartAtMock,
}));

import { useUnreadCounts } from "@/lib/hooks/useUnreadCounts";

interface HookHarnessProps {
  channels: Channel[];
  activeTargetId?: string;
}

function HookHarness({ channels, activeTargetId }: HookHarnessProps) {
  const { unreadCounts } = useUnreadCounts({
    channels,
    activeTargetId,
    activeTargetType: "channel",
  });

  return <output data-testid="unread-counts">{JSON.stringify(unreadCounts)}</output>;
}

function createChannel(channelId: string): Channel {
  return {
    channelId,
    workspaceId: "workspace-1",
    name: channelId,
    createdBy: "user-1",
    createdAt: {} as Channel["createdAt"],
  };
}

describe("useUnreadCounts", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
      },
    });

    mocks.firestoreCollectionMock.mockReturnValue("UNREAD_COUNTS_COLLECTION");
    mocks.firestoreWhereMock.mockReturnValue("USER_FILTER");
    mocks.firestoreQueryMock.mockReturnValue("UNREAD_COUNTS_QUERY");
    mocks.firestoreDocMock.mockImplementation(
      (_firestore: unknown, collectionPath: string, documentId: string) =>
        `${collectionPath}/${documentId}`,
    );
    mocks.firestoreOnSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<{ data: () => unknown }> }) => void) => {
        onNext({ docs: [] });
        return vi.fn();
      },
    );
    mocks.firestoreUpdateDocMock.mockResolvedValue(undefined);
    mocks.firestoreSetDocMock.mockResolvedValue(undefined);

    mocks.databaseRefMock.mockImplementation(
      (_database: unknown, path: string) => ({ path }),
    );
    mocks.databaseOrderByChildMock.mockReturnValue("ORDER_BY_TIMESTAMP");
    mocks.databaseStartAtMock.mockReturnValue("START_AT_NOW");
    mocks.databaseQueryMock.mockImplementation(
      (databaseRef: { path: string }) => ({ path: databaseRef.path }),
    );
  });

  it("subscribes to all channels and increments unread for non-active channel messages", async () => {
    const childAddedHandlers = new Map<string, (snapshot: { key: string; val: () => unknown }) => void>();

    mocks.databaseOnChildAddedMock.mockImplementation(
      (channelQuery: { path: string }, callback: (snapshot: { key: string; val: () => unknown }) => void) => {
        childAddedHandlers.set(channelQuery.path, callback);
      },
    );

    render(
      <HookHarness
        channels={[createChannel("general"), createChannel("dev-team")]}
        activeTargetId="general"
      />,
    );

    await waitFor(() => {
      expect(mocks.databaseOnChildAddedMock).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mocks.firestoreUpdateDocMock).toHaveBeenCalledWith(
        "unreadCounts/user-1_general",
        expect.objectContaining({ count: 0, targetType: "channel" }),
      );
    });

    mocks.firestoreUpdateDocMock.mockClear();
    mocks.firestoreIncrementMock.mockClear();

    const devTeamHandler = childAddedHandlers.get("messages/workspace-1/dev-team");
    expect(devTeamHandler).toBeDefined();

    devTeamHandler?.({
      key: "message-1",
      val: () => ({ userId: "user-2" }),
    });

    await waitFor(() => {
      expect(mocks.firestoreIncrementMock).toHaveBeenCalledWith(1);
      expect(mocks.firestoreUpdateDocMock).toHaveBeenCalledWith(
        "unreadCounts/user-1_dev-team",
        expect.objectContaining({
          count: { op: "increment", amount: 1 },
          updatedAt: "SERVER_TIMESTAMP",
        }),
      );
    });
  });

  it("does not increment unread count for messages in the active channel", async () => {
    const childAddedHandlers = new Map<string, (snapshot: { key: string; val: () => unknown }) => void>();

    mocks.databaseOnChildAddedMock.mockImplementation(
      (channelQuery: { path: string }, callback: (snapshot: { key: string; val: () => unknown }) => void) => {
        childAddedHandlers.set(channelQuery.path, callback);
      },
    );

    render(
      <HookHarness
        channels={[createChannel("general")]}
        activeTargetId="general"
      />,
    );

    await waitFor(() => {
      expect(mocks.databaseOnChildAddedMock).toHaveBeenCalledTimes(1);
    });

    mocks.firestoreUpdateDocMock.mockClear();
    mocks.firestoreSetDocMock.mockClear();

    const generalHandler = childAddedHandlers.get("messages/workspace-1/general");
    expect(generalHandler).toBeDefined();

    generalHandler?.({
      key: "message-2",
      val: () => ({ userId: "user-2" }),
    });

    await waitFor(() => {
      expect(mocks.firestoreUpdateDocMock).not.toHaveBeenCalled();
      expect(mocks.firestoreSetDocMock).not.toHaveBeenCalled();
    });
  });

  it("clears unread count when the active channel changes", async () => {
    mocks.databaseOnChildAddedMock.mockImplementation(() => undefined);

    const { rerender } = render(
      <HookHarness channels={[createChannel("general"), createChannel("dev-team")]} activeTargetId="general" />,
    );

    await waitFor(() => {
      expect(mocks.firestoreUpdateDocMock).toHaveBeenCalledWith(
        "unreadCounts/user-1_general",
        expect.objectContaining({
          userId: "user-1",
          targetId: "general",
          targetType: "channel",
          count: 0,
          lastReadAt: "SERVER_TIMESTAMP",
          updatedAt: "SERVER_TIMESTAMP",
        }),
      );
    });

    mocks.firestoreUpdateDocMock.mockClear();

    rerender(
      <HookHarness channels={[createChannel("general"), createChannel("dev-team")]} activeTargetId="dev-team" />,
    );

    await waitFor(() => {
      expect(mocks.firestoreUpdateDocMock).toHaveBeenCalledWith(
        "unreadCounts/user-1_dev-team",
        expect.objectContaining({
          userId: "user-1",
          targetId: "dev-team",
          targetType: "channel",
          count: 0,
          lastReadAt: "SERVER_TIMESTAMP",
          updatedAt: "SERVER_TIMESTAMP",
        }),
      );
    });
  });

  it("maps unread counts from the Firestore subscription", async () => {
    mocks.databaseOnChildAddedMock.mockImplementation(() => undefined);
    mocks.firestoreOnSnapshotMock.mockImplementation(
      (_queryRef: unknown, onNext: (snapshot: { docs: Array<{ data: () => unknown }> }) => void) => {
        onNext({
          docs: [
            {
              data: () => ({ targetId: "general", count: 0 }),
            },
            {
              data: () => ({ targetId: "dev-team", count: 3 }),
            },
          ],
        });
        return vi.fn();
      },
    );

    render(
      <HookHarness channels={[createChannel("general"), createChannel("dev-team")]} activeTargetId="general" />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread-counts")).toHaveTextContent('"general":0');
      expect(screen.getByTestId("unread-counts")).toHaveTextContent('"dev-team":3');
    });
  });
});
