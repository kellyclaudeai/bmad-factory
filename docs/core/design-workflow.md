# Design Workflow - Figma Integration

**Version:** 1.0  
**Date:** 2026-02-19  
**Status:** Proposed (not yet implemented)

---

## Overview

This document describes how design artifacts (mockups, components, design tokens) are generated, managed, and consumed during the factory workflow.

**Goal:** Move from text-based design specs → visual design references with Figma MCP integration.

**Benefits:**
- ✅ Amelia implements from actual mockups (not just text descriptions)
- ✅ Design tokens extracted programmatically (no manual hex code copying)
- ✅ Pixel-perfect fidelity between design and implementation
- ✅ Visual design artifacts displayed in dashboard
- ✅ Zero cost (Figma MCP is free API, rate-limited but reasonable)

---

## Architecture

### Design Artifact Flow

```
Phase 1 (Planning):
1. Sally creates ux-design.md (text specs) [existing]
2. Sally creates Figma designs OR references existing Figma file
3. Sally outputs design-assets.json with Figma URLs
4. Bob references Figma URLs in story specs
5. Project Lead updates project-state.json with designAssets

Phase 2 (Build):
6. Amelia reads story + design_references
7. Amelia uses Figma MCP to extract specs
8. Amelia implements with visual fidelity

Dashboard:
9. Project Details page displays Figma embeds/previews
```

### File Structure

```
projects/<projectId>/
├── _bmad-output/
│   ├── design-assets.json        # NEW: Figma URLs
│   └── planning-artifacts/
│       └── ux-design.md          # Existing text specs
└── project-state.json            # Updated with designAssets field
```

---

## Phase 1: Sally's Figma Workflow

### Sally's New Responsibilities

**After creating ux-design.md:**

1. **Create or reference Figma designs:**
   - Option A: Create new Figma file with mockups
   - Option B: Reference existing Figma file (if provided in intake)

2. **Export design-assets.json:**
   ```json
   {
     "figma_file_url": "https://figma.com/file/abc123/ProjectName",
     "color_system": "https://figma.com/file/abc123/page#node-456",
     "typography": "https://figma.com/file/abc123/page#node-457",
     "components": {
       "button_primary": "https://figma.com/file/abc123/page#node-458",
       "button_secondary": "https://figma.com/file/abc123/page#node-459",
       "input_text": "https://figma.com/file/abc123/page#node-460",
       "input_textarea": "https://figma.com/file/abc123/page#node-461",
       "card": "https://figma.com/file/abc123/page#node-462"
     },
     "screens": {
       "login": "https://figma.com/file/abc123/page#node-463",
       "dashboard": "https://figma.com/file/abc123/page#node-464",
       "settings": "https://figma.com/file/abc123/page#node-465"
     }
   }
   ```

3. **Save to:** `_bmad-output/design-assets.json`

### Sally's Updated Output

**Before (v3.3 and earlier):**
- `_bmad-output/planning-artifacts/ux-design.md` (text-only)

**After (v4.0 - Design Integration):**
- `_bmad-output/planning-artifacts/ux-design.md` (text specs, existing)
- `_bmad-output/design-assets.json` (Figma URLs, NEW)

### Sally's Agent Instructions Update

Add to `~/.openclaw/workspace-bmad-bmm-sally/AGENTS.md`:

```markdown
## Output Format

After creating ux-design.md, generate design-assets.json:

**If Figma file exists (provided in intake or created by you):**
1. Identify key frames: color system, typography, components, screens
2. Export Figma URLs for each frame
3. Save to _bmad-output/design-assets.json

**If no Figma file:**
- Skip design-assets.json (text-only workflow)
- Note in ux-design.md: "Visual mockups not provided"

**design-assets.json schema:**
- figma_file_url: Base Figma file URL
- color_system: Frame with color palette/variables
- typography: Frame with text styles
- components: Object mapping component names → Figma frame URLs
- screens: Object mapping screen names → Figma frame URLs
```

---

## Phase 1: Bob's Story Template Update

### Story Schema Addition

**Add `design_references` field:**

```yaml
story_id: "3.2"
epic: 3
title: "Build Login Form"
description: "Implement login form with email/password fields..."
acceptance_criteria:
  - User can enter email and password
  - Form validation on submit
  - Error messages display clearly
design_references:  # NEW
  - url: "https://figma.com/file/abc123/page#node-463"
    type: "screen"
    description: "Login screen layout"
  - url: "https://figma.com/file/abc123/page#node-458"
    type: "component"
    description: "Primary button (submit button style)"
  - url: "https://figma.com/file/abc123/page#node-460"
    type: "component"
    description: "Text input component"
design_tokens:  # NEW
  colors: "https://figma.com/file/abc123/page#node-456"
  typography: "https://figma.com/file/abc123/page#node-457"
dependencies:
  - "3.1"
estimate_hours: 3
```

