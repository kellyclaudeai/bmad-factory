"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDirectMessages } from "@/lib/hooks/useDirectMessages";
import { useUnreadCounts } from "@/lib/hooks/useUnreadCounts";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatting";

export interface DMListProps {
  onDirectMessageSelect?: () => void;
}

export function DMList({ onDirectMessageSelect }: DMListProps) {
  const { dms, loading, error } = useDirectMessages();
  const pathname = usePathname();
  const [, setTick] = useState(0);
  const dmIds = useMemo(() => dms.map((directMessage) => directMessage.dmId), [dms]);

  // Extract active DM ID from pathname (e.g., /app/dms/dm-123 → dm-123)
  const activeDmId = useMemo(() => {
    const dmPathPrefix = "/app/dms/";
    if (!pathname.startsWith(dmPathPrefix)) {
      return "";
    }
    return pathname.slice(dmPathPrefix.length).split("/")[0]?.trim() ?? "";
  }, [pathname]);

  // Get unread counts for DMs
  // Note: Pass empty channels array since this is for DMs, not channels
  // The hook subscribes to Firestore unreadCounts which includes both channels and DMs
  const { unreadCounts } = useUnreadCounts({
    channels: [],
    directMessageIds: dmIds,
    activeTargetId: activeDmId,
    activeTargetType: "dm",
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((tick) => tick + 1);
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="px-2 py-3">
        <div role="status" className="flex items-center gap-2 text-sm text-muted">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
          />
          Loading direct messages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="px-2 py-3 text-sm text-error">
        Failed to load direct messages.
      </p>
    );
  }

  if (dms.length === 0) {
    return (
      <p className="px-2 py-3 text-sm text-secondary">
        No direct messages yet. Click a team member to start chatting.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {dms.map((directMessage) => {
        const isActive = pathname === `/app/dms/${directMessage.dmId}`;
        const unreadCount = unreadCounts[directMessage.dmId] ?? 0;
        const formattedLastMessageAt =
          directMessage.lastMessageAt
            ? formatRelativeTime(directMessage.lastMessageAt)
            : null;

        return (
          <li key={directMessage.dmId}>
            <Link
              href={`/app/dms/${directMessage.dmId}`}
              onClick={onDirectMessageSelect}
              className={`
                flex w-full items-center justify-between py-1.5 text-left font-mono text-sm transition-colors
                ${isActive
                  ? "border-l-2 border-accent bg-accent-subtle pl-[14px] pr-2 text-primary font-semibold"
                  : "border-l-2 border-transparent pl-[14px] pr-2 text-secondary hover:bg-surface-3 hover:text-primary"
                }
              `}
            >
              <span className="truncate">{directMessage.otherUserName}</span>
              <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                {formattedLastMessageAt ? (
                  <span className="text-xs text-muted">{formattedLastMessageAt}</span>
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

export default DMList;
