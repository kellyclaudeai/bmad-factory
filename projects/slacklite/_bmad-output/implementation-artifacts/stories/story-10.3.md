# Story 10.3: Write Unit Tests for UI Components

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Test UI components (Button, Input, Modal, MessageItem, ChannelList) for rendering, interactions, and accessibility.

**Acceptance Criteria:**
- [ ] Test `Button`:
  - [ ] Renders with correct variant (Primary, Secondary, Destructive)
  - [ ] Disabled state works
  - [ ] onClick handler called
- [ ] Test `Modal`:
  - [ ] Renders with overlay
  - [ ] ESC key closes
  - [ ] Focus trap works (Tab cycles through elements)
- [ ] Test `MessageItem`:
  - [ ] Renders author, timestamp, text
  - [ ] Formats timestamp correctly
  - [ ] Handles long messages
- [ ] Test `ChannelList`:
  - [ ] Renders channels
  - [ ] Highlights active channel
  - [ ] Shows unread badges
- [ ] Accessibility: Run axe-core tests on all components

**Estimated Effort:** 4 hours
