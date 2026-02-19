"use client";

import { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import type { MemberListMember } from "@/components/features/sidebar/MemberList";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";

export interface UseWorkspaceMembersResult {
  members: MemberListMember[];
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

function parseDisplayName(data: DocumentData): string | null {
  const displayName = toNonEmptyString(data.displayName);

  if (displayName) {
    return displayName;
  }

  const email = toNonEmptyString(data.email);

  if (!email) {
    return null;
  }

  const emailPrefix = email.split("@")[0];
  return toNonEmptyString(emailPrefix);
}

function parseLastSeenAt(value: unknown): MemberListMember["lastSeenAt"] {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    value instanceof Timestamp ||
    value instanceof Date ||
    typeof value === "number"
  ) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value as { toDate: () => Date };
  }

  return undefined;
}

function parseMember(userIdFallback: string, data: DocumentData): MemberListMember | null {
  const userId = toNonEmptyString(data.userId) ?? toNonEmptyString(userIdFallback);
  const displayName = parseDisplayName(data);

  if (!userId || !displayName) {
    return null;
  }

  return {
    userId,
    displayName,
    isOnline: data.isOnline === true,
    lastSeenAt: parseLastSeenAt(data.lastSeenAt),
  };
}

function sortMembers(firstMember: MemberListMember, secondMember: MemberListMember): number {
  if (firstMember.isOnline !== secondMember.isOnline) {
    return firstMember.isOnline ? -1 : 1;
  }

  return firstMember.displayName.localeCompare(secondMember.displayName, undefined, {
    sensitivity: "base",
  });
}

export function useWorkspaceMembers(): UseWorkspaceMembersResult {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberListMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userId = user?.uid ?? null;
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";

  useEffect(() => {
    if (!userId || workspaceId.length === 0) {
      setMembers([]);
      setError(null);
      setLoading(false);
      return;
    }

    setMembers([]);
    setLoading(true);
    setError(null);

    const membersQuery = query(
      collection(firestore, "users"),
      where("workspaceId", "==", workspaceId),
    );

    const unsubscribe = onSnapshot(
      membersQuery,
      (snapshot) => {
        const nextMembers = snapshot.docs
          .map((documentSnapshot) =>
            parseMember(documentSnapshot.id, documentSnapshot.data()),
          )
          .filter((member): member is MemberListMember => member !== null)
          .sort(sortMembers);

        setMembers(nextMembers);
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

  return { members, loading, error };
}

