"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useChannels } from "@/lib/hooks/useChannels";
import { useUnreadCounts } from "@/lib/hooks/useUnreadCounts";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatting";

export interface ChannelListProps {
  onChannelSelect?: () => void;
}

export function ChannelList({ onChannelSelect }: ChannelListProps) {
  const { channels, loading, error } = useChannels();
  const pathname = usePathname();
  const router = useRouter();
  const channelRefs = useRef<Array<HTMLAnchorElement | null>>([]);
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [, setTimestampTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimestampTick((tick) => tick + 1);
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (sortedChannels.length === 0) {
      setFocusedIndex(0);
      return;
    }

    const activeIndex = sortedChannels.findIndex(
      (channel) => channel.channelId === activeChannelId,
    );
    setFocusedIndex(activeIndex >= 0 ? activeIndex : 0);
  }, [activeChannelId, sortedChannels]);

  const focusChannel = useCallback(
    (index: number) => {
      if (sortedChannels.length === 0) {
        return;
      }

      const normalizedIndex = (index + sortedChannels.length) % sortedChannels.length;
      setFocusedIndex(normalizedIndex);
      channelRefs.current[normalizedIndex]?.focus();
    },
    [sortedChannels.length],
  );

  const handleChannelKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
      if (sortedChannels.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusChannel(index + 1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusChannel(index - 1);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const channelId = sortedChannels[index]?.channelId;

        if (!channelId) {
          return;
        }

        router.push(`/app/channels/${channelId}`);
        onChannelSelect?.();
      }
    },
    [focusChannel, onChannelSelect, router, sortedChannels],
  );

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
    <ul aria-label="Channels" className="space-y-1">
      {sortedChannels.map((channel, index) => {
        const isActive = channel.channelId === activeChannelId;
        const unreadCount = unreadCounts[channel.channelId] ?? 0;
        const formattedLastMessageAt = channel.lastMessageAt
          ? formatRelativeTime(channel.lastMessageAt)
          : null;

        return (
          <li key={channel.channelId}>
            <Link
              ref={(element) => {
                channelRefs.current[index] = element;
              }}
              href={`/app/channels/${channel.channelId}`}
              onClick={onChannelSelect}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={(event) => handleChannelKeyDown(event, index)}
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-label={
                unreadCount > 0
                  ? `Channel ${channel.name}, ${unreadCount} unread messages`
                  : `Channel ${channel.name}`
              }
              className={`
                flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-brand
                ${
                  isActive
                    ? "border-l-4 border-primary-brand bg-gray-300 font-semibold text-gray-900"
                    : "text-gray-800 hover:bg-gray-200"
                }
              `}
            >
              <span className="truncate"># {channel.name}</span>
              <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                {formattedLastMessageAt ? (
                  <span className="text-xs text-gray-600">{formattedLastMessageAt}</span>
                ) : null}
                {unreadCount > 0 ? (
                  <Badge size="sm" className="flex-shrink-0">
                    {unreadCount}
                  </Badge>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default ChannelList;
