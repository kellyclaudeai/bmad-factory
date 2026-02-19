import { render, screen } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";
import MessageList from "@/components/features/messages/MessageList";
import { validateChannelName } from "@/lib/utils/validation";

describe("XSS/CSRF audit coverage", () => {
  it("renders attacker message payload as escaped text (no HTML execution)", () => {
    render(
      <MessageList
        messages={[
          {
            messageId: "message-1",
            channelId: "channel-1",
            workspaceId: "workspace-1",
            userId: "user-1",
            userName: "Attacker",
            text: "<img src=x onerror=alert(1)>",
            timestamp: Timestamp.fromMillis(1700000000000),
            createdAt: Timestamp.fromMillis(1700000000000),
            status: "sent",
          },
        ]}
      />,
    );

    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(document.querySelector("img[src='x']")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });

  it("rejects channel-name XSS injection payloads", () => {
    expect(validateChannelName("<script>alert(1)</script>")).toEqual({
      valid: false,
      error: "Use only lowercase letters, numbers, and hyphens.",
    });
  });
});

