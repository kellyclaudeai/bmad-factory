import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "@/lib/types/models";

const mocks = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useParamsMock: vi.fn(),
  useRealtimeMessagesMock: vi.fn(),
  sendMessageMock: vi.fn(),
  retryMessageMock: vi.fn(),
  scrollToMock: vi.fn(),
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
    mocks.useRealtimeMessagesMock.mockReturnValue({
      messages: [],
      loading: false,
      error: null,
      sendMessage: mocks.sendMessageMock,
      retryMessage: mocks.retryMessageMock,
    });

    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: mocks.scrollToMock,
      writable: true,
    });
  });

  it("shows failed message UI and retries when retry button is clicked", () => {
    mocks.useRealtimeMessagesMock.mockReturnValue({
      messages: [
        createMessage({
          messageId: "temp_123",
          status: "failed",
        }),
      ],
      loading: false,
      error: null,
      sendMessage: mocks.sendMessageMock,
      retryMessage: mocks.retryMessageMock,
    });

    render(<ChannelPage />);

    expect(screen.getByText("Failed to send. Retry?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(mocks.retryMessageMock).toHaveBeenCalledWith("temp_123");
  });

  it("scrolls to bottom when messages are added", async () => {
    const hookState = {
      messages: [] as Message[],
      loading: false,
      error: null,
      sendMessage: mocks.sendMessageMock,
      retryMessage: mocks.retryMessageMock,
    };

    mocks.useRealtimeMessagesMock.mockImplementation(() => hookState);

    const { rerender } = render(<ChannelPage />);

    hookState.messages = [
      createMessage({
        messageId: "server-1",
        text: "Newest message",
      }),
    ];

    rerender(<ChannelPage />);

    await waitFor(() => {
      expect(mocks.scrollToMock).toHaveBeenCalled();
    });
  });
});
