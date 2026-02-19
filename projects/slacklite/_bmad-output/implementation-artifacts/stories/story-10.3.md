# Story 10.3: Write Unit Tests for UI Components

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Test UI components (Button, Input, Modal, MessageItem, ChannelList) for rendering, interactions, and accessibility.

**Acceptance Criteria:**
- [x] Test `Button`:
  - [x] Renders with correct variant (Primary, Secondary, Destructive)
  - [x] Disabled state works
  - [x] onClick handler called
- [x] Test `Modal`:
  - [x] Renders with overlay
  - [x] ESC key closes
  - [x] Focus trap works (Tab cycles through elements)
- [x] Test `MessageItem`:
  - [x] Renders author, timestamp, text
  - [x] Formats timestamp correctly
  - [x] Handles long messages
- [x] Test `ChannelList`:
  - [x] Renders channels
  - [x] Highlights active channel
  - [x] Shows unread badges
- [x] Accessibility: Run axe-core tests on all components

**Estimated Effort:** 4 hours
