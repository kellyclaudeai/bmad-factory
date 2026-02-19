"use client";

import { useCallback, useEffect, useState } from "react";

export interface UseRateLimitResult {
  canSendMessage: () => boolean;
  recordMessage: () => void;
}

export function useRateLimit(maxMessages = 10, windowMs = 10000): UseRateLimitResult {
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);

  const getRecentMessages = useCallback(
    (timestamps: number[], now = Date.now()): number[] =>
      timestamps.filter((timestamp) => now - timestamp < windowMs),
    [windowMs],
  );

  const canSendMessage = useCallback((): boolean => {
    const now = Date.now();
    const recentMessages = getRecentMessages(messageTimestamps, now);

    return recentMessages.length < maxMessages;
  }, [getRecentMessages, maxMessages, messageTimestamps]);

  const recordMessage = useCallback((): void => {
    const now = Date.now();

    setMessageTimestamps((previousTimestamps) => [
      ...getRecentMessages(previousTimestamps, now),
      now,
    ]);
  }, [getRecentMessages]);

  useEffect(() => {
    if (messageTimestamps.length === 0) {
      return;
    }

    const now = Date.now();
    const recentMessages = getRecentMessages(messageTimestamps, now);

    if (recentMessages.length !== messageTimestamps.length) {
      setMessageTimestamps(recentMessages);
      return;
    }

    const oldestMessageTimestamp = recentMessages[0];
    const cleanupDelay = Math.max(windowMs - (now - oldestMessageTimestamp), 0);
    const timeoutId = window.setTimeout(() => {
      setMessageTimestamps((previousTimestamps) => getRecentMessages(previousTimestamps));
    }, cleanupDelay + 1);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [getRecentMessages, messageTimestamps, windowMs]);

  return { canSendMessage, recordMessage };
}

export default useRateLimit;
