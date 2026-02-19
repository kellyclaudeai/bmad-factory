"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ChannelList from "@/components/features/channels/ChannelList";
import CreateChannelModal from "@/components/features/channels/CreateChannelModal";
import DMList from "@/components/features/channels/DMList";
import WorkspaceMembersSection from "@/components/features/sidebar/WorkspaceMembersSection";
import InviteTeamModal from "@/components/features/workspace/InviteTeamModal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { firestore } from "@/lib/firebase/client";
import { createChannel } from "@/lib/utils/channels";

export interface SidebarProps {
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ workspaceName, isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
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

  const handleCreateChannel = async (name: string): Promise<void> => {
    if (!user?.uid || !workspaceId) {
      throw new Error("Unable to create channel. Please try again.");
    }

    const channelId = await createChannel(firestore, workspaceId, name, user.uid);
    setIsCreateChannelModalOpen(false);
    router.push(`/app/channels/${channelId}`);
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
        className={`fixed inset-y-0 left-0 z-50 w-[280px] flex-none border-r border-gray-300 bg-white transform transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:w-[250px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[280px]"
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
              className="h-8 px-2 text-xs lg:hidden"
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
                  Direct Messages
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
              <DMList onDirectMessageSelect={onClose} />
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
        workspaceName={workspaceName}
      />
    </>
  );
}
