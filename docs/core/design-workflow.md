# Design Workflow — frontend-design Skill

## Overview

Sally creates **visual HTML prototypes** using the `frontend-design` skill. These prototypes define the aesthetic direction for the project and serve as implementation reference for Bob's stories and Amelia's code.

**Flow:**
```
John (PRD) → Sally (ux-design.md + HTML prototypes) → Bob (stories with design_references) → Amelia (implements matching prototypes)
```

No Figma account required. No external design tools. Sally generates the designs herself.

---

## What Sally Produces

After writing `ux-design.md`, Sally uses the `frontend-design` skill to produce:

```
_bmad-output/
  planning-artifacts/
    ux-design.md              # text spec (user flows, components, requirements)
  design-assets/
    screens/
      home.html               # self-contained HTML prototype per screen
      detail.html
      ...
    images/
      screens/
        home.png              # screenshot of each HTML prototype
        detail.png
    design-tokens.json        # colors, fonts, spacing, aesthetic direction
  design-assets.json          # index: screen → image path + prototype path
```

### design-assets.json schema
```json
{
  "aesthetic": "one-line description of the visual direction",
  "screens": {
    "home": "screens/home.png",
    "detail": "screens/detail.png"
  },
  "prototypes": {
    "home": "screens/home.html",
    "detail": "screens/detail.html"
  },
  "tokens": "design-tokens.json"
}
```

---

## What Bob Does with Design Assets

Bob reads `_bmad-output/design-assets.json` before writing stories. For every UI story, he adds:

```yaml
design_references:
  prototype: "_bmad-output/design-assets/screens/home.html"
  screenshot: "screens/home.png"
  aesthetic: "brutalist monochrome with neon accents"
  tokens: "_bmad-output/design-assets/design-tokens.json"
```

Pure backend stories get no `design_references`.

---

## What Amelia Does with Design References

Before writing any UI code, Amelia:
1. Reads the `prototype` HTML file — understands layout, fonts, colors, spacing
2. Reads `design-tokens.json` — extracts exact values
3. Implements matching the prototype aesthetic precisely
4. Does not deviate from Sally's chosen direction

---

## Dashboard Display

The Project Details page (`/project/[id]`) shows the Design Mockups section when `designAssets` exists in `project-state.json`.

- **Screens** — PNG screenshots served via `/api/design-image?projectId={id}&file=screens/{name}.png`
- **Components** — same pattern, from `_bmad-output/design-assets/images/components/`

Images are served from disk by the dashboard API — no external dependencies.

### How project-state.json gets designAssets

PL reads `_bmad-output/design-assets.json` after Sally announces completion, then writes:
```json
{
  "designAssets": {
    "aesthetic": "...",
    "screens": { "home": "screens/home.png", ... },
    "prototypes": { "home": "screens/home.html", ... },
    "tokens": "design-tokens.json"
  }
}
```
into `project-state.json`.

---

## frontend-design Skill

Location: `skills/frontend-design/SKILL.md`

Key principles:
- Commit to a BOLD aesthetic direction (not generic AI defaults)
- Self-contained HTML (inline CSS, no CDN dependencies)
- Real content (not wireframe placeholders)
- Each screen is a separate file

Amelia also uses this skill for UI stories that don't have a prototype yet (e.g. edge-case screens, error states).

---

## Notes

- Screenshots use Playwright (`playwright` npm package available globally).
- No external design tools required — Sally generates everything from the PRD using the frontend-design skill.
