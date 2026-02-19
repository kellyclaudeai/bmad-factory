# Story 8.4: Implement Mobile-Friendly Navigation Bar

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Create mobile-specific top navigation bar with hamburger menu, channel name, and action buttons optimized for touch with proper spacing.

**Acceptance Criteria:**
- [ ] Mobile top bar: 56px height, fixed position
- [ ] Left: Hamburger menu (☰) 44x44px tap target
- [ ] Center: Current channel/DM name (truncate if too long)
- [ ] Right: Settings/actions icon (⚙) 44x44px tap target
- [ ] Background: White, 1px bottom border (Gray 300)
- [ ] Z-index: Above message list (sticky header)
- [ ] Hide on desktop (≥1024px, channel name in sidebar)
- [ ] Tap hamburger: Open sidebar overlay
- [ ] Tap settings: Open settings modal

**Dependencies:**
dependsOn: ["3.1", "3.3"]

**Technical Notes:**
- Mobile navigation bar:
  ```tsx
  import { usePathname } from 'next/navigation';

  export default function MobileNavBar({ onMenuClick }) {
    const pathname = usePathname();
    const { channels } = useChannels();
    const { dms } = useDirectMessages();

    // Get current channel/DM name from URL
    const currentChannelId = pathname.split('/channels/')[1];
    const currentDMId = pathname.split('/dms/')[1];

    const currentChannel = channels.find(c => c.channelId === currentChannelId);
    const currentDM = dms.find(d => d.dmId === currentDMId);

    const title = currentChannel
      ? `# ${currentChannel.name}`
      : currentDM
      ? currentDM.otherUserName
      : 'SlackLite';

    return (
      <nav className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-300 flex items-center justify-between px-4 z-10">
        <button
          onClick={onMenuClick}
          className="w-11 h-11 flex items-center justify-center"
          aria-label="Open menu"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold truncate flex-1 text-center">
          {title}
        </h1>

        <button
          onClick={() => {/* Open settings */}}
          className="w-11 h-11 flex items-center justify-center"
          aria-label="Settings"
        >
          ⚙
        </button>
      </nav>
    );
  }
  ```
- Layout with mobile nav:
  ```tsx
  export default function AppShell({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <div className="h-screen flex flex-col">
        <MobileNavBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="flex flex-1 overflow-hidden pt-14 lg:pt-0">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  }
  ```
- Mobile-specific considerations:
  - Fixed top bar (stays visible during scroll)
  - 44x44px minimum tap targets
  - Title truncates with ellipsis if too long

**Estimated Effort:** 2 hours
