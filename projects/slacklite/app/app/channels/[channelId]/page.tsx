"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import ChannelHeader from "@/components/features/channels/ChannelHeader";
import DeleteChannelModal from "@/components/features/channels/DeleteChannelModal";
import RenameChannelModal from "@/components/features/channels/RenameChannelModal";
import { MessageInput } from "@/components/features/messages/MessageInput";
import MessageList from "@/components/features/messages/MessageList";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { useChannels } from "@/lib/hooks/useChannels";
import { useMessages } from "@/lib/hooks/useMessages";
import { useWorkspaceOwnerId } from "@/lib/hooks/useWorkspaceOwnerId";
import type { Message } from "@/lib/types/models";
import {
  consumeChannelSwitchStart,
  trackChannelSwitch,
} from "@/lib/monitoring/performance";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import { deleteChannel, renameChannel } from "@/lib/utils/channels";
import { isGeneralChannelName } from "@/lib/utils/workspace";

const BOTTOM_THRESHOLD_PX = 100;

function ChannelPageContent() {
  const params = useParams<{ channelId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelNameFromUrl = searchParams.get("name") ?? "";
  const channelId = typeof params?.channelId === "string" ? params.channelId.trim() : "";
  const { user } = useAuth();
  const workspaceId = typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const { channels } = useChannels();
  const { ownerId: workspaceOwnerId } = useWorkspaceOwnerId(workspaceId);
  const currentChannel = useMemo(
    () => channels.find((channel) => channel.channelId === channelId) ?? null,
    [channelId, channels]
  );
  const channelName = currentChannel?.name ?? (channelNameFromUrl || channelId);
  const canManageChannel = Boolean(
    user?.uid &&
    currentChannel &&
    (currentChannel.createdBy === user.uid || workspaceOwnerId === user.uid)
  );
  const generalChannelId = useMemo(() => {
    const generalChannel = channels.find((channel) => isGeneralChannelName(channel.name));

    return generalChannel?.channelId ?? "";
  }, [channels]);
  const userName =
    typeof user?.displayName === "string" && user.displayName.trim().length > 0
      ? user.displayName.trim()
      : typeof user?.email === "string" && user.email.length > 0
        ? user.email.split("@")[0]
        : "Unknown";
  const {
    messages: realtimeMessages,
    loading: realtimeLoading,
    error: realtimeError,
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
      : null
  );
  const {
    messages: persistedMessages,
    loading: persistedLoading,
    error: persistedError,
  } = useMessages(channelId);

  // Merge Firestore (persisted) and RTDB (real-time) messages using a Map keyed
  // on messageId so the same message from both sources is never duplicated.
  const messages = useMemo((): Message[] => {
    const mergedMessages = new Map<string, Message>();
    persistedMessages.forEach((message) => {
      mergedMessages.set(message.messageId, message);
    });
    realtimeMessages.forEach((message) => {
      mergedMessages.set(message.messageId, message);
    });
    return [...mergedMessages.values()].sort(
      (a, b) =>
        (a.timestamp?.toMillis?.() ?? 0) - (b.timestamp?.toMillis?.() ?? 0),
    );
  }, [persistedMessages, realtimeMessages]);

  const loading = realtimeLoading || persistedLoading;
  const error = realtimeError ?? persistedError;
  const [isChannelSwitching, setIsChannelSwitching] = useState(false);
  const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);
  const [isRenameChannelModalOpen, setIsRenameChannelModalOpen] = useState(false);
  const [isDeleteChannelModalOpen, setIsDeleteChannelModalOpen] = useState(false);
  const [channelActionError, setChannelActionError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const channelSwitchStartTimeRef = useRef<number | null>(null);
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
    if (!channelActionError) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setChannelActionError(null);
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [channelActionError]);

  useEffect(() => {
    channelSwitchStartTimeRef.current =
      consumeChannelSwitchStart(channelId) ?? Date.now();
    setShowNewMessagesBadge(false);
    previousMessageCountRef.current = 0;
    wasAtBottomRef.current = true;
    hasInitializedScrollRef.current = false;
    setIsRenameChannelModalOpen(false);
    setIsDeleteChannelModalOpen(false);
    setChannelActionError(null);

    setIsChannelSwitching(true);
    const timer = setTimeout(() => {
      setIsChannelSwitching(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [channelId]);

  useEffect(() => {
    if (channelId.length === 0 || loading || isChannelSwitching) {
      return;
    }

    const switchStartTime = channelSwitchStartTimeRef.current;

    if (switchStartTime === null) {
      return;
    }

    trackChannelSwitch(switchStartTime, Date.now(), { channelId });
    channelSwitchStartTimeRef.current = null;
  }, [channelId, isChannelSwitching, loading]);

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

  const handleRenameChannel = useCallback(
    async (newName: string): Promise<void> => {
      if (!user?.uid || workspaceId.length === 0 || !currentChannel) {
        throw new Error("Unable to rename channel. Please try again.");
      }

      await renameChannel({
        firestore,
        workspaceId,
        channelId: currentChannel.channelId,
        currentName: currentChannel.name,
        newName,
        userId: user.uid,
        channelCreatedBy: currentChannel.createdBy,
        workspaceOwnerId,
      });

      setIsRenameChannelModalOpen(false);
    },
    [currentChannel, user?.uid, workspaceId, workspaceOwnerId]
  );

  const handleOpenDeleteModal = useCallback(() => {
    if (!currentChannel) {
      return;
    }

    if (isGeneralChannelName(currentChannel.name)) {
      setChannelActionError("Cannot delete #general channel");
      return;
    }

    setChannelActionError(null);
    setIsDeleteChannelModalOpen(true);
  }, [currentChannel]);

  const handleDeleteChannel = useCallback(async (): Promise<void> => {
    if (!user?.uid || workspaceId.length === 0 || !currentChannel) {
      throw new Error("Unable to delete channel. Please try again.");
    }

    await deleteChannel({
      firestore,
      workspaceId,
      channelId: currentChannel.channelId,
      channelName: currentChannel.name,
      userId: user.uid,
      channelCreatedBy: currentChannel.createdBy,
      workspaceOwnerId,
    });

    setIsDeleteChannelModalOpen(false);

    if (channelId === currentChannel.channelId) {
      if (generalChannelId.length > 0 && generalChannelId !== currentChannel.channelId) {
        router.replace(`/app/channels/${generalChannelId}`);
      } else {
        router.replace("/app");
      }
    }
  }, [
    channelId,
    currentChannel,
    generalChannelId,
    router,
    user?.uid,
    workspaceId,
    workspaceOwnerId,
  ]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2">
        <p className="text-muted">Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {channelActionError ? (
        <div
          role="alert"
          className="fixed right-4 top-4 z-50 rounded-md border border-error/30 bg-error px-4 py-3 text-sm text-white shadow-lg"
        >
          {channelActionError}
        </div>
      ) : null}

      <ChannelHeader
        channelName={channelName}
        canRenameChannel={canManageChannel}
        onRenameChannel={() => {
          setIsRenameChannelModalOpen(true);
        }}
        canDeleteChannel={canManageChannel}
        onDeleteChannel={handleOpenDeleteModal}
      />

      {/* Message List */}
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

          {(loading || isChannelSwitching) && messages.length === 0 && (
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
            <div className="flex flex-1 items-center justify-center bg-surface-2">
              <div className="text-center">
                <p className="text-sm text-muted mb-1">No messages yet</p>
                <p className="text-xs font-mono text-disabled">
                  Be the first to send a message in this channel!
                </p>
              </div>
            </div>
          )}

          {!error && messages.length > 0 && (
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

      {/* Message Input */}
      <MessageInput channelId={channelId} onSend={sendMessage} />

      <RenameChannelModal
        channel={currentChannel}
        isOpen={isRenameChannelModalOpen}
        onClose={() => {
          setIsRenameChannelModalOpen(false);
        }}
        onRename={handleRenameChannel}
      />

      <DeleteChannelModal
        channel={currentChannel}
        isOpen={isDeleteChannelModalOpen}
        onClose={() => {
          setIsDeleteChannelModalOpen(false);
        }}
        onDelete={handleDeleteChannel}
      />
    </div>
  );
}

export default function ChannelPage() {
  return (
    <Suspense fallback={null}>
      <ChannelPageContent />
    </Suspense>
  );
}
