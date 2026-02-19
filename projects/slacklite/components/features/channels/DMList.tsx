"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDirectMessages } from "@/lib/hooks/useDirectMessages";

export interface DMListProps {
  onDirectMessageSelect?: () => void;
}

export function DMList({ onDirectMessageSelect }: DMListProps) {
  const { dms, loading, error } = useDirectMessages();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="px-2 py-3">
        <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
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
      <p className="px-2 py-3 text-sm text-gray-700">
        No direct messages yet. Click a team member to start chatting.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {dms.map((directMessage) => {
        const isActive = pathname === `/app/dms/${directMessage.dmId}`;

        return (
          <li key={directMessage.dmId}>
            <Link
              href={`/app/dms/${directMessage.dmId}`}
              onClick={onDirectMessageSelect}
              className={`
                flex w-full items-center rounded px-2 py-1.5 text-left text-sm transition-colors
                ${isActive
                  ? "bg-gray-300 border-l-4 border-primary-brand font-semibold text-gray-900"
                  : "text-gray-800 hover:bg-gray-200"
                }
              `}
            >
              <span className="truncate">{directMessage.otherUserName}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default DMList;

