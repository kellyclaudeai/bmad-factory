"use client";

import { useEffect, useRef, useState } from "react";
import { off, onChildAdded, onValue, ref, type DataSnapshot } from "firebase/database";
import { Timestamp } from "firebase/firestore";

import { rtdb } from "@/lib/firebase/client";
import type { Message, RTDBMessage } from "@/lib/types/models";

export interface UseRealtimeMessagesResult {
  messages: Message[];
  loading: boolean;
  error: Error | null;
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

export function useRealtimeMessages(
  workspaceId: string | null | undefined,
  channelId: string | null | undefined,
): UseRealtimeMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const normalizedWorkspaceId = workspaceId?.trim() ?? "";
    const normalizedChannelId = channelId?.trim() ?? "";

    seenMessageIdsRef.current.clear();
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
  }, [workspaceId, channelId]);

  return {
    messages,
    loading,
    error,
  };
}
