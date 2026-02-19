import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "@/lib/types/models";

const mocks = vi.hoisted(() => ({
  deleteChannelMock: vi.fn(),
  renameChannelMock: vi.fn(),
  useAuthMock: vi.fn(),
  useChannelsMock: vi.fn(),
  useParamsMock: vi.fn(),
  useRouterMock: vi.fn(),
  useRealtimeMessagesMock: vi.fn(),
  useWorkspaceOwnerIdMock: vi.fn(),
  routerReplaceMock: vi.fn(),
  retryFirestoreWriteMock: vi.fn(),
  retryLastSendMock: vi.fn(),
  retryMessageMock: vi.fn(),
  scrollToMock: vi.fn(),
  sendMessageMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mocks.useParamsMock,
  useRouter: mocks.useRouterMock,
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/hooks/useChannels", () => ({
  useChannels: mocks.useChannelsMock,
}));

vi.mock("@/lib/hooks/useWorkspaceOwnerId", () => ({
  useWorkspaceOwnerId: mocks.useWorkspaceOwnerIdMock,
}));

vi.mock("@/lib/hooks/useRealtimeMessages", () => ({
  useRealtimeMessages: mocks.useRealtimeMessagesMock,
}));

vi.mock("@/lib/utils/channels", () => ({
  deleteChannel: mocks.deleteChannelMock,
  renameChannel: mocks.renameChannelMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: {},
}));

import ChannelPage from "@/app/app/channels/[channelId]/page";

function createMessage(overrides: Partial<Message> = {}): Message {
  const timestamp = Timestamp.now();

  return {
    messageId: "message-1",
    channelId: "channel-1",
    workspaceId: "workspace-1",
    userId: "user-1",
    userName: "Austen",
    text: "Hello world",
    timestamp,
    createdAt: timestamp,
    status: "sent",
    ...overrides,
  };
}

interface MockRealtimeHookState {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  sendMessage: typeof mocks.sendMessageMock;
  retryMessage: typeof mocks.retryMessageMock;
  sendErrorBanner: string | null;
  retryLastSend: typeof mocks.retryLastSendMock;
  firestoreWarningBanner: {
    message: string;
    messageId: string;
    pendingCount: number;
  } | null;
  retryFirestoreWrite: typeof mocks.retryFirestoreWriteMock;
}

function createRealtimeHookState(
  overrides: Partial<MockRealtimeHookState> = {},
): MockRealtimeHookState {
  return {
    messages: [],
    loading: false,
    error: null,
    sendMessage: mocks.sendMessageMock,
    retryMessage: mocks.retryMessageMock,
    sendErrorBanner: null,
    retryLastSend: mocks.retryLastSendMock,
    firestoreWarningBanner: null,
    retryFirestoreWrite: mocks.retryFirestoreWriteMock,
    ...overrides,
  };
}

function setScrollMetrics(
  element: HTMLElement,
  {
    scrollTop,
    clientHeight,
    scrollHeight,
  }: {
    scrollTop: number;
    clientHeight: number;
    scrollHeight: number;
  },
): void {
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    value: scrollTop,
    writable: true,
  });
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
}

