"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import {
  off,
  onChildAdded,
  onValue,
  push,
  ref,
  set,
  type DataSnapshot,
} from "firebase/database";
import { Timestamp, doc, serverTimestamp as firestoreServerTimestamp, setDoc } from "firebase/firestore";

import { firestore, rtdb } from "@/lib/firebase/client";
import { trackMessageLatency } from "@/lib/monitoring/performance";
import { createRTDBMessage, type Message, type RTDBMessage } from "@/lib/types/models";
import { sanitizeMessageText, validateMessageText } from "@/lib/utils/validation";

export interface MessageSender {
  userId: string;
  userName: string;
}

export type RealtimeMessageTargetType = "channel" | "dm";

export interface UseRealtimeMessagesOptions {
  targetType?: RealtimeMessageTargetType;
  rtdbThreadId?: string | null | undefined;
  firestoreThreadId?: string | null | undefined;
}

interface QueuedFirestoreWrite {
  messageId: string;
  channelId: string;
  targetType: RealtimeMessageTargetType;
  workspaceId: string;
  userId: string;
  userName: string;
  text: string;
}

export interface FirestoreWarningBanner {
  message: string;
  messageId: string;
  pendingCount: number;
}

export interface UseRealtimeMessagesResult {
  messages: Message[];
  loading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<string>;
  retryMessage: (messageId: string) => Promise<void>;
  sendErrorBanner: string | null;
  retryLastSend: () => Promise<void>;
  firestoreWarningBanner: FirestoreWarningBanner | null;
  retryFirestoreWrite: (messageId: string) => Promise<void>;
}

const RTDB_SEND_ERROR_BANNER = "Message failed to send. Retry?";
const FIRESTORE_PERSISTENCE_WARNING_BANNER =
  "Message sent but not saved. It will disappear in 1 hour.";
const MESSAGE_TOO_LONG_ERROR = "Message too long. Maximum 4,000 characters.";
const MAX_MESSAGE_LENGTH = 4000;
const RTDB_MESSAGE_TTL_MS = 60 * 60 * 1000;
const FIRESTORE_RETRY_INTERVAL_MS = 15_000;

function toQueuedFirestoreWrite(
  message: Message,
  targetType: RealtimeMessageTargetType,
): QueuedFirestoreWrite {
  return {
    messageId: message.messageId,
    channelId: message.channelId,
    targetType,
    workspaceId: message.workspaceId,
    userId: message.userId,
    userName: message.userName,
    text: message.text,
  };
}

function getFirestoreMessagesCollectionPath(
  workspaceId: string,
  channelId: string,
  targetType: RealtimeMessageTargetType,
): string {
  const parentCollection = targetType === "dm" ? "directMessages" : "channels";

  return `workspaces/${workspaceId}/${parentCollection}/${channelId}/messages`;
}

