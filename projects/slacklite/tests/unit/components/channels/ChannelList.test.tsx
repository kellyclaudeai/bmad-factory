import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useChannelsMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useUnreadCountsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
  usePathname: mocks.usePathnameMock,
  useRouter: () => ({
    prefetch: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/useChannels", () => ({
  useChannels: mocks.useChannelsMock,
}));

vi.mock("@/lib/hooks/useUnreadCounts", () => ({
  useUnreadCounts: mocks.useUnreadCountsMock,
}));

import { ChannelList } from "@/components/features/channels/ChannelList";

describe("ChannelList", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.usePathnameMock.mockReturnValue("/app/channels/general");
    mocks.useChannelsMock.mockReturnValue({
      channels: [
        {
          channelId: "general",
          workspaceId: "workspace-1",
          name: "general",
          createdBy: "user-1",
          createdAt: {},
        },
        {
          channelId: "dev-team",
          workspaceId: "workspace-1",
          name: "dev-team",
          createdBy: "user-1",
          createdAt: {},
        },
      ],
      loading: false,
      error: null,
    });
    mocks.useUnreadCountsMock.mockReturnValue({
      unreadCounts: {
        general: 0,
        "dev-team": 3,
      },
      loading: false,
      error: null,
    });
  });

  it("renders unread badges with brand styling in channel rows", () => {
    render(<ChannelList />);

    const channelRow = screen.getByText("# dev-team").closest("a");
    const unreadBadge = screen.getByText("3");

    expect(channelRow).not.toBeNull();
    expect(channelRow).toHaveClass("justify-between");
    expect(unreadBadge).toHaveClass("bg-primary-brand");
    expect(unreadBadge).toHaveClass("text-white");
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it("passes the active channel context into unread-count tracking", () => {
    render(<ChannelList />);

    expect(mocks.useUnreadCountsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activeTargetId: "general",
        activeTargetType: "channel",
        channels: expect.any(Array),
      }),
    );
  });
});
