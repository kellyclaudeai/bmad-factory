"use client";

import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import type { Channel } from "@/lib/types/models";

export interface UseChannelsResult {
  channels: Channel[];
  loading: boolean;
  error: Error | null;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function parseOptionalTimestamp(value: unknown): Timestamp | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Timestamp ? value : undefined;
}

function parseOptionalMessageCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function parseChannel(
  channelId: string,
  data: DocumentData,
  fallbackWorkspaceId: string,
): Channel | null {
  const name = toNonEmptyString(data.name);
  const createdBy = toNonEmptyString(data.createdBy);
  const createdAt =
    data.createdAt instanceof Timestamp ? data.createdAt : undefined;

  if (!name || !createdBy || !createdAt) {
    return null;
  }

  const workspaceId =
    toNonEmptyString(data.workspaceId) ?? fallbackWorkspaceId;

  return {
    channelId,
    workspaceId,
    name,
    createdBy,
    createdAt,
    lastMessageAt: parseOptionalTimestamp(data.lastMessageAt),
    messageCount: parseOptionalMessageCount(data.messageCount),
  };
}

export function useChannels(): UseChannelsResult {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userId = user?.uid ?? null;
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";

  useEffect(() => {
    if (!userId || workspaceId.length === 0) {
      setChannels([]);
      setError(null);
      setLoading(false);
      return;
    }

    setChannels([]);
    setLoading(true);
    setError(null);

    const channelQuery = query(
      collection(firestore, `workspaces/${workspaceId}/channels`),
      orderBy("name", "asc"),
    );

    const unsubscribe = onSnapshot(
      channelQuery,
      (snapshot) => {
        const nextChannels = snapshot.docs
          .map((documentSnapshot) =>
            parseChannel(
              documentSnapshot.id,
              documentSnapshot.data(),
              workspaceId,
            ),
          )
          .filter((channel): channel is Channel => channel !== null);

        setChannels(nextChannels);
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
  }, [userId, workspaceId]);

  return { channels, loading, error };
}
