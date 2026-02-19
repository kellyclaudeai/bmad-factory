"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onCreate,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
    }
  }, [isOpen]);

  const handleNameChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/\s+/g, "-");
    setName(formatted);

    if (!/^[a-z0-9-]*$/.test(formatted)) {
      setError("Use only lowercase letters, numbers, and hyphens");
    } else if (formatted.length > 50) {
      setError("Channel name must be 50 characters or less");
    } else {
      setError("");
    }
  };

  const handleCreate = () => {
    if (!isValid) {
      return;
    }

    onCreate(name);
  };

  const isValid = name.length > 0 && name.length <= 50 && /^[a-z0-9-]+$/.test(name);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className="mb-4 text-xl font-semibold text-gray-900">Create a Channel</h3>

      <div className="mb-4">
        <label htmlFor="create-channel-name" className="mb-2 block text-sm font-medium text-gray-900">
          Name
        </label>
        <div className="flex items-center">
          <span className="mr-2 text-gray-700">#</span>
          <Input
            id="create-channel-name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="channel-name"
            error={error || undefined}
            autoFocus
          />
        </div>
        <p className="mt-2 text-xs text-gray-700">
          Lowercase, no spaces. Use - for multiple words.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={handleCreate} disabled={!isValid}>
          Create
        </Button>
      </div>
    </Modal>
  );
}
