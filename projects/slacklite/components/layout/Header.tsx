"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/contexts/AuthContext";

function getSignOutErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to sign out right now. Please try again.";
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userLabel =
    typeof user?.displayName === "string" && user.displayName.trim().length > 0
      ? user.displayName
      : (user?.email ?? "Signed in user");

  const closeSignOutModal = () => {
    if (isSigningOut) {
      return;
    }

    setErrorMessage("");
    setIsSignOutModalOpen(false);
  };

  const handleSignOut = async () => {
    setErrorMessage("");
    setIsSigningOut(true);

    try {
      await signOut({ skipConfirmation: true });
      setIsSignOutModalOpen(false);
    } catch (error) {
      setErrorMessage(getSignOutErrorMessage(error));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-gray-300 bg-white">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">SlackLite</p>
            <p className="truncate text-sm font-normal text-gray-700">{userLabel}</p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-10 px-4"
            onClick={() => {
              setErrorMessage("");
              setIsSignOutModalOpen(true);
            }}
            disabled={loading || isSigningOut}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <Modal
        isOpen={isSignOutModalOpen}
        onClose={closeSignOutModal}
        title="Sign Out"
        titleTag="h3"
        size="sm"
      >
        <p className="text-base font-normal text-gray-700">
          Are you sure you want to sign out?
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={closeSignOutModal}
            disabled={isSigningOut}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
