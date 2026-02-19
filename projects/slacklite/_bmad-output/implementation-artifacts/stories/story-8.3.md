# Story 8.3: Add Touch Gestures for Channel Navigation

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Add swipe gestures for mobile: Swipe right to open sidebar, swipe left to close sidebar with smooth animations and proper touch handling.

**Acceptance Criteria:**
- [x] Swipe right from left edge (< 50px): Open sidebar
- [x] Swipe left on open sidebar: Close sidebar
- [x] Touch threshold: >50px swipe distance to trigger
- [x] Animation follows finger during drag
- [x] Release: Complete animation if >50% across, otherwise snap back
- [x] No conflict with message list scrolling (vertical swipes)
- [x] Use touch events: touchstart, touchmove, touchend

**Dependencies:**
dependsOn: ["3.1"]

**Technical Notes:**
- Touch gesture handling:
  ```tsx
  import { useState, useRef } from 'react';

  export default function AppShell({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      // Swipe right from left edge: open sidebar
      if (isRightSwipe && touchStart < 50) {
        setIsSidebarOpen(true);
      }

      // Swipe left on open sidebar: close sidebar
      if (isLeftSwipe && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    return (
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex h-screen"
      >
        {/* Sidebar and main view */}
      </div>
    );
  }
  ```
- Alternative: Use a gesture library (e.g., react-use-gesture):
  ```tsx
  import { useSwipeable } from 'react-swipeable';

  const handlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    trackMouse: false, // Touch only
  });

  <div {...handlers}>...</div>
  ```
- Gesture detection rules:
  - Right swipe from left edge (<50px): Open sidebar
  - Left swipe anywhere: Close sidebar (if open)
  - Minimum distance: 50px
  - No interference with vertical scrolling

**Estimated Effort:** 2 hours
