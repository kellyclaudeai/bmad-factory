"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ChannelIdentity {
  channelId: string;
  name: string;
}

export interface DeleteChannelModalProps {
  channel: ChannelIdentity | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function DeleteChannelModal({
  channel,
  isOpen,
  onClose,
  onDelete,
}: DeleteChannelModalProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
      setIsDeleting(false);
      return;
    }

    setErrorMessage("");
    setIsDeleting(false);
  }, [isOpen]);

  const handleDelete = async () => {
    if (!channel || isDeleting) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      await onDelete();
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "Unable to delete channel. Please try again.";
      setErrorMessage(message);
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-semibold text-gray-900">Delete Channel</h3>

      {errorMessage ? (
        <div className="mb-4 rounded bg-error px-4 py-3 text-sm text-white">
          {errorMessage}
        </div>
      ) : null}

      <p className="mb-6 text-sm text-gray-800">
        Are you sure you want to delete <strong>#{channel?.name ?? ""}</strong>? This cannot be
        undone.
      </p>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