function upsertQueuedWrite(
  queue: QueuedFirestoreWrite[],
  queuedWrite: QueuedFirestoreWrite,
): QueuedFirestoreWrite[] {
  const withoutExisting = queue.filter((entry) => entry.messageId !== queuedWrite.messageId);

  return [...withoutExisting, queuedWrite];
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
  const latencyMs = trackMessageLatency(sentAtMs, Date.now());

  if (latencyMs > 60_000) {
    return;
  }

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
  options: UseRealtimeMessagesOptions = {},
): UseRealtimeMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingServerIdsByTempIdRef = useRef<Map<string, string>>(new Map());
  const tempIdsByServerIdRef = useRef<Map<string, string>>(new Map());
  const messagesRef = useRef<Message[]>([]);
  const firestoreRetryQueueRef = useRef<QueuedFirestoreWrite[]>([]);
  const backgroundRetryInFlightRef = useRef(false);
  const isConnectedRef = useRef(false);
  const [sendErrorBanner, setSendErrorBanner] = useState<string | null>(null);
  const [lastFailedSendText, setLastFailedSendText] = useState<string | null>(null);
  const [firestoreRetryQueue, setFirestoreRetryQueue] = useState<QueuedFirestoreWrite[]>([]);
  const normalizedTargetType: RealtimeMessageTargetType =
    options.targetType === "dm" ? "dm" : "channel";
  const normalizedWorkspaceId = workspaceId?.trim() ?? "";
  const normalizedFirestoreChannelId =
    options.firestoreThreadId?.trim() ?? channelId?.trim() ?? "";
  const normalizedRTDBChannelId =
    options.rtdbThreadId?.trim() ?? channelId?.trim() ?? "";
  const normalizedUserId = sender?.userId?.trim() ?? "";
  const normalizedUserName = sender?.userName?.trim() ?? "";

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    firestoreRetryQueueRef.current = firestoreRetryQueue;
  }, [firestoreRetryQueue]);

  const rollbackOptimisticMessage = useCallback((optimisticMessageId: string): void => {
    setMessages((previousMessages) =>
      previousMessages.filter((message) => message.messageId !== optimisticMessageId),
    );
  }, []);

  const persistMessageToFirestore = useCallback(
    async (
      queuedWrite: QueuedFirestoreWrite,
      options: { captureException: boolean } = { captureException: true },
    ): Promise<void> => {
      const firestoreCollectionPath = getFirestoreMessagesCollectionPath(
        queuedWrite.workspaceId,
        queuedWrite.channelId,
        queuedWrite.targetType,
      );
      const firestoreDocPath = `${firestoreCollectionPath}/${queuedWrite.messageId}`;
      const firestorePayload = {
        messageId: queuedWrite.messageId,
        channelId: queuedWrite.channelId,
        workspaceId: queuedWrite.workspaceId,
        userId: queuedWrite.userId,
        userName: queuedWrite.userName,
        text: queuedWrite.text,
        timestamp: firestoreServerTimestamp(),
        createdAt: firestoreServerTimestamp(),
      };

      // DIAGNOSTIC: log full Firestore write context so we can confirm path and workspaceId are correct
      console.log('[DIAG][Firestore write] path:', firestoreDocPath, 'workspaceId:', queuedWrite.workspaceId, 'channelId:', queuedWrite.channelId, 'targetType:', queuedWrite.targetType, 'userId:', queuedWrite.userId, 'payload keys:', Object.keys(firestorePayload));

      try {
        const messageDocRef = doc(firestore, firestoreDocPath);

        await setDoc(messageDocRef, firestorePayload);
        console.log('[DIAG][Firestore write] SUCCESS — messageId:', queuedWrite.messageId);

        setFirestoreRetryQueue((previousQueue) =>
          previousQueue.filter((entry) => entry.messageId !== queuedWrite.messageId),
        );
      } catch (firestoreError) {
        console.error('[DIAG][Firestore write] FAILED — messageId:', queuedWrite.messageId, 'path:', firestoreDocPath, 'error:', firestoreError);
        if (options.captureException) {
          Sentry.captureException(firestoreError, {
            tags: {
              feature: "dual-write-messages",
              provider: "firestore",
            },
            extra: {
              channelId: queuedWrite.channelId,
              targetType: queuedWrite.targetType,
              workspaceId: queuedWrite.workspaceId,
              messageId: queuedWrite.messageId,
            },
          });
        }

        setFirestoreRetryQueue((previousQueue) => upsertQueuedWrite(previousQueue, queuedWrite));
        throw toError(firestoreError, "Failed to persist message to Firestore.");
      }
    },
    [],
  );

  const retryQueuedFirestoreWrites = useCallback(async (): Promise<void> => {
    if (backgroundRetryInFlightRef.current) {
      return;
    }

    const queueSnapshot = firestoreRetryQueueRef.current;

    if (queueSnapshot.length === 0) {
      return;
    }

    backgroundRetryInFlightRef.current = true;

    try {
      for (const queuedWrite of queueSnapshot) {
        try {
          await persistMessageToFirestore(queuedWrite, { captureException: false });
        } catch {
          // Keep failed writes in queue for future retries.
        }
      }
    } finally {
      backgroundRetryInFlightRef.current = false;
    }
  }, [persistMessageToFirestore]);

  useEffect(() => {
    if (firestoreRetryQueue.length === 0) {
      return;
    }

    const retryIntervalId = window.setInterval(() => {
      void retryQueuedFirestoreWrites();
    }, FIRESTORE_RETRY_INTERVAL_MS);

    return () => {
      window.clearInterval(retryIntervalId);
    };
  }, [firestoreRetryQueue.length, retryQueuedFirestoreWrites]);

  const sendWithOptimisticMessage = useCallback(
    async (optimisticMessage: Message): Promise<string> => {
      const messagePathRef = ref(rtdb, `messages/${normalizedWorkspaceId}/${normalizedRTDBChannelId}`);
      const nextMessageRef = push(messagePathRef);
      const serverMessageId = nextMessageRef.key;

      if (!serverMessageId) {
        rollbackOptimisticMessage(optimisticMessage.messageId);
        setSendErrorBanner(RTDB_SEND_ERROR_BANNER);
        setLastFailedSendText(optimisticMessage.text);
        throw new Error("Failed to generate a message ID.");
      }

      pendingServerIdsByTempIdRef.current.set(optimisticMessage.messageId, serverMessageId);
      tempIdsByServerIdRef.current.set(serverMessageId, optimisticMessage.messageId);

      const sentAtMs = Date.now();
      const payload = createRTDBMessage(
        {
          userId: optimisticMessage.userId,
          userName: optimisticMessage.userName,
          text: optimisticMessage.text,
        },
        {
          timestamp: sentAtMs,
          ttlMs: RTDB_MESSAGE_TTL_MS,
        },
      );

      // BUG ROOT CAUSE: database.rules.json validates writes at messages/$workspaceId/$channelId with
      //   root.child('users').child(auth.uid).child('workspaceId').val() == $workspaceId
      // but the app NEVER writes user data to the RTDB /users/ path — user data lives only in Firestore.
      // Therefore root.child('users').child(auth.uid).child('workspaceId').val() always returns null,
      // making null == $workspaceId always false, and EVERY RTDB message write is PERMISSION_DENIED.
      // Fix: write workspaceId to RTDB users/{uid} at workspace join/create (story 12.2).

      // DIAGNOSTIC: log full RTDB write context so we can confirm workspaceId/channelId are populated
      console.log('[DIAG][RTDB write] path:', `messages/${normalizedWorkspaceId}/${normalizedRTDBChannelId}/${serverMessageId}`, 'workspaceId:', normalizedWorkspaceId, 'channelId:', normalizedRTDBChannelId, 'userId:', optimisticMessage.userId, 'payload:', payload);

      try {
        await set(nextMessageRef, payload);
        console.log('[DIAG][RTDB write] SUCCESS — messageId:', serverMessageId);
      } catch (rtdbWriteError) {
        console.error('[DIAG][RTDB write] FAILED — messageId:', serverMessageId, 'error:', rtdbWriteError);
        pendingServerIdsByTempIdRef.current.delete(optimisticMessage.messageId);
        tempIdsByServerIdRef.current.delete(serverMessageId);
        rollbackOptimisticMessage(optimisticMessage.messageId);
        setSendErrorBanner(RTDB_SEND_ERROR_BANNER);
        setLastFailedSendText(optimisticMessage.text);
        throw toError(rtdbWriteError, RTDB_SEND_ERROR_BANNER);
      }

      pendingServerIdsByTempIdRef.current.delete(optimisticMessage.messageId);
      tempIdsByServerIdRef.current.delete(serverMessageId);
      seenMessageIdsRef.current.add(serverMessageId);

      const confirmedTimestamp = Timestamp.fromMillis(sentAtMs);
      const confirmedMessage: Message = {
        ...optimisticMessage,
        messageId: serverMessageId,
        timestamp: confirmedTimestamp,
        createdAt: confirmedTimestamp,
        status: "sent",
      };

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.messageId === optimisticMessage.messageId ? confirmedMessage : message,
        ),
      );
      logDeliveryLatency(serverMessageId, sentAtMs);

      try {
        await persistMessageToFirestore(
          toQueuedFirestoreWrite(confirmedMessage, normalizedTargetType),
        );
      } catch {
        // RTDB delivery has already succeeded. Firestore failures are queued and surfaced as warnings.
      }

      return serverMessageId;
    },
    [
      normalizedRTDBChannelId,
      normalizedTargetType,
      normalizedWorkspaceId,
      persistMessageToFirestore,
      rollbackOptimisticMessage,
    ],
  );

  const sendMessage = useCallback(
    async (text: string): Promise<string> => {
      const validationResult = validateMessageText(text, MAX_MESSAGE_LENGTH);

      if (!validationResult.valid) {
        if (validationResult.error === `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`) {
          throw new Error(MESSAGE_TOO_LONG_ERROR);
        }

        return "";
      }

      const sanitizedText = sanitizeMessageText(text);

      if (sanitizedText.length > MAX_MESSAGE_LENGTH) {
        throw new Error(MESSAGE_TOO_LONG_ERROR);
      }

      if (sanitizedText.length === 0) {
        return "";
      }

      if (
        normalizedWorkspaceId.length === 0 ||
        normalizedFirestoreChannelId.length === 0 ||
        normalizedRTDBChannelId.length === 0 ||
        normalizedUserId.length === 0 ||
        normalizedUserName.length === 0
      ) {
        throw new Error("Missing workspace, channel, or user details.");
      }

      const tempId = `temp_${Date.now()}`;
      const tempTimestamp = Timestamp.now();
      const optimisticMessage: Message = {
        messageId: tempId,
        channelId: normalizedFirestoreChannelId,
        workspaceId: normalizedWorkspaceId,
        userId: normalizedUserId,
        userName: normalizedUserName,
        text: sanitizedText,
        timestamp: tempTimestamp,
        createdAt: tempTimestamp,
        status: "sending",
      };

      setSendErrorBanner(null);
      setLastFailedSendText(null);
      setMessages((previousMessages) => [...previousMessages, optimisticMessage]);
      return sendWithOptimisticMessage(optimisticMessage);
    },
    [
      normalizedFirestoreChannelId,
      normalizedRTDBChannelId,
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

      setSendErrorBanner(null);
      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message.messageId === messageId ? retryMessageRecord : message,
        ),
      );
      await sendWithOptimisticMessage(retryMessageRecord);
    },
    [sendWithOptimisticMessage],
  );

  const retryLastSend = useCallback(async (): Promise<void> => {
    if (!lastFailedSendText) {
      return;
    }

    await sendMessage(lastFailedSendText);
  }, [lastFailedSendText, sendMessage]);

  const retryFirestoreWrite = useCallback(
    async (messageId: string): Promise<void> => {
      const queuedWrite = firestoreRetryQueueRef.current.find((entry) => entry.messageId === messageId);

      if (!queuedWrite) {
        return;
      }

      try {
        await persistMessageToFirestore(queuedWrite);
      } catch {
        // Preserve warning state while write remains queued.
      }
    },
    [persistMessageToFirestore],
  );

  useEffect(() => {
    seenMessageIdsRef.current.clear();
    pendingServerIdsByTempIdRef.current.clear();
    tempIdsByServerIdRef.current.clear();
    isConnectedRef.current = false;
    setMessages([]);
    setError(null);
    setSendErrorBanner(null);
    setLastFailedSendText(null);

    if (
      normalizedWorkspaceId.length === 0 ||
      normalizedFirestoreChannelId.length === 0 ||
      normalizedRTDBChannelId.length === 0
    ) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const messagesRef = ref(rtdb, `messages/${normalizedWorkspaceId}/${normalizedRTDBChannelId}`);
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
        channelId: normalizedFirestoreChannelId,
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
  }, [normalizedFirestoreChannelId, normalizedRTDBChannelId, normalizedWorkspaceId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    retryMessage,
    sendErrorBanner,
    retryLastSend,
    firestoreWarningBanner:
      firestoreRetryQueue.length > 0
        ? {
            message: FIRESTORE_PERSISTENCE_WARNING_BANNER,
            messageId: firestoreRetryQueue[0].messageId,
            pendingCount: firestoreRetryQueue.length,
          }
        : null,
    retryFirestoreWrite,
  };
}
