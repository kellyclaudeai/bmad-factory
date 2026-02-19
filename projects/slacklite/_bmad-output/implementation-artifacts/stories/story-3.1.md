# Story 3.1: Create App Layout with Sidebar

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Build the main application layout with a three-column structure: sidebar (channels/DMs), main content area (messages), and optional right panel. The sidebar should display the workspace name, channels list, DMs list, and integrate with the existing Header component from Story 2.6.

**Acceptance Criteria:**
- [x] Create `AppShell` component with 3-column layout structure (sidebar, content, optional right panel)
- [x] Build `Sidebar` component with:
  - [x] Workspace name display at top
  - [x] Channels section header
  - [x] DMs section header
  - [x] Uses design system components (Button, Badge, etc.)
- [x] Integrate with existing `Header` component from Story 2.6
- [x] Implement responsive design:
  - [x] Desktop: Fixed sidebar (240px width)
  - [x] Mobile: Collapsible sidebar with hamburger menu toggle
  - [x] Sidebar overlay on mobile when open
- [x] Create layout wrapper in `app/app/layout.tsx` using AppShell
- [x] Main content area takes remaining space
- [x] Smooth transitions for sidebar collapse/expand

**Dependencies:**
dependsOn: ["1.6", "2.8"]

**Technical Notes:**
- App layout structure:
  ```
  <AppShell>
    <Sidebar>
      <WorkspaceHeader />
      <ChannelsSection />
      <DMsSection />
    </Sidebar>
    <MainContent>
      <Header />  (from Story 2.6)
      {children}
    </MainContent>
  </AppShell>
  ```
- Sidebar component path: `components/layout/Sidebar.tsx`
- AppShell component path: `components/layout/AppShell.tsx`
- Use Tailwind for responsive breakpoints: `md:` prefix for desktop (768px+)
- Mobile: `fixed` positioning with `z-50` for overlay, `translate-x-full` for hidden state
- Desktop: `flex` layout with sidebar as `flex-none w-60` (240px)
- State management: useState for sidebar collapsed state
- Integrate Header component from `components/layout/Header.tsx` (Story 2.6)
- Design system usage:
  - Button component for "+ New Channel", "+ New DM"
  - Badge component for unread counts (placeholder for now)
  - Avatar component for workspace icon (optional)

**Architecture Reference:**
See Section 5.1 (Next.js App Router Structure) and Section 5.3 (Component Patterns) in architecture.md

**Estimated Effort:** 2 hours
