import { fireEvent, render, screen } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import MessageItem from "@/components/features/messages/MessageItem";
import type { Message } from "@/lib/types/models";

function createMessage(text: string): Message {
  const timestamp = Timestamp.now();

  return {
    messageId: "message-1",
    channelId: "channel-1",
    workspaceId: "workspace-1",
    userId: "user-1",
    userName: "Austen",
    text,
    timestamp,
    createdAt: timestamp,
    status: "sent",
  };
}

function normalizeTextContent(element: HTMLElement | null): string {
  return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("MessageItem long message truncation", () => {
  it("renders user-generated html-like content as text", () => {
    const htmlLikeText = '<script>alert("xss")</script><b>hello</b>';
    const { container } = render(<MessageItem message={createMessage(htmlLikeText)} />);

    expect(screen.getByText(htmlLikeText)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
  });

  it("does not truncate messages with 2000 characters or fewer", () => {
    const text = "a".repeat(2000);

    render(<MessageItem message={createMessage(text)} />);

    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("shows a collapsed preview and Show more button for messages longer than 2000 characters", () => {
    const text = "b".repeat(2100);
    const preview = text.slice(0, 2000);

    render(<MessageItem message={createMessage(text)} />);

    const button = screen.getByRole("button", { name: "Show more" });
    const body = button.closest("p");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(normalizeTextContent(body)).toBe(`${preview}... Show more`);
  });

  it("toggles between collapsed and expanded text", () => {
    const text = "c".repeat(2100);

    render(<MessageItem message={createMessage(text)} />);

    const showMoreButton = screen.getByRole("button", { name: "Show more" });
    fireEvent.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: "Show less" });
    const body = showLessButton.closest("p");

    expect(showLessButton).toHaveAttribute("aria-expanded", "true");
    expect(normalizeTextContent(body).startsWith(text)).toBe(true);
    expect(normalizeTextContent(body)).not.toContain("... Show more");

    fireEvent.click(showLessButton);

    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("supports keyboard interaction on the toggle button", () => {
    const text = "d".repeat(2100);

    render(<MessageItem message={createMessage(text)} />);

    const showMoreButton = screen.getByRole("button", { name: "Show more" });

    showMoreButton.focus();
    expect(showMoreButton).toHaveFocus();

    fireEvent.keyDown(showMoreButton, { key: "Enter" });
    fireEvent.keyUp(showMoreButton, { key: "Enter" });

    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });
});
