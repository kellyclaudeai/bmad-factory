---
name: frontend-design
description: >
  Create distinctive, production-grade frontend interfaces that avoid generic AI
  aesthetics. Use when designing or building UI components, pages, layouts, or
  prototypes. Covers bold aesthetic direction, typography, color, spacing, motion,
  and interactive element contrast standards.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Interactive Element Standards (Non-Negotiable)

These apply regardless of aesthetic direction. Beautiful buttons that can't be seen aren't buttons.

### Contrast
- **Text on backgrounds**: minimum 4.5:1 (WCAG AA). Never use `--text-muted` or equivalent low-contrast tokens as the *default* color for interactive elements.
- **UI components** (borders, icons, focus rings): minimum 3:1. A border of `rgba(255,255,255,0.1)` on a dark surface fails. Use at least `rgba(255,255,255,0.3)` or a dedicated high-contrast border token.
- **Icon-only buttons**: icons must be at least `--text-secondary` at rest, never `--text-muted`. If an icon is invisible until hover, it's broken.

### Button resting state
- Every interactive button must have a **visible affordance at rest** — either a background color, a visible border, or sufficient icon contrast. `border: transparent` + `color: muted` = invisible button.
- Disabled states should look *inactive*, not invisible. Use reduced opacity on the whole element, not a color that blends into the background.

### Ghost / icon buttons
- Ghost buttons need a resting border. Use a dedicated `--border-button` token (e.g. `rgba(255,255,255,0.3)`) that clears the 3:1 UI component threshold.
- Icon buttons in tables or toolbars: default `color: var(--text-secondary)`, hover `color: var(--text-primary)` + background fill. Never transparent-on-transparent.

### Screenshot naming convention (for dashboard rendering)
When generating mockup screenshots for `design-assets.json`, always suffix filenames with `-mobile` or `-desktop`:
- `screens/home-mobile.png` — 390px viewport
- `screens/home-desktop.png` — 1440px viewport

The kelly-dashboard project details page splits designs into "Desktop Designs" and "Mobile Designs" sections using these suffixes. Wrong naming = designs won't appear in the correct section.

### URL generation
- **Never hardcode domain names** in generated links (invite URLs, share links, canonical references). Always use `window.location.origin` or an environment variable. Hardcoded domains break on staging, preview, and any deployment that isn't the final production domain.

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion (mandatory, not optional)**: Every web UI must have animations. Prioritize CSS-only for HTML prototypes. Use the Motion library (`skills/lb-motion-skill/`) for React — read it. Minimum baseline: staggered page load reveals, hover transitions on all interactive elements (150-200ms), route/modal entrance+exit via AnimatePresence. High-impact moments: scroll-triggered reveals, spring physics on cards/modals, hover states that surprise. A static, unanimated UI is an unfinished UI.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.