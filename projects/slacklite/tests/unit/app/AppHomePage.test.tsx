import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useAuthMock: vi.fn(),
  useChannelsMock: vi.fn(),
  ensureWorkspaceHasDefaultChannelMock: vi.fn(),
  getWorkspaceLandingChannelIdMock: vi.fn(),
  firestoreMock: {},
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({}),
  usePathname: () => "/app",
  useRouter: () => ({
    replace: mocks.replaceMock,
  }),
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/hooks/useChannels", () => ({
  useChannels: mocks.useChannelsMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: mocks.firestoreMock,
}));

vi.mock("@/lib/utils/workspace", () => ({
  ensureWorkspaceHasDefaultChannel: mocks.ensureWorkspaceHasDefaultChannelMock,
  getWorkspaceLandingChannelId: mocks.getWorkspaceLandingChannelIdMock,
}));

import AppHomePage from "@/app/app/page";

describe("AppHomePage", () => {
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
  });

  it("redirects to landing channel when channels are available", async () => {
    mocks.useChannelsMock.mockReturnValue({
      channels: [{ channelId: "general-id", name: "general" }],
      loading: false,
      error: null,
    });
    mocks.getWorkspaceLandingChannelIdMock.mockReturnValue("general-id");

    render(<AppHomePage />);

    await waitFor(() => {
      expect(mocks.replaceMock).toHaveBeenCalledWith("/app/channels/general-id");
    });
    expect(mocks.ensureWorkspaceHasDefaultChannelMock).not.toHaveBeenCalled();
  });

  it("creates and redirects to #general when workspace has no channels", async () => {
    mocks.useChannelsMock.mockReturnValue({
      channels: [],
      loading: false,
      error: null,
    });
    mocks.getWorkspaceLandingChannelIdMock.mockReturnValue(null);
    mocks.ensureWorkspaceHasDefaultChannelMock.mockResolvedValue("new-general-id");

    render(<AppHomePage />);

    await waitFor(() => {
      expect(mocks.ensureWorkspaceHasDefaultChannelMock).toHaveBeenCalledWith({
        firestore: mocks.firestoreMock,
        workspaceId: "workspace-1",
        userId: "user-1",
      });
    });
    await waitFor(() => {
      expect(mocks.replaceMock).toHaveBeenCalledWith("/app/channels/new-general-id");
    });
  });

  it("shows an error when default channel bootstrap fails", async () => {
    mocks.useChannelsMock.mockReturnValue({
      channels: [],
      loading: false,
      error: null,
    });
    mocks.getWorkspaceLandingChannelIdMock.mockReturnValue(null);
    mocks.ensureWorkspaceHasDefaultChannelMock.mockRejectedValue(
      new Error("Permission denied"),
    );

    render(<AppHomePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load channels"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });
});
