import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DeleteChannelModal from "@/components/features/channels/DeleteChannelModal";

describe("DeleteChannelModal", () => {
  it("renders the expected confirmation copy", () => {
    render(
      <DeleteChannelModal
        channel={{ channelId: "channel-1", name: "engineering" }}
        isOpen
        onClose={vi.fn()}
        onDelete={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole("heading", { name: "Delete Channel" })).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("#engineering")).toBeInTheDocument();
  });

  it("submits the delete action", async () => {
    const onDeleteMock = vi.fn().mockResolvedValue(undefined);

    render(
      <DeleteChannelModal
        channel={{ channelId: "channel-1", name: "engineering" }}
        isOpen
        onClose={vi.fn()}
        onDelete={onDeleteMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
  });
});
