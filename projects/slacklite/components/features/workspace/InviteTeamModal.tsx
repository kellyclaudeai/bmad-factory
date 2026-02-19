"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

function parseEmails(input: string): string[] {
  return input.split(/[\s,]+/).filter((email) => email.length > 0);
}

export default function InviteTeamModal({
  isOpen,
  onClose,
  workspaceId,
}: InviteTeamModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  const inviteLink = useMemo(() => {
    const normalizedWorkspaceId = workspaceId.trim();

    if (normalizedWorkspaceId.length === 0) {
      return "https://slacklite.app/invite";
    }

    return `https://slacklite.app/invite/${normalizedWorkspaceId}`;
  }, [workspaceId]);

  const validateEmails = (emails: string[]): boolean => {
    const invalid = emails.filter((email) => !EMAIL_REGEX.test(email));

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

    if (!validateEmails(parsedEmails)) {
      return;
    }

    onClose();
  };

  const handleCopy = async () => {
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
            value={inviteLink}
            readOnly
            className="w-full rounded border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-800"
          />
          <Button type="button" variant="secondary" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
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
