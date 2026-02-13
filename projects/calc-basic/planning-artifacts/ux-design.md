# UX Design: calc-basic

## Aesthetic Direction: Brutalist Precision
Bold geometric forms, stark black/white contrast, unapologetic typography, grid-based precision.

## Visual Specifications

### Typography
- Display Font: JetBrains Mono, weight 700, 48px
- Button Labels: JetBrains Mono, weight 600, 24px

### Color Palette
```css
:root {
  --primary-bg: #FFFFFF;
  --primary-fg: #000000;
  --display-bg: #000000;
  --display-fg: #FFFFFF;
  --accent-operation: #FF0000;
}
```

### Layout
- Container: 420px × 640px, black 4px border, centered
- Display: full width, 120px height, black bg, white text, right-aligned, 32px padding
- Button Grid: 4×5 grid, 100px × 100px buttons, 5px gaps
- Buttons: white bg, 2px black borders
- Hover: invert (black bg, white text)
- Operation buttons: red accent on hover

### Button Layout
```
┌─────┬─────┬─────┬─────┐
│  C  │  ÷  │  ×  │  -  │
├─────┼─────┼─────┼─────┤
│  7  │  8  │  9  │  +  │
├─────┼─────┼─────┼─────┤
│  4  │  5  │  6  │  +  │
├─────┼─────┼─────┼─────┤
│  1  │  2  │  3  │  =  │
├─────┼─────┼─────┼─────┤
│  0  │  0  │  .  │  =  │
└─────┴─────┴─────┴─────┘
```
(Zero button spans 2 columns, Equals button spans 2 rows on right)

### Responsive Behavior
- Desktop (>600px): Fixed 420px width, centered
- Mobile (<600px): Full width minus 32px margin, proportional button scaling, 64px+ touch targets
