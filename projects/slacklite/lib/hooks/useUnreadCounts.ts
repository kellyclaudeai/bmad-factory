"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  off,
  onChildAdded,
  orderByChild,
  query as rtdbQuery,
  ref,
  startAt,
  type DataSnapshot,
} from "firebase/database";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore, rtdb } from "@/lib/firebase/client";
import type { Channel, UnreadTargetType } from "@/lib/types/models";

export interface UseUnreadCountsOptions {
  channels: Channel[];
  directMessageIds?: string[];
  activeTargetId?: string | null;
  activeTargetType?: UnreadTargetType;
}

export interface UseUnreadCountsResult {
  unreadCounts: Record<string, number>;
  loading: boolean;
  error: Error | null;
}

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "not-found";
}

function parseUnreadCountSnapshot(
  data: DocumentData,
): { targetId: string; count: number } | null {
  if (typeof data.targetId !== "string" || data.targetId.trim().length === 0) {
    return null;
  }

  if (typeof data.count !== "number" || !Number.isFinite(data.count)) {
    return null;
  }

  return {
    targetId: data.targetId.trim(),
    count: Math.max(0, Math.floor(data.count)),
  };
}

function toChannelIds(channels: Channel[]): string[] {
  const uniqueChannelIds = new Set<string>();

  channels.forEach((channel) => {
    const channelId =
      typeof channel.channelId === "string" ? channel.channelId.trim() : "";

    if (channelId.length > 0) {
      uniqueChannelIds.add(channelId);
    }
  });

  return [...uniqueChannelIds];
}

function toTargetIds(targetIds: string[] | undefined): string[] {
  if (!targetIds || targetIds.length === 0) {
    return [];
  }

  const uniqueTargetIds = new Set<string>();

  targetIds.forEach((targetId) => {
    if (typeof targetId !== "string") {
      return;
    }

    const normalizedTargetId = targetId.trim();

    if (normalizedTargetId.length > 0) {
      uniqueTargetIds.add(normalizedTargetId);
    }
  });

  return [...uniqueTargetIds];
}

function toMessageAuthorUserId(snapshot: DataSnapshot): string {
  const payload = snapshot.val();

  if (typeof payload !== "object" || payload === null) {
    return "";
  }

  const userId = (payload as { userId?: unknown }).userId;

  return typeof userId === "string" ? userId.trim() : "";
}

