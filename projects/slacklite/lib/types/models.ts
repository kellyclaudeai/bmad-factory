import type { Auth } from "firebase/auth";
import type { Database } from "firebase/database";
import {
  Timestamp,
  type FieldValue,
  type Firestore,
  serverTimestamp as firestoreServerTimestamp,
} from "firebase/firestore";

const MAX_MESSAGE_LENGTH = 4000;
const DEFAULT_RTDB_TTL_MS = 60 * 60 * 1000;

/**
 * Firebase client instances used by app services.
 */
export interface FirebaseClientInstances {
  auth: Auth;
  firestore: Firestore;
  rtdb: Database;
}

/**
 * Canonical Firestore user document shape.
 * Path: /users/{userId}
 */
export interface User {
  userId: string;
  email: string;
  displayName: string;
  workspaceId: string | null;
  createdAt: Timestamp;
  lastSeenAt?: Timestamp | null;
  isOnline: boolean;
}

/**
 * Canonical Firestore workspace invite document shape.
 * Path: /workspaceInvites/{inviteId}
 */
export interface WorkspaceInvite {
  inviteId: string;
  workspaceId: string;
  token: string;
  createdBy: string;
  expiresAt: Timestamp;
  createdAt?: Timestamp;
  workspaceName?: string;
}

/**
 * Canonical Firestore channel document shape.
 * Path: /workspaces/{workspaceId}/channels/{channelId}
 */
export interface Channel {
  channelId: string;
  workspaceId: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  lastMessageAt?: Timestamp;
  messageCount?: number;
}

/**
 * Supported unread-count target types.
 */
export type UnreadTargetType = "channel" | "dm";

/**
 * Canonical Firestore unread-count document shape.
 * Path: /unreadCounts/{userId}_{targetId}
 */
export interface UnreadCount {
  id: string;
  userId: string;
  targetId: string;
  targetType: UnreadTargetType;
  count: number;
  lastReadAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Supported lifecycle states for message sending.
 */
export type MessageStatus = "sending" | "sent" | "failed";

/**
 * Canonical Firestore message document shape.
 * Path: /workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}
 */
export interface Message {
  messageId: string;
  channelId: string;
  workspaceId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Timestamp;
  createdAt: Timestamp;
  status?: MessageStatus;
  clientTimestamp?: number; // milliseconds since epoch, set by sender for sort tiebreaking
}

/**
 * Ephemeral RTDB payload used for low-latency message fanout.
 * Path: /messages/{workspaceId}/{channelId}/{messageId}
 */
export interface RTDBMessage {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  ttl: number;
}

/**
 * Input required to create a new message before generated fields are added.
 */
export interface MessageInput {
  channelId: string;
  workspaceId: string;
  userId: string;
  userName: string;
  text: string;
  status?: MessageStatus;
}

/**
 * Optional metadata to override generated message fields.
 */
export interface MessageMetadata {
  messageId?: string;
  timestamp?: Timestamp;
  createdAt?: Timestamp;
  status?: MessageStatus;
}

/**
 * Validation response for message inputs and message documents.
 */
export interface MessageValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Options for RTDB message creation.
 */
export interface RTDBMessageOptions {
  timestamp?: number;
  ttlMs?: number;
}

function generateMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Validates required fields and text constraints for messages.
 */
export function validateMessage(input: MessageInput | Message): MessageValidationResult {
  const errors: string[] = [];
  const text = input.text.trim();

  if (text.length === 0) {
    errors.push("Message text cannot be empty.");
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message text must be <= ${MAX_MESSAGE_LENGTH} characters.`);
  }

  if (input.channelId.trim().length === 0) {
    errors.push("channelId is required.");
  }

  if (input.workspaceId.trim().length === 0) {
    errors.push("workspaceId is required.");
  }

  if (input.userId.trim().length === 0) {
    errors.push("userId is required.");
  }

  if (input.userName.trim().length === 0) {
    errors.push("userName is required.");
  }

  if ("messageId" in input && input.messageId.trim().length === 0) {
    errors.push("messageId is required.");
  }

  if ("timestamp" in input && !(input.timestamp instanceof Timestamp)) {
    errors.push("timestamp must be a Firestore Timestamp.");
  }

  if ("createdAt" in input && !(input.createdAt instanceof Timestamp)) {
    errors.push("createdAt must be a Firestore Timestamp.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a strongly typed Message object with generated defaults.
 */
export function createMessage(input: MessageInput, metadata: MessageMetadata = {}): Message {
  const validation = validateMessage(input);

  if (!validation.valid) {
    throw new Error(`Invalid message input: ${validation.errors.join(" ")}`);
  }

  const now = Timestamp.now();
  const status = metadata.status ?? input.status;

  return {
    messageId: metadata.messageId ?? generateMessageId(),
    channelId: input.channelId.trim(),
    workspaceId: input.workspaceId.trim(),
    userId: input.userId.trim(),
    userName: input.userName.trim(),
    text: input.text.trim(),
    timestamp: metadata.timestamp ?? now,
    createdAt: metadata.createdAt ?? now,
    ...(status ? { status } : {}),
  };
}

/**
 * Creates the RTDB payload format from message-author fields.
 */
export function createRTDBMessage(
  input: Pick<MessageInput, "userId" | "userName" | "text">,
  options: RTDBMessageOptions = {},
): RTDBMessage {
  const text = input.text.trim();

  if (text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message text must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`);
  }

  if (input.userId.trim().length === 0) {
    throw new Error("userId is required.");
  }

  if (input.userName.trim().length === 0) {
    throw new Error("userName is required.");
  }

  const timestamp = options.timestamp ?? Date.now();
  const ttl = timestamp + (options.ttlMs ?? DEFAULT_RTDB_TTL_MS);

  return {
    userId: input.userId.trim(),
    userName: input.userName.trim(),
    text,
    timestamp,
    ttl,
  };
}

/**
 * Wrapper for Firestore server-side timestamp sentinel.
 */
export function serverTimestamp(): FieldValue {
  return firestoreServerTimestamp();
}

/**
 * Converts Firestore Timestamp (or epoch/date values) to a JavaScript Date.
 */
export function toDate(value: Timestamp | number | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  return value.toDate();
}
