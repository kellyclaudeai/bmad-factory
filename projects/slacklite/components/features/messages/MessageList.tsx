import { useCallback, useRef } from "react";

import MessageItem from "./MessageItem";

import type { Message } from "@/lib/types/models";

export interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
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

export default function MessageList({
  messages,
  loading,
  error,
  loadMore,
  hasMore = false,
  loadingMore = false,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreInFlightRef = useRef(false);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (!loadMore || !hasMore || loadingMore || loadMoreInFlightRef.current) {
      return;
    }

    const listElement = listRef.current;

    if (!listElement) {
      return;
    }

    const previousScrollHeight = listElement.scrollHeight;
    const previousScrollTop = listElement.scrollTop;

    loadMoreInFlightRef.current = true;

    try {
      await loadMore();

      if (!listRef.current) {
        return;
      }

      const newScrollHeight = listRef.current.scrollHeight;
      listRef.current.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [hasMore, loadMore, loadingMore]);

  const handleScroll = useCallback(() => {
    const listElement = listRef.current;

    if (!listElement) {
      return;
    }

    if (listElement.scrollTop <= 0 && hasMore && !loadingMore) {
      void handleLoadMore();
    }
  }, [handleLoadMore, hasMore, loadingMore]);

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
    <div ref={listRef} onScroll={handleScroll} className="space-y-1 overflow-y-auto p-4">
      {loadingMore ? (
        <div role="status" className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
          />
          Loading older messages...
        </div>
      ) : null}

      {messages.map((message) => (
        <MessageItem key={message.messageId} message={message} />
      ))}
    </div>
  );
}