export function useUnreadCounts({
  channels,
  directMessageIds,
  activeTargetId,
  activeTargetType = "channel",
}: UseUnreadCountsOptions): UseUnreadCountsResult {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userId = typeof user?.uid === "string" ? user.uid.trim() : "";
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const normalizedActiveTargetId =
    typeof activeTargetId === "string" ? activeTargetId.trim() : "";
  const channelIds = useMemo(() => toChannelIds(channels), [channels]);
  const dmIds = useMemo(() => toTargetIds(directMessageIds), [directMessageIds]);
  const activeTargetIdRef = useRef(normalizedActiveTargetId);

  useEffect(() => {
    activeTargetIdRef.current = normalizedActiveTargetId;
  }, [normalizedActiveTargetId]);

  const incrementUnreadCount = useCallback(
    async (targetId: string, targetType: UnreadTargetType): Promise<void> => {
      if (userId.length === 0 || targetId.length === 0) {
        return;
      }

      const unreadCountRef = doc(firestore, "unreadCounts", `${userId}_${targetId}`);

      try {
        await updateDoc(unreadCountRef, {
          count: increment(1),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (incrementError) {
        if (!isNotFoundError(incrementError)) {
          throw incrementError;
        }
      }

      await setDoc(unreadCountRef, {
        userId,
        targetId,
        targetType,
        count: 1,
        lastReadAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [userId],
  );

  const clearUnreadCount = useCallback(
    async (targetId: string, targetType: UnreadTargetType): Promise<void> => {
      if (userId.length === 0 || targetId.length === 0) {
        return;
      }

      const unreadCountRef = doc(firestore, "unreadCounts", `${userId}_${targetId}`);

      try {
        await updateDoc(unreadCountRef, {
          userId,
          targetId,
          targetType,
          count: 0,
          lastReadAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (clearError) {
        if (!isNotFoundError(clearError)) {
          throw clearError;
        }
      }

      await setDoc(unreadCountRef, {
        userId,
        targetId,
        targetType,
        count: 0,
        lastReadAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [userId],
  );

  useEffect(() => {
    if (userId.length === 0) {
      setUnreadCounts({});
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unreadCountsQuery = query(
      collection(firestore, "unreadCounts"),
      where("userId", "==", userId),
    );

    const unsubscribe = onSnapshot(
      unreadCountsQuery,
      (snapshot) => {
        const nextUnreadCounts: Record<string, number> = {};

        snapshot.docs.forEach((documentSnapshot) => {
          const parsedUnreadCount = parseUnreadCountSnapshot(documentSnapshot.data());

          if (!parsedUnreadCount) {
            return;
          }

          nextUnreadCounts[parsedUnreadCount.targetId] = parsedUnreadCount.count;
        });

        setUnreadCounts(nextUnreadCounts);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    if (userId.length === 0 || normalizedActiveTargetId.length === 0) {
      return;
    }

    void clearUnreadCount(normalizedActiveTargetId, activeTargetType).catch(
      (clearError) => {
        setError(toError(clearError, "Failed to clear unread count."));
      },
    );
  }, [activeTargetType, clearUnreadCount, normalizedActiveTargetId, userId]);

  useEffect(() => {
    if (
      userId.length === 0 ||
      workspaceId.length === 0 ||
      (channelIds.length === 0 && dmIds.length === 0)
    ) {
      return;
    }

    const channelTargets = channelIds.map((channelId) => ({
      targetId: channelId,
      targetType: "channel" as const,
      rtdbThreadId: channelId,
    }));
    const dmTargets = dmIds.map((dmId) => ({
      targetId: dmId,
      targetType: "dm" as const,
      rtdbThreadId: `dm-${dmId}`,
    }));
    const unreadTargets = [...channelTargets, ...dmTargets];
    const detachListeners: Array<() => void> = [];

    unreadTargets.forEach((unreadTarget) => {
      const channelMessagesRef = ref(rtdb, `messages/${workspaceId}/${unreadTarget.rtdbThreadId}`);
      const channelMessagesQuery = rtdbQuery(
        channelMessagesRef,
        orderByChild("timestamp"),
        startAt(Date.now()),
      );
      const seenMessageIds = new Set<string>();

      const handleNewMessage = (snapshot: DataSnapshot): void => {
        const messageId = snapshot.key;
        const messageAuthorUserId = toMessageAuthorUserId(snapshot);

        if (!messageId || seenMessageIds.has(messageId)) {
          return;
        }

        seenMessageIds.add(messageId);

        if (messageAuthorUserId.length === 0 || messageAuthorUserId === userId) {
          return;
        }

        if (
          activeTargetType === unreadTarget.targetType &&
          activeTargetIdRef.current === unreadTarget.targetId
        ) {
          return;
        }

        void incrementUnreadCount(unreadTarget.targetId, unreadTarget.targetType).catch(
          (incrementError) => {
            setError(toError(incrementError, "Failed to increment unread count."));
          },
        );
      };

      const handleMessageError = (listenerError: Error): void => {
        setError(listenerError);
      };

      onChildAdded(channelMessagesQuery, handleNewMessage, handleMessageError);

      detachListeners.push(() => {
        off(channelMessagesQuery, "child_added", handleNewMessage);
      });
    });

    return () => {
      detachListeners.forEach((detachListener) => {
        detachListener();
      });
    };
  }, [activeTargetType, channelIds, dmIds, incrementUnreadCount, userId, workspaceId]);

  return {
    unreadCounts,
    loading,
    error,
  };
}
