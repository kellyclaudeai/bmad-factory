"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { firestore } from "@/lib/firebase/client";

function toNonEmptyString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export interface UseWorkspaceOwnerIdResult {
  ownerId: string;
  loading: boolean;
  error: Error | null;
}

export function useWorkspaceOwnerId(workspaceId: string): UseWorkspaceOwnerIdResult {
  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const normalizedWorkspaceId = workspaceId.trim();

    if (normalizedWorkspaceId.length === 0) {
      setOwnerId("");
      setLoading(false);
      setError(null);
      return;
    }

    setOwnerId("");
    setLoading(true);
    setError(null);

    const workspaceRef = doc(firestore, "workspaces", normalizedWorkspaceId);
    const unsubscribe = onSnapshot(
      workspaceRef,
      (workspaceSnapshot) => {
        const data = workspaceSnapshot.data();
        setOwnerId(toNonEmptyString(data?.ownerId));
        setLoading(false);
      },
      (snapshotError) => {
        setOwnerId("");
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [workspaceId]);

  return { ownerId, loading, error };
}
