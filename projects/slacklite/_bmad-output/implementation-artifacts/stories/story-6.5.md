# Story 6.5: Add Last Seen Timestamp

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Store and display "last seen" timestamp for offline users. Show in member list tooltip on hover with relative time formatting.

**Acceptance Criteria:**
- [ ] Update `/users/{userId}`: Field `lastSeenAt` updated on every presence change
- [ ] onDisconnect: Set `lastSeenAt: serverTimestamp()` in RTDB
- [ ] Member list: Hover over offline user → tooltip shows "Last seen: 2 hours ago"
- [ ] Format: Relative time (formatDistanceToNow from date-fns)
- [ ] If never seen: Show "Last seen: Never" (edge case for newly invited users)

**Dependencies:**
dependsOn: ["6.1"]

**Technical Notes:**
- Update presence with lastSeenAt:
  ```typescript
  // In usePresence hook
  onDisconnect(userPresenceRef).set({
    online: false,
    lastSeen: rtdbTimestamp(),
  });

  // Sync to Firestore
  onDisconnect(userPresenceRef).onDisconnect(() => {
    updateDoc(doc(firestore, 'users', user.uid), {
      isOnline: false,
      lastSeenAt: new Date(),
    });
  });
  ```
- Member list with tooltip:
  ```tsx
  import { formatDistanceToNow } from 'date-fns';

  export default function MemberList() {
    const { members } = useWorkspaceMembers();

    return (
      <ul>
        {members.map(member => (
          <li
            key={member.userId}
            className="relative group"
            title={
              member.isOnline
                ? 'Online'
                : member.lastSeenAt
                ? `Last seen: ${formatDistanceToNow(member.lastSeenAt.toDate(), { addSuffix: true })}`
                : 'Last seen: Never'
            }
          >
            <div className="flex items-center gap-2">
              <OnlineIndicator isOnline={member.isOnline} />
              <span>{member.displayName}</span>
            </div>

            {/* Tooltip (optional: custom implementation) */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded">
              {member.isOnline
                ? 'Online'
                : `Last seen: ${formatDistanceToNow(member.lastSeenAt.toDate(), { addSuffix: true })}`}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  ```
- Relative time formatting (reuse from Story 7.4):
  - "2 minutes ago"
  - "1 hour ago"
  - "Yesterday"
  - "3 days ago"

**Estimated Effort:** 1 hour
