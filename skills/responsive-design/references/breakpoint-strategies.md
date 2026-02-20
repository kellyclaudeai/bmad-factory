# Breakpoint Strategies

## Mobile-First Philosophy

Start with smallest screen, progressively enhance for larger.

```css
/* Base (mobile) */
.component { display: flex; flex-direction: column; padding: 1rem; }

/* Enhance for larger */
@media (min-width: 640px)  { .component { flex-direction: row; padding: 1.5rem; } }
@media (min-width: 1024px) { .component { padding: 2rem; } }
```

**Benefits:** Performance (mobile loads less CSS), progressive enhancement, content-first focus.

## Breakpoint Scales

### Tailwind CSS (recommended)

```css
@media (min-width: 640px)  { /* sm  - Large phones */ }
@media (min-width: 768px)  { /* md  - Tablets */ }
@media (min-width: 1024px) { /* lg  - Laptops */ }
@media (min-width: 1280px) { /* xl  - Desktops */ }
@media (min-width: 1536px) { /* 2xl - Large desktops */ }
```

### Minimalist (3 breakpoints)

```css
@media (min-width: 600px)  { /* medium */ }
@media (min-width: 1024px) { /* large */ }
```

## Content-Based Breakpoints

Set breakpoints where your *content* breaks, not device sizes.

```css
/* Bad: device-based */
@media (min-width: 768px) { /* "iPad breakpoint" */ }

/* Good: content-based */
@media (min-width: 50rem) {
  .layout { display: grid; grid-template-columns: 1fr 300px; }
}
```

## Design Token Integration

```css
:root {
  --bp-sm: 640px; --bp-md: 768px; --bp-lg: 1024px;
  --bp-xl: 1280px; --bp-2xl: 1536px;
}
```

```typescript
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 } as const;

function useBreakpoint() {
  const isLarge = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  return { isMobile: !isSmall, isDesktop: isLarge };
}
```

## Feature Queries

```css
@supports (display: grid) {
  .layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
}

@supports (container-type: inline-size) {
  .card-container { container-type: inline-size; }
  @container (min-width: 400px) { .card { flex-direction: row; } }
}
```

## Responsive Patterns

### Cards Grid

```css
/* Explicit breakpoints */
.cards { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
@media (min-width: 640px)  { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cards { grid-template-columns: repeat(3, 1fr); } }

/* Better: auto-fit */
.cards-auto {
  display: grid; gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}
```

### Hero Section

```css
.hero { min-height: 50vh; padding: var(--space-lg) var(--space-md); text-align: center; }
.hero-title    { font-size: clamp(2rem, 5vw + 1rem, 4rem); }
.hero-subtitle { font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem); }

@media (min-width: 768px) {
  .hero { min-height: 70vh; display: flex; align-items: center; text-align: left; }
  .hero-content { max-width: 60%; }
}
```

### Tables: Horizontal Scroll or Card Flip

```css
/* Horizontal scroll */
.table-container { overflow-x: auto; }
.responsive-table { min-width: 600px; }

/* Card flip on mobile */
@media (max-width: 639px) {
  .responsive-table thead { display: none; }
  .responsive-table tr { display: block; margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; }
  .responsive-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; }
  .responsive-table td::before { content: attr(data-label); font-weight: 600; }
}
```

## Preference Queries

```css
@media (prefers-color-scheme: dark)   { :root { --bg: #1a1a1a; --text: #f0f0f0; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
@media (prefers-contrast: high)       { :root { --text: #000; --bg: #fff; --border: #000; } }
@media (prefers-reduced-data: reduce) { .hero-video { display: none; } }
```

## Print Styles

```css
@media print {
  .nav, .sidebar, .footer, .ads { display: none; }
  * { background: white !important; color: black !important; }
  h1, h2, h3 { page-break-after: avoid; }
  img, table { page-break-inside: avoid; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
}
```

## Testing

```javascript
// Playwright breakpoint testing
async function testBreakpoints(page, breakpoints) {
  for (const [name, width] of Object.entries(breakpoints)) {
    await page.setViewportSize({ width, height: 800 });
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    console.log(`${name} (${width}px): overflow=${hasOverflow}`);
  }
}
```

## Rules

- ✅ Mobile-first (min-width queries)
- ✅ Content-based breakpoints
- ✅ Prefer `clamp()` + auto-fit over manual breakpoints
- ❌ Don't use device-specific breakpoints
- ❌ Don't use max-width queries as primary strategy

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Modern CSS Solutions](https://moderncss.dev/)
- [Defensive CSS](https://defensivecss.dev/)
