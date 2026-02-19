"use client";

import { useCallback, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import OnlineIndicator from "@/components/ui/OnlineIndicator";
import { startDM as startDMAction } from "@/lib/actions/startDM";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";

type LastSeenAtValue =
  | Date
  | number
  | {
      toDate: () => Date;
    }
  | null
  | undefined;

export interface MemberListMember {
  userId: string;
  displayName: string;
  isOnline: boolean;
  lastSeenAt?: LastSeenAtValue;
}

interface MemberListProps {
  members: MemberListMember[];
  currentUserId?: string;
  className?: string;
}

function toDate(lastSeenAt: LastSeenAtValue): Date | null {
  if (!lastSeenAt) {
    return null;
  }

  if (lastSeenAt instanceof Date) {
    return Number.isNaN(lastSeenAt.getTime()) ? null : lastSeenAt;
  }

  if (typeof lastSeenAt === "number") {
    const convertedDate = new Date(lastSeenAt);
    return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
  }

  if (
    typeof lastSeenAt === "object" &&
    "toDate" in lastSeenAt &&
    typeof lastSeenAt.toDate === "function"
  ) {
    const convertedDate = lastSeenAt.toDate();
    return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
  }

  return null;
}

function getLastSeenTooltip(lastSeenAt: LastSeenAtValue): string {
  const lastSeenDate = toDate(lastSeenAt);

  if (!lastSeenDate) {
    return "Last seen: Never";
  }

  return `Last seen: ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
}

export function MemberList({ members, currentUserId, className = "" }: MemberListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";
  const authenticatedUserId = user?.uid ?? "";

  const startDM = useCallback(
    async (otherUserId: string) => {
      if (
        loadingMemberId ||
        authenticatedUserId.length === 0 ||
        workspaceId.length === 0 ||
        otherUserId === authenticatedUserId
      ) {
        return;
      }

      setLoadingMemberId(otherUserId);

      try {
        const dmId = await startDMAction({
          firestore,
          workspaceId,
          currentUserId: authenticatedUserId,
          otherUserId,
        });

        router.push(`/app/dms/${dmId}`);
      } catch (error) {
        console.error("Failed to start direct message.", error);
      } finally {
        setLoadingMemberId(null);
      }
    },
    [authenticatedUserId, loadingMemberId, router, workspaceId],
  );

  return (
    <ul className={`space-y-1 ${className}`.trim()}>
      {members.map((member) => {
        const tooltipText = member.isOnline
          ? undefined
          : getLastSeenTooltip(member.lastSeenAt);
        const isCurrentUser =
          currentUserId !== undefined && member.userId === currentUserId;
        const isLoading = loadingMemberId === member.userId;
        const isDisabled = isCurrentUser || loadingMemberId !== null;

        return (
          <li key={member.userId}>
            <button
              type="button"
              title={tooltipText}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left ${
                isDisabled ? "cursor-default" : "hover:bg-gray-200"
              }`}
              onClick={() => void startDM(member.userId)}
              disabled={isDisabled}
            >
              <div className="relative">
                <Avatar alt={member.displayName} fallbackText={member.displayName} size="sm" />
                <span className="absolute bottom-0 right-0">
                  <OnlineIndicator isOnline={member.isOnline} />
                </span>
              </div>
              <span className="flex min-w-0 items-center gap-2 text-sm text-gray-900">
                <span className="truncate">
                  {member.displayName}
                  {isCurrentUser ? " (You)" : ""}
                </span>
                {isLoading ? (
                  <span
                    role="status"
                    className="inline-flex items-center"
                    aria-live="polite"
                  >
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"
                    />
                    <span className="sr-only">Starting DM...</span>
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default MemberList;
