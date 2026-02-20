# Fluid Layouts and Typography

## The clamp() Function

```css
/* clamp(minimum, preferred, maximum) */
.heading { font-size: clamp(1.5rem, 5vw, 3rem); }

/* Precise formula: scales from 16px (320px viewport) to 24px (1200px viewport) */
/* slope = (24-16)/(1200-320) = 0.00909 */
/* y-intercept = 16 - 0.00909*320 = 0.818rem */
.text { font-size: clamp(1rem, 0.818rem + 0.909vw, 1.5rem); }
```

## Complete Type Scale

```css
:root {
  --text-xs:   clamp(0.75rem,  0.7rem + 0.25vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem,     0.9rem + 0.5vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl:   clamp(1.25rem,  1.1rem + 0.75vw, 1.5rem);
  --text-2xl:  clamp(1.5rem,   1.2rem + 1.5vw, 2rem);
  --text-3xl:  clamp(1.875rem, 1.4rem + 2.375vw, 2.5rem);
  --text-4xl:  clamp(2.25rem,  1.5rem + 3.75vw, 3.5rem);
  --text-5xl:  clamp(3rem,     1.8rem + 6vw, 5rem);
}

h1 { font-size: var(--text-4xl); line-height: 1.25; }
h2 { font-size: var(--text-3xl); line-height: 1.25; }
h3 { font-size: var(--text-2xl); line-height: 1.25; }
body { font-size: var(--text-base); line-height: 1.5; }
```

## Fluid Spacing Scale

```css
:root {
  --space-3xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem);
  --space-2xs: clamp(0.375rem, 0.3rem + 0.375vw, 0.5rem);
  --space-xs:  clamp(0.5rem,  0.4rem + 0.5vw, 0.75rem);
  --space-sm:  clamp(0.75rem, 0.6rem + 0.75vw, 1rem);
  --space-md:  clamp(1rem,    0.8rem + 1vw, 1.5rem);
  --space-lg:  clamp(1.5rem,  1.2rem + 1.5vw, 2rem);
  --space-xl:  clamp(2rem,    1.5rem + 2.5vw, 3rem);
  --space-2xl: clamp(3rem,    2rem + 5vw, 5rem);
  --space-3xl: clamp(4rem,    2.5rem + 7.5vw, 8rem);
}
```

## Container Widths

```css
:root {
  --container-xs:  min(100% - 2rem, 20rem);
  --container-sm:  min(100% - 2rem, 30rem);
  --container-md:  min(100% - 2rem, 45rem);
  --container-lg:  min(100% - 2rem, 65rem);
  --container-xl:  min(100% - 3rem, 80rem);
  --container-2xl: min(100% - 4rem, 96rem);
}

.container { width: var(--container-lg); margin-inline: auto; }
.prose     { max-width: var(--container-md); }
.full-bleed { width: 100vw; margin-inline: calc(-50vw + 50%); }
```

## CSS Grid Fluid Layouts

```css
/* Auto-fit: wraps naturally */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: var(--space-md);
}

/* Content with sidebar */
.content-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-lg); }
@media (min-width: 768px) {
  .content-grid { grid-template-columns: 1fr min(300px, 30%); }
}
```

## Flexbox Fluid Patterns

```css
/* Sidebar that collapses when too narrow */
.with-sidebar { display: flex; flex-wrap: wrap; gap: var(--space-lg); }
.with-sidebar > :first-child { flex-basis: 300px; flex-grow: 1; }
.with-sidebar > :last-child  { flex-basis: 0; flex-grow: 999; min-width: 60%; }

/* Cluster */
.cluster { display: flex; flex-wrap: wrap; gap: var(--space-sm); align-items: center; }

/* Switcher: horizontal → vertical based on container */
.switcher { display: flex; flex-wrap: wrap; gap: var(--space-md); }
.switcher > * { flex-grow: 1; flex-basis: calc((30rem - 100%) * 999); }
```

## Intrinsic Sizing

```css
.button { width: fit-content; min-width: 8rem; padding-inline: var(--space-md); }
.tag    { width: fit-content; padding: var(--space-2xs) var(--space-xs); }
.modal  { width: min(90vw, 600px); max-height: min(90vh, 800px); }

/* min() and max() */
.container { width: min(90%, 1200px); margin-inline: auto; }
.hero-text  { font-size: max(2rem, min(5vw, 4rem)); }
```

## Viewport Units (Modern)

```css
.full-height { min-height: 100dvh; } /* Dynamic - accounts for mobile browser UI */
.hero        { min-height: 100svh; } /* Small viewport */
.backdrop    { height: 100lvh; }     /* Large viewport */

/* NEVER use bare 100vh on mobile — use 100dvh or 100svh */

/* Safe area insets for notched devices */
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}
```

## Type Scale Generator (JS)

```javascript
function fluidType({ minFontSize, maxFontSize, minViewport = 320, maxViewport = 1200 }) {
  const minRem = minFontSize / 16, maxRem = maxFontSize / 16;
  const minVpRem = minViewport / 16, maxVpRem = maxViewport / 16;
  const slope = (maxRem - minRem) / (maxVpRem - minVpRem);
  const intercept = minRem - slope * minVpRem;
  return `clamp(${minRem}rem, ${intercept.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxRem}rem)`;
}
```

## Resources

- [Utopia Fluid Type Calculator](https://utopia.fyi/)
- [Every Layout](https://every-layout.dev/)
- [Modern Fluid Typography](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
