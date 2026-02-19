# Story 4.7: Display Messages in Message List

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Render messages in main view with author name, timestamp, and text. Use flat Slack-style design (no bubbles) with proper typography and spacing from UX design spec.

**Acceptance Criteria:**
- [ ] Create `components/features/messages/MessageList.tsx`
- [ ] Create `components/features/messages/MessageItem.tsx`
- [ ] MessageItem structure:
  - [ ] Line 1: Author name (14px Semibold, Gray 900) + Timestamp (13px, Gray 700, 8px left margin)
  - [ ] Line 2: Message text (16px, Gray 900, 4px top margin)
  - [ ] Border bottom: 1px solid Gray 300 (separator)
  - [ ] Padding: 12px vertical, 16px horizontal
- [ ] Timestamp format: Relative ("2 min ago", "Yesterday", "Jan 15")
- [ ] Word wrap: break-word for long messages
- [ ] Hover state: Gray 200 background (for future actions like copy)
- [ ] Accessible: Each message is <article> with aria-label="Message from {userName} at {timestamp}"

**Dependencies:**
dependsOn: ["4.6"]

**Technical Notes:**
- MessageList component:
  ```tsx
  import MessageItem from './MessageItem';

  export default function MessageList({ messages, loading, error }) {
    if (loading) {
      return <div className="flex items-center justify-center h-full"><Spinner /></div>;
    }

    if (error) {
      return <div className="text-error text-center p-4">Failed to load messages</div>;
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      );
    }

    return (
      <div className="overflow-y-auto p-4 space-y-1">
        {messages.map(message => (
          <MessageItem key={message.messageId} message={message} />
        ))}
      </div>
    );
  }
  ```
- MessageItem component:
  ```tsx
  import { formatRelativeTime } from '@/lib/utils/formatting';

  export default function MessageItem({ message }: { message: Message }) {
    return (
      <article
        className="py-3 px-4 border-b border-gray-300 hover:bg-gray-200 transition-colors"
        aria-label={`Message from ${message.userName} at ${formatRelativeTime(message.timestamp)}`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {message.userName}
          </span>
          <span className="text-xs text-gray-700">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        <p className="mt-1 text-base text-gray-900 break-words">
          {message.text}
        </p>
      </article>
    );
  }
  ```
- Timestamp formatting (lib/utils/formatting.ts):
  ```typescript
  import { Timestamp } from 'firebase/firestore';
  import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

  export function formatRelativeTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();

    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    if (now.getFullYear() === date.getFullYear()) {
      return format(date, 'MMM d');
    }

    return format(date, 'MMM d, yyyy');
  }
  ```
- Typography (from UX spec):
  - Author name: Body Regular (14px), Semibold (600), Gray 900
  - Timestamp: Body Small (13px), Regular (400), Gray 700
  - Message text: Body Large (16px), Regular (400), Gray 900
- Spacing:
  - Padding: 12px vertical, 16px horizontal
  - Gap between author and timestamp: 8px
  - Gap between lines: 4px

**Estimated Effort:** 2 hours
