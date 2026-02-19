"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useChannels } from "@/lib/hooks/useChannels";
import { useUnreadCounts } from "@/lib/hooks/useUnreadCounts";
import { Badge } from "@/components/ui/Badge";

export interface ChannelListProps {
  onChannelSelect?: () => void;
}

export function ChannelList({ onChannelSelect }: ChannelListProps) {
  const { channels, loading, error } = useChannels();
  const pathname = usePathname();
  const activeChannelId = useMemo(() => {
    const channelPathPrefix = "/app/channels/";

    if (!pathname.startsWith(channelPathPrefix)) {
      return "";
    }

    return pathname.slice(channelPathPrefix.length).split("/")[0]?.trim() ?? "";
  }, [pathname]);
  const { unreadCounts } = useUnreadCounts({
    channels,
    activeTargetId: activeChannelId,
    activeTargetType: "channel",
  });

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
      {sortedChannels.map((channel) => {
        const isActive = pathname === `/app/channels/${channel.channelId}`;
        const unreadCount = unreadCounts[channel.channelId] ?? 0;
        
        return (
          <li key={channel.channelId}>
            <Link
              href={`/app/channels/${channel.channelId}`}
              onClick={onChannelSelect}
              className={`
                flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors
                ${isActive 
                  ? 'bg-gray-300 border-l-4 border-primary-brand font-semibold text-gray-900' 
                  : 'text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              <span className="truncate"># {channel.name}</span>
              {unreadCount > 0 ? (
                <Badge size="sm" className="ml-2 flex-shrink-0">
                  {unreadCount}
                </Badge>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default ChannelList;
