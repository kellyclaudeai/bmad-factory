"use client";

import MemberList, {
  type MemberListMember,
} from "@/components/features/sidebar/MemberList";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SidebarItem {
  id: string;
  label: string;
  unreadCount?: number;
}

const DEFAULT_CHANNELS: SidebarItem[] = [
  { id: "general", label: "general", unreadCount: 3 },
  { id: "product", label: "product" },
  { id: "engineering", label: "engineering", unreadCount: 1 },
];

const DEFAULT_DIRECT_MESSAGES: SidebarItem[] = [
  { id: "alex", label: "Alex", unreadCount: 2 },
  { id: "sarah", label: "Sarah" },
  { id: "michael", label: "Michael" },
];

const DEFAULT_MEMBERS: MemberListMember[] = [
  { userId: "alex", displayName: "Alex", isOnline: true },
  {
    userId: "sarah",
    displayName: "Sarah",
    isOnline: false,
    lastSeenAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  { userId: "michael", displayName: "Michael", isOnline: false },
];

export interface SidebarProps {
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
  channels?: SidebarItem[];
  directMessages?: SidebarItem[];
  members?: MemberListMember[];
  currentUserId?: string;
}

export function Sidebar({
  workspaceName,
  isOpen,
  onClose,
  channels = DEFAULT_CHANNELS,
  directMessages = DEFAULT_DIRECT_MESSAGES,
  members = DEFAULT_MEMBERS,
  currentUserId,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-60 flex-none border-r border-gray-300 bg-white transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Workspace sidebar"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-300 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar alt={workspaceName} fallbackText={workspaceName} size="sm" />
            <p className="truncate text-sm font-semibold text-gray-900">{workspaceName}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 px-2 text-xs md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <section aria-labelledby="channels-title">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2
                id="channels-title"
                className="text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Channels
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onClose}
              >
                + New Channel
              </Button>
            </div>

            <ul className="space-y-1">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-200"
                    onClick={onClose}
                  >
                    <span className="truncate"># {channel.label}</span>
                    {channel.unreadCount ? (
                      <Badge size="sm">{channel.unreadCount}</Badge>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="dms-title">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2
                id="dms-title"
                className="text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                DMs
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={onClose}
              >
                + New DM
              </Button>
            </div>

            <ul className="space-y-1">
              {directMessages.map((directMessage) => (
                <li key={directMessage.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-200"
                    onClick={onClose}
                  >
                    <span className="truncate">{directMessage.label}</span>
                    {directMessage.unreadCount ? (
                      <Badge size="sm">{directMessage.unreadCount}</Badge>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="members-title">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2
                id="members-title"
                className="text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                Members
              </h2>
            </div>
            <MemberList members={members} currentUserId={currentUserId} />
          </section>
        </div>
      </div>
    </aside>
  );
}
