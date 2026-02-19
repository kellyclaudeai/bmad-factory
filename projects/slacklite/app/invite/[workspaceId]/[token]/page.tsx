"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import type { WorkspaceInvite } from "@/lib/types/models";
import {
  buildWorkspaceInvitePath,
  joinWorkspaceFromInvite,
  resolveWorkspaceInvite,
} from "@/lib/utils/workspaceInvites";

type InviteValidationState = "loading" | "valid" | "invalid" | "error";

function decodeRouteParam(value: string | string[] | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getInviteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to validate this invite right now. Please try again.";
}

function getJoinErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code);

    switch (code) {
      case "permission-denied":
        return "You do not have permission to join this workspace.";
      case "not-found":
        return "Your user profile could not be found. Please sign in again.";
      default:
        break;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to join this workspace right now. Please try again.";
}

export default function WorkspaceInvitePage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string; token: string }>();
  const { user, loading: isAuthLoading } = useAuth();
  const [invite, setInvite] = useState<WorkspaceInvite | null>(null);
  const [validationState, setValidationState] =
    useState<InviteValidationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const workspaceId = decodeRouteParam(params.workspaceId);
  const token = decodeRouteParam(params.token);
  const invitePath = useMemo(() => {
    if (workspaceId.trim().length === 0 || token.trim().length === 0) {
      return null;
    }

    return buildWorkspaceInvitePath(workspaceId, token);
  }, [token, workspaceId]);
  const signUpHref = invitePath
    ? `/signup?next=${encodeURIComponent(invitePath)}`
    : "/signup";
  const signInHref = invitePath
    ? `/signin?next=${encodeURIComponent(invitePath)}`
    : "/signin";

  useEffect(() => {
    if (workspaceId.trim().length === 0 || token.trim().length === 0) {
      setInvite(null);
      setValidationState("invalid");
      return;
    }

    let isCancelled = false;
    setValidationState("loading");
    setInvite(null);
    setErrorMessage("");

    void resolveWorkspaceInvite({
      firestore,
      workspaceId,
      token,
    })
      .then((resolvedInvite) => {
        if (isCancelled) {
          return;
        }

        if (!resolvedInvite) {
          setValidationState("invalid");
          return;
        }

        setInvite(resolvedInvite);
        setValidationState("valid");
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setErrorMessage(getInviteErrorMessage(error));
        setValidationState("error");
      });

    return () => {
      isCancelled = true;
    };
  }, [token, workspaceId]);

  const handleJoinWorkspace = async () => {
    if (!user || !invite || isJoining) {
      return;
    }

    setErrorMessage("");
    setIsJoining(true);

    try {
      await joinWorkspaceFromInvite({
        firestore,
        userId: user.uid,
        workspaceId: invite.workspaceId,
      });

      window.location.assign("/app");
    } catch (error) {
      setErrorMessage(getJoinErrorMessage(error));
      setIsJoining(false);
    }
  };

  if (validationState === "loading" || isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
        <section className="w-full max-w-[480px] rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
          <p className="text-center text-sm text-gray-700">Validating invite...</p>
        </section>
      </main>
    );
  }

  if (validationState === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
        <section className="w-full max-w-[480px] rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Unable to validate invite
          </h1>
          <p
            role="alert"
            className="mt-3 rounded border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {errorMessage}
          </p>
          <div className="mt-6">
            <Button type="button" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (validationState === "invalid" || !invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
        <section className="w-full max-w-[480px] rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Invalid or expired invite link
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Ask your workspace admin for a fresh invite.
          </p>
          <div className="mt-6">
            <Button type="button" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <section className="w-full max-w-[520px] rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          You have been invited to join {invite.workspaceName ?? invite.workspaceId}
        </h1>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {errorMessage}
          </p>
        ) : null}

        {!user ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => router.push(signUpHref)}>
              Sign Up
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(signInHref)}
            >
              Sign In
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <Button type="button" onClick={handleJoinWorkspace} disabled={isJoining}>
              {isJoining ? "Joining workspace..." : "Join Workspace"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
