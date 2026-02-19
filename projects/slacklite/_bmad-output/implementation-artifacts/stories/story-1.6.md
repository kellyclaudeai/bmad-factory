# Story 1.6: Create Design System Foundation in Tailwind

**Epic:** Epic 1 - Foundation

**Description:**
Configure Tailwind CSS with SlackLite design tokens (colors, typography, spacing from UX spec). Create reusable UI components (Button, Input, Modal) following design system specifications.

**Acceptance Criteria:**
- [ ] `tailwind.config.ts` includes design system colors (Primary Brand, Success, Error, Gray scale)
- [ ] Typography scale configured (fontFamily: Inter, fontSize: 12px-32px, fontWeight: 400-700)
- [ ] Spacing scale configured (base 4px unit, 1-12 scale)
- [ ] UI component library created in `components/ui/`:
  - [ ] `Button.tsx` (Primary, Secondary, Destructive variants)
  - [ ] `Input.tsx` (with error states, focus styles)
  - [ ] `Modal.tsx` (with overlay, focus trap, ESC to close)
  - [ ] `Badge.tsx` (for unread counts)
  - [ ] `Avatar.tsx` (with initials fallback)
- [ ] Storybook setup (optional for MVP) or test page at `/design-system` showing all components
- [ ] Components follow WCAG 2.1 AA contrast ratios (4.5:1 minimum)

**Dependencies:**
dependsOn: ["1.1"]

**Technical Notes:**
- Tailwind config (tailwind.config.ts):
  ```typescript
  export default {
    theme: {
      extend: {
        colors: {
          'primary-brand': '#4A154B',
          'primary-light': '#611F69',
          'primary-dark': '#350D36',
          'success': '#2EB67D',
          'error': '#E01E5A',
          'warning': '#ECB22E',
          'info': '#36C5F0',
          'gray-900': '#1D1C1D',
          'gray-800': '#2C2B2C',
          'gray-700': '#616061',
          'gray-600': '#868686',
          'gray-500': '#A0A0A0',
          'gray-400': '#D1D1D1',
          'gray-300': '#E8E8E8',
          'gray-200': '#F2F2F2',
          'gray-100': '#F8F8F8',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
  };
  ```
- Button component variants:
  - Primary: Primary Brand background, white text
  - Secondary: Transparent background, Gray 600 border
  - Destructive: Error background, white text
- Modal: Full-screen overlay, centered content, focus trap with Tab cycling
- Badge: Primary Brand background, white text, pill shape (border-radius: 10px)
- Avatar: 32px circle, Primary Brand gradient background, white initials

**Estimated Effort:** 3 hours
