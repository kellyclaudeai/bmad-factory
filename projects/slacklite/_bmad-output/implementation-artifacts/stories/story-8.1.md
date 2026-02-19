# Story 8.1: Implement Responsive Sidebar (Hamburger Menu)

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Convert sidebar to overlay menu on mobile. Add hamburger menu icon in top bar, sidebar slides in from left on tap with smooth animations.

**Acceptance Criteria:**
- [x] Desktop (≥1024px): Sidebar always visible (250px fixed width)
- [x] Tablet (768-1023px): Sidebar collapsible, hamburger menu in top-left
- [x] Mobile (<768px): Sidebar hidden by default, hamburger menu in top-left
- [x] Hamburger icon: 3 horizontal lines (☰), 44x44px tap target
- [x] Tap hamburger → Sidebar slides in from left (280px width, covers main view)
- [x] Overlay: Semi-transparent backdrop (rgba(0,0,0,0.5))
- [x] Close: Tap outside sidebar or tap channel/DM (auto-close after selection)
- [x] Animation: 200ms slide transition (transform: translateX(-280px) → translateX(0))

**Dependencies:**
dependsOn: ["3.1"]

**Technical Notes:**
- Responsive sidebar with overlay:
  ```tsx
  import { useState } from 'react';

  export default function AppShell({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
      <div className="flex h-screen">
        {/* Hamburger menu (mobile/tablet only) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden w-11 h-11 flex items-center justify-center"
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Overlay (mobile/tablet) */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 w-70 bg-gray-100 transform transition-transform duration-200
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:w-64
          `}
        >
          <Sidebar onItemClick={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Main view */}
        <main className="flex-1 bg-white overflow-hidden">
          {children}
        </main>
      </div>
    );
  }
  ```
- Sidebar component with auto-close:
  ```tsx
  export default function Sidebar({ onItemClick }) {
    return (
      <div>
        <ChannelList onChannelClick={onItemClick} />
        <DMList onDMClick={onItemClick} />
        <MemberList />
      </div>
    );
  }
  ```
- Tailwind breakpoints:
  - `lg:`: 1024px and up (desktop)
  - Below 1024px: Mobile/tablet (hamburger menu)

**Estimated Effort:** 2-3 hours
