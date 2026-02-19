"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";

import DMHeader from "@/components/features/messages/DMHeader";
import { MessageInput } from "@/components/features/messages/MessageInput";
import MessageList from "@/components/features/messages/MessageList";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { useDocument } from "@/lib/hooks/useDocument";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";

const BOTTOM_THRESHOLD_PX = 100;

interface DirectMessageDocument {
  userIds?: unknown;
}

interface UserDocument {
  displayName?: unknown;
  email?: unknown;
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
  const isOtherUserOnline = otherUser?.isOnline === true;
  const canOpenConversation =
    !directMessageLoading && !directMessageError && directMessage !== null && isParticipant;
  const activeThreadId = canOpenConversation ? dmId : "";
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
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Please sign in to view messages.</p>
      </div>
    );
  }

  if (dmId.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Direct message not found.</p>
      </div>
    );
  }

  if (directMessageLoading) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
          />
          Loading conversation...
        </div>
      </div>
    );
  }

  if (directMessageError) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load this conversation. Please try again.</p>
      </div>
    );
  }

  if (!directMessage) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Direct message not found.</p>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">You do not have access to this conversation.</p>
      </div>
    );
  }

  if (otherUserId.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Unable to load conversation participant.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3">
        <DMHeader otherUserName={otherUserName} isOnline={isOtherUserOnline} />
      </header>

      <div className="relative flex-1">
        <div className="flex h-full min-h-0 flex-col p-4">
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

          {loading && (
            <div className="flex flex-1 items-center justify-center py-8">
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
              <p className="text-sm text-red-800">Failed to load messages. Please try again.</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-gray-600">No messages yet. Say hello!</p>
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

      <MessageInput channelId={dmId} onSend={sendMessage} />
    </div>
  );
}
