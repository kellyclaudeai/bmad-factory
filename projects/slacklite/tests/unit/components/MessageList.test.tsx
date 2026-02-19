import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { afterEach, describe, expect, it, vi } from "vitest";

import MessageList from "@/components/features/messages/MessageList";
import type { Message } from "@/lib/types/models";

function createMessages(
  count: number,
  startIndex = 0,
  textBuilder?: (index: number) => string
): Message[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const timestamp = Timestamp.fromMillis(1700000000000 + index * 1000);

    return {
      messageId: `message-${index}`,
      channelId: "channel-1",
      workspaceId: "workspace-1",
      userId: `user-${index % 5}`,
      userName: `User ${index % 5}`,
      text: textBuilder ? textBuilder(index) : `Message ${index}`,
      timestamp,
      createdAt: timestamp,
      status: "sent",
    };
  });
}

describe("MessageList virtualization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only visible rows for 10,000 messages", async () => {
    const messages = createMessages(10_000);

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} />
      </div>
    );

    const listElement = await screen.findByTestId("channel-message-list");

    await waitFor(() => {
      expect(screen.getAllByTestId("virtualized-message-row-container").length).toBeLessThanOrEqual(
        20
      );
    });

    expect(screen.getByText("Message 0")).toBeInTheDocument();

    Object.defineProperty(listElement, "scrollTop", {
      configurable: true,
      value: 400_000,
      writable: true,
    });
    Object.defineProperty(listElement, "clientHeight", {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(listElement, "scrollHeight", {
      configurable: true,
      value: 800_000,
    });

    fireEvent.scroll(listElement);

    await waitFor(() => {
      expect(screen.getByText("Message 5000")).toBeInTheDocument();
      expect(screen.getAllByTestId("virtualized-message-row-container").length).toBeLessThanOrEqual(
        20
      );
    });
  });

  it("uses measured row heights for multi-line messages", async () => {
    const longText = "LONG_ROW ".repeat(60);
    const messages = createMessages(3, 0, (index) => (index === 0 ? longText : `Message ${index}`));

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function mockRect(
      this: HTMLElement
    ) {
      const text = this.textContent ?? "";
      const height = text.includes("LONG_ROW") ? 180 : 80;

      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: height,
        right: 320,
        width: 320,
        height,
        toJSON: () => ({}),
      } as DOMRect;
    });

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} />
      </div>
    );

    await waitFor(() => {
      const firstRow = document.querySelector<HTMLElement>('[data-message-id="message-0"]');
      expect(firstRow).not.toBeNull();
      expect(firstRow?.style.height).toBe("180px");
    });
  });

  it("maintains scroll position when older messages are prepended", async () => {
    const initialMessages = createMessages(100, 100);
    const { rerender } = render(
      <div style={{ height: "600px" }}>
        <MessageList messages={initialMessages} />
      </div>
    );

    const listElement = await screen.findByTestId("channel-message-list");

    Object.defineProperty(listElement, "scrollTop", {
      configurable: true,
      value: 640,
      writable: true,
    });

    const olderMessages = createMessages(50, 50);

    rerender(
      <div style={{ height: "600px" }}>
        <MessageList messages={[...olderMessages, ...initialMessages]} />
      </div>
    );

    await waitFor(() => {
      expect(listElement.scrollTop).toBe(4640);
    });
  });
});
