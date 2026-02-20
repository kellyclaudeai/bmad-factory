"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";

import { MessageInput } from "@/components/features/messages/MessageInput";
import MessageList from "@/components/features/messages/MessageList";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { useDocument } from "@/lib/hooks/useDocument";
import { useMessages } from "@/lib/hooks/useMessages";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import type { Message } from "@/lib/types/models";

const BOTTOM_THRESHOLD_PX = 100;

interface DirectMessageDocument {
  userIds?: unknown;
}

interface UserDocument {
  displayName?: unknown;
  email?: unknown;
  photoURL?: unknown;
  isOnline?: unknown;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function parseUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const userIds = new Set<string>();

  value.forEach((entry) => {
    const userId = toNonEmptyString(entry);

    if (userId) {
      userIds.add(userId);
    }
  });

  return [...userIds];
}

function getUserDisplayName(user: UserDocument | null): string {
  const displayName = toNonEmptyString(user?.displayName);

  if (displayName) {
    return displayName;
  }

  const email = toNonEmptyString(user?.email);

  if (email) {
    return email.split("@")[0] ?? email;
  }

  return "Unknown user";
}

function toTimestampMillis(timestamp: Message["timestamp"]): number {
  return typeof timestamp === "number" ? timestamp : timestamp.toMillis();
}

