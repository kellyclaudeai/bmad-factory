"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  off,
  onChildAdded,
  onValue,
  push,
  ref,
  set,
  type DataSnapshot,
} from "firebase/database";
import { Timestamp } from "firebase/firestore";

import { rtdb } from "@/lib/firebase/client";
import { createRTDBMessage, type Message, type RTDBMessage } from "@/lib/types/models";

export interface MessageSender {
  userId: string;
  userName: string;
}

export interface UseRealtimeMessagesResult {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseRTDBMessage(value: unknown): RTDBMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const payload = value as Partial<Record<keyof RTDBMessage, unknown>>;

  if (
    !isNonEmptyString(payload.userId) ||
    !isNonEmptyString(payload.userName) ||
    !isNonEmptyString(payload.text) ||
    !isFiniteNumber(payload.timestamp) ||
    !isFiniteNumber(payload.ttl)
  ) {
    return null;
  }

  return {
    userId: payload.userId.trim(),
    userName: payload.userName.trim(),
    text: payload.text,
    timestamp: payload.timestamp,
    ttl: payload.ttl,
  };
}

function logDeliveryLatency(messageId: string, sentAtMs: number): void {
  const latencyMs = Date.now() - sentAtMs;

  if (latencyMs < 500) {
    console.log(
      `[useRealtimeMessages] Message ${messageId} delivery latency: ${latencyMs}ms (target <500ms)`,
    );
    return;
  }

  console.warn(
    `[useRealtimeMessages] Message ${messageId} delivery latency: ${latencyMs}ms (target <500ms)`,
  );
}

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export function useRealtimeMessages(
  workspaceId: string | null | undefined,
  channelId: string | null | undefined,
  sender: MessageSender | null | undefined,
): UseRealtimeMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingServerIdsByTempIdRef = useRef<Map<string, string>>(new Map());
  const tempIdsByServerIdRef = useRef<Map<string, string>>(new Map());
  const messagesRef = useRef<Message[]>([]);
  const isConnectedRef = useRef(false);
  const normalizedWorkspaceId = workspaceId?.trim() ?? "";
  const normalizedChannelId = channelId?.trim() ?? "";
  const normalizedUserId = sender?.userId?.trim() ?? "";
  const normalizedUserName = sender?.userName?.trim() ?? "";

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendWithOptimisticMessage = useCallback(
    async (optimisticMessage: Message): Promise<void> => {
      const messagePathRef = ref(rtdb, `messages/${normalizedWorkspaceId}/${normalizedChannelId}`);
      const nextMessageRef = push(messagePathRef);
      const serverMessageId = nextMessageRef.key;

      if (!serverMessageId) {
        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.messageId === optimisticMessage.messageId
              ? { ...message, status: "failed" }
              : message,
          ),
        );
        setError(new Error("Failed to generate a message ID."));
        return;
      }

      pendingServerIdsByTempIdRef.current.set(optimisticMessage.messageId, serverMessageId);
      tempIdsByServerIdRef.current.set(serverMessageId, optimisticMessage.messageId);

      try {
        const sentAtMs = Date.now();
        const payload = createRTDBMessage(
          {
            userId: optimisticMessage.userId,
            userName: optimisticMessage.userName,
            text: optimisticMessage.text,
          },
          { timestamp: sentAtMs },
        );

        await set(nextMessageRef, payload);

        pendingServerIdsByTempIdRef.current.delete(optimisticMessage.messageId);
        tempIdsByServerIdRef.current.delete(serverMessageId);
        seenMessageIdsRef.current.add(serverMessageId);
        setError(null);

        const serverTimestamp = Timestamp.fromMillis(sentAtMs);
        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.messageId === optimisticMessage.messageId
              ? {
                  ...message,
                  messageId: serverMessageId,
                  timestamp: serverTimestamp,
                  createdAt: serverTimestamp,
                  status: "sent",
                }
              : message,
          ),
        );
      } catch (sendError) {
        pendingServerIdsByTempIdRef.current.delete(optimisticMessage.messageId);
        tempIdsByServerIdRef.current.delete(serverMessageId);
        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.messageId === optimisticMessage.messageId
              ? { ...message, status: "failed" }
              : message,
          ),
        );
        setError(toError(sendError, "Failed to send message."));
      }
    },
    [normalizedChannelId, normalizedWorkspaceId],
  );

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        return;
      }

      if (
        normalizedWorkspaceId.length === 0 ||
        normalizedChannelId.length === 0 ||
        normalizedUserId.length === 0 ||
        normalizedUserName.length === 0
      ) {
        setError(new Error("Missing workspace, channel, or user details."));
        return;
      }

      const tempId = `temp_${Date.now()}`;
      const tempTimestamp = Timestamp.now();
      const optimisticMessage: Message = {
        messageId: tempId,
        channelId: normalizedChannelId,
        workspaceId: normalizedWorkspaceId,
        userId: normalizedUserId,
        userName: normalizedUserName,
        text: trimmedText,
        timestamp: tempTimestamp,
        createdAt: tempTimestamp,
        status: "sending",
      };

      setError(null);
      setMessages((previousMessages) => [...previousMessages, optimisticMessage]);
      await sendWithOptimisticMessage(optimisticMessage);
    },
    [
      normalizedChannelId,
      normalizedUserId,
      normalizedUserName,
      normalizedWorkspaceId,
      sendWithOptimisticMessage,
    ],
  );

  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const messageToRetry = messagesRef.current.find(
        (message) => message.messageId === messageId && message.status === "failed",
      );

      if (!messageToRetry) {
        return;
      }

      const retryTimestamp = Timestamp.now();
      const retryMessageRecord: Message = {
        ...messageToRetry,
        timestamp: retryTimestamp,
        createdAt: retryTimestamp,
        status: "sending",
      };

      setError(null);
      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.messageId === messageId ? retryMessageRecord : message,
        ),
      );
      await sendWithOptimisticMessage(retryMessageRecord);
    },
    [sendWithOptimisticMessage],
  );

  useEffect(() => {
    seenMessageIdsRef.current.clear();
    pendingServerIdsByTempIdRef.current.clear();
    tempIdsByServerIdRef.current.clear();
    isConnectedRef.current = false;
    setMessages([]);
    setError(null);

    if (normalizedWorkspaceId.length === 0 || normalizedChannelId.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const messagesRef = ref(rtdb, `messages/${normalizedWorkspaceId}/${normalizedChannelId}`);
    const connectedRef = ref(rtdb, ".info/connected");

    const handleConnectionState = (snapshot: DataSnapshot): void => {
      const connected = snapshot.val() === true;

      if (connected !== isConnectedRef.current) {
        isConnectedRef.current = connected;
        if (!connected) {
          console.warn("[useRealtimeMessages] Realtime Database disconnected.");
        }
      }

      if (connected) {
        setError(null);
      }

      setLoading(false);
    };

    const handleConnectionError = (connectionError: Error): void => {
      setError(connectionError);
      setLoading(false);
    };

    const handleNewMessage = (snapshot: DataSnapshot): void => {
      const messageId = snapshot.key;

      if (!messageId || seenMessageIdsRef.current.has(messageId)) {
        return;
      }

      const rtdbMessage = parseRTDBMessage(snapshot.val());

      if (!rtdbMessage) {
        console.warn(`[useRealtimeMessages] Ignored malformed RTDB message payload for ${messageId}.`);
        return;
      }

      const optimisticTempId = tempIdsByServerIdRef.current.get(messageId);

      if (optimisticTempId) {
        const confirmedTimestamp = Timestamp.fromMillis(rtdbMessage.timestamp);
        seenMessageIdsRef.current.add(messageId);
        pendingServerIdsByTempIdRef.current.delete(optimisticTempId);
        tempIdsByServerIdRef.current.delete(messageId);

        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.messageId === optimisticTempId
              ? {
                  ...message,
                  messageId,
                  timestamp: confirmedTimestamp,
                  createdAt: confirmedTimestamp,
                  status: "sent",
                }
              : message,
          ),
        );
        setLoading(false);
        logDeliveryLatency(messageId, rtdbMessage.timestamp);
        return;
      }

      seenMessageIdsRef.current.add(messageId);

      const messageTimestamp = Timestamp.fromMillis(rtdbMessage.timestamp);
      const realtimeMessage: Message = {
        messageId,
        channelId: normalizedChannelId,
        workspaceId: normalizedWorkspaceId,
        userId: rtdbMessage.userId,
        userName: rtdbMessage.userName,
        text: rtdbMessage.text,
        timestamp: messageTimestamp,
        createdAt: messageTimestamp,
        status: "sent",
      };

      setMessages((previousMessages) => [...previousMessages, realtimeMessage]);
      setLoading(false);
      logDeliveryLatency(messageId, rtdbMessage.timestamp);
    };

    const handleMessageError = (messageError: Error): void => {
      setError(messageError);
      setLoading(false);
    };

    onValue(connectedRef, handleConnectionState, handleConnectionError);
    onChildAdded(messagesRef, handleNewMessage, handleMessageError);

    return () => {
      off(messagesRef, "child_added", handleNewMessage);
      off(connectedRef, "value", handleConnectionState);
    };
  }, [normalizedChannelId, normalizedWorkspaceId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
  };
}
