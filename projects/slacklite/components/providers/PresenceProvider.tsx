"use client";

import { usePresence } from "@/lib/hooks/usePresence";

export function PresenceProvider() {
  usePresence();

  return null;
}
