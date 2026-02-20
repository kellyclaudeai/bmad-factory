---
name: design-workflow
description: "Full design integration workflow for the Kelly Software Factory. Use when: Sally is creating UX design specs (outputs Figma mockups + design-assets.json), Bob is writing story files that need design references, or Amelia is implementing UI stories with Figma MCP visual fidelity. Covers the complete Sally → Figma → Bob → Amelia pipeline."
---

# Design Workflow

This skill covers the full design pipeline: **Sally** (Figma mockups) → **Bob** (design refs in stories) → **Amelia** (Figma MCP + frontend-design skill implementation).

Full spec: [`references/design-workflow-full.md`](references/design-workflow-full.md) — load when you need complete agent instruction templates, dashboard UI code, Figma embed options, or migration path details.

---

## Sally: UX Design + Figma Output

**After creating `ux-design.md`**, Sally creates Figma designs and outputs `design-assets.json`:

```json
{
  "figma_file_url": "https://figma.com/file/abc123/ProjectName",
  "color_system": "https://figma.com/file/abc123/page#node-456",
  "typography": "https://figma.com/file/abc123/page#node-457",
  "components": {
    "button_primary": "https://figma.com/file/abc123/page#node-458",
    "card": "https://figma.com/file/abc123/page#node-459"
  },
  "screens": {
    "home": "https://figma.com/file/abc123/page#node-460",
    "detail": "https://figma.com/file/abc123/page#node-461"
  }
}
```

**Save to:** `_bmad-output/design-assets.json`

If no Figma file exists → skip `design-assets.json`, proceed text-only.

---

## Bob: Story Files with Design References

**If `design-assets.json` exists**, add to each story file:

```yaml
design_references:
  - url: "https://figma.com/file/abc123/page#node-460"
    type: "screen"
    description: "Home screen layout"
  - url: "https://figma.com/file/abc123/page#node-458"
    type: "component"
    description: "Primary button style"
design_tokens:
  colors: "https://figma.com/file/abc123/page#node-456"
  typography: "https://figma.com/file/abc123/page#node-457"
```

**Mapping logic:**
- Story about a specific screen → reference `screens.<name>`
- Story about buttons/inputs/cards → reference relevant `components.<name>`
- Any story touching colors/typography → include `design_tokens`

---

## Amelia: Implementation with Figma MCP + frontend-design

**For any UI story:**

1. **Apply the `frontend-design` skill first** — commit to a bold aesthetic direction before writing code. Avoid Inter, Roboto, purple gradients, generic layouts.

2. **If `design_references` exist in the story:**
   - Use Figma MCP to extract layout, spacing, colors, typography from each URL
   - Match the Figma design structure exactly
   - Extract design tokens (colors, text styles) directly from Figma variables

3. **Implement with visual fidelity:**
   - Match Figma mockup layout (spacing, sizing, hierarchy)
   - Apply the aesthetic direction from frontend-design skill
   - Use extracted tokens — no manual hex copying

**Figma MCP is available** — tool name: `figma` — call it to read frame data, extract CSS specs, and get component properties.

---

## Project Lead: Wiring It Together

After Sally completes:

```python
# Read design-assets.json if it exists
import json, os
design_path = "_bmad-output/design-assets.json"
if os.path.exists(design_path):
    with open(design_path) as f:
        design_assets = json.load(f)
    # Write to project-state.json
    project_state["designAssets"] = design_assets
```

Design mockups are auto-displayed in the **Project Details dashboard page** when `project-state.json` has a `designAssets` field (screens as Figma iframes, components as links).

---

## Figma MCP Setup

Config: `~/.openclaw/mcp.json`

```json
{
  "servers": {
    "figma": {
      "type": "stdio",
      "command": "figma-developer-mcp",
      "args": ["--figma-api-key=YOUR_PAT_HERE"]
    }
  }
}
```

Get a PAT: figma.com → Settings → Security → Personal access tokens → Create new
