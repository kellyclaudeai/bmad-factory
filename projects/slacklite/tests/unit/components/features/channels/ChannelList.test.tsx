import { render, screen } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChannelList } from "@/components/features/channels/ChannelList";
import { runAxe } from "@/tests/utils/axe";

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  useChannelsMock: vi.fn(),
  usePathnameMock: vi.fn(),
  useUnreadCountsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathnameMock,
  useRouter: () => ({
    prefetch: vi.fn(),
    push: mocks.pushMock,
    replace: vi.fn(),
  }),
}));

vi.mock("next/link", () => {
  const MockLink = forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      children: ReactNode;
      href: string | { pathname?: string };
    }
  >(({ children, href, ...props }, ref) => (
    <a
      ref={ref}
      href={typeof href === "string" ? href : href.pathname ?? ""}
      {...props}
    >
      {children}
    </a>
  ));
  MockLink.displayName = "MockLink";

  return {
    __esModule: true,
    default: MockLink,
  };
});

vi.mock("@/lib/hooks/useChannels", () => ({
  useChannels: mocks.useChannelsMock,
}));

vi.mock("@/lib/hooks/useUnreadCounts", () => ({
  useUnreadCounts: mocks.useUnreadCountsMock,
}));

const FIXED_TIMESTAMP = Timestamp.fromDate(new Date("2026-02-19T12:00:00.000Z"));

describe("ChannelList", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((value) => {
      if (typeof value === "function") {
        value.mockReset();
      }
    });

    mocks.usePathnameMock.mockReturnValue("/app/channels/dev-team");
    mocks.useChannelsMock.mockReturnValue({
      channels: [
        {
          channelId: "general",
          workspaceId: "workspace-1",
          name: "general",
          createdBy: "user-1",
          createdAt: FIXED_TIMESTAMP,
          lastMessageAt: FIXED_TIMESTAMP,
        },
        {
          channelId: "dev-team",
          workspaceId: "workspace-1",
          name: "dev-team",
          createdBy: "user-1",
          createdAt: FIXED_TIMESTAMP,
          lastMessageAt: FIXED_TIMESTAMP,
        },
      ],
      loading: false,
      error: null,
    });
    mocks.useUnreadCountsMock.mockReturnValue({
      unreadCounts: {
        general: 0,
        "dev-team": 27,
      },
      loading: false,
      error: null,
    });
  });

  it("renders channels", () => {
    render(<ChannelList />);

    expect(screen.getByText("# general")).toBeInTheDocument();
    expect(screen.getByText("# dev-team")).toBeInTheDocument();
  });

  it("highlights the active channel", () => {
    render(<ChannelList />);

    const activeChannel = screen.getByText("# dev-team").closest("a");
    const inactiveChannel = screen.getByText("# general").closest("a");

    expect(activeChannel).toHaveClass("border-l-4", "border-primary-brand", "font-semibold");
    expect(inactiveChannel).toHaveClass("hover:bg-gray-200");
  });

  it("shows unread badges", () => {
    render(<ChannelList />);

    const unreadBadge = screen.getByText("27");

    expect(unreadBadge).toBeInTheDocument();
    expect(unreadBadge).toHaveClass("bg-primary-brand", "text-white");
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ChannelList />);
    const results = await runAxe(container);

    expect(results.violations).toHaveLength(0);
  });
});
