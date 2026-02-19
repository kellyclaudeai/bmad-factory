"use client";

import { useMemo, useState } from "react";

import MemberList from "@/components/features/sidebar/MemberList";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useWorkspaceMembers } from "@/lib/hooks/useWorkspaceMembers";

export function WorkspaceMembersSection() {
  const { user } = useAuth();
  const { members, loading, error } = useWorkspaceMembers();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentUserId = user?.uid;

  const otherMembersCount = useMemo(() => {
    if (!currentUserId) {
      return members.length;
    }

    return members.filter((member) => member.userId !== currentUserId).length;
  }, [currentUserId, members]);

  const showEmptyState =
    !loading && !error && (members.length === 0 || otherMembersCount === 0);

  return (
    <section aria-labelledby="members-toggle">
      <div className="mb-2 px-1">
        <button
          id="members-toggle"
          type="button"
          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-200"
          aria-controls="members-content"
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          <span>Members ({members.length})</span>
          <span aria-hidden="true">{isCollapsed ? "▸" : "▾"}</span>
        </button>
      </div>

      {!isCollapsed ? (
        <div id="members-content">
          {loading ? (
            <div className="px-2 py-3">
              <div
                role="status"
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
                />
                Loading members...
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="px-2 py-3 text-sm text-error">
              Failed to load members.
            </p>
          ) : null}

          {!loading && !error && members.length > 0 ? (
            <MemberList members={members} currentUserId={currentUserId} />
          ) : null}

          {showEmptyState ? (
            <p className="px-2 py-3 text-sm text-gray-700">
              No other members yet. Invite your team!
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default WorkspaceMembersSection;

