# Story 8.5: Test on Real Devices (iOS/Android)

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Comprehensive testing on real iOS and Android devices to ensure touch interactions, virtual keyboard, and responsive layouts work correctly with performance validation.

**Acceptance Criteria:**
- [x] Test on iOS Safari (iPhone 12+, iOS 15+):
  - [x] Virtual keyboard appears correctly
  - [x] Message input expands/contracts with keyboard
  - [x] Sidebar overlay works smoothly
  - [x] Swipe gestures work without conflicts
  - [x] Tap targets are accessible (44x44px minimum)
- [x] Test on Android Chrome (Pixel 5+, Android 12+):
  - [x] Virtual keyboard behavior
  - [x] Sidebar animations smooth
  - [x] Touch scrolling in message list
  - [x] No layout shifts on keyboard open
- [x] Test common scenarios:
  - [x] Send message with virtual keyboard
  - [x] Switch channels via sidebar
  - [x] Open/close sidebar with hamburger menu
  - [x] Scroll through 100+ messages
  - [x] Swipe gestures for sidebar
- [x] Performance validation:
  - [x] 60fps scrolling in message list
  - [x] <200ms tap response time
  - [x] No janky animations
- [x] Document device-specific issues in bug tracker

**Dependencies:**
dependsOn: ["8.1", "8.2", "8.3", "8.4"]

**Technical Notes:**
- Testing tools:
  - BrowserStack for remote device testing
  - Physical devices: iPhone 12+, Pixel 5+
  - Chrome DevTools mobile emulation (initial testing)
- Test checklist:
  ```markdown
  ## iOS Safari
  - [ ] Keyboard opens message input
  - [ ] Keyboard closes on send
  - [ ] Sidebar overlay slides smoothly
  - [ ] Swipe right opens sidebar
  - [ ] Swipe left closes sidebar
  - [ ] No scroll conflicts
  - [ ] Tap targets accessible

  ## Android Chrome
  - [ ] Keyboard behavior
  - [ ] Sidebar animations
  - [ ] Message list scrolling
  - [ ] Touch gestures
  - [ ] No layout issues
  ```
- Common issues to watch for:
  - iOS: viewport height changes with keyboard (use `vh` units carefully)
  - Android: Back button behavior (should close sidebar first)
  - Both: Touch event conflicts (scroll vs swipe)
- Performance monitoring:
  - Use Chrome DevTools Performance panel
  - Record during scrolling and animations
  - Check for dropped frames (<16ms per frame = 60fps)

**Estimated Effort:** 3 hours