export default function DirectMessagePage() {
  const params = useParams<{ dmId: string }>();
  const dmId = typeof params?.dmId === "string" ? params.dmId.trim() : "";
  const { user } = useAuth();
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const currentUserId = typeof user?.uid === "string" ? user.uid.trim() : "";
  const userName =
    typeof user?.displayName === "string" && user.displayName.trim().length > 0
      ? user.displayName.trim()
      : typeof user?.email === "string" && user.email.length > 0
        ? user.email.split("@")[0]
        : "Unknown";

  const directMessageRef = useMemo(() => {
    if (workspaceId.length === 0 || dmId.length === 0) {
      return null;
    }

    return doc(firestore, `workspaces/${workspaceId}/directMessages/${dmId}`);
  }, [dmId, workspaceId]);
  const {
    data: directMessage,
    loading: directMessageLoading,
    error: directMessageError,
  } = useDocument<DirectMessageDocument>(directMessageRef);

  const dmUserIds = useMemo(
    () => parseUserIds(directMessage?.userIds),
    [directMessage?.userIds],
  );
  const isParticipant = currentUserId.length > 0 && dmUserIds.includes(currentUserId);
  const otherUserId = useMemo(
    () => dmUserIds.find((userId) => userId !== currentUserId) ?? "",
    [currentUserId, dmUserIds],
  );
  const otherUserRef = useMemo(() => {
    if (otherUserId.length === 0) {
      return null;
    }

    return doc(firestore, "users", otherUserId);
  }, [otherUserId]);
  const { data: otherUser } = useDocument<UserDocument>(otherUserRef);
  const otherUserName = getUserDisplayName(otherUser);
  const otherUserPhotoUrl = toNonEmptyString(otherUser?.photoURL) ?? undefined;
  const isOtherUserOnline = otherUser?.isOnline === true;
  const canOpenConversation =
    !directMessageLoading && !directMessageError && directMessage !== null && isParticipant;
  const activeThreadId = canOpenConversation ? dmId : "";
  const {
    messages: realtimeMessages,
    loading: realtimeMessagesLoading,
    error: realtimeMessagesError,
    sendMessage,
    retryMessage,
    sendErrorBanner,
    retryLastSend,
    firestoreWarningBanner,
    retryFirestoreWrite,
  } = useRealtimeMessages(
    workspaceId,
    activeThreadId,
    user
      ? {
          userId: user.uid,
          userName,
        }
      : null,
    {
      targetType: "dm",
      firestoreThreadId: activeThreadId,
      rtdbThreadId: activeThreadId.length > 0 ? `dm-${activeThreadId}` : "",
    },
  );
  const {
    messages: persistedMessages,
    loading: persistedMessagesLoading,
    error: persistedMessagesError,
  } = useMessages(activeThreadId, { targetType: "dm" });
  const messages = useMemo(() => {
    const mergedMessages = new Map<string, Message>();

    persistedMessages.forEach((message) => {
      mergedMessages.set(message.messageId, message);
    });

    realtimeMessages.forEach((message) => {
      mergedMessages.set(message.messageId, message);
    });

    return [...mergedMessages.values()].sort(
      (firstMessage, secondMessage) =>
        toTimestampMillis(firstMessage.timestamp) -
        toTimestampMillis(secondMessage.timestamp),
    );
  }, [persistedMessages, realtimeMessages]);
  const loading = realtimeMessagesLoading || persistedMessagesLoading;
  const error = realtimeMessagesError ?? persistedMessagesError;
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

  useEffect(() => {
    setShowNewMessagesBadge(false);
    previousMessageCountRef.current = 0;
    wasAtBottomRef.current = true;
    hasInitializedScrollRef.current = false;
  }, [dmId]);

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
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">Please sign in to view messages.</p>
      </div>
    );
  }

  if (dmId.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">Direct message not found.</p>
      </div>
    );
  }

  if (directMessageLoading) {
    return (
      <div className="flex h-full items-center justify-center py-8 bg-surface-2">
        <div role="status" className="flex items-center gap-2 text-sm text-muted">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-transparent"
          />
          Loading conversation...
        </div>
      </div>
    );
  }

  if (directMessageError) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2 p-4">
        <div className="rounded-lg border border-error/30 bg-surface-3 p-4">
          <p className="text-sm text-error">Failed to load this conversation. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!directMessage) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">Direct message not found.</p>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">You do not have access to this conversation.</p>
      </div>
    );
  }

  if (otherUserId.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">Unable to load conversation participant.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border bg-surface-1 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={otherUserPhotoUrl}
              alt={otherUserName}
              fallbackText={otherUserName}
              size="sm"
            />
            <span
              className={`absolute bottom-0 right-0 inline-block h-2.5 w-2.5 rounded-full border-2 border-surface-1 ${
                isOtherUserOnline ? "bg-success" : "bg-surface-3"
              }`}
              role="status"
              aria-label={isOtherUserOnline ? "Online" : "Offline"}
            />
          </div>
          <h2 className="text-xl font-semibold text-primary">{otherUserName}</h2>
        </div>
      </header>

      <div className="relative flex-1 bg-surface-2">
        <div className="flex h-full min-h-0 flex-col">
          {sendErrorBanner && (
            <div
              role="alert"
              className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border border-error/30 bg-surface-3 px-4 py-3"
            >
              <p className="text-sm text-error">{sendErrorBanner}</p>
              <button
                type="button"
                onClick={() => {
                  void retryLastSend();
                }}
                className="text-sm font-medium text-error underline decoration-error/70 underline-offset-2 hover:opacity-80"
              >
                Retry
              </button>
            </div>
          )}

          {firestoreWarningBanner && (
            <div
              role="alert"
              className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-surface-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-secondary">{firestoreWarningBanner.message}</p>
                {firestoreWarningBanner.pendingCount > 1 && (
                  <p className="mt-1 text-xs text-muted">
                    {firestoreWarningBanner.pendingCount} messages are waiting to be saved.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  void retryFirestoreWrite(firestoreWarningBanner.messageId);
                }}
                className="text-sm font-medium text-secondary underline decoration-border-strong underline-offset-2 hover:text-primary"
              >
                Retry Save
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-1 items-center justify-center py-8 bg-surface-2">
              <div role="status" className="flex items-center gap-2 text-sm text-muted">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-transparent"
                />
                Loading messages...
              </div>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-3 rounded-lg border border-error/30 bg-surface-3 p-4">
              <p className="text-sm text-error">Failed to load messages. Please try again.</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center bg-surface-2 text-center px-8">
              <p className="text-sm text-muted">No messages yet. Say hello!</p>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="min-h-0 flex-1">
              <MessageList
                messages={messages}
                onRetryMessage={(messageId) => {
                  void retryMessage(messageId);
                }}
                onScroll={() => {
                  handleMessageListScroll();
                }}
                outerRef={messageListRef}
              />
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

      <MessageInput channelId={`dm-${dmId}`} onSend={sendMessage} />
    </div>
  );
}
