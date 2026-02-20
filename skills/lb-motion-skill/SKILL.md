---
name: motion
version: 1.0.0
description: >
  Motion.dev (formerly Framer Motion) animation library for React, JavaScript,
  and Vue. Use when adding animations, transitions, scroll effects, gesture
  interactions, layout animations, or AnimatePresence enter/exit animations
  to a web application.
author: Leonardo Balland
tags:
  - motion
  - animation
  - react
  - javascript
  - vue
  - framer-motion
  - transitions
  - gestures
  - scroll
  - spring
  - keyframes
read_when:
  - Working with Motion animations or Framer Motion
  - Implementing animations in React, Vue, or vanilla JavaScript
  - Creating scroll-linked or scroll-triggered animations
  - Building gesture-based interactions
  - Optimizing animation performance
  - Migrating from Framer Motion to Motion
---

# Motion.dev Documentation

Motion is a modern animation library for React, JavaScript, and Vue. It's the evolution of Framer Motion, offering:

- **Tiny size**: Just 2.3kb for the mini HTML/SVG version
- **High performance**: Hardware-accelerated animations
- **Flexible**: Animate HTML, SVG, WebGL, and JavaScript objects
- **Easy to use**: Intuitive API with smart defaults
- **Spring physics**: Natural, kinetic animations
- **Scroll animations**: Link values to scroll position
- **Gestures**: Drag, hover, tap, and more

## Quick Reference

### Installation

```bash
npm install motion
```

### Basic Animation

```javascript
import { animate } from "motion"

// Animate elements
animate(".box", { rotate: 360, scale: 1.2 })

// Spring animation
animate(element, { x: 100 }, { type: "spring", stiffness: 300 })

// Stagger multiple elements
animate("li", { opacity: 1 }, { delay: stagger(0.1) })
```

### React

```jsx
import { motion } from "motion/react"

<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2 }}
/>

// Enter/exit animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>

// Hover/tap gestures
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Scroll Animations

```javascript
import { scroll } from "motion"

scroll(animate(".box", { scale: [1, 2, 1] }))
```

```jsx
// React scroll
import { useScroll, useTransform } from "motion/react"

function Component() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  return <motion.div style={{ opacity }} />
}
```

### Layout Animations

```jsx
// Automatic layout transitions
<motion.div layout>
  {items.map(item => <motion.li key={item.id} layout>{item}</motion.li>)}
</motion.div>
```

### AnimatePresence (Mount/Unmount)

```jsx
import { AnimatePresence, motion } from "motion/react"

<AnimatePresence>
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    />
  )}
</AnimatePresence>
```

### Variants (Orchestration)

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i} variants={item}>{i}</motion.li>)}
</motion.ul>
```

### Transition Types

```javascript
// Tween (default)
{ duration: 0.3, ease: "easeOut" }
{ duration: 0.3, ease: [0.16, 1, 0.3, 1] } // Custom cubic bezier

// Spring
{ type: "spring", stiffness: 300, damping: 30 }
{ type: "spring", bounce: 0.25 }

// Inertia (drag)
{ type: "inertia", velocity: 50 }
```

## Documentation Structure

- `docs/quick-start.md` - Installation and first animation

## When to Use This Skill

- Implementing animations in web applications
- Optimizing animation performance
- Creating scroll-based effects
- Building interactive UI with gestures
- Migrating from Framer Motion to Motion

## Migration from Framer Motion

```bash
# framer-motion → motion
npm uninstall framer-motion
npm install motion

# Import change:
# import { motion } from "framer-motion"  →  import { motion } from "motion/react"
# All other APIs are backwards compatible
```

## Performance Tips

- Use `transform` and `opacity` for hardware-accelerated animations
- Avoid animating `width`/`height` — use `scaleX`/`scaleY` instead
- Use `will-change: transform` sparingly
- `layout` animations are expensive — use only when needed

## External Resources

- Official site: https://motion.dev
- GitHub: https://github.com/motiondivision/motion
- Examples: https://motion.dev/examples
