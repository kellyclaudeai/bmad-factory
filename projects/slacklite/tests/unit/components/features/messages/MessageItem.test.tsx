import { fireEvent, render, screen } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";

import MessageItem from "@/components/features/messages/MessageItem";
import type { Message } from "@/lib/types/models";
import { runAxe } from "@/tests/utils/axe";

function createMessage({
  text = "Hello from SlackLite",
  timestamp = Timestamp.fromDate(new Date(Date.now() - 60_000)),
}: {
  text?: string;
  timestamp?: Timestamp;
} = {}): Message {
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

describe("MessageItem", () => {
  it("renders author, timestamp, and message text", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"));

    try {
      render(<MessageItem message={createMessage({ text: "Ship it." })} />);

      expect(screen.getByText("Austen")).toBeInTheDocument();
      expect(screen.getByText("1 min ago")).toBeInTheDocument();
      expect(screen.getByText("Ship it.")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("formats timestamp correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"));

    try {
      const timestamp = Timestamp.fromDate(new Date("2026-02-19T11:55:00.000Z"));
      render(<MessageItem message={createMessage({ timestamp })} />);

      expect(screen.getByText("5 min ago")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Message from Austen at 5 min ago"),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("truncates long messages and toggles with Show more / Show less", () => {
    const longText = "x".repeat(2100);
    const preview = longText.slice(0, 2000);
    render(<MessageItem message={createMessage({ text: longText })} />);

    const showMoreButton = screen.getByRole("button", { name: "Show more" });
    const body = showMoreButton.closest("p");

    expect(showMoreButton).toHaveAttribute("aria-expanded", "false");
    expect(normalizeTextContent(body)).toBe(`${preview}... Show more`);

    fireEvent.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: "Show less" });
    expect(showLessButton).toHaveAttribute("aria-expanded", "true");
    expect(normalizeTextContent(showLessButton.closest("p")).startsWith(longText)).toBe(
      true,
    );
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<MessageItem message={createMessage()} />);
    const results = await runAxe(container);

    expect(results.violations).toHaveLength(0);
  });
});
