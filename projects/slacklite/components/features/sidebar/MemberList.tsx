import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";

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
  return (
    <ul className={`space-y-1 ${className}`.trim()}>
      {members.map((member) => {
        const tooltipText = member.isOnline
          ? undefined
          : getLastSeenTooltip(member.lastSeenAt);

        return (
          <li
            key={member.userId}
            title={tooltipText}
            className="flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-200"
          >
            <div className="relative">
              <Avatar alt={member.displayName} fallbackText={member.displayName} size="sm" />
              <span
                aria-label={member.isOnline ? "Online" : "Offline"}
                role="status"
                className={`absolute bottom-0 right-0 inline-block h-2.5 w-2.5 rounded-full border-2 border-white ${
                  member.isOnline ? "bg-[#2EB67D]" : "bg-[#868686]"
                }`}
              />
            </div>
            <span className="text-sm text-gray-900">
              {member.displayName}
              {currentUserId && member.userId === currentUserId ? " (You)" : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default MemberList;