describe("ChannelPage", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.useParamsMock.mockReturnValue({ channelId: "general" });
    mocks.useRouterMock.mockReturnValue({
      replace: mocks.routerReplaceMock,
    });
    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
        displayName: "Austen",
        email: "austen@example.com",
      },
    });
    mocks.useChannelsMock.mockReturnValue({
      channels: [
        {
          channelId: "general",
          workspaceId: "workspace-1",
          name: "general",
          createdBy: "user-1",
          createdAt: Timestamp.now(),
        },
      ],
      loading: false,
      error: null,
    });
    mocks.useWorkspaceOwnerIdMock.mockReturnValue({
      ownerId: "user-1",
      loading: false,
      error: null,
    });
    mocks.useRealtimeMessagesMock.mockReturnValue(createRealtimeHookState());
    mocks.deleteChannelMock.mockResolvedValue(undefined);
    mocks.renameChannelMock.mockResolvedValue(undefined);

    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: mocks.scrollToMock,
      writable: true,
    });
  });

  it("shows RTDB send error banner and retries when banner retry is clicked", () => {
    mocks.useRealtimeMessagesMock.mockReturnValue(
      createRealtimeHookState({
        sendErrorBanner: "Message failed to send. Retry?",
      }),
    );

    render(<ChannelPage />);

    expect(screen.getByText("Message failed to send. Retry?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(mocks.retryLastSendMock).toHaveBeenCalledTimes(1);
  });

  it("shows Firestore warning banner and retries persistence for the queued message", () => {
    mocks.useRealtimeMessagesMock.mockReturnValue(
      createRealtimeHookState({
        messages: [createMessage({ messageId: "server-1" })],
        firestoreWarningBanner: {
          message: "Message sent but not saved. It will disappear in 1 hour.",
          messageId: "server-1",
          pendingCount: 1,
        },
      }),
    );

    render(<ChannelPage />);

    expect(
      screen.getByText("Message sent but not saved. It will disappear in 1 hour."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry Save" }));

    expect(mocks.retryFirestoreWriteMock).toHaveBeenCalledWith("server-1");
  });

  it("renders the channel header using the live channel name", () => {
    render(<ChannelPage />);

    expect(screen.getByRole("heading", { name: "# general" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Channel settings" })).toBeInTheDocument();
  });

  it("hides channel settings when the user cannot rename the channel", () => {
    mocks.useChannelsMock.mockReturnValue({
      channels: [
        {
          channelId: "general",
          workspaceId: "workspace-1",
          name: "general",
          createdBy: "user-2",
          createdAt: Timestamp.now(),
        },
      ],
      loading: false,
      error: null,
    });
    mocks.useWorkspaceOwnerIdMock.mockReturnValue({
      ownerId: "user-3",
      loading: false,
      error: null,
    });

    render(<ChannelPage />);

    expect(screen.queryByRole("button", { name: "Channel settings" })).not.toBeInTheDocument();
  });

  it("shows an error toast when deleting #general is attempted", async () => {
    render(<ChannelPage />);

    fireEvent.click(screen.getByRole("button", { name: "Channel settings" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete Channel" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot delete #general channel",
    );
    expect(screen.queryByRole("heading", { name: "Delete Channel" })).not.toBeInTheDocument();
  });

  it("deletes a non-general channel and redirects to #general", async () => {
    mocks.useParamsMock.mockReturnValue({ channelId: "engineering" });
    mocks.useChannelsMock.mockReturnValue({
      channels: [
        {
          channelId: "general-channel",
          workspaceId: "workspace-1",
          name: "general",
          createdBy: "user-1",
          createdAt: Timestamp.now(),
        },
        {
          channelId: "engineering",
          workspaceId: "workspace-1",
          name: "engineering",
          createdBy: "user-1",
          createdAt: Timestamp.now(),
        },
      ],
      loading: false,
      error: null,
    });

    render(<ChannelPage />);

    fireEvent.click(screen.getByRole("button", { name: "Channel settings" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete Channel" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mocks.deleteChannelMock).toHaveBeenCalledWith({
        firestore: expect.anything(),
        workspaceId: "workspace-1",
        channelId: "engineering",
        channelName: "engineering",
        userId: "user-1",
        channelCreatedBy: "user-1",
        workspaceOwnerId: "user-1",
      });
      expect(mocks.routerReplaceMock).toHaveBeenCalledWith("/app/channels/general-channel");
    });
  });

  it("scrolls to bottom when messages are added", async () => {
    const hookState: MockRealtimeHookState = createRealtimeHookState();

    mocks.useRealtimeMessagesMock.mockImplementation(() => hookState);

    const { rerender } = render(<ChannelPage />);

    hookState.messages = [createMessage({ messageId: "server-1", text: "Initial message" })];
    rerender(<ChannelPage />);

    await waitFor(() => {
      expect(mocks.scrollToMock).toHaveBeenCalledWith({
        behavior: "auto",
        top: expect.any(Number),
      });
    });

    mocks.scrollToMock.mockClear();

    hookState.messages = [
      createMessage({ messageId: "server-1", text: "Initial message" }),
      createMessage({ messageId: "server-2", text: "Newest message" }),
    ];

    rerender(<ChannelPage />);

    await waitFor(() => {
      expect(mocks.scrollToMock).toHaveBeenCalledWith({
        behavior: "smooth",
        top: expect.any(Number),
      });
    });
  });

  it('shows "New messages ↓" when user is scrolled up and a new message arrives', async () => {
    const hookState: MockRealtimeHookState = createRealtimeHookState({
      messages: [createMessage({ messageId: "server-1", text: "Initial message" })],
    });

    mocks.useRealtimeMessagesMock.mockImplementation(() => hookState);

    const { rerender } = render(<ChannelPage />);
    const messageList = await screen.findByTestId("channel-message-list");

    setScrollMetrics(messageList, {
      scrollTop: 500,
      clientHeight: 300,
      scrollHeight: 1000,
    });
    fireEvent.scroll(messageList);
    mocks.scrollToMock.mockClear();

    hookState.messages = [
      createMessage({ messageId: "server-1", text: "Initial message" }),
      createMessage({ messageId: "server-2", text: "Newest message" }),
    ];

    rerender(<ChannelPage />);

    expect(await screen.findByRole("button", { name: "New messages ↓" })).toBeInTheDocument();
    expect(mocks.scrollToMock).not.toHaveBeenCalled();
  });

  it("scrolls to bottom and hides the badge when badge is clicked", async () => {
    const hookState: MockRealtimeHookState = createRealtimeHookState({
      messages: [createMessage({ messageId: "server-1", text: "Initial message" })],
    });

    mocks.useRealtimeMessagesMock.mockImplementation(() => hookState);

    const { rerender } = render(<ChannelPage />);
    const messageList = await screen.findByTestId("channel-message-list");

    setScrollMetrics(messageList, {
      scrollTop: 500,
      clientHeight: 300,
      scrollHeight: 1000,
    });
    fireEvent.scroll(messageList);
    mocks.scrollToMock.mockClear();

    hookState.messages = [
      createMessage({ messageId: "server-1", text: "Initial message" }),
      createMessage({ messageId: "server-2", text: "Newest message" }),
    ];

    rerender(<ChannelPage />);

    const badge = await screen.findByRole("button", { name: "New messages ↓" });
    fireEvent.click(badge);

    expect(mocks.scrollToMock).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 1000,
    });
    expect(screen.queryByRole("button", { name: "New messages ↓" })).not.toBeInTheDocument();
  });

  it("hides the badge when user manually scrolls to bottom", async () => {
    const hookState: MockRealtimeHookState = createRealtimeHookState({
      messages: [createMessage({ messageId: "server-1", text: "Initial message" })],
    });

    mocks.useRealtimeMessagesMock.mockImplementation(() => hookState);

    const { rerender } = render(<ChannelPage />);
    const messageList = await screen.findByTestId("channel-message-list");

    setScrollMetrics(messageList, {
      scrollTop: 500,
      clientHeight: 300,
      scrollHeight: 1000,
    });
    fireEvent.scroll(messageList);

    hookState.messages = [
      createMessage({ messageId: "server-1", text: "Initial message" }),
      createMessage({ messageId: "server-2", text: "Newest message" }),
    ];

    rerender(<ChannelPage />);

    expect(await screen.findByRole("button", { name: "New messages ↓" })).toBeInTheDocument();

    setScrollMetrics(messageList, {
      scrollTop: 620,
      clientHeight: 300,
      scrollHeight: 1000,
    });
    fireEvent.scroll(messageList);

    expect(screen.queryByRole("button", { name: "New messages ↓" })).not.toBeInTheDocument();
  });
});