### Bob's Agent Instructions Update

Add to `~/.openclaw/workspace-bmad-bmm-bob/AGENTS.md`:

```markdown
## Story Creation (create-story)

**If design-assets.json exists:**
1. Read design-assets.json
2. Match story scope to relevant design frames
3. Add design_references field with Figma URLs
4. Add design_tokens field if story needs colors/typography

**Example mapping:**
- Story about login screen → reference screens.login
- Story about button component → reference components.button_primary
- Story needing color palette → reference design_tokens.colors

**If no design-assets.json:**
- Omit design_references and design_tokens fields
- Story proceeds with text-only specs from ux-design.md
```

---

## Phase 2: Amelia's Figma MCP Usage

### Amelia's New Workflow

**Before implementing a story:**

1. **Check for design_references:**
   ```yaml
   design_references:
     - url: "https://figma.com/file/abc123/page#node-463"
       type: "screen"
       description: "Login screen layout"
   ```

2. **Use Figma MCP to extract specs:**
   - Layout structure (positioning, spacing)
   - Component hierarchy
   - Design tokens (colors from variables, text styles)
   - Dimensions and responsive breakpoints

3. **Generate implementation:**
   - Match Figma design pixel-perfect
   - Use extracted color/typography tokens directly
   - Implement components with visual fidelity

### Amelia's Agent Instructions Update

Add to `~/.openclaw/workspace-bmad-bmm-amelia/AGENTS.md`:

```markdown
## Implementation Workflow (dev-story)

**Step 1: Read story spec**
- Load story from _bmad-output/implementation-artifacts/stories/story-X.Y.md
- Check for design_references and design_tokens fields

**Step 2: Extract design specs (if design_references exist)**
- Use Figma MCP to pull frame data for each URL
- Extract: layout structure, spacing, colors, typography, component hierarchy
- Generate design tokens file (colors.css, spacing.css) if needed

**Step 3: Implement with design fidelity**
- Match Figma mockup exactly (pixel-perfect where feasible)
- Use extracted design tokens (no manual hex code copying)
- Reference Figma frame for visual details (shadows, borders, hover states)

**Step 4: Commit and push**
- Standard git workflow (existing)

**If no design_references:**
- Implement from text specs in ux-design.md (existing workflow)
```

---

## Figma MCP Setup

### Prerequisites

- Figma account with access to design files
- MCP-compatible environment (OpenClaw supports MCP natively)

### Installation

**1. Add Figma MCP to OpenClaw:**

Create/update `~/.openclaw/mcp.json`:
```json
{
  "inputs": [],
  "servers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "type": "http"
    }
  }
}
```

**2. Authenticate:**
- First Figma MCP usage triggers OAuth flow
- Credentials persist across sessions
- One-time setup per machine

**3. Test:**
```bash
# Test Figma MCP access
curl -H "Authorization: Bearer <token>" \
  https://mcp.figma.com/mcp/v1/files/<file-id>/nodes/<node-id>
```

### Usage in Agent Prompts

**Example prompt for Amelia:**
```
Story 3.2: Build Login Form
Design reference: https://figma.com/file/abc123/page#node-463

Use Figma MCP to:
1. Extract layout specs from the login screen frame
2. Pull color tokens from the design system
3. Generate React component matching the mockup exactly

Implement with Tailwind CSS using extracted design tokens.
```

---

## Dashboard Display

### Project State Schema Update

**Add to `projects/<projectId>/project-state.json`:**

```typescript
interface ProjectState {
  // ... existing fields
  designAssets?: {
    figma_file_url?: string;
    color_system?: string;
    typography?: string;
    components?: Record<string, string>; // name → Figma URL
    screens?: Record<string, string>;    // name → Figma URL
  };
}
```

### Project Lead Registry Update

**When reading design-assets.json in Phase 1:**

```javascript
// After Sally completes ux-design
const designAssets = await readJSON('_bmad-output/design-assets.json');

// Update project-state.json
projectState.designAssets = designAssets;
await writeJSON('project-state.json', projectState);
```

### Dashboard API Update

**`/api/project-state` endpoint:**

