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
