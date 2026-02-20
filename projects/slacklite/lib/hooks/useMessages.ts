"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import type { Message } from "@/lib/types/models";

const PAGE_SIZE = 50;
type MessageTargetType = "channel" | "dm";

export interface UseMessagesOptions {
  targetType?: MessageTargetType;
}

export interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loadingMore: boolean;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Failed to load messages.");
}

function mapMessages(snapshotDocs: QueryDocumentSnapshot<DocumentData>[]): Message[] {
  const seenMessageIds = new Set<string>();

  return snapshotDocs
    .map((documentSnapshot) => {
      const messageId = documentSnapshot.id;

      if (seenMessageIds.has(messageId)) {
        return null;
      }

      seenMessageIds.add(messageId);

      return {
        messageId,
        ...documentSnapshot.data(),
      } as Message;
    })
    .filter((message): message is Message => message !== null);
}

function getMessagesCollectionPath(
  workspaceId: string,
  targetId: string,
  targetType: MessageTargetType,
): string {
  const parentCollection = targetType === "dm" ? "directMessages" : "channels";

  return `workspaces/${workspaceId}/${parentCollection}/${targetId}/messages`;
}

export function useMessages(
  targetId: string,
  options: UseMessagesOptions = {},
): UseMessagesResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasLoadedMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const normalizedTargetType: MessageTargetType =
    options.targetType === "dm" ? "dm" : "channel";
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const normalizedTargetId = targetId.trim();

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (
      workspaceId.length === 0 ||
      normalizedTargetId.length === 0 ||
      !hasMore ||
      loadingMoreRef.current ||
      !lastVisible
    ) {
      return;
    }

    hasLoadedMoreRef.current = true;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const messagesRef = collection(
        firestore,
        getMessagesCollectionPath(
          workspaceId,
          normalizedTargetId,
          normalizedTargetType,
        ),
      );
      const messagesQuery = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(PAGE_SIZE),
      );
      const snapshot = await getDocs(messagesQuery);
      const olderMessages = mapMessages(snapshot.docs).reverse();

      setMessages((previousMessages) => {
        const existingIds = new Set(previousMessages.map((message) => message.messageId));
        const uniqueOlderMessages = olderMessages.filter((message) => !existingIds.has(message.messageId));

        return [...uniqueOlderMessages, ...previousMessages];
      });

      if (snapshot.empty || snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
        setLastVisible(null);
      } else {
        setHasMore(true);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (loadMoreError) {
      setError(toError(loadMoreError));
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [
    hasMore,
    lastVisible,
    normalizedTargetId,
    normalizedTargetType,
    workspaceId,
  ]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]);
    setLastVisible(null);
    setHasMore(true);
    setLoadingMore(false);
    hasLoadedMoreRef.current = false;
    loadingMoreRef.current = false;

    if (workspaceId.length === 0 || normalizedTargetId.length === 0) {
      setLoading(false);
      setHasMore(false);
      return;
    }

    const messagesCollectionPath = getMessagesCollectionPath(workspaceId, normalizedTargetId, normalizedTargetType);

    const messagesRef = collection(firestore, messagesCollectionPath);
    const messagesQuery = query(
      messagesRef,
      orderBy("timestamp", "desc"),
      limit(50),
    );

    const unsubscribeFirestore = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newestMessages = mapMessages(snapshot.docs).reverse();
        const newestMessageIds = new Set(newestMessages.map((message) => message.messageId));

        setMessages((previousMessages) => {
          const olderMessages = previousMessages.filter(
            (message) => !newestMessageIds.has(message.messageId),
          );

          return [...olderMessages, ...newestMessages];
        });

        if (!hasLoadedMoreRef.current) {
          if (snapshot.docs.length < PAGE_SIZE) {
            setHasMore(false);
            setLastVisible(null);
          } else {
            setHasMore(true);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          }
        }

        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeFirestore();
    };
  }, [normalizedTargetId, normalizedTargetType, workspaceId]);

  return { messages, loading, error, loadMore, hasMore, loadingMore };
}
