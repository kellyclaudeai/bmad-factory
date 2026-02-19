# Story 6.2: Display Online/Offline Indicators

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Show 10px colored dots next to usernames in member list and DM headers. Green = online, gray = offline with proper real-time updates.

**Acceptance Criteria:**
- [ ] Create `components/ui/OnlineIndicator.tsx`
- [ ] Props: `isOnline: boolean`
- [ ] Render: 10px circle, green (#2EB67D) if online, gray (#868686) if offline
- [ ] 2px white border (separation from background)
- [ ] Positioned: Bottom-right of avatar or inline before name
- [ ] Member list: Show indicator next to each member's name
- [ ] DM header: Show indicator next to other user's name
- [ ] Updates in real-time (subscribe to `/presence/{userId}`)

**Dependencies:**
dependsOn: ["6.1", "5.1"]

**Technical Notes:**
- OnlineIndicator component:
  ```tsx
  export default function OnlineIndicator({ isOnline }: { isOnline: boolean }) {
    return (
      <span
        className={`
          inline-block w-2.5 h-2.5 rounded-full border-2 border-white
          ${isOnline ? 'bg-success' : 'bg-gray-600'}
        `}
        aria-label={isOnline ? 'Online' : 'Offline'}
        role="status"
      />
    );
  }
  ```
- Usage in MemberList:
  ```tsx
  <li className="flex items-center gap-2">
    <div className="relative">
      <Avatar user={member} />
      <span className="absolute bottom-0 right-0">
        <OnlineIndicator isOnline={member.isOnline} />
      </span>
    </div>
    <span>{member.displayName}</span>
  </li>
  ```
- Usage in DM header:
  ```tsx
  <div className="flex items-center gap-2">
    <OnlineIndicator isOnline={otherUser.isOnline} />
    <h2>{otherUser.displayName}</h2>
  </div>
  ```
- Real-time updates (useWorkspaceMembers already subscribed to Firestore users collection)

**Estimated Effort:** 1 hour