```typescript
// Already serving project-state.json
// designAssets field will auto-appear once added to schema
```

### UI Component: Design Section

**Add to Project Details page:**

```tsx
{project.designAssets && (
  <Section title="Design">
    <div className="space-y-6">
      {/* Color System */}
      {project.designAssets.color_system && (
        <Subsection title="Color System">
          <FigmaEmbed url={project.designAssets.color_system} />
        </Subsection>
      )}

      {/* Typography */}
      {project.designAssets.typography && (
        <Subsection title="Typography">
          <FigmaEmbed url={project.designAssets.typography} />
        </Subsection>
      )}

      {/* Components */}
      {project.designAssets.components && (
        <Subsection title="Components">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(project.designAssets.components).map(([name, url]) => (
              <FigmaPreview 
                key={name} 
                name={name} 
                url={url} 
                aspectRatio="square"
              />
            ))}
          </div>
        </Subsection>
      )}

      {/* Screens */}
      {project.designAssets.screens && (
        <Subsection title="Screens">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(project.designAssets.screens).map(([name, url]) => (
              <FigmaPreview 
                key={name} 
                name={name} 
                url={url} 
                aspectRatio="16/9"
              />
            ))}
          </div>
        </Subsection>
      )}

      {/* Link to Figma File */}
      {project.designAssets.figma_file_url && (
        <div className="mt-4">
          <a 
            href={project.designAssets.figma_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open in Figma →
          </a>
        </div>
      )}
    </div>
  </Section>
)}
```

### Figma Embed Options

**Option A: Figma iFrame Embeds** (if supported)
```tsx
<iframe 
  src={`https://www.figma.com/embed?embed_host=factory&url=${encodeURIComponent(url)}`}
  className="w-full h-96 border rounded"
/>
```

**Option B: Figma Thumbnail API** (if available via MCP)
```tsx
<img 
  src={`https://mcp.figma.com/thumbnails?url=${encodeURIComponent(url)}`}
  alt={name}
  className="w-full h-auto rounded shadow"
/>
```

**Option C: Screenshot on Save** (fallback)
- Generate thumbnails when Sally creates design-assets.json
- Store in `_bmad-output/design-thumbnails/*.png`
- Serve via dashboard static assets

---

## Migration Path

### Phase 1: Core Infrastructure (Week 1)
1. Create design-workflow.md (this file)
2. Set up Figma MCP in OpenClaw (mcp.json + auth)
3. Update project-state.json schema (add designAssets field)
4. Test Figma MCP access with sample file

### Phase 2: Agent Updates (Week 1-2)
5. Update Sally's instructions (output design-assets.json)
6. Update Bob's instructions (add design_references to stories)
7. Update Amelia's instructions (use Figma MCP for implementation)
8. Test on one greenfield project

### Phase 3: Dashboard UI (Week 2)
9. Update dashboard API (serve designAssets from project-state.json)
10. Build Design section UI component
11. Implement Figma embed/preview (iframe or thumbnail API)
12. Deploy dashboard update

### Phase 4: Rollout (Week 2-3)
13. Run full project with design integration
14. Monitor quality improvement
15. Document lessons learned
16. Make design workflow default for new projects

---

## Cost & Performance

**Figma MCP:**
- Cost: Free (Figma-hosted API)
- Rate limits: Unknown (likely reasonable for factory usage)
- Latency: ~500ms per frame request (acceptable)

**Alternatives (rejected):**
- Frame0: Free but requires screenshot workaround (not exportable by default)
- nano-banana-pro: $$$ per image, lower quality (AI hallucination)

**Recommendation:** Figma MCP is optimal (free, high quality, clean API).

---

## FAQ

**Q: What if a project has no Figma file?**  
A: Sally skips design-assets.json, workflow proceeds text-only (existing behavior).

**Q: Can Sally create Figma files programmatically?**  
A: Not directly via MCP (read-only). Sally references existing files or documents that mockups are needed.

**Q: What if Figma URLs break (file moved/deleted)?**  
A: Dashboard shows broken embed, Amelia falls back to ux-design.md text specs.

**Q: Does this slow down Phase 1?**  
A: ~5 min overhead for Sally to export URLs (minimal). Design quality gain >> time cost.

**Q: Can we use this for brownfield projects?**  
A: Yes, if Figma file exists. Otherwise text-only workflow (existing).

---

## Version History

- **v1.0 (2026-02-19):** Initial design workflow proposal (Matt + Kelly)
