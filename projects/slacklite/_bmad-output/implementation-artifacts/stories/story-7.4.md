# Story 7.4: Add Timestamp Formatting Helpers

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Create utility functions for relative timestamps ("2 min ago", "Yesterday", "Jan 15"). Use throughout app (messages, sidebar, tooltips) with consistent formatting.

**Acceptance Criteria:**
- [ ] Install: `pnpm add date-fns`
- [ ] Create `lib/utils/formatting.ts`
- [ ] Function: `formatRelativeTime(timestamp: Timestamp): string`
- [ ] Logic:
  - [ ] <1 hour: "X min ago" (e.g., "2 min ago")
  - [ ] <24 hours: "Today at HH:MM AM/PM" (e.g., "Today at 2:45 PM")
  - [ ] Yesterday: "Yesterday at HH:MM AM/PM"
  - [ ] <7 days: "Monday at HH:MM AM/PM"
  - [ ] Older: "Jan 15" or "Jan 15, 2026" (include year if different)
- [ ] Use in MessageItem, DM list, channel list (lastMessageAt)
- [ ] Update every minute (useEffect interval) for "X min ago" to stay current

**Dependencies:**
dependsOn: ["4.7"]

**Technical Notes:**
- Timestamp formatting utility (lib/utils/formatting.ts):
  ```typescript
  import { Timestamp } from 'firebase/firestore';
  import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

  export function formatRelativeTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();

    // Within last hour: "2 min ago"
    if (now.getTime() - date.getTime() < 3600000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    // Today: "Today at 2:45 PM"
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }

    // Yesterday: "Yesterday at 2:45 PM"
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    // This week: "Monday at 2:45 PM"
    if (isThisWeek(date)) {
      return format(date, "EEEE 'at' h:mm a");
    }

    // This year: "Jan 15"
    if (now.getFullYear() === date.getFullYear()) {
      return format(date, 'MMM d');
    }

    // Different year: "Jan 15, 2026"
    return format(date, 'MMM d, yyyy');
  }
  ```
- Usage in MessageItem:
  ```tsx
  import { formatRelativeTime } from '@/lib/utils/formatting';

  export default function MessageItem({ message }) {
    return (
      <div>
        <span className="text-gray-700">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    );
  }
  ```
- Auto-update timestamps (optional):
  ```tsx
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1); // Force re-render every minute
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  ```

**Estimated Effort:** 1-2 hours
