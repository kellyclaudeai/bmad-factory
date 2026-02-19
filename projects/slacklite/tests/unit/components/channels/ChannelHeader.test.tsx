import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChannelHeader from "@/components/features/channels/ChannelHeader";

describe("ChannelHeader", () => {
  it("opens the settings menu and triggers rename", () => {
    const onRenameChannelMock = vi.fn();

    render(
      <ChannelHeader
        channelName="engineering"
        canRenameChannel
        onRenameChannel={onRenameChannelMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Channel settings" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename Channel" }));

    expect(onRenameChannelMock).toHaveBeenCalledTimes(1);
  });

  it("does not render settings when user lacks rename permissions", () => {
    render(
      <ChannelHeader
        channelName="engineering"
        canRenameChannel={false}
        onRenameChannel={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Channel settings" }),
    ).not.toBeInTheDocument();
  });

  it("shows delete action and triggers callback", () => {
    const onDeleteChannelMock = vi.fn();

    render(
      <ChannelHeader
        channelName="engineering"
        canRenameChannel={false}
        onRenameChannel={vi.fn()}
        canDeleteChannel
        onDeleteChannel={onDeleteChannelMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Channel settings" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete Channel" }));

    expect(onDeleteChannelMock).toHaveBeenCalledTimes(1);
  });
});
