"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { useChannels } from "@/lib/hooks/useChannels";
import {
  ensureWorkspaceHasDefaultChannel,
  getWorkspaceLandingChannelId,
} from "@/lib/utils/workspace";

function getChannelSetupErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to set up your default channel. Please refresh and try again.";
}

export default function AppHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { channels, loading, error } = useChannels();
  const [setupError, setSetupError] = useState("");
  const hasAttemptedBootstrapRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const userId = typeof user?.uid === "string" ? user.uid.trim() : "";

  useEffect(() => {
    hasAttemptedBootstrapRef.current = false;
    hasRedirectedRef.current = false;
    setSetupError("");
  }, [workspaceId, userId]);

  useEffect(() => {
    if (
      loading ||
      !!error ||
      workspaceId.length === 0 ||
      userId.length === 0 ||
      hasRedirectedRef.current
    ) {
      return;
    }

    const landingChannelId = getWorkspaceLandingChannelId(channels);

    if (landingChannelId) {
      hasRedirectedRef.current = true;
      router.replace(`/app/channels/${landingChannelId}`);
      return;
    }

    if (hasAttemptedBootstrapRef.current) {
      return;
    }

    hasAttemptedBootstrapRef.current = true;

    void ensureWorkspaceHasDefaultChannel({
      firestore,
      workspaceId,
      userId,
    })
      .then((createdChannelId) => {
        if (!createdChannelId || hasRedirectedRef.current) {
          return;
        }

        hasRedirectedRef.current = true;
        router.replace(`/app/channels/${createdChannelId}`);
      })
      .catch((creationError) => {
        hasAttemptedBootstrapRef.current = false;
        setSetupError(getChannelSetupErrorMessage(creationError));
      });
  }, [channels, error, loading, router, userId, workspaceId]);

  if (error || setupError) {
    return (
      <section className="rounded-lg border border-error/40 bg-error/10 p-6">
        <h1 className="text-xl font-semibold text-error">Unable to load channels</h1>
        <p className="mt-2 text-sm text-error">
          {setupError || "Failed to load your channels. Please refresh and try again."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Loading your channels...</h1>
      <p className="mt-2 text-sm text-gray-700">
        Setting up your workspace and redirecting you to #general.
      </p>
    </section>
  );
}
