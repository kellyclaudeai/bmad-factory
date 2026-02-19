# Story 3.3: Implement Channel Switching

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Enable users to click a channel in sidebar and navigate to that channel's message view. Update URL, highlight active channel, and clear previous channel's messages with sub-200ms perceived latency.

**Acceptance Criteria:**
- [x] Channel list items are clickable buttons/links
- [x] Click navigates to `/app/channels/{channelId}`
- [x] Active channel highlighted with Gray 300 background + 3px Primary Brand left border
- [x] URL updates to reflect current channel
- [x] Message view clears previous channel's messages
- [x] Loading indicator in message view during channel switch
- [x] Channel switch perceived latency <200ms (Firestore query cached)
- [x] Active state persists on page refresh (read from URL)

**Dependencies:**
dependsOn: ["3.2"]

**Technical Notes:**
- Channel navigation (using Next.js Link):
  ```tsx
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';

  export default function ChannelList() {
    const { channels } = useChannels();
    const pathname = usePathname();

    return (
      <ul className="space-y-1">
        {channels.map(channel => {
          const isActive = pathname === `/app/channels/${channel.channelId}`;
          
          return (
            <li key={channel.channelId}>
              <Link
                href={`/app/channels/${channel.channelId}`}
                className={`
                  block w-full text-left px-3 py-2 rounded
                  ${isActive 
                    ? 'bg-gray-300 border-l-4 border-primary-brand font-semibold' 
                    : 'hover:bg-gray-200'
                  }
                `}
              >
                # {channel.name}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  ```
- Channel page (app/app/channels/[channelId]/page.tsx):
  ```tsx
  export default function ChannelPage({ params }: { params: { channelId: string } }) {
    return (
      <div>
        {/* Message view - Story 4.7 */}
        <MessageList channelId={params.channelId} />
        <MessageInput channelId={params.channelId} />
      </div>
    );
  }
  ```
- Active state styling:
  - Background: Gray 300 (#E8E8E8)
  - Left border: 3px solid Primary Brand (#4A154B)
  - Font weight: Semibold (600)
- Performance optimization:
  - Firestore query caching (automatic)
  - Optimistic UI: Highlight active channel immediately on click

**Estimated Effort:** 1-2 hours
