# Story 4.8: Implement Auto-Scroll to Bottom

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Automatically scroll to bottom when new messages arrive (if user is already at bottom). Show "New messages" badge if user scrolled up with proper user control.

**Acceptance Criteria:**
- [ ] Detect scroll position: Check if scrollTop + clientHeight ≈ scrollHeight (within 100px of bottom)
- [ ] On new message:
  - [ ] If at bottom: Auto-scroll to bottom (`scrollIntoView` or `scrollTo`)
  - [ ] If scrolled up: Show "New messages ↓" badge (Primary Brand background, bottom-right corner, 32px height)
- [ ] Badge click: Scroll to bottom, hide badge
- [ ] Badge auto-hides when user manually scrolls to bottom
- [ ] Smooth scrolling: `behavior: 'smooth'` (optional, depends on UX preference)
- [ ] Works on initial load (scroll to bottom when channel first loaded)

**Dependencies:**
dependsOn: ["4.7"]

**Technical Notes:**
- Auto-scroll implementation:
  ```tsx
  import { useRef, useEffect, useState } from 'react';

  export default function MessageList({ messages }) {
    const messageListRef = useRef<HTMLDivElement>(null);
    const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);

    const isAtBottom = () => {
      if (!messageListRef.current) return false;
      const { scrollTop, clientHeight, scrollHeight } = messageListRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    };

    const scrollToBottom = (smooth = true) => {
      if (!messageListRef.current) return;
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setShowNewMessagesBadge(false);
    };

    // Handle new messages
    useEffect(() => {
      if (messages.length === 0) return;

      if (isAtBottom()) {
        scrollToBottom(true);
      } else {
        setShowNewMessagesBadge(true);
      }
    }, [messages]);

    // Scroll to bottom on initial load
    useEffect(() => {
      if (messages.length > 0) {
        scrollToBottom(false);
      }
    }, []);

    // Handle manual scroll
    const handleScroll = () => {
      if (isAtBottom()) {
        setShowNewMessagesBadge(false);
      }
    };

    return (
      <div className="relative flex-1">
        <div
          ref={messageListRef}
          onScroll={handleScroll}
          className="overflow-y-auto h-full"
        >
          {messages.map(message => (
            <MessageItem key={message.messageId} message={message} />
          ))}
        </div>

        {showNewMessagesBadge && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 bg-primary-brand text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-light transition-colors"
          >
            New messages ↓
          </button>
        )}
      </div>
    );
  }
  ```
- Badge styling (from UX spec):
  - Background: Primary Brand (#4A154B)
  - Text: White, Body Regular (14px), Semibold (600)
  - Position: Fixed bottom-right, 16px from bottom, 16px from right
  - Height: 32px
  - Border radius: 16px (pill shape)
  - Box shadow: 0 4px 12px rgba(0,0,0,0.15)
- Scroll behavior:
  - Smooth scrolling on new messages (if at bottom)
  - Instant scrolling on initial load (no animation)
  - Badge click: Smooth scroll to bottom
- Threshold: 100px from bottom = "at bottom" (prevents badge flickering)

**Estimated Effort:** 1-2 hours
