"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  formatChannelNameInput,
  getChannelNameValidationError,
} from "@/lib/utils/channelName";
import { isGeneralChannelName } from "@/lib/utils/workspace";

interface ChannelIdentity {
  channelId: string;
  name: string;
}

export interface RenameChannelModalProps {
  channel: ChannelIdentity | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
}

export default function RenameChannelModal({
  channel,
  isOpen,
  onClose,
  onRename,
}: RenameChannelModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const isGeneralChannel = useMemo(() => {
    if (!channel) {
      return false;
    }

    return isGeneralChannelName(channel.name);
  }, [channel]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
      setErrorMessage("");
      setIsRenaming(false);
      return;
    }

    if (!channel) {
      return;
    }

    setName(channel.name);
    setError("");
    setErrorMessage("");
    setIsRenaming(false);
  }, [channel, isOpen]);

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

  const handleRename = async () => {
    if (!channel || !isValid || isRenaming) {
      return;
    }

    if (isGeneralChannel) {
      setErrorMessage("Cannot rename #general channel");
      return;
    }

    setIsRenaming(true);
    setErrorMessage("");

    try {
      await onRename(name);
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : "Unable to rename channel. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsRenaming(false);
    }
  };

  const isValid = getChannelNameValidationError(name) === "";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-semibold text-primary">Rename Channel</h3>

      {errorMessage && (
        <div className="mb-4 rounded bg-error-subtle border border-error px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="rename-channel-name" className="mb-2 block text-xs font-semibold font-mono uppercase tracking-wide text-secondary">
          Name
        </label>
        <div className="flex items-center">
          <span className="mr-2 text-muted">#</span>
          <Input
            id="rename-channel-name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="channel-name"
            error={error || undefined}
            autoFocus
            disabled={isRenaming}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Lowercase, no spaces. Use - for multiple words.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isRenaming}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleRename} disabled={!isValid || isRenaming}>
          {isRenaming ? "Renaming..." : "Rename"}
        </Button>
      </div>
    </Modal>
  );
}
