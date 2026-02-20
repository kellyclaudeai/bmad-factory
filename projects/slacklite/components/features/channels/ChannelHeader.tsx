"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

export interface ChannelHeaderProps {
  channelName: string;
  canRenameChannel: boolean;
  onRenameChannel: () => void;
  canDeleteChannel?: boolean;
  onDeleteChannel?: () => void;
}

export default function ChannelHeader({
  channelName,
  canRenameChannel,
  onRenameChannel,
  canDeleteChannel = false,
  onDeleteChannel,
}: ChannelHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canManageChannel = canRenameChannel || (canDeleteChannel && Boolean(onDeleteChannel));

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [channelName]);

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
      <h1 className="truncate font-mono text-lg font-semibold text-primary"># {channelName}</h1>

      {canManageChannel ? (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 text-base"
            aria-label="Channel settings"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen((current) => !current);
            }}
          >
            ⚙
          </Button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-44 rounded border border-border bg-surface-3 p-1 shadow-lg"
            >
              {canRenameChannel ? (
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-surface-4"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRenameChannel();
                  }}
                >
                  Rename Channel
                </button>
              ) : null}

              {canDeleteChannel && onDeleteChannel ? (
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error-subtle"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDeleteChannel();
                  }}
                >
                  Delete Channel
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
