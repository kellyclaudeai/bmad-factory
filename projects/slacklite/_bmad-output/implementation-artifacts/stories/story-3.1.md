# Story 3.1: Create App Layout with Sidebar

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Build main app layout with persistent sidebar (channels, DMs, members) and main content area (message view). Desktop-first responsive design with proper spacing and background colors.

**Acceptance Criteria:**
- [ ] Create `app/app/layout.tsx` (App layout wrapping all `/app/*` routes)
- [ ] Layout structure: Sidebar (250px fixed width) + Main View (flex-grow)
- [ ] Sidebar background: Gray 100 (#F8F8F8)
- [ ] Main view background: White (#FFFFFF)
- [ ] Sidebar includes sections: Logo, Workspace Name, Channels, Direct Messages, Members
- [ ] Sidebar scrollable if content overflows
- [ ] Main view takes remaining height (h-screen)
- [ ] Responsive: Desktop (1024px+) shows sidebar, mobile (<768px) sidebar hidden (Epic 8 handles mobile)
- [ ] Component file: `components/layout/AppShell.tsx`

**Dependencies:**
dependsOn: ["1.1", "1.6", "2.8"]

**Technical Notes:**
- Layout structure (app/app/layout.tsx):
  ```tsx
  import AppShell from '@/components/layout/AppShell';

  export default function AppLayout({ children }: { children: ReactNode }) {
    return <AppShell>{children}</AppShell>;
  }
  ```
- AppShell component (components/layout/AppShell.tsx):
  ```tsx
  export default function AppShell({ children }: { children: ReactNode }) {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 flex flex-col overflow-y-auto">
          <div className="p-4">
            <h1 className="text-lg font-semibold">SlackLite</h1>
          </div>
          {/* Sections: Channels, DMs, Members */}
        </aside>

        {/* Main View */}
        <main className="flex-1 bg-white overflow-hidden">
          {children}
        </main>
      </div>
    );
  }
  ```
- Sidebar sections:
  - Logo: 16px padding, Body Regular (14px Semibold)
  - Workspace Name: Body Regular (14px Semibold), Gray 900
  - Section headers: Caption (12px), Gray 700, uppercase
  - Channel list: Placeholder for Story 3.2
  - DM list: Placeholder for Story 5.3
  - Member list: Placeholder for Story 5.1
- Responsive:
  - Desktop (1024px+): `flex` layout, sidebar visible
  - Mobile (<768px): Sidebar hidden, hamburger menu (Story 8.1)

**Estimated Effort:** 2 hours
