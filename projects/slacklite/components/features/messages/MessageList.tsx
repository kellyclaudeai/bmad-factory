"use client";

import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MutableRefObject,
} from "react";
import {
  VariableSizeList,
  type ListChildComponentProps,
  type ListOnScrollProps,
} from "react-window";

import type { Message } from "@/lib/types/models";

const ESTIMATED_MESSAGE_HEIGHT_PX = 80;
const DEFAULT_VIEWPORT_HEIGHT_PX = 600;
const OVERSCAN_COUNT = 3;

export interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: Error | null;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
  onRetryMessage?: (messageId: string) => void;
  onScroll?: (props: ListOnScrollProps) => void;
  outerRef?: MutableRefObject<HTMLDivElement | null>;
}

interface MessageListItemData {
  messages: Message[];
  onRetryMessage?: (messageId: string) => void;
  setRowHeight: (index: number, messageId: string, nextHeight: number) => void;
}

interface SpinnerProps {
  label?: string;
  className?: string;
  indicatorClassName?: string;
}

function Spinner({
  label = "Loading messages...",
  className = "text-sm text-muted",
  indicatorClassName = "h-4 w-4",
}: SpinnerProps = {}) {
  return (
    <div role="status" className={`flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`${indicatorClassName} animate-spin rounded-full border-2 border-border-strong border-t-transparent`}
      />
      {label}
    </div>
  );
}

function formatMessageTimestamp(timestamp: Message["timestamp"]): string {
  const messageDate = typeof timestamp === "number" ? new Date(timestamp) : timestamp.toDate();

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ListOuterElement = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListOuterElement(props, ref) {
    return <div {...props} ref={ref} data-testid="channel-message-list" />;
  }
);

const TopSentinelContext = createContext<MutableRefObject<HTMLDivElement | null> | null>(null);

const ListInnerElement = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListInnerElement({ children, style, ...props }, ref) {
    const sentinelRef = useContext(TopSentinelContext);

    return (
      <div {...props} ref={ref} style={{ ...style, position: "relative" }}>
        <div
          ref={(element) => {
            if (!sentinelRef) {
              return;
            }

            sentinelRef.current = element;
          }}
          data-testid="message-list-top-sentinel"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
        />
        {children}
      </div>
    );
  }
);

const MessageRow = memo(function MessageRow({
  index,
  style,
  data,
}: ListChildComponentProps<MessageListItemData>) {
  const message = data.messages[index];
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !rowRef.current) {
      return;
    }

    const rowElement = rowRef.current;
    const measureRowHeight = (): void => {
      const measuredHeight = Math.ceil(rowElement.getBoundingClientRect().height);

      if (measuredHeight > 0) {
        data.setRowHeight(index, message.messageId, measuredHeight);
      }
    };

    measureRowHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureRowHeight();
    });

    observer.observe(rowElement);

    return () => {
      observer.disconnect();
    };
  }, [data, index, message]);

  if (!message) {
    return null;
  }

  return (
    <div
      style={style}
      data-testid="virtualized-message-row-container"
      data-message-id={message.messageId}
    >
      <div
        ref={rowRef}
        data-testid="virtualized-message-row"
        className={`px-4 py-2 ${message.status === "sending" ? "opacity-70" : ""}`}
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-primary-brand font-semibold text-white">
            {message.userName?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-primary">{message.userName || "Unknown"}</span>
              <span
                className={`text-xs ${
                  message.status === "failed" ? "text-error" : "text-muted"
                }`}
              >
                {message.status === "sending"
                  ? "Sending..."
                  : formatMessageTimestamp(message.timestamp)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-secondary">
              {message.text}
            </p>
            {message.status === "failed" && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-error">Failed to send. Retry?</span>
                <button
                  type="button"
                  onClick={() => {
                    data.onRetryMessage?.(message.messageId);
                  }}
                  className="text-xs font-medium text-error underline decoration-error/60 underline-offset-2 hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function MessageList({
  messages,
  loading = false,
  error = null,
  loadMore,
  hasMore = false,
  loadingMore = false,
  onRetryMessage,
  onScroll,
  outerRef,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<VariableSizeList<MessageListItemData> | null>(null);
  const listOuterElementRef = useRef<HTMLDivElement | null>(null);
  const listTopSentinelRef = useRef<HTMLDivElement | null>(null);
  const rowHeightsRef = useRef<Record<string, number>>({});
  const previousMessagesRef = useRef<Message[]>(messages);
  const measuredViewportHeightRef = useRef(DEFAULT_VIEWPORT_HEIGHT_PX);
  const loadMoreInFlightRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT_PX);

  const setRowHeight = useCallback((index: number, messageId: string, nextHeight: number): void => {
    const currentHeight = rowHeightsRef.current[messageId];

    if (currentHeight === nextHeight) {
      return;
    }

    rowHeightsRef.current[messageId] = nextHeight;
    listRef.current?.resetAfterIndex(index);
  }, []);

  const getRowHeight = useCallback(
    (index: number): number => {
      const messageId = messages[index]?.messageId;

      if (!messageId) {
        return ESTIMATED_MESSAGE_HEIGHT_PX;
      }

      return rowHeightsRef.current[messageId] ?? ESTIMATED_MESSAGE_HEIGHT_PX;
    },
    [messages]
  );

  const setOuterElementRef = useCallback(
    (element: HTMLDivElement | null): void => {
      listOuterElementRef.current = element;

      if (outerRef) {
        outerRef.current = element;
      }
    },
    [outerRef]
  );

  const triggerLoadMore = useCallback(async (): Promise<void> => {
    if (!loadMore || !hasMore || loadingMore || loadMoreInFlightRef.current) {
      return;
    }

    loadMoreInFlightRef.current = true;

    try {
      await loadMore();
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [hasMore, loadMore, loadingMore]);

  const handleListScroll = useCallback(
    (scrollEvent: ListOnScrollProps): void => {
      onScroll?.(scrollEvent);
    },
    [onScroll]
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const listElement = listOuterElementRef.current;
    const sentinelElement = listTopSentinelRef.current;

    if (!listElement || !sentinelElement || !hasMore || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void triggerLoadMore();
        }
      },
      {
        root: listElement,
        threshold: 0.1,
      }
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, triggerLoadMore]);

  const itemData = useMemo<MessageListItemData>(
    () => ({
      messages,
      onRetryMessage,
      setRowHeight,
    }),
    [messages, onRetryMessage, setRowHeight]
  );

  useEffect(() => {
    const updateViewportHeight = (): void => {
      const containerHeight = containerRef.current?.clientHeight ?? 0;

      if (containerHeight > 0 && containerHeight !== measuredViewportHeightRef.current) {
        measuredViewportHeightRef.current = containerHeight;
        setViewportHeight(containerHeight);
      }
    };

    updateViewportHeight();

    if (typeof ResizeObserver === "undefined") {
      if (typeof window === "undefined") {
        return;
      }

      window.addEventListener("resize", updateViewportHeight);

      return () => {
        window.removeEventListener("resize", updateViewportHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      updateViewportHeight();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const activeMessageIds = new Set(messages.map((message) => message.messageId));
    let removedHeightMetadata = false;

    for (const cachedMessageId of Object.keys(rowHeightsRef.current)) {
      if (activeMessageIds.has(cachedMessageId)) {
        continue;
      }

      delete rowHeightsRef.current[cachedMessageId];
      removedHeightMetadata = true;
    }

    if (removedHeightMetadata) {
      listRef.current?.resetAfterIndex(0, false);
    }
  }, [messages]);

  useEffect(() => {
    const previousMessages = previousMessagesRef.current;
    const listElement = listOuterElementRef.current;

    if (
      !listElement ||
      previousMessages.length === 0 ||
      messages.length <= previousMessages.length
    ) {
      previousMessagesRef.current = messages;
      return;
    }

    const previousFirstMessageId = previousMessages[0]?.messageId;

    if (!previousFirstMessageId) {
      previousMessagesRef.current = messages;
      return;
    }

    const prependedMessageCount = messages.findIndex(
      (message) => message.messageId === previousFirstMessageId
    );

    if (prependedMessageCount <= 0) {
      previousMessagesRef.current = messages;
      return;
    }

    const previousScrollTop = listElement.scrollTop;
    let prependedHeight = 0;

    for (let index = 0; index < prependedMessageCount; index += 1) {
      prependedHeight += getRowHeight(index);
    }

    listRef.current?.resetAfterIndex(0, false);
    listElement.scrollTop = previousScrollTop + prependedHeight;
    previousMessagesRef.current = messages;
  }, [getRowHeight, messages]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2 p-4 text-center text-error">
        Failed to load messages
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-surface-2 text-center px-8">
        <p className="text-muted text-sm mb-1">No messages yet</p>
        <p className="text-disabled text-xs font-mono">Send the first message below</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-0 bg-surface-2">
      {loadingMore ? (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-md bg-surface-3/95 px-3 py-1 shadow">
          <Spinner
            label="Loading older messages..."
            className="text-xs text-muted"
            indicatorClassName="h-3 w-3"
          />
        </div>
      ) : null}

      <TopSentinelContext.Provider value={listTopSentinelRef}>
        <VariableSizeList
          ref={listRef}
          outerRef={setOuterElementRef}
          outerElementType={ListOuterElement}
          innerElementType={ListInnerElement}
          height={viewportHeight}
          width="100%"
          itemCount={messages.length}
          itemData={itemData}
          itemSize={getRowHeight}
          estimatedItemSize={ESTIMATED_MESSAGE_HEIGHT_PX}
          overscanCount={OVERSCAN_COUNT}
          onScroll={handleListScroll}
        >
          {MessageRow}
        </VariableSizeList>
      </TopSentinelContext.Provider>
    </div>
  );
}
