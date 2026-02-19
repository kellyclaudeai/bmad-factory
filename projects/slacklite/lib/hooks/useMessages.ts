"use client";

import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import type { Message } from "@/lib/types/models";

export interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: Error | null;
}

export function useMessages(channelId: string): UseMessagesResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setSeenMessageIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const normalizedChannelId = channelId.trim();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]);
    setSeenMessageIds(new Set());

    if (workspaceId.length === 0 || normalizedChannelId.length === 0) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(
      firestore,
      `workspaces/${workspaceId}/channels/${normalizedChannelId}/messages`,
    );
    const messagesQuery = query(
      messagesRef,
      orderBy("timestamp", "desc"),
      limit(50),
    );

    const unsubscribeFirestore = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const nextSeenMessageIds = new Set<string>();
        const firestoreMessages = snapshot.docs
          .map((documentSnapshot) => {
            const messageId = documentSnapshot.id;

            if (nextSeenMessageIds.has(messageId)) {
              return null;
            }

            nextSeenMessageIds.add(messageId);
            const data = documentSnapshot.data();

            return {
              messageId,
              ...data,
            } as Message;
          })
          .filter((message): message is Message => message !== null);

        const sortedMessages = firestoreMessages.reverse();

        setSeenMessageIds(nextSeenMessageIds);
        setMessages(sortedMessages);
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
  }, [normalizedChannelId, workspaceId]);

  return { messages, loading, error };
}
