# Story 6.3: Implement Active Channel Highlighting

**Epic:** Epic 6 - User Presence & Indicators

**Description:**
Highlight currently selected channel/DM in sidebar with background color and left border. Update when user switches channels with proper URL sync.

**Acceptance Criteria:**
- [ ] Active channel: Gray 300 (#E8E8E8) background + 3px Primary Brand (#4A154B) left border
- [ ] Hover (non-active): Gray 200 (#F2F2F2) background
- [ ] Default (non-active, no hover): Transparent background
- [ ] Channel name: Bold when active (font-weight: 600)
- [ ] Active state synced with URL: `/app/channels/{channelId}` or `/app/dms/{dmId}`
- [ ] Persists on page refresh (read from URL params)
- [ ] Keyboard navigation: Arrow keys move active highlight, Enter switches channel

**Dependencies:**
dependsOn: ["3.3"]

**Technical Notes:**
- Active channel styling (already implemented in Story 3.3):
  ```tsx
  import { usePathname } from 'next/navigation';

  export default function ChannelList() {
    const pathname = usePathname();

    return (
      <ul>
        {channels.map(channel => {
          const isActive = pathname === `/app/channels/${channel.channelId}`;

          return (
            <li>
              <Link
                href={`/app/channels/${channel.channelId}`}
                className={`
                  block w-full px-3 py-2 rounded transition-colors
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
- Keyboard navigation (Phase 2):
  - Arrow Up/Down: Move focus between channels
  - Enter: Navigate to focused channel
  - Tab: Move to next section (DMs, Members)
- Styling (from UX spec):
  - Active: Gray 300 background, 3px Primary Brand left border, font-weight 600
  - Hover: Gray 200 background
  - Default: Transparent

**Estimated Effort:** 1 hour
