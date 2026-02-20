"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  formatChannelNameInput,
  getChannelNameValidationError,
} from "@/lib/utils/channelName";

export interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onCreate,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
      setErrorMessage("");
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleNameChange = (value: string) => {
    const formatted = formatChannelNameInput(value);
    setName(formatted);
    setErrorMessage("");

    if (formatted.length === 0) {
      setError("");
      return;
    }

    setError(getChannelNameValidationError(formatted));
  };

  const handleCreate = async () => {
    if (!isValid || isCreating) {
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      await onCreate(name);
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "Unable to create channel. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsCreating(false);
    }
  };

  const isValid = getChannelNameValidationError(name) === "";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-semibold text-primary">Create a Channel</h3>

      {errorMessage && (
        <div className="mb-4 rounded bg-error-subtle border border-error px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="create-channel-name" className="mb-2 block text-xs font-semibold font-mono uppercase tracking-wide text-secondary">
          Name
        </label>
        <div className="flex items-center">
          <span className="mr-2 text-muted">#</span>
          <Input
            id="create-channel-name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="channel-name"
            error={error || undefined}
            autoFocus
            disabled={isCreating}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Lowercase, no spaces. Use - for multiple words.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleCreate} disabled={!isValid || isCreating}>
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </div>
    </Modal>
  );
}
