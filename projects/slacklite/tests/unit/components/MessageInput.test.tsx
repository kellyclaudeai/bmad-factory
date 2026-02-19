import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MessageInput } from "@/components/features/messages/MessageInput";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("MessageInput mobile optimization", () => {
  const onSendMock = vi.fn();

  beforeEach(() => {
    onSendMock.mockReset();
  });

  it("uses a 60px minimum textarea height on mobile breakpoints", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");

    await waitFor(() => {
      expect(textarea).toHaveClass("min-h-[60px]");
      expect(textarea).toHaveStyle({ height: "60px" });
    });
  });

  it("does not auto-focus on mobile mount", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");

    await waitFor(() => {
      expect(textarea).toHaveStyle({ height: "60px" });
    });
    expect(textarea).not.toHaveFocus();
  });

  it("expands to 60vh when focused on mobile", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");

    await waitFor(() => {
      expect(textarea).toHaveStyle({ height: "60px" });
    });

    fireEvent.focus(textarea);
    expect(textarea).toHaveStyle({ height: "60vh" });

    fireEvent.blur(textarea);
    expect(textarea).toHaveStyle({ height: "60px" });
  });

  it("always shows a touch-sized send button on mobile", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const button = await screen.findByRole("button", { name: "Send message" });
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
    expect(button).toHaveClass("h-11");
    expect(button).toHaveClass("w-11");
  });

  it("sends on mobile Enter even when Shift is pressed", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "hello mobile" } });
    fireEvent.keyDown(textarea, {
      code: "Enter",
      key: "Enter",
      shiftKey: true,
    });

    expect(onSendMock).toHaveBeenCalledWith("hello mobile");
  });

  it("keeps Shift+Enter newline behavior on desktop", () => {
    setViewportWidth(1024);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "desktop message" } });
    fireEvent.keyDown(textarea, {
      code: "Enter",
      key: "Enter",
      shiftKey: true,
    });

    expect(onSendMock).not.toHaveBeenCalled();
  });

  it("renders the character counter above the textarea", () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "a".repeat(3901) } });

    const counter = screen.getByText("3901 / 4000");
    expect(
      counter.compareDocumentPosition(textarea) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
