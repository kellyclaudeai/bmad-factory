import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

type MockIntersectionObserverEntryOptions = {
  isIntersecting: boolean;
  target: Element;
  rootBounds: DOMRectReadOnly | null;
};

function createMockEntry({
  isIntersecting,
  target,
  rootBounds,
}: MockIntersectionObserverEntryOptions): IntersectionObserverEntry {
  const targetBounds = target.getBoundingClientRect();
  const emptyRect = DOMRectReadOnly.fromRect();

  return {
    target,
    time: Date.now(),
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: targetBounds,
    intersectionRect: isIntersecting ? targetBounds : emptyRect,
    rootBounds,
  };
}

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  private readonly callback: IntersectionObserverCallback;
  private observedTarget: Element | null = null;

  observe = vi.fn((target: Element) => {
    this.observedTarget = target;
  });

  unobserve = vi.fn((target: Element) => {
    if (this.observedTarget === target) {
      this.observedTarget = null;
    }
  });

  disconnect = vi.fn(() => {
    this.observedTarget = null;
  });

  takeRecords = vi.fn(() => []);

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];

    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean): void {
    if (!this.observedTarget) {
      return;
    }

    const rootBounds =
      this.root instanceof Element ? this.root.getBoundingClientRect() : DOMRectReadOnly.fromRect();

    this.callback(
      [
        createMockEntry({
          isIntersecting,
          target: this.observedTarget,
          rootBounds,
        }),
      ],
      this
    );
  }
}

describe("MessageList virtualization", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("triggers loadMore when top sentinel becomes visible", async () => {
    const messages = createMessages(100);
    const loadMore = vi.fn().mockResolvedValue(undefined);

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} loadMore={loadMore} hasMore />
      </div>
    );

    const sentinel = await screen.findByTestId("message-list-top-sentinel");
    const observer = MockIntersectionObserver.instances[0];

    expect(observer).toBeDefined();
    expect(observer?.observe).toHaveBeenCalledWith(sentinel);

    observer?.trigger(true);

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("does not observe sentinel when there are no more messages to load", async () => {
    const messages = createMessages(100);
    const loadMore = vi.fn().mockResolvedValue(undefined);

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} loadMore={loadMore} hasMore={false} />
      </div>
    );

    await screen.findByTestId("message-list-top-sentinel");

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it("prevents concurrent loadMore calls while a load is in flight", async () => {
    const messages = createMessages(100);
    let resolveLoadMore: (() => void) | null = null;
    const loadMore = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLoadMore = resolve;
        })
    );

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} loadMore={loadMore} hasMore />
      </div>
    );

    const observer = MockIntersectionObserver.instances[0];
    expect(observer).toBeDefined();

    observer?.trigger(true);
    observer?.trigger(true);

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalledTimes(1);
    });

    resolveLoadMore?.();

    await waitFor(() => {
      observer?.trigger(true);
      expect(loadMore).toHaveBeenCalledTimes(2);
    });
  });

  it("shows loading indicator for older messages at the top", () => {
    const messages = createMessages(100);

    render(
      <div style={{ height: "600px" }}>
        <MessageList messages={messages} hasMore loadingMore />
      </div>
    );

    expect(screen.getByText("Loading older messages...")).toBeInTheDocument();
  });
});
