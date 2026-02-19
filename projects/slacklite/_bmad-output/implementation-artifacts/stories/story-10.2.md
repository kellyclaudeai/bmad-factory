# Story 10.2: Write Unit Tests for Core Functions

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Write comprehensive unit tests for core utility functions, hooks, and components using Vitest and React Testing Library with 80%+ coverage.

**Acceptance Criteria:**
- [x] Test `lib/utils/formatting.ts`: Timestamp formatting functions
- [x] Test `lib/utils/validation.ts`: Input validation functions
- [x] Test `lib/hooks/useChannels.ts`: Channel data fetching
- [x] Test `lib/hooks/useMessages.ts`: Message data fetching
- [x] Test `lib/hooks/useAuth.ts`: Authentication state management
- [x] Test `components/ui/Button.tsx`: Button variants and states
- [x] Test `components/ui/Input.tsx`: Input validation and errors
- [x] All tests pass: `pnpm test`
- [x] Coverage >80%: `pnpm test:coverage`

**Dependencies:**
dependsOn: ["10.1", "4.4", "3.5", "2.3"]

**Technical Notes:**
- Unit test example (tests/unit/utils/formatting.test.ts):
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { formatRelativeTime } from '@/lib/utils/formatting';
  import { Timestamp } from 'firebase/firestore';

  describe('formatRelativeTime', () => {
    it('formats recent timestamps as "X min ago"', () => {
      const now = Date.now();
      const twoMinutesAgo = Timestamp.fromMillis(now - 2 * 60 * 1000);
      expect(formatRelativeTime(twoMinutesAgo)).toMatch(/2 minutes? ago/);
    });

    it('formats today timestamps as "Today at HH:MM AM/PM"', () => {
      const now = Date.now();
      const twoHoursAgo = Timestamp.fromMillis(now - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toMatch(/Today at \d{1,2}:\d{2} (AM|PM)/);
    });

    it('formats yesterday timestamps as "Yesterday at HH:MM AM/PM"', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const timestamp = Timestamp.fromMillis(yesterday);
      expect(formatRelativeTime(timestamp)).toMatch(/Yesterday at \d{1,2}:\d{2} (AM|PM)/);
    });
  });
  ```
- Component test example (tests/unit/components/Button.test.tsx):
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { render, screen, fireEvent } from '@testing-library/react';
  import Button from '@/components/ui/Button';

  describe('Button', () => {
    it('renders with primary variant', () => {
      render(<Button variant="primary">Click me</Button>);
      const button = screen.getByText('Click me');
      expect(button).toHaveClass('bg-primary-brand');
    });

    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Click me</Button>);
      expect(screen.getByText('Click me')).toBeDisabled();
    });
  });
  ```
- Hook test example (tests/unit/hooks/useAuth.test.ts):
  ```typescript
  import { describe, it, expect, vi } from 'vitest';
  import { renderHook, waitFor } from '@testing-library/react';
  import { useAuth } from '@/lib/hooks/useAuth';

  vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
  }));

  describe('useAuth', () => {
    it('returns loading state initially', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.loading).toBe(true);
    });

    it('returns user after authentication', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.user).toBeDefined();
        expect(result.current.loading).toBe(false);
      });
    });
  });
  ```

**Estimated Effort:** 3 hours
