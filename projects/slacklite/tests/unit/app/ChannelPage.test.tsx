import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "@/lib/types/models";

const mocks = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useParamsMock: vi.fn(),
  useRealtimeMessagesMock: vi.fn(),
  retryFirestoreWriteMock: vi.fn(),
  retryLastSendMock: vi.fn(),
  retryMessageMock: vi.fn(),
  scrollToMock: vi.fn(),
  sendMessageMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mocks.useParamsMock,
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/hooks/useRealtimeMessages", () => ({
  useRealtimeMessages: mocks.useRealtimeMessagesMock,
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
    mocks.useAuthMock.mockReturnValue({
      user: {
        uid: "user-1",
        workspaceId: "workspace-1",
        displayName: "Austen",
        email: "austen@example.com",
      },
    });
    mocks.useRealtimeMessagesMock.mockReturnValue(createRealtimeHookState());

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
