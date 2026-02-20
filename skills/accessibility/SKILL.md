---
name: accessibility
description: >
  WCAG 2.1 AA compliance for web applications. Use when designing prototypes,
  writing acceptance criteria for UI stories, implementing interactive components,
  or QA-testing pages for accessibility. Covers semantic HTML, color contrast,
  keyboard navigation, focus management, ARIA patterns, forms, and screen reader support.
---

# Web Accessibility — WCAG 2.1 AA

## Non-Negotiable Rules

These are hard requirements. Every UI story and prototype must meet them.

### 1. Semantic HTML First

```html
<!-- ❌ -->
<div onclick="submit()">Submit</div>
<span class="link" onclick="go()">Next</span>

<!-- ✅ -->
<button type="submit">Submit</button>
<a href="/next">Next</a>
```

- `<button>` for actions, `<a>` for navigation — no exceptions
- Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` landmarks
- One `<h1>` per page. Never skip heading levels (h1 → h3 ❌)
- Every `<img>` needs `alt` (descriptive) or `alt=""` (decorative)

### 2. Color Contrast

| Element | Minimum Ratio |
|---|---|
| Normal text (< 18pt) | **4.5:1** |
| Large text (≥ 18pt / ≥ 14pt bold) | **3:1** |
| UI components, focus indicators | **3:1** |

**Safe dark text on light bg:** `#374151` (gray-700) or darker
**Safe light text on dark bg:** `#f9fafb` (gray-50) or lighter

Common failures:
- `#9ca3af` on white → 2.9:1 ❌
- `#ef4444` on white → 3.3:1 ❌ (use `#b91c1c` → 6.2:1)
- `#14b8a6` (teal) on white → 2.8:1 ❌

### 3. Keyboard Navigation

- All interactive elements reachable via Tab
- Visible focus indicator on every focusable element
- Never `outline: none` without a replacement
- Use `:focus-visible` (shows on keyboard only, not click)
- Escape closes dialogs/modals
- Focus trap inside open modals
- Focus returns to trigger element when modal closes
- No `tabindex` > 0 (breaks natural order)

```css
/* ❌ */
button:focus { outline: none; }

/* ✅ */
button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### 4. Touch Targets

- Minimum **44×44px** for all interactive elements on mobile
- Applies to: buttons, links, form controls, icons
- Ghost/icon buttons need padding even if the icon is 16px

### 5. Forms

- Every `<input>` needs a visible `<label>` with matching `for`/`id`
- Placeholders are NOT labels
- Required fields: `aria-required="true"` + visual indicator
- Errors: `aria-invalid="true"` + `aria-describedby` pointing to error message
- Error messages: `role="alert"` for screen reader announcement

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">Enter a valid email</span>
```

### 6. ARIA — Use Sparingly

- No ARIA is better than bad ARIA
- Never add `role="button"` to a `<button>` (already has it)
- Never `aria-hidden="true"` on focusable elements
- `aria-label` only when visible text isn't possible
- `aria-live="polite"` for dynamic content updates (toasts, counters)
- `role="alert"` for urgent errors

### 7. Motion and Animation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Always respect `prefers-reduced-motion`
- No auto-playing video/audio without controls

---

## Acceptance Criteria Checklist (for Story Writers)

When writing stories with UI components, include relevant items:

- [ ] All interactive elements use semantic HTML (`button`, `a`, `select`)
- [ ] Color contrast meets minimums (4.5:1 text, 3:1 UI)
- [ ] Keyboard-navigable: Tab, Enter/Space, Escape
- [ ] Focus indicators visible
- [ ] Form inputs have visible labels
- [ ] Error states are announced to screen readers
- [ ] Touch targets ≥ 44×44px
- [ ] Images have alt text
- [ ] Heading hierarchy is logical
- [ ] `prefers-reduced-motion` respected for animations

---

## QA Testing Checklist (for Testers)

### Keyboard Test (2 min)
1. Tab through entire page — can you reach everything?
2. Press Enter/Space on buttons — do they activate?
3. Open a dialog → Tab stays trapped inside?
4. Press Escape → dialog closes, focus returns to trigger?

### Visual Test (2 min)
1. Focus indicators visible on every interactive element?
2. Text readable without squinting? (contrast check)
3. Touch targets large enough on mobile?
4. Color not the only indicator of state? (error = icon + text + color)

### Screen Reader Quick Check (3 min)
1. Headings navigable (VoiceOver: VO+Cmd+H)
2. Landmarks present (main, nav, footer)
3. Images have alt text read aloud
4. Form labels announced when focusing inputs
5. Dynamic content changes announced (toasts, errors)

### Automated (1 min)
Run axe DevTools browser extension — fix all violations.

---

## Prototype Design Rules (for Designers)

- Pick colors that meet contrast ratios from the start
- Design focus states — don't leave them to developers
- Design error states with icon + text (not color alone)
- Include mobile tap target sizing in mockups
- Show keyboard interaction patterns (how does Tab work here?)
- Design `prefers-reduced-motion` variant for heavy animation
- Always provide a visible label for form fields in the design

---

## Common Fixes Quick Reference

| Problem | Fix |
|---|---|
| `<div onclick>` | → `<button>` |
| `outline: none` | → `:focus-visible` custom outline |
| Placeholder as label | → Add `<label>` |
| `#999` text on white | → `#595959` or darker |
| 24px icon button | → Add padding to reach 44px tap target |
| Heading skip (h1→h3) | → Use h2 |
| Color-only error | → Add icon + `role="alert"` text |
| Missing alt | → Descriptive `alt` or `alt=""` if decorative |
| Positive tabindex | → Remove, use DOM order |
| No skip link | → Add `<a href="#main">Skip to content</a>` |
