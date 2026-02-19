import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  startDMMock: vi.fn(),
  useAuthMock: vi.fn(),
  firestoreMock: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.pushMock,
  }),
}));

vi.mock("@/lib/actions/startDM", () => ({
  startDM: mocks.startDMMock,
}));

vi.mock("@/lib/contexts/AuthContext", () => ({
  useAuth: mocks.useAuthMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  firestore: mocks.firestoreMock,
}));

import { MemberList } from "@/components/features/sidebar/MemberList";

describe("MemberList", () => {
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

  it("starts a DM and routes to the DM page when clicking another member", async () => {
    mocks.startDMMock.mockResolvedValue("dm-123");

    render(
      <MemberList
        currentUserId="user-1"
        members={[
          { userId: "user-1", displayName: "Taylor", isOnline: true },
          { userId: "user-2", displayName: "Morgan", isOnline: false },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /morgan/i }));

    await waitFor(() => {
      expect(mocks.startDMMock).toHaveBeenCalledWith({
        firestore: mocks.firestoreMock,
        workspaceId: "workspace-1",
        currentUserId: "user-1",
        otherUserId: "user-2",
      });
    });
    await waitFor(() => {
      expect(mocks.pushMock).toHaveBeenCalledWith("/app/dms/dm-123");
    });
  });

  it("shows a spinner while checking/creating the DM", async () => {
    let resolveStartDM: ((dmId: string) => void) | undefined;
    const pendingStartDM = new Promise<string>((resolve) => {
      resolveStartDM = resolve;
    });
    mocks.startDMMock.mockReturnValue(pendingStartDM);

    render(
      <MemberList
        currentUserId="user-1"
        members={[
          { userId: "user-1", displayName: "Taylor", isOnline: true },
          { userId: "user-2", displayName: "Morgan", isOnline: false },
          { userId: "user-3", displayName: "Sky", isOnline: true },
        ]}
      />,
    );

    const targetMemberButton = screen.getByRole("button", { name: /morgan/i });
    const otherMemberButton = screen.getByRole("button", { name: /sky/i });

    fireEvent.click(targetMemberButton);

    expect(screen.getByText("Starting DM...")).toBeInTheDocument();
    expect(targetMemberButton).toBeDisabled();
    expect(otherMemberButton).toBeDisabled();

    resolveStartDM?.("dm-456");

    await waitFor(() => {
      expect(mocks.pushMock).toHaveBeenCalledWith("/app/dms/dm-456");
    });
    await waitFor(() => {
      expect(screen.queryByText("Starting DM...")).not.toBeInTheDocument();
    });
  });

  it("does not start a DM when clicking the current user", () => {
    render(
      <MemberList
        currentUserId="user-1"
        members={[{ userId: "user-1", displayName: "Taylor", isOnline: true }]}
      />,
    );

    const currentUserButton = screen.getByRole("button", {
      name: /taylor \(you\)/i,
    });

    expect(currentUserButton).toBeDisabled();
    fireEvent.click(currentUserButton);
    expect(mocks.startDMMock).not.toHaveBeenCalled();
  });
});
