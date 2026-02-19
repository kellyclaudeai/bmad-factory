# Story 7.5: Handle Long Messages with Truncation

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Truncate very long messages (>2000 characters) with "Show more" link. Full text revealed on click for better UI performance.

**Acceptance Criteria:**
- [x] MessageItem: Check if `text.length > 2000`
- [x] If >2000: Show first 2000 chars + "... Show more" link (Primary Brand color)
- [x] Click "Show more" → reveal full text, replace with "Show less" link
- [x] State: `useState<boolean>(isExpanded)` per message
- [x] Collapsed by default (prevent UI clutter)
- [x] Accessibility: Keyboard accessible (Tab + Enter to toggle)

**Dependencies:**
dependsOn: ["4.7"]

**Technical Notes:**
- MessageItem with truncation:
  ```tsx
  import { useState } from 'react';

  export default function MessageItem({ message }: { message: Message }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isTruncated = message.text.length > 2000;

    const displayText = isTruncated && !isExpanded
      ? message.text.slice(0, 2000)
      : message.text;

    return (
      <article className="py-3 px-4 border-b border-gray-300">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{message.userName}</span>
          <span className="text-xs text-gray-700">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        <p className="mt-1 text-base break-words whitespace-pre-wrap">
          {displayText}
          {isTruncated && (
            <>
              {!isExpanded && '... '}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-brand hover:underline ml-1"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </>
          )}
        </p>
      </article>
    );
  }
  ```
- Styling:
  - "Show more" link: Primary Brand color, hover underline
  - Full text: whitespace-pre-wrap (preserve newlines)
  - word-break: break-word (prevent overflow)
- Accessibility:
  - Button element (not link) for toggling
  - aria-expanded attribute
  - Keyboard accessible (Tab + Enter)

**Estimated Effort:** 1 hour
