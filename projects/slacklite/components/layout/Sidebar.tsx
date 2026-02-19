"use client";

import { useState } from "react";

import ChannelList from "@/components/features/channels/ChannelList";
import CreateChannelModal from "@/components/features/channels/CreateChannelModal";
import WorkspaceMembersSection from "@/components/features/sidebar/WorkspaceMembersSection";
import InviteTeamModal from "@/components/features/workspace/InviteTeamModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";

interface DirectMessageItem {
  id: string;
  label: string;
  unreadCount?: number;
}

const DEFAULT_DIRECT_MESSAGES: DirectMessageItem[] = [
  { id: "alex", label: "Alex", unreadCount: 2 },
  { id: "sarah", label: "Sarah" },
  { id: "michael", label: "Michael" },
];

export interface SidebarProps {
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
  directMessages?: DirectMessageItem[];
}

export function Sidebar({
  workspaceName,
  isOpen,
  onClose,
  directMessages = DEFAULT_DIRECT_MESSAGES,
}: SidebarProps) {
  const { user } = useAuth();
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isInviteTeamModalOpen, setIsInviteTeamModalOpen] = useState(false);
  const workspaceId =
    typeof user?.workspaceId === "string" ? user.workspaceId.trim() : "";

  const handleOpenCreateChannelModal = () => {
    setIsCreateChannelModalOpen(true);
    onClose();
  };

  const handleCloseCreateChannelModal = () => {
    setIsCreateChannelModalOpen(false);
  };

  const handleCreateChannel = () => {
    setIsCreateChannelModalOpen(false);
  };

  const handleOpenInviteTeamModal = () => {
    setIsInviteTeamModalOpen(true);
    onClose();
  };

  const handleCloseInviteTeamModal = () => {
    setIsInviteTeamModalOpen(false);
  };

  return (
    <>
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={handleOpenInviteTeamModal}
                  >
                    Invite Team
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={handleOpenCreateChannelModal}
                  >
                    + New Channel
                  </Button>
                </div>
              </div>
              <ChannelList onChannelSelect={onClose} />
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

            <WorkspaceMembersSection />
          </div>
        </div>
      </aside>

      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={handleCloseCreateChannelModal}
        onCreate={handleCreateChannel}
      />
      <InviteTeamModal
        isOpen={isInviteTeamModalOpen}
        onClose={handleCloseInviteTeamModal}
        workspaceId={workspaceId}
      />
    </>
  );
}
