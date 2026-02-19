import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RenameChannelModal from "@/components/features/channels/RenameChannelModal";

describe("RenameChannelModal", () => {
  it("pre-fills the input with the current channel name", () => {
    render(
      <RenameChannelModal
        channel={{ channelId: "channel-1", name: "engineering" }}
        isOpen
        onClose={vi.fn()}
        onRename={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("engineering");
  });

  it("formats input to lowercase with hyphens", () => {
    render(
      <RenameChannelModal
        channel={{ channelId: "channel-1", name: "engineering" }}
        isOpen
        onClose={vi.fn()}
        onRename={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My New Channel" },
    });

    expect(screen.getByLabelText("Name")).toHaveValue("my-new-channel");
  });

  it("submits the new channel name through onRename", async () => {
    const onRenameMock = vi.fn().mockResolvedValue(undefined);

    render(
      <RenameChannelModal
        channel={{ channelId: "channel-1", name: "engineering" }}
        isOpen
        onClose={vi.fn()}
        onRename={onRenameMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "eng-platform" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));

    await waitFor(() => {
      expect(onRenameMock).toHaveBeenCalledWith("eng-platform");
    });
  });

  it("shows an error and blocks rename for #general", async () => {
    const onRenameMock = vi.fn().mockResolvedValue(undefined);

    render(
      <RenameChannelModal
        channel={{ channelId: "channel-general", name: "general" }}
        isOpen
        onClose={vi.fn()}
        onRename={onRenameMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));

    expect(await screen.findByText("Cannot rename #general channel")).toBeInTheDocument();
    expect(onRenameMock).not.toHaveBeenCalled();
  });
});
