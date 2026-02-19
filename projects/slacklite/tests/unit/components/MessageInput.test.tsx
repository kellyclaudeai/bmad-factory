import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  it("sanitizes message text before sending", () => {
    setViewportWidth(1024);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "<b>Hello team</b>" } });
    fireEvent.keyDown(textarea, {
      code: "Enter",
      key: "Enter",
    });

    expect(onSendMock).toHaveBeenCalledWith("Hello team");
  });

  it("does not send script-only content after sanitization", () => {
    setViewportWidth(1024);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "<script>alert(1)</script>" } });
    fireEvent.keyDown(textarea, {
      code: "Enter",
      key: "Enter",
    });

    expect(onSendMock).not.toHaveBeenCalled();
  });

  it("does not send blocked XSS patterns", () => {
    setViewportWidth(1024);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "javascript:alert(1)" } });
    fireEvent.keyDown(textarea, {
      code: "Enter",
      key: "Enter",
    });

    expect(onSendMock).not.toHaveBeenCalled();
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

  it("renders the character counter below the textarea in gray when under limit", () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(textarea, { target: { value: "a".repeat(3901) } });

    const counter = screen.getByText("3901 / 4000");
    expect(counter).toHaveClass("text-gray-700");
    expect(
      textarea.compareDocumentPosition(counter) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("Message too long. Maximum 4,000 characters.")).not.toBeInTheDocument();
  });

  it("shows over-limit error state and disables send", async () => {
    setViewportWidth(390);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    const button = await screen.findByRole("button", { name: "Send message" });

    fireEvent.change(textarea, { target: { value: "a".repeat(4001) } });

    expect(screen.getByText("4001 / 4000")).toHaveClass("text-error");
    expect(screen.getByText("Message too long. Maximum 4,000 characters.")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});

describe("MessageInput rate limiting", () => {
  const onSendMock = vi.fn();

  beforeEach(() => {
    onSendMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T16:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks the 11th message, shows rate limit feedback, and resets after 10 seconds", () => {
    setViewportWidth(1024);

    render(<MessageInput channelId="channel-1" onSend={onSendMock} />);

    const textarea = screen.getByPlaceholderText("Type a message...");
    const button = screen.getByRole("button", { name: "Send" });

    for (let messageIndex = 1; messageIndex <= 10; messageIndex += 1) {
      fireEvent.change(textarea, { target: { value: `message ${messageIndex}` } });
      fireEvent.keyDown(textarea, { code: "Enter", key: "Enter" });
    }

    expect(onSendMock).toHaveBeenCalledTimes(10);

    fireEvent.change(textarea, { target: { value: "message 11" } });
    expect(button).toBeDisabled();

    fireEvent.keyDown(textarea, { code: "Enter", key: "Enter" });
    expect(onSendMock).toHaveBeenCalledTimes(10);
    expect(screen.getByText("Slow down! Max 10 messages per 10 seconds.")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Slow down! Max 10 messages per 10 seconds.")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(7001);
    });
    expect(button).not.toBeDisabled();
  });
});
