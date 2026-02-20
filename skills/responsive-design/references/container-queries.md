# Container Queries Deep Dive

## Overview

Container queries enable component-based responsive design by allowing elements to respond to their container's size rather than the viewport. This paradigm shift makes truly reusable components possible.

## Browser Support

Container queries have excellent modern browser support (Chrome 105+, Firefox 110+, Safari 16+). For older browsers, provide graceful fallbacks.

## Containment Basics

### Container Types

```css
/* Size containment - queries based on inline and block size */
.container { container-type: size; }

/* Inline-size containment - queries based on inline (width) size only */
/* Most common and recommended */
.container { container-type: inline-size; }

/* Normal - style queries only, no size queries */
.container { container-type: normal; }
```

### Named Containers

```css
/* Named container for targeted queries */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Shorthand */
.card-wrapper { container: card / inline-size; }

/* Query specific container */
@container card (min-width: 400px) {
  .card-content { display: flex; }
}
```

## Container Query Syntax

```css
.container { container-type: inline-size; }

@container (min-width: 300px) { .element { /* styles */ } }
@container (max-width: 500px) { .element { /* styles */ } }
@container (300px <= width <= 600px) { .element { /* styles */ } }

/* AND / OR / NOT */
@container (min-width: 400px) and (max-width: 800px) { }
@container (max-width: 300px) or (min-width: 800px) { }
@container not (min-width: 400px) { }
```

## Container Query Units

```css
.element {
  width: 50cqw;        /* 1cqw = 1% of container width */
  height: 50cqh;       /* 1cqh = 1% of container height */
  padding-inline: 5cqi; /* 1cqi = 1% of container inline size */
  padding-block: 3cqb;  /* 1cqb = 1% of container block size */
  font-size: 5cqmin;   /* smaller of cqi/cqb */
  margin: 2cqmax;      /* larger of cqi/cqb */
}

/* Fluid typography based on container */
.card-title { font-size: clamp(1rem, 4cqi, 2rem); }
.card-body  { padding: clamp(0.75rem, 4cqi, 1.5rem); }
```

## Style Queries

```css
.card { --layout: stack; }

@container style(--layout: stack) {
  .card-content { display: flex; flex-direction: column; }
}
@container style(--layout: inline) {
  .card-content { display: flex; flex-direction: row; }
}

.card.horizontal { --layout: inline; }
```

## Practical Patterns

### Responsive Card

```css
.card-container { container: card / inline-size; }

.card {
  display: flex; flex-direction: column;
  gap: 1rem; padding: clamp(1rem, 4cqi, 2rem);
}

@container card (min-width: 400px) {
  .card { flex-direction: row; align-items: flex-start; }
  .card-image { width: 40%; aspect-ratio: 1; }
  .card-content { flex: 1; }
}

@container card (min-width: 600px) {
  .card-image { width: 250px; }
  .card-title { font-size: 1.5rem; }
}
```

### Dashboard Widget

```css
.widget-container { container: widget / inline-size; }

.widget-stats { display: grid; grid-template-columns: 1fr; gap: 0.5rem; }

@container widget (min-width: 300px) {
  .widget-stats { grid-template-columns: repeat(2, 1fr); }
}
@container widget (min-width: 500px) {
  .widget-stats { grid-template-columns: repeat(4, 1fr); }
}
```

### Nav: Icon-only → Icon+Label

```css
.nav-container { container: nav / inline-size; }
.nav-link-text { display: none; }

@container nav (min-width: 200px) {
  .nav-link-text { display: block; }
}
@container nav (min-width: 600px) {
  .nav { flex-direction: row; }
}
```

## Tailwind CSS Integration

```tsx
// tailwind.config.js: plugins: [require("@tailwindcss/container-queries")]

function Card({ title, image, description }) {
  return (
    <div className="@container">
      <article className="flex flex-col @md:flex-row @md:gap-4">
        <img className="w-full @md:w-48 @lg:w-64 aspect-video @md:aspect-square object-cover rounded-lg" />
        <div className="p-4 @md:p-0">
          <h2 className="text-lg @md:text-xl @lg:text-2xl font-semibold">{title}</h2>
        </div>
      </article>
    </div>
  )
}

// Named containers
function Dashboard() {
  return (
    <div className="@container/main">
      <aside className="@container/sidebar">
        <nav className="flex flex-col @lg/sidebar:flex-row" />
      </aside>
      <main className="@lg/main:grid @lg/main:grid-cols-2" />
    </div>
  )
}
```

## Fallbacks

```css
@supports (container-type: inline-size) {
  .card-container { container-type: inline-size; }
  @container (min-width: 400px) {
    .card { flex-direction: row; }
  }
}
```

## Performance

- Prefer `inline-size` over `size` — less expensive
- Don't nest containers unnecessarily
- Place containment at component wrapper, not deep inside

## Resources

- [MDN Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [Ahmad Shadeed: Container Queries Guide](https://ishadeed.com/article/container-queries-are-finally-here/)
