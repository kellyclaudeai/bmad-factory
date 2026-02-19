# Story 8.5: Test on Real Devices (iOS/Android)

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Comprehensive testing on real iOS and Android devices to ensure touch interactions, virtual keyboard, and responsive layouts work correctly with performance validation.

**Acceptance Criteria:**
- [ ] Test on iOS Safari (iPhone 12+, iOS 15+):
  - [ ] Virtual keyboard appears correctly
  - [ ] Message input expands/contracts with keyboard
  - [ ] Sidebar overlay works smoothly
  - [ ] Swipe gestures work without conflicts
  - [ ] Tap targets are accessible (44x44px minimum)
- [ ] Test on Android Chrome (Pixel 5+, Android 12+):
  - [ ] Virtual keyboard behavior
  - [ ] Sidebar animations smooth
  - [ ] Touch scrolling in message list
  - [ ] No layout shifts on keyboard open
- [ ] Test common scenarios:
  - [ ] Send message with virtual keyboard
  - [ ] Switch channels via sidebar
  - [ ] Open/close sidebar with hamburger menu
  - [ ] Scroll through 100+ messages
  - [ ] Swipe gestures for sidebar
- [ ] Performance validation:
  - [ ] 60fps scrolling in message list
  - [ ] <200ms tap response time
  - [ ] No janky animations
- [ ] Document device-specific issues in bug tracker

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
