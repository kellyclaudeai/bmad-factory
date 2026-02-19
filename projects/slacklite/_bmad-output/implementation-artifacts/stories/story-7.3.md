# Story 7.3: Optimize Message List Rendering with Virtualization

**Epic:** Epic 7 - Message History & Pagination

**Description:**
Implement virtual scrolling (react-window) to render only visible messages. Reduces DOM nodes and memory usage for large channels with 10,000+ messages.

**Acceptance Criteria:**

- [x] Install: `pnpm add react-window`
- [x] Wrap MessageList in `FixedSizeList` or `VariableSizeList`
- [x] Render only visible messages (~10-20 DOM nodes regardless of total message count)
- [x] Estimate message height: 80px (adjust based on average)
- [x] Dynamic height support: Calculate actual height per message (for multi-line messages)
- [x] Scroll position maintained during pagination
- [x] Performance: 10,000 messages → <200MB memory, smooth scrolling (60fps)

**Dependencies:**
dependsOn: ["4.7"]

**Technical Notes:**

- react-window virtualization:

  ```tsx
  import { VariableSizeList as List } from "react-window";
  import { useRef, useEffect } from "react";

  export default function MessageList({ messages }) {
    const listRef = useRef<List>(null);
    const rowHeights = useRef<Record<string, number>>({});

    // Estimate row height (or measure dynamically)
    const getRowHeight = (index: number) => {
      const message = messages[index];
      return rowHeights.current[message.messageId] || 80; // Default 80px
    };

    // Measure actual height after render
    const setRowHeight = (messageId: string, height: number) => {
      if (rowHeights.current[messageId] !== height) {
        rowHeights.current[messageId] = height;
        listRef.current?.resetAfterIndex(0);
      }
    };

    const Row = ({ index, style }) => {
      const message = messages[index];
      const rowRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (rowRef.current) {
          setRowHeight(message.messageId, rowRef.current.getBoundingClientRect().height);
        }
      }, [message]);

      return (
        <div style={style} ref={rowRef}>
          <MessageItem message={message} />
        </div>
      );
    };

    return (
      <List
        ref={listRef}
        height={600} // Container height
        itemCount={messages.length}
        itemSize={getRowHeight}
        width="100%"
      >
        {Row}
      </List>
    );
  }
  ```

- Performance considerations:
  - Only 10-20 messages rendered in DOM at a time
  - Memory usage constant regardless of total message count
  - Smooth 60fps scrolling even with 10,000+ messages
- Trade-off: Adds library dependency, slightly more complex code

**Estimated Effort:** 2-3 hours
