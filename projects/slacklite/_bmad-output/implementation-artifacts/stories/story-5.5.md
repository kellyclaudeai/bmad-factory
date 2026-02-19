# Story 5.5: Add Unread Counts to DM List (Placeholder)

**Epic:** Epic 5 - Direct Messages (1-on-1)

**Description:**
Display unread message counts in DM list (same badge as channels). Full implementation in Epic 6, this story sets up structure and placeholder UI.

**Acceptance Criteria:**
- [x] DM list item includes unread badge (Primary Brand background, white text, right-aligned)
- [x] Badge shows number: e.g., "[2]"
- [x] Badge hidden if count = 0
- [x] Data structure prepared (unread counts stored in `/unreadCounts/{userId}_{dmId}`)
- [x] Full unread logic implemented in Story 6.4

**Dependencies:**
dependsOn: ["5.3"]

**Technical Notes:**
- DMList with unread badges:
  ```tsx
  export default function DMList() {
    const { dms } = useDirectMessages();
    const { unreadCounts } = useUnreadCounts(); // Story 6.4

    return (
      <ul className="space-y-1">
        {dms.map(dm => {
          const unreadCount = unreadCounts[dm.dmId] || 0;

          return (
            <li key={dm.dmId}>
              <Link href={`/app/dms/${dm.dmId}`} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-200">
                <span>{dm.otherUserName}</span>
                {unreadCount > 0 && (
                  <span className="bg-primary-brand text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  ```
- Unread count data structure (Story 6.4):
  - Collection: `/unreadCounts/{userId}_{dmId}`
  - Fields: `{ userId, targetId, targetType: 'dm', count, lastReadAt }`
- Badge styling (from UX spec):
  - Background: Primary Brand (#4A154B)
  - Text: White, Caption Bold (12px / 700)
  - Min width: 20px
  - Padding: 2px horizontal, 4px vertical
  - Border radius: 10px (pill)

**Estimated Effort:** 1 hour
