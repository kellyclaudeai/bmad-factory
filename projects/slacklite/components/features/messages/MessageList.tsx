"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
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
const LOAD_MORE_THRESHOLD_PX = 24;

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

function Spinner() {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
      />
      Loading messages...
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
              <span className="font-semibold text-gray-900">{message.userName || "Unknown"}</span>
              <span
                className={`text-xs ${
                  message.status === "failed" ? "text-error" : "text-gray-500"
                }`}
              >
                {message.status === "sending"
                  ? "Sending..."
                  : formatMessageTimestamp(message.timestamp)}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">
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

      const shouldLoadMore =
        scrollEvent.scrollDirection === "backward" &&
        scrollEvent.scrollOffset <= LOAD_MORE_THRESHOLD_PX;

      if (shouldLoadMore) {
        void triggerLoadMore();
      }
    },
    [onScroll, triggerLoadMore]
  );

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
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-error">Failed to load messages</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <p>No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full min-h-0">
      {loadingMore ? (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-white/95 px-3 py-1 text-xs text-gray-600 shadow"
        >
          <span
            aria-hidden="true"
            className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
          />
          Loading older messages...
        </div>
      ) : null}

      <VariableSizeList
        ref={listRef}
        outerRef={setOuterElementRef}
        outerElementType={ListOuterElement}
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
    </div>
  );
}
