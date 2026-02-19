"use client";

import { useEffect, useMemo, useState } from "react";
import { onDisconnect, onValue, ref, serverTimestamp as rtdbServerTimestamp, set } from "firebase/database";
import { doc, serverTimestamp as firestoreServerTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore, rtdb } from "@/lib/firebase/client";
import type {
  PresenceConnectionState,
  PresenceData,
  PresenceMap,
  UsePresenceResult,
  UsePresenceUpdatesResult,
} from "@/lib/types/presence";

const DEFAULT_CONNECTION_STATE: PresenceConnectionState = {
  isConnected: false,
  isMonitoring: false,
  lastChangedAt: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

function normalizePresenceData(value: unknown): PresenceData {
  if (!value || typeof value !== "object") {
    return { online: false, lastSeen: null };
  }

  const candidate = value as { online?: unknown; lastSeen?: unknown };

  return {
    online: candidate.online === true,
    lastSeen: typeof candidate.lastSeen === "number" ? candidate.lastSeen : null,
  };
}

/**
 * Tracks the authenticated user's RTDB presence and mirrors online state to Firestore.
 */
export function usePresence(): UsePresenceResult {
  const { user } = useAuth();
  const [connectionState, setConnectionState] =
    useState<PresenceConnectionState>(DEFAULT_CONNECTION_STATE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.uid;

    if (!userId) {
      setConnectionState(DEFAULT_CONNECTION_STATE);
      setError(null);
      return;
    }

    const connectedRef = ref(rtdb, ".info/connected");
    const userPresenceRef = ref(rtdb, `presence/${userId}`);
    const userDocRef = doc(firestore, "users", userId);
    let isMounted = true;
    let disconnectHandler: ReturnType<typeof onDisconnect> | null = null;

    const syncFirestoreStatus = async (isOnline: boolean) => {
      try {
        await updateDoc(userDocRef, {
          isOnline,
          lastSeenAt: firestoreServerTimestamp(),
        });
      } catch (syncError) {
        if (isMounted) {
          setError(
            getErrorMessage(syncError, "Failed to sync user presence to Firestore."),
          );
        }
      }
    };

    const unsubscribe = onValue(
      connectedRef,
      (snapshot) => {
        const isConnected = snapshot.val() === true;
        const now = Date.now();

        if (!isMounted) {
          return;
        }

        setConnectionState({
          isConnected,
          isMonitoring: true,
          lastChangedAt: now,
        });

        if (!isConnected) {
          void syncFirestoreStatus(false);
          return;
        }

        void (async () => {
          try {
            if (disconnectHandler) {
              await disconnectHandler.cancel();
            }

            disconnectHandler = onDisconnect(userPresenceRef);
            await disconnectHandler.set({
              online: false,
              lastSeen: rtdbServerTimestamp(),
            });

            await set(userPresenceRef, {
              online: true,
              lastSeen: rtdbServerTimestamp(),
            });

            await syncFirestoreStatus(true);
            if (isMounted) {
              setError(null);
            }
          } catch (connectionError) {
            if (isMounted) {
              setError(
                getErrorMessage(connectionError, "Failed to update realtime presence status."),
              );
            }
          }
        })();
      },
      (subscriptionError) => {
        if (isMounted) {
          setConnectionState({
            isConnected: false,
            isMonitoring: false,
            lastChangedAt: Date.now(),
          });
          setError(
            getErrorMessage(subscriptionError, "Failed to subscribe to Firebase connection state."),
          );
        }
      },
    );

    return () => {
      isMounted = false;

      unsubscribe();

      if (disconnectHandler) {
        void disconnectHandler.cancel();
      }

      void set(userPresenceRef, {
        online: false,
        lastSeen: rtdbServerTimestamp(),
      }).catch(() => undefined);

      void syncFirestoreStatus(false);
    };
  }, [user?.uid]);

  return { connectionState, error };
}

/**
 * Subscribes to presence updates for other users.
 */
export function usePresenceUpdates(userIds?: string[]): UsePresenceUpdatesResult {
  const [presence, setPresence] = useState<PresenceMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionKey = useMemo(() => {
    return [...new Set((userIds ?? []).filter(Boolean))].sort().join("|");
  }, [userIds]);

  useEffect(() => {
    let isMounted = true;
    const presenceRef = ref(rtdb, "presence");
    const subscribedUserIds = subscriptionKey ? subscriptionKey.split("|") : [];
    const subscribedSet =
      subscribedUserIds.length > 0 ? new Set(subscribedUserIds) : null;
    setLoading(true);

    const unsubscribe = onValue(
      presenceRef,
      (snapshot) => {
        if (!isMounted) {
          return;
        }

        const rawPresence = (snapshot.val() ?? {}) as Record<string, unknown>;
        const nextPresence: PresenceMap = {};

        for (const [userId, rawValue] of Object.entries(rawPresence)) {
          if (subscribedSet && !subscribedSet.has(userId)) {
            continue;
          }

          nextPresence[userId] = normalizePresenceData(rawValue);
        }

        setPresence(nextPresence);
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        if (!isMounted) {
          return;
        }

        setLoading(false);
        setError(
          getErrorMessage(subscriptionError, "Failed to subscribe to user presence updates."),
        );
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscriptionKey]);

  return { presence, loading, error };
}

/**
 * Lightweight connection monitor for components that only need network status.
 */
export function useConnectionState(): PresenceConnectionState {
  const [connectionState, setConnectionState] =
    useState<PresenceConnectionState>(DEFAULT_CONNECTION_STATE);

  useEffect(() => {
    let isMounted = true;
    const connectedRef = ref(rtdb, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (!isMounted) {
        return;
      }

      setConnectionState({
        isConnected: snapshot.val() === true,
        isMonitoring: true,
        lastChangedAt: Date.now(),
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return connectionState;
}
