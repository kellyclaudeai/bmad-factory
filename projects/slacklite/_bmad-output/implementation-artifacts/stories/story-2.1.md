# Story 2.1: Create Landing Page

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Build static landing page with hero section, product pitch, and CTAs for Sign Up / Sign In. Server-side rendered for SEO optimization with SlackLite brand positioning.

**Acceptance Criteria:**
- [x] Create `app/(marketing)/page.tsx` (Server Component for SEO)
- [x] Hero section: "Lightweight Team Messaging" headline, "Slack's simplicity. None of the bloat." subtitle
- [x] Primary CTA button: "Get Started Free" → links to `/signup`
- [x] Secondary CTA button: "Sign In" → links to `/signin`
- [x] Header with logo ("SlackLite") and auth buttons (Sign In, Sign Up)
- [x] Features section (3-column grid): Real-Time Messages, Simple Setup, Free to Start
- [x] Footer with About, Privacy, Terms links (placeholder pages)
- [x] Fully responsive (desktop + mobile breakpoints)
- [x] Meta tags for SEO (title, description, Open Graph)

**Dependencies:**
dependsOn: ["1.1", "1.6"]

**Technical Notes:**
- URL: `/` (root)
- Server Component (default in App Router): No 'use client' needed
- Layout structure (from UX spec):
  - Header: 64px height, fixed top, white background
  - Hero: Centered, H1 (32px Bold), subtitle Body Large (16px)
  - Primary CTA: 48px height, Primary Brand background
  - Features: 3-column grid (desktop), 1-column stack (mobile)
  - Footer: Gray 100 background, Body Small text
- Meta tags (next/head):
  ```typescript
  export const metadata = {
    title: 'SlackLite - Lightweight Team Messaging',
    description: 'Slack's simplicity. None of the bloat. Real-time messaging for small teams.',
    openGraph: {
      title: 'SlackLite',
      description: 'Lightweight team messaging',
      url: 'https://slacklite.app',
      type: 'website',
    },
  };
  ```
- Responsive breakpoints:
  - Desktop: 1024px+
  - Mobile: <768px

**Estimated Effort:** 2 hours
