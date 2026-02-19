"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MessageInput } from "@/components/features/messages/MessageInput";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Message } from "@/lib/types/models";

const BOTTOM_THRESHOLD_PX = 100;

function formatMessageTimestamp(timestamp: Message["timestamp"]): string {
  const messageDate =
    typeof timestamp === "number" ? new Date(timestamp) : timestamp.toDate();

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>();
  const channelId =
    typeof params?.channelId === "string" ? params.channelId.trim() : "";
  const { user } = useAuth();
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const userName =
    typeof user?.displayName === "string" && user.displayName.trim().length > 0
      ? user.displayName.trim()
      : typeof user?.email === "string" && user.email.length > 0
        ? user.email.split("@")[0]
        : "Unknown";
  const {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
    sendErrorBanner,
    retryLastSend,
    firestoreWarningBanner,
    retryFirestoreWrite,
  } = useRealtimeMessages(
    workspaceId,
    channelId,
    user
      ? {
          userId: user.uid,
          userName,
        }
      : null,
  );
  const [isChannelSwitching, setIsChannelSwitching] = useState(false);
  const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const wasAtBottomRef = useRef(true);
  const hasInitializedScrollRef = useRef(false);

  const isAtBottom = useCallback((): boolean => {
    const listElement = messageListRef.current;

    if (!listElement) {
      return false;
    }

    const distanceFromBottom =
      listElement.scrollHeight - listElement.scrollTop - listElement.clientHeight;

    return distanceFromBottom <= BOTTOM_THRESHOLD_PX;
  }, []);

  const scrollToBottom = useCallback((smooth = true): void => {
    const listElement = messageListRef.current;

    if (!listElement) {
      return;
    }

    if (typeof listElement.scrollTo === "function") {
      listElement.scrollTo({
        top: listElement.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      listElement.scrollTop = listElement.scrollHeight;
    }

    wasAtBottomRef.current = true;
    setShowNewMessagesBadge(false);
  }, []);

  const handleMessageListScroll = useCallback((): void => {
    const atBottom = isAtBottom();

    wasAtBottomRef.current = atBottom;

    if (atBottom) {
      setShowNewMessagesBadge(false);
    }
  }, [isAtBottom]);

  // Track channel switches for loading indicator
  useEffect(() => {
    setShowNewMessagesBadge(false);
    previousMessageCountRef.current = 0;
    wasAtBottomRef.current = true;
    hasInitializedScrollRef.current = false;

    setIsChannelSwitching(true);
    const timer = setTimeout(() => {
      setIsChannelSwitching(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [channelId]);

  useEffect(() => {
    if (messages.length === 0) {
      previousMessageCountRef.current = 0;
      return;
    }

    const previousMessageCount = previousMessageCountRef.current;
    const hasNewMessage = messages.length > previousMessageCount;

    if (!hasInitializedScrollRef.current) {
      scrollToBottom(false);
      hasInitializedScrollRef.current = true;
      previousMessageCountRef.current = messages.length;
      return;
    }

    if (hasNewMessage) {
      if (wasAtBottomRef.current) {
        scrollToBottom(true);
      } else {
        setShowNewMessagesBadge(true);
      }
    }

    previousMessageCountRef.current = messages.length;
  }, [messages, scrollToBottom]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message List */}
      <div className="relative flex-1">
        <div
          ref={messageListRef}
          onScroll={handleMessageListScroll}
          data-testid="channel-message-list"
          className="h-full overflow-y-auto p-4"
        >
          {sendErrorBanner && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-error/30 bg-red-50 px-4 py-3"
            >
              <p className="text-sm text-error">{sendErrorBanner}</p>
              <button
                type="button"
                onClick={() => {
                  void retryLastSend();
                }}
                className="text-sm font-medium text-error underline decoration-error/70 underline-offset-2 hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {firestoreWarningBanner && (
            <div
              role="alert"
              className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-gray-100 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-gray-800">{firestoreWarningBanner.message}</p>
                {firestoreWarningBanner.pendingCount > 1 && (
                  <p className="mt-1 text-xs text-gray-600">
                    {firestoreWarningBanner.pendingCount} messages are waiting to be saved.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  void retryFirestoreWrite(firestoreWarningBanner.messageId);
                }}
                className="text-sm font-medium text-gray-800 underline decoration-gray-500 underline-offset-2 hover:text-gray-900"
              >
                Retry Save
              </button>
            </div>
          )}

          {(loading || isChannelSwitching) && (
            <div className="flex items-center justify-center py-8">
              <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
                />
                Loading messages...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                Failed to load messages. Please try again.
              </p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">No messages yet</p>
                <p className="mt-1 text-sm text-gray-600">
                  Be the first to send a message in this channel!
                </p>
              </div>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.messageId}
                  className={`flex gap-3 ${message.status === "sending" ? "opacity-70" : ""}`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-primary-brand text-white font-semibold">
                    {message.userName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900">
                        {message.userName || "Unknown"}
                      </span>
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
                    <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                    {message.status === "failed" && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-error">Failed to send. Retry?</span>
                        <button
                          type="button"
                          onClick={() => {
                            void retryMessage(message.messageId);
                          }}
                          className="text-xs font-medium text-error underline decoration-error/60 underline-offset-2 hover:text-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showNewMessagesBadge && (
          <button
            type="button"
            onClick={() => {
              scrollToBottom(true);
            }}
            className="absolute bottom-4 right-4 z-10 inline-flex h-8 items-center rounded-full bg-primary-brand px-3 text-base font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-brand focus:ring-offset-2"
          >
            New messages ↓
          </button>
        )}
      </div>

      {/* Message Input */}
      <MessageInput channelId={channelId} onSend={sendMessage} />
    </div>
  );
}
