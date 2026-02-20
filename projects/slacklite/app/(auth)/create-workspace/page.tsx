"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { validateWorkspaceName as validateWorkspaceNameInput } from "@/lib/utils/validation";
import { createWorkspace } from "@/lib/utils/workspace";

const MAX_WORKSPACE_NAME_LENGTH = 50;
const DEFAULT_CREATION_ERROR_MESSAGE =
  "Unable to create workspace right now. Please try again.";

function getWorkspaceNameValidationError(value: string): string {
  const result = validateWorkspaceNameInput(value);

  if (result.valid) {
    return "";
  }

  return result.error ?? "Workspace name must be 1-50 characters.";
}

function getWorkspaceCreationErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code);

    switch (code) {
      case "permission-denied":
        return "You do not have permission to create a workspace.";
      case "not-found":
        return "Your user profile could not be found. Please sign in again.";
      default:
        break;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return DEFAULT_CREATION_ERROR_MESSAGE;
}

function CreateWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewSignup = searchParams.get("new") === "1";
  const { user, loading: isAuthLoading, refreshUserData } = useAuth();
  const [workspaceName, setWorkspaceName] = useState("");
  const [nameError, setNameError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingWorkspace, setIsCheckingWorkspace] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingWorkspaceId = useMemo(() => {
    if (!user || typeof user.workspaceId !== "string") {
      return "";
    }

    return user.workspaceId.trim();
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/signin");
      return;
    }

    // Only redirect to /app if NOT coming from a fresh signup
    if (!isNewSignup && existingWorkspaceId.length > 0) {
      router.replace("/app");
      return;
    }

    setIsCheckingWorkspace(false);
  }, [existingWorkspaceId, isAuthLoading, isNewSignup, router, user]);

  const workspaceNameValidationResult = validateWorkspaceNameInput(workspaceName);
  const canSubmit =
    !!user &&
    !isAuthLoading &&
    !isCheckingWorkspace &&
    !isSubmitting &&
    workspaceNameValidationResult.valid;

  const handleWorkspaceNameChange = (value: string) => {
    setWorkspaceName(value);
    setErrorMessage("");

    const normalized = value.trim();
    if (normalized.length === 0) {
      setNameError("");
      return;
    }

    setNameError(getWorkspaceNameValidationError(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || isAuthLoading || isCheckingWorkspace || !user) {
      return;
    }

    const validationError = getWorkspaceNameValidationError(workspaceName);
    setNameError(validationError);

    if (validationError) {
      return;
    }

    const normalizedWorkspaceName = workspaceName.trim();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { defaultChannelId } = await createWorkspace({
        firestore,
        name: normalizedWorkspaceName,
        userId: user.uid,
      });

      await refreshUserData();
      router.replace(`/app/channels/${defaultChannelId}`);
    } catch (error) {
      setErrorMessage(getWorkspaceCreationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isCheckingWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
        <div className="w-full max-w-[480px] rounded-lg border border-border bg-surface-2 p-8 shadow-xl">
          <p className="text-center text-sm text-secondary">
            Loading workspace setup...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-mono text-2xl font-semibold text-accent">SlackLite</span>
          <p className="mt-2 text-sm text-secondary">Set up your workspace</p>
        </div>

        {/* Auth card */}
        <section
          className="rounded-lg border border-border bg-surface-2 p-8 shadow-xl"
          aria-label="Create workspace form"
        >
          <h3 className="mb-6 text-xl font-semibold text-primary">
            Create Your Workspace
          </h3>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            aria-label="Create workspace form"
            noValidate
          >
            <Input
              id="workspace-name"
              label="What's the name of your team or project?"
              placeholder="e.g., Acme Inc"
              helperText="e.g., 'Acme Inc', 'Dev Team', 'Friend Group'"
              value={workspaceName}
              onChange={(event) => handleWorkspaceNameChange(event.target.value)}
              error={nameError}
              maxLength={MAX_WORKSPACE_NAME_LENGTH}
              autoComplete="organization"
              aria-label="Workspace name"
              required
              disabled={isSubmitting}
            />

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-md border border-error bg-error-subtle px-4 py-3 text-sm font-mono text-error"
              >
                {errorMessage}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-inverse/80 border-t-transparent"
                  />
                  Creating Workspace...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function CreateWorkspacePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
          <div className="w-full max-w-[480px] rounded-lg border border-border bg-surface-2 p-8 shadow-xl">
            <p className="text-center text-sm text-secondary">
              Loading workspace setup...
            </p>
          </div>
        </main>
      }
    >
      <CreateWorkspaceContent />
    </Suspense>
  );
}
