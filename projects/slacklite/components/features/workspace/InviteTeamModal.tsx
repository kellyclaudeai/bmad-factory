"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import {
  buildWorkspaceInviteUrl,
  createWorkspaceInvite,
} from "@/lib/utils/workspaceInvites";
import { validateEmail } from "@/lib/utils/validation";

export interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

function parseEmails(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

export default function InviteTeamModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: InviteTeamModalProps) {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteErrorMessage, setInviteErrorMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
      setEmailInput("");
      setErrorMessage("");
      setInviteErrorMessage("");
      setInviteLink("");
      setIsGeneratingInvite(false);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const normalizedWorkspaceId = workspaceId.trim();
    const normalizedUserId = typeof user?.uid === "string" ? user.uid.trim() : "";

    if (normalizedWorkspaceId.length === 0) {
      setInviteLink("");
      setInviteErrorMessage("Workspace is required to generate an invite.");
      return;
    }

    if (normalizedUserId.length === 0) {
      setInviteLink("");
      setInviteErrorMessage("Please sign in again to generate an invite.");
      return;
    }

    let isCancelled = false;
    setIsGeneratingInvite(true);
    setInviteErrorMessage("");

    void createWorkspaceInvite({
      firestore,
      workspaceId: normalizedWorkspaceId,
      createdBy: normalizedUserId,
      workspaceName,
    })
      .then((invite) => {
        if (isCancelled) {
          return;
        }

        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : undefined;
        setInviteLink(
          buildWorkspaceInviteUrl(invite.workspaceId, invite.token, baseUrl),
        );
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        if (error instanceof Error && error.message.trim().length > 0) {
          setInviteErrorMessage(error.message);
          return;
        }

        setInviteErrorMessage("Unable to generate an invite link right now.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsGeneratingInvite(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, user?.uid, workspaceId, workspaceName]);

  const validateEmails = (emails: string[]): boolean => {
    const invalid = emails.filter((email) => !validateEmail(email).valid);

    setErrorMessage(
      invalid.length > 0 ? `Invalid emails: ${invalid.join(", ")}` : "",
    );

    return invalid.length === 0;
  };

  const handleSendInvites = () => {
    const parsedEmails = parseEmails(emailInput);

    if (parsedEmails.length === 0) {
      setErrorMessage("Enter at least one email address.");
      return;
    }

    if (!inviteLink) {
      setInviteErrorMessage("Invite link is still generating. Please try again.");
      return;
    }

    if (!validateEmails(parsedEmails)) {
      return;
    }

    onClose();
  };

  const handleCopy = async () => {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        Invite Team Members
      </h3>

      <div className="mb-4">
        <label
          htmlFor="invite-team-emails"
          className="mb-2 block text-sm font-medium text-gray-900"
        >
          Email Addresses
        </label>
        <textarea
          id="invite-team-emails"
          value={emailInput}
          onChange={(event) => {
            setEmailInput(event.target.value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          placeholder="alex@example.com, jordan@example.com"
          className={`min-h-[96px] w-full rounded border px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            errorMessage
              ? "border-error focus:border-error focus:ring-error"
              : "border-gray-400 focus:border-primary-brand focus:ring-primary-brand"
          }`}
        />
        <p className="mt-2 text-xs text-gray-700">
          Separate multiple emails with commas or spaces.
        </p>
        {errorMessage ? (
          <p className="mt-2 text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-900">
          Or share this invite link:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink || "Generating invite link..."}
            readOnly
            className="w-full rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            disabled={!inviteLink || isGeneratingInvite}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        {inviteErrorMessage ? (
          <p className="mt-2 text-sm text-error" role="alert">
            {inviteErrorMessage}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleSendInvites}>
          Send Invites
        </Button>
      </div>
    </Modal>
  );
}
