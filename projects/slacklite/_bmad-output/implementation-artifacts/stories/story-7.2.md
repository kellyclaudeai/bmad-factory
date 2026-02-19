# Story 7.2: Add Infinite Scroll Trigger

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Detect when user scrolls to top of message list, automatically trigger pagination to load older messages using Intersection Observer.

**Acceptance Criteria:**
- [x] Top reached detection: detect when list top is visible (sentinel visibility; equivalent to `scrollTop === 0`)
- [x] Debounce: Prevent multiple simultaneous loads (use `useRef` to track loading state)
- [x] Trigger: Call `loadMore()` when top reached
- [x] Show loading indicator: "Loading older messages..." at top (Spinner + text)
- [x] Intersection Observer: Use sentinel div at top, trigger when visible (more performant)
- [x] Stop triggering when all messages loaded (hasMore = false)

**Dependencies:**
dependsOn: ["7.1"]

**Technical Notes:**
- Intersection Observer approach:
  ```tsx
  import { useRef, useEffect } from 'react';

  export default function MessageList({ channelId }) {
    const { messages, loadMore, hasMore, loadingMore } = useMessages(channelId);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!sentinelRef.current || !hasMore || loadingMore) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(sentinelRef.current);

      return () => {
        if (sentinelRef.current) {
          observer.unobserve(sentinelRef.current);
        }
      };
    }, [loadMore, hasMore, loadingMore]);

    return (
      <div className="overflow-y-auto">
        {/* Sentinel div at top */}
        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <div className="text-center py-2 text-gray-700">
            <Spinner size="small" /> Loading older messages...
          </div>
        )}

        {messages.map(message => (
          <MessageItem key={message.messageId} message={message} />
        ))}

        {!hasMore && messages.length > 50 && (
          <div className="text-center py-2 text-gray-500 text-sm">
            No more messages
          </div>
        )}
      </div>
    );
  }
  ```
- Alternative: Scroll event listener:
  ```tsx
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !loadingMore) {
      loadMore();
    }
  };

  <div onScroll={handleScroll}>...</div>
  ```
- Performance: Intersection Observer is more performant than scroll events

**Estimated Effort:** 2 hours

---

## Implementation Verification

**Status:** ✅ VERIFIED COMPLETE (2026-02-19 16:04 CST)

**Verified By:** Amelia (BMAD Developer)

### Implementation Details

All acceptance criteria have been verified as implemented in `components/features/messages/MessageList.tsx`:

1. **Top reached detection**: IntersectionObserver watches sentinel element (`listTopSentinelRef`)
2. **Debounce**: `loadMoreInFlightRef` prevents multiple simultaneous loads
3. **Trigger**: Calls `triggerLoadMore()` → `loadMore()` when sentinel is visible
4. **Show loading indicator**: Displays "Loading older messages..." at top when `loadingMore` is true
5. **Intersection Observer**: Uses sentinel div with threshold 0.1 (more performant than scroll events)
6. **Stop triggering**: Checks `hasMore` flag before triggering pagination

### Code Location

- **Component**: `components/features/messages/MessageList.tsx`
- **Hook**: `lib/hooks/useMessages.ts` (provides `loadMore`, `hasMore`, `loadingMore`)
- **Tests**: `tests/unit/components/MessageList.test.tsx` (7 tests passing)

### Test Results

```
✓ tests/unit/components/MessageList.test.tsx (7 tests) 340ms
```

All tests passing, including:
- Virtualization behavior
- Loading states
- Error handling
- Message rendering

### Notes

Implementation was already complete as part of Story 7.1 work. This verification confirms all Story 7.2 acceptance criteria are met and working correctly.

**Commit:** Previously implemented (bundled with pagination work)
