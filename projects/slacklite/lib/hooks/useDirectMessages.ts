"use client";

import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";

export interface DirectMessageListItem {
  dmId: string;
  workspaceId: string;
  userIds: string[];
  createdAt?: Timestamp;
  lastMessageAt?: Timestamp | null;
  otherUserId: string;
  otherUserName: string;
}

export interface UseDirectMessagesResult {
  dms: DirectMessageListItem[];
  loading: boolean;
  error: Error | null;
}

interface ParsedDirectMessage {
  dmId: string;
  workspaceId: string;
  userIds: string[];
  createdAt?: Timestamp;
  lastMessageAt?: Timestamp | null;
  otherUserId: string;
}

function toError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
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

  const uniqueUserIds = new Set<string>();

  value.forEach((entry) => {
    const userId = toNonEmptyString(entry);

    if (userId) {
      uniqueUserIds.add(userId);
    }
  });

  return [...uniqueUserIds];
}

function parseOptionalTimestamp(value: unknown): Timestamp | undefined {
  return value instanceof Timestamp ? value : undefined;
}

function parseOptionalNullableTimestamp(value: unknown): Timestamp | null | undefined {
  if (value === null) {
    return null;
  }

  return parseOptionalTimestamp(value);
}

function parseDisplayName(data: DocumentData): string | null {
  const displayName = toNonEmptyString(data.displayName);

  if (displayName) {
    return displayName;
  }

  const email = toNonEmptyString(data.email);

  if (!email) {
    return null;
  }

  return toNonEmptyString(email.split("@")[0]);
}

async function resolveOtherUserNames(otherUserIds: string[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    otherUserIds.map(async (otherUserId) => {
      try {
        const otherUserSnapshot = await getDoc(doc(firestore, "users", otherUserId));
        const otherUserData = otherUserSnapshot.data();
        const otherUserName = otherUserData ? parseDisplayName(otherUserData) : null;

        return [otherUserId, otherUserName ?? "Unknown user"] as const;
      } catch (error) {
        console.error("Failed to resolve DM participant display name.", error);
        return [otherUserId, "Unknown user"] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

function parseDirectMessage(
  dmId: string,
  data: DocumentData,
  fallbackWorkspaceId: string,
  currentUserId: string,
): ParsedDirectMessage | null {
  const userIds = parseUserIds(data.userIds);

  if (userIds.length === 0 || !userIds.includes(currentUserId)) {
    return null;
  }

  const otherUserId = userIds.find((userId) => userId !== currentUserId);

  if (!otherUserId) {
    return null;
  }

  const workspaceId =
    toNonEmptyString(data.workspaceId) ?? fallbackWorkspaceId;

  return {
    dmId,
    workspaceId,
    userIds,
    createdAt: parseOptionalTimestamp(data.createdAt),
    lastMessageAt: parseOptionalNullableTimestamp(data.lastMessageAt),
    otherUserId,
  };
}

function toLastMessageAtMillis(value: Timestamp | null | undefined): number {
  return value instanceof Timestamp ? value.toMillis() : 0;
}

function sortByLastMessageAtDesc(
  first: Pick<DirectMessageListItem, "lastMessageAt" | "otherUserName">,
  second: Pick<DirectMessageListItem, "lastMessageAt" | "otherUserName">,
): number {
  const firstLastMessageAt = toLastMessageAtMillis(first.lastMessageAt);
  const secondLastMessageAt = toLastMessageAtMillis(second.lastMessageAt);

  if (firstLastMessageAt !== secondLastMessageAt) {
    return secondLastMessageAt - firstLastMessageAt;
  }

  return first.otherUserName.localeCompare(second.otherUserName, undefined, {
    sensitivity: "base",
  });
}

export function useDirectMessages(): UseDirectMessagesResult {
  const { user } = useAuth();
  const [dms, setDms] = useState<DirectMessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userId = typeof user?.uid === "string" ? user.uid.trim() : "";
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";

  useEffect(() => {
    if (userId.length === 0 || workspaceId.length === 0) {
      setDms([]);
      setError(null);
      setLoading(false);
      return;
    }

    setDms([]);
    setError(null);
    setLoading(true);

    let isCurrent = true;
    let latestSnapshotToken = 0;
    const directMessagesQuery = query(
      collection(firestore, `workspaces/${workspaceId}/directMessages`),
      where("userIds", "array-contains", userId),
    );

    const unsubscribe = onSnapshot(
      directMessagesQuery,
      (snapshot) => {
        latestSnapshotToken += 1;
        const snapshotToken = latestSnapshotToken;

        void (async () => {
          try {
            const parsedDirectMessages = snapshot.docs
              .map((documentSnapshot) =>
                parseDirectMessage(
                  documentSnapshot.id,
                  documentSnapshot.data(),
                  workspaceId,
                  userId,
                ),
              )
              .filter(
                (directMessage): directMessage is ParsedDirectMessage =>
                  directMessage !== null,
              );
            const uniqueOtherUserIds = [
              ...new Set(
                parsedDirectMessages.map(
                  (directMessage) => directMessage.otherUserId,
                ),
              ),
            ];
            const otherUserNames = await resolveOtherUserNames(uniqueOtherUserIds);
            const nextDirectMessages = parsedDirectMessages
              .map((directMessage) => ({
                ...directMessage,
                otherUserName:
                  otherUserNames[directMessage.otherUserId] ?? "Unknown user",
              }))
              .sort(sortByLastMessageAtDesc);

            if (!isCurrent || snapshotToken !== latestSnapshotToken) {
              return;
            }

            setDms(nextDirectMessages);
            setError(null);
            setLoading(false);
          } catch (snapshotProcessingError) {
            if (!isCurrent || snapshotToken !== latestSnapshotToken) {
              return;
            }

            setError(
              toError(snapshotProcessingError, "Failed to load direct messages."),
            );
            setLoading(false);
          }
        })();
      },
      (snapshotError) => {
        if (!isCurrent) {
          return;
        }

        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [userId, workspaceId]);

  return { dms, loading, error };
}

