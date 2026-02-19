"use client";

import { useMemo } from "react";

import { useChannels } from "@/lib/hooks/useChannels";

export interface ChannelListProps {
  onChannelSelect?: () => void;
}

export function ChannelList({ onChannelSelect }: ChannelListProps) {
  const { channels, loading, error } = useChannels();

  const sortedChannels = useMemo(() => {
    return [...channels].sort((firstChannel, secondChannel) =>
      firstChannel.name.localeCompare(secondChannel.name, undefined, {
        sensitivity: "base",
      }),
    );
  }, [channels]);

  if (loading) {
    return (
      <div className="px-2 py-3">
        <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
          />
          Loading channels...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="px-2 py-3 text-sm text-error">
        Failed to load channels.
      </p>
    );
  }

  if (sortedChannels.length === 0) {
    return (
      <p className="px-2 py-3 text-sm text-gray-700">
        No channels yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {sortedChannels.map((channel) => (
        <li key={channel.channelId}>
          <button
            type="button"
            className="flex w-full items-center rounded px-2 py-1.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-200"
            onClick={onChannelSelect}
          >
            <span className="truncate"># {channel.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ChannelList;
