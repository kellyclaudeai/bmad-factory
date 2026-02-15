# Barry Plan: Kelly Factory Dashboard Upgrade

**Created:** 2026-02-15T05:19:00-06:00  
**Agent:** Barry (BMAD Quick Flow Solo Dev)  
**Model:** Sonnet 4.5  
**Project:** kelly-dashboard  
**Location:** `/Users/austenallred/clawd/projects/kelly-dashboard/`

---

## Executive Summary

Upgrade Kelly Software Factory dashboard from basic HTML/CSS/JS to modern Next.js 15 application with:
- **3 views:** Factory Overview → Project Detail → Subagent Detail
- **Terminal aesthetic:** Matrix-inspired (dark bg, green/amber accents, monospace)
- **Real-time data:** Sessions API + file system state
- **Factory health:** 6 key metrics with color-coded alerts
- **Quality:** Fast loading, auto-refresh, responsive design

**Current dashboard preserved at:** `/Users/austenallred/clawd/factory-dashboard/`  
**New location:** `/Users/austenallred/clawd/projects/kelly-dashboard/`

---

## Current Architecture Analysis

### Existing Dashboard Structure

**Files:**
```
factory-dashboard/
├── index.html         (Factory overview - 5.5KB)
├── project.html       (Project detail - 6.5KB)
├── server.js          (Node.js backend - 4KB)
└── styles.css         (Dark theme - 4KB)
```

**Backend API (Node.js server.js):**
- `GET /` → index.html
- `GET /api/factory-state` → Parses factory-state.md, returns { active, queued, completed, shipped }
- `GET /api/project-state?id=X` → Reads project-state.json from `/Users/austenallred/clawd/projects/{id}/`
- `GET /api/projects` → Lists all project directories
- Port: 8080
- No sessions API integration (sessions_list not implemented)

**Frontend:**
- Vanilla JavaScript (fetch API, DOM manipulation)
- 10-second auto-refresh with setInterval
- Click project card → `/project.html?id={projectId}`
- Stats cards: active/queued/completed/shipped counts
- Project cards: name, stage, subagent counts
- Subagent cards: persona, role, task, duration

**Data Sources:**
1. `/Users/austenallred/clawd/projects/factory-state.md` - Project lists by stage
2. `/Users/austenallred/clawd/projects/{project-name}/project-state.json` - Project metadata

**Missing:**
1. OpenClaw Gateway sessions_list API integration (real-time session data)
2. Independent agent tracking (only shows projects)
3. Factory health metrics
4. Subagent detail view (no drill-down beyond project level)
5. Session transcripts/artifacts display
6. Historical data (only shows current state)

---

## Migration Strategy

### Preserve vs Migrate

**PRESERVE (backend):**
- ✅ Keep existing API endpoints structure (`/api/factory-state`, `/api/project-state`)
- ✅ Keep file system data sources (factory-state.md, project-state.json)
- ✅ Migrate to Next.js API routes (app/api/*/route.ts)

**REPLACE (frontend):**
- ❌ Remove vanilla HTML/CSS/JS
- ✅ Rebuild with Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- ✅ Server Components for static data, Client Components for polling/interactivity

**ADD (new features):**
1. Sessions API integration (OpenClaw Gateway http://localhost:3000/api/sessions_list)
2. Factory health dashboard (6 metrics)
3. Subagent detail view (3rd page)
4. Enhanced project detail (live/past/queued subagents)
5. Terminal aesthetic redesign

### Tech Stack

**Framework:** Next.js 15 (App Router)  
**Language:** TypeScript (strict mode)  
**Styling:** Tailwind CSS + shadcn/ui  
**Components:** shadcn/ui (Card, Badge, Button, Table, Skeleton)  
**Fonts:** Geist Mono (terminal headers), Geist Sans (body text)  
**State:** React Server Components + Client Components (SWR for polling)  
**Build:** npm (already installed)

**Skills Applied:**
- `frontend-design` - Terminal aesthetic (matrix-inspired), distinctive design
- `shadcn-ui` - Component library, theme config, dark mode
- `react-nextjs` - App Router, Server/Client split, data fetching patterns

---

## Component Architecture

### Page Structure (App Router)

```
app/
├── page.tsx                      → Factory View (home)
├── project/[id]/page.tsx         → Project Detail View
├── subagent/[sessionKey]/page.tsx → Subagent Detail View
├── layout.tsx                    → Root layout (global styles, fonts, auto-refresh provider)
├── api/
│   ├── factory-state/route.ts   → GET factory-state.md → JSON
│   ├── project-state/route.ts   → GET project-state.json?id={projectId}
│   ├── sessions/route.ts        → Proxy to OpenClaw Gateway sessions_list
│   └── transcript/route.ts      → GET session transcript file
└── components/
    ├── factory-view/
    │   ├── stats-cards.tsx       → 4 metric cards (active/queued/completed/shipped)
    │   ├── health-dashboard.tsx  → 6 health signals (failures/violations/queue/cost/blocked/bottlenecks)
    │   ├── agent-list.tsx        → Active agents grid (projects + independent)
    │   └── historical-projects.tsx → All-time projects with pagination
    ├── project-view/
    │   ├── project-header.tsx    → Breadcrumb, title, stage badge
    │   ├── project-metrics.tsx   → Time, tokens, cost, story progress
    │   ├── subagent-grid.tsx     → Live/past/queued subagents
    │   └── subagent-card.tsx     → Persona, story, timestamps
    ├── subagent-view/
    │   ├── session-metadata.tsx  → Model, tokens, duration, status
    │   ├── artifacts-list.tsx    → Files created/modified
    │   └── status-indicator.tsx  → Active/completed/failed badge
    ├── ui/                        → shadcn/ui components (Card, Badge, Button, etc.)
    └── shared/
        ├── auto-refresh.tsx      → Client component wrapper (10s polling)
        ├── timestamp.tsx         → Relative time + hover tooltip
        └── terminal-badge.tsx    → Color-coded status (green/amber/red)
```

### View Hierarchy

```
Factory View (/)
├── Stats Cards (4 metrics)
├── Health Dashboard (6 signals)
├── Active Agents Grid
│   ├── Project Leads → Click → Project Detail
│   ├── Barry/Mary/Independent → Click → Subagent Detail
└── Historical Projects (all-time with pagination)

Project Detail (/project/[id])
├── Breadcrumb → Factory View
├── Project Header (name, stage, status)
├── Project Metrics (time, tokens, cost, progress)
├── Live Subagents Grid → Click → Subagent Detail
├── Past Subagents Grid → Click → Subagent Detail
└── Queued Subagents List

Subagent Detail (/subagent/[sessionKey])
├── Breadcrumb → Project Detail (if project) OR Factory View
├── Session Metadata (model, tokens, duration)
├── Status Indicator (active/completed/failed)
├── Timestamps (created, last active, completed)
├── Output Artifacts (files created/modified)
└── Optional: Transcript excerpt (first 500 lines)
```

---

## Data Layer Architecture

### API Routes (Next.js API)

#### 1. `/api/factory-state` (migrate from server.js)
**Input:** None  
**Output:** `{ active: string[], queued: string[], completed: string[], shipped: string[] }`  
**Logic:**
- Read `/Users/austenallred/clawd/projects/factory-state.md`
- Parse markdown sections (`## Active Projects`, `## Queued Projects`, etc.)
- Extract project IDs from `### project-name` lines
- Return JSON object

#### 2. `/api/project-state` (migrate from server.js)
**Input:** `?id={projectId}`  
**Output:** `project-state.json` contents OR `{ error: "Not found" }`  
**Logic:**
- Read `/Users/austenallred/clawd/projects/{projectId}/project-state.json`
- Parse JSON, return directly
- Return 404 if file not found

#### 3. `/api/sessions` (NEW - OpenClaw Gateway proxy)
**Input:** None  
**Output:** `Session[]` from Gateway API  
**Logic:**
- Fetch `http://localhost:3000/api/sessions_list`
- Filter for active sessions (status !== 'completed')
- Transform to frontend format:
  ```typescript
  {
    sessionKey: string      // e.g., "agent:project-lead:project-calc-basic"
    label: string           // e.g., "project:calc-basic"
    agentType: string       // "project-lead" | "bmad-bmm-barry" | "bmad-bmm-mary"
    projectId?: string      // Extracted from label or sessionKey
    status: string          // "active" | "idle" | "waiting"
    lastActivity: string    // ISO timestamp
    model: string
    tokens: { input: number, output: number }
    duration: number        // milliseconds
  }
  ```
- Cache for 5 seconds (reduce Gateway load)

#### 4. `/api/transcript` (NEW)
**Input:** `?path={transcriptPath}`  
**Output:** Transcript file contents (first 500 lines) OR `{ error: "Not found" }`  
**Logic:**
- Read transcript file from path (security: validate path starts with `/Users/austenallred/.openclaw/transcripts/`)
- Return first 500 lines (prevent huge payloads)
- Return 404 if file not found

### Data Fetching Strategy

**Server Components (fast, SEO-friendly, no JS):**
- Factory view stats (active/queued/completed/shipped counts)
- Historical projects list (paginated)
- Project detail metadata (read project-state.json)
- Subagent detail metadata (read from project-state.json)

**Client Components (polling, interactivity):**
- Active agents list (10s refresh via SWR)
- Factory health signals (10s refresh)
- Live subagent status (10s refresh)
- Auto-refresh wrapper (configurable interval)

**Polling Pattern (SWR):**
```typescript
// components/shared/auto-refresh.tsx
'use client'
import useSWR from 'swr'

export function useAutoRefresh<T>(
  url: string,
  intervalMs: number = 10000
) {
  return useSWR<T>(url, fetcher, {
    refreshInterval: intervalMs,
    revalidateOnFocus: false
  })
}
```

---

## Factory Health Dashboard (NEW)

### 6 Key Metrics

#### 1. Session Failures/Retries
**Source:** Sessions API + project-state.json  
**Logic:** Count sessions with `status: 'failed'` OR `error` field  
**Display:** `{failureCount} failures, {retryCount} retries`  
**Threshold:**
- Green: 0 failures
- Amber: 1-3 failures
- Red: 4+ failures

#### 2. Protocol Violations
**Source:** Session transcripts (scan for "BMAD-VIOLATION" or "PERSONA-SPAWN-FAILED")  
**Logic:** Grep transcripts for violation keywords (expensive - cache for 60s)  
**Display:** `{violationCount} protocol violations`  
**Threshold:**
- Green: 0 violations
- Amber: 1-2 violations
- Red: 3+ violations

#### 3. Queue Depth + Throughput
**Source:** factory-state.md (queued count) + sessions API (active count)  
**Logic:** `queueDepth = queued.length`, `throughput = active.length`  
**Display:** `{queueDepth} queued, {throughput} active`  
**Threshold:**
- Green: queue < 5
- Amber: queue 5-10
- Red: queue 11+

#### 4. Cost/Token Burn
**Source:** Sessions API (sum tokens across all sessions)  
**Logic:** `totalTokens = sum(session.tokens.input + session.tokens.output)`, `estimatedCost = totalTokens * $0.015/1K`  
**Display:** `${cost.toFixed(2)} burned today`  
**Threshold:**
- Green: < $50
- Amber: $50-$100
- Red: $100+

#### 5. Blocked Projects
**Source:** project-state.json (check `lastActivity` timestamp)  
**Logic:** Count projects where `lastActivity > 4 hours ago` AND `status === 'active'`  
**Display:** `{blockedCount} projects blocked >4h`  
**Threshold:**
- Green: 0 blocked
- Amber: 1 blocked
- Red: 2+ blocked

#### 6. Bottleneck Timestamps
**Source:** project-state.json (analyze subagent durations)  
**Logic:** Find slowest story (longest `completedAt - startedAt`) in active projects  
**Display:** `Slowest: Story {storyId} ({duration}m)`  
**Threshold:**
- Green: < 30min
- Amber: 30-60min
- Red: 60+ min

### Health Dashboard Component

```typescript
// components/factory-view/health-dashboard.tsx
'use client'
import { useAutoRefresh } from '@/components/shared/auto-refresh'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type HealthMetric = {
  label: string
  value: string
  status: 'healthy' | 'warning' | 'critical'
}

export function HealthDashboard() {
  const { data: metrics, isLoading } = useAutoRefresh<HealthMetric[]>(
    '/api/health-metrics',
    10000
  )

  if (isLoading) return <SkeletonGrid />

  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics?.map(metric => (
        <Card key={metric.label} className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{metric.label}</span>
            <Badge variant={getBadgeVariant(metric.status)}>
              {metric.status === 'healthy' ? '✅' : metric.status === 'warning' ? '⚠️' : '🔴'}
            </Badge>
          </div>
          <div className="mt-2 text-lg font-bold text-green-400">
            {metric.value}
          </div>
        </Card>
      ))}
    </div>
  )
}
```

---

## Terminal Aesthetic Design System

### Color Palette (Matrix-Inspired)

**Background:**
- Primary: `#0a0e0f` (deep black)
- Secondary: `#151a1c` (card background)
- Tertiary: `#1f2527` (hover state)

**Foreground:**
- Primary text: `#e0e0e0` (light gray)
- Secondary text: `#888888` (dim gray)
- Accent (success): `#00ff88` (matrix green)
- Accent (warning): `#ffaa00` (amber)
- Accent (error): `#ff4444` (red)

**Borders:**
- Default: `#2a2f32` (subtle)
- Active: `#00ff88` (green glow)

### Typography

**Display (Headers):**
- Font: Geist Mono (monospace)
- Size: 2.5rem (h1), 1.5rem (h2), 1.25rem (h3)
- Weight: 700 (bold)
- Color: `#00ff88`

**Body:**
- Font: Geist Sans
- Size: 1rem (base), 0.875rem (small)
- Weight: 400 (regular)
- Color: `#e0e0e0`

**Code/Metrics:**
- Font: Geist Mono
- Size: 0.875rem
- Weight: 500 (medium)
- Color: `#00ff88` (values), `#888888` (labels)

### Component Styles

**Card:**
```css
background: #151a1c
border: 1px solid #2a2f32
border-radius: 8px
padding: 1rem
transition: border-color 0.2s

hover:
  border-color: #00ff88
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.1)
```

**Badge:**
```css
/* Status: healthy */
background: rgba(0, 255, 136, 0.1)
color: #00ff88
border: 1px solid #00ff88

/* Status: warning */
background: rgba(255, 170, 0, 0.1)
color: #ffaa00
border: 1px solid #ffaa00

/* Status: critical */
background: rgba(255, 68, 68, 0.1)
color: #ff4444
border: 1px solid #ff4444
```

**Button:**
```css
background: #00ff88
color: #0a0e0f
border: none
border-radius: 4px
padding: 0.5rem 1rem
font-weight: 600

hover:
  background: #00cc6a
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.3)
```

### Animations

**Fade In (page load):**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

animation: fadeIn 0.3s ease-out
```

**Pulse (active status):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

animation: pulse 2s infinite
```

**Shimmer (loading skeleton):**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

background: linear-gradient(90deg, #151a1c 25%, #1f2527 50%, #151a1c 75%)
background-size: 1000px 100%
animation: shimmer 2s infinite
```

### Tailwind Config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0e0f',
          card: '#151a1c',
          hover: '#1f2527',
          border: '#2a2f32',
          text: '#e0e0e0',
          dim: '#888888',
          green: '#00ff88',
          amber: '#ffaa00',
          red: '#ff4444',
        },
      },
      fontFamily: {
        mono: ['Geist Mono', 'monospace'],
        sans: ['Geist Sans', 'sans-serif'],
      },
    },
  },
}
```

---

## Implementation Stories (Parallel Execution)

### Story 1: Project Scaffold + shadcn/ui Setup
**Duration:** 15 min  
**Assignee:** Barry  
**Dependencies:** None  
**Tasks:**
1. Create Next.js 15 project: `npx create-next-app@latest kelly-dashboard --typescript --tailwind --app`
2. Init shadcn/ui: `npx shadcn-ui@latest init` (Tailwind setup, config)
3. Add components: `npx shadcn-ui@latest add card badge button table skeleton`
4. Install Geist fonts: `npm install geist`
5. Configure Tailwind theme (colors, fonts per design system)
6. Create `app/layout.tsx` with global styles
7. Test: `npm run dev` on port 3000

**Acceptance Criteria:**
- ✅ Next.js app runs on http://localhost:3000
- ✅ shadcn/ui components imported successfully
- ✅ Terminal color palette applied (dark bg, green accents)
- ✅ Geist Mono + Geist Sans fonts loaded

---

### Story 2: API Routes (Factory State + Project State)
**Duration:** 20 min  
**Assignee:** Barry  
**Dependencies:** Story 1 (project exists)  
**Tasks:**
1. Create `app/api/factory-state/route.ts`:
   - Read `/Users/austenallred/clawd/projects/factory-state.md`
   - Parse markdown sections (Active/Queued/Completed/Shipped)
   - Return JSON: `{ active: [], queued: [], completed: [], shipped: [] }`
2. Create `app/api/project-state/route.ts`:
   - Accept `?id={projectId}` query param
   - Read `/Users/austenallred/clawd/projects/{projectId}/project-state.json`
   - Return JSON or 404
3. Create `app/api/sessions/route.ts`:
   - Fetch `http://localhost:3000/api/sessions_list` (OpenClaw Gateway)
   - Transform to frontend format (sessionKey, label, agentType, projectId, status, lastActivity)
   - Cache for 5 seconds (in-memory)
4. Test: `curl http://localhost:3000/api/factory-state`, `curl http://localhost:3000/api/project-state?id=calc-basic`

**Acceptance Criteria:**
- ✅ `/api/factory-state` returns project lists
- ✅ `/api/project-state?id=X` returns project JSON
- ✅ `/api/sessions` returns active sessions (or empty array if Gateway offline)
- ✅ API routes handle file not found gracefully

---

### Story 3: Factory View - Stats Cards
**Duration:** 15 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `app/page.tsx` (Factory View - Server Component)
2. Create `components/factory-view/stats-cards.tsx`:
   - Fetch `/api/factory-state` server-side
   - Display 4 cards: Active, Queued, Completed, Shipped
   - Card component: shadcn Card, terminal styling
   - Show count + label
3. Style: Grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)

**Acceptance Criteria:**
- ✅ Factory view shows 4 stat cards
- ✅ Counts match factory-state.md
- ✅ Cards use terminal color palette
- ✅ Responsive grid layout

---

### Story 4: Factory View - Active Agents List
**Duration:** 25 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `components/factory-view/agent-list.tsx` (Client Component):
   - Use `useAutoRefresh('/api/sessions', 10000)` for polling
   - Group sessions by type: Project Leads, Barry, Mary, Independent
   - For each agent: name, project (if applicable), status, last activity
   - Click card → navigate to `/project/[id]` (if project) OR `/subagent/[sessionKey]` (if independent)
2. Create `components/shared/auto-refresh.tsx`:
   - SWR hook with configurable interval
3. Create `components/shared/timestamp.tsx`:
   - Relative time (e.g., "2m ago") + hover tooltip (absolute timestamp)
4. Style: Grid layout, agent cards with hover effect

**Acceptance Criteria:**
- ✅ Active agents list auto-refreshes every 10s
- ✅ Cards clickable (navigate to detail view)
- ✅ Timestamps show relative time + hover tooltip
- ✅ Loading skeleton while fetching

---

### Story 5: Factory View - Health Dashboard
**Duration:** 30 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `app/api/health-metrics/route.ts`:
   - Calculate 6 metrics (failures, violations, queue, cost, blocked, bottlenecks)
   - Return `{ label, value, status }[]`
   - Cache for 10 seconds
2. Create `components/factory-view/health-dashboard.tsx` (Client Component):
   - Use `useAutoRefresh('/api/health-metrics', 10000)`
   - Display 6 metric cards (3x2 grid)
   - Color-coded badges: green (healthy), amber (warning), red (critical)
3. Create `components/shared/terminal-badge.tsx`:
   - Badge component with status variants

**Acceptance Criteria:**
- ✅ Health dashboard shows 6 metrics
- ✅ Color coding based on thresholds
- ✅ Auto-refresh every 10s
- ✅ Loading state (skeleton cards)

---

### Story 6: Factory View - Historical Projects
**Duration:** 20 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `components/factory-view/historical-projects.tsx` (Server Component):
   - Fetch `/api/factory-state` (completed + shipped)
   - Display paginated list (10 per page)
   - Each row: project name, stage, completion date
   - Click row → navigate to `/project/[id]`
2. Add pagination controls (shadcn Button, client-side state)

**Acceptance Criteria:**
- ✅ Historical projects list (completed + shipped)
- ✅ Pagination (10 per page)
- ✅ Click row → project detail
- ✅ Shows completion timestamps

---

### Story 7: Project Detail View - Header + Metrics
**Duration:** 20 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `app/project/[id]/page.tsx`:
   - Server Component (fetch project-state.json)
   - Dynamic route with `params.id`
2. Create `components/project-view/project-header.tsx`:
   - Breadcrumb: Factory View → Project Name
   - Title: project ID
   - Stage badge (terminal styling)
3. Create `components/project-view/project-metrics.tsx`:
   - Display: total time, tokens, cost, story progress
   - Calculate from project-state.json subagents array

**Acceptance Criteria:**
- ✅ Project detail page loads with dynamic route
- ✅ Breadcrumb navigation works
- ✅ Metrics calculated from project state
- ✅ Stage badge color-coded

---

### Story 8: Project Detail View - Subagent Grid
**Duration:** 25 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2, Story 7  
**Tasks:**
1. Create `components/project-view/subagent-grid.tsx`:
   - Group subagents by status: live (active), past (complete), queued (pending)
   - Display 3 sections (collapsible)
2. Create `components/project-view/subagent-card.tsx`:
   - Persona name, role (from roleMap)
   - Story title (extract from storyFile)
   - Timestamps: started, completed (or elapsed if active)
   - Click card → navigate to `/subagent/[sessionKey]`
3. Style: Grid layout, status color-coding

**Acceptance Criteria:**
- ✅ Subagents grouped by status (live/past/queued)
- ✅ Cards show persona, story, timestamps
- ✅ Click card → subagent detail
- ✅ Loading state for live subagents (client polling)

---

### Story 9: Subagent Detail View
**Duration:** 25 min  
**Assignee:** Barry  
**Dependencies:** Story 1, Story 2  
**Tasks:**
1. Create `app/subagent/[sessionKey]/page.tsx`:
   - Server Component (fetch session data from sessions API)
   - Dynamic route with `params.sessionKey`
2. Create `components/subagent-view/session-metadata.tsx`:
   - Model, tokens (input/output), duration
   - Status indicator (active/completed/failed)
3. Create `components/subagent-view/artifacts-list.tsx`:
   - List files created/modified (from project-state.json or transcript)
   - Show file paths
4. Create `components/subagent-view/status-indicator.tsx`:
   - Badge with status (green/amber/red)
5. Optional: Transcript excerpt (first 500 lines) with collapsible section

**Acceptance Criteria:**
- ✅ Subagent detail page loads with dynamic route
- ✅ Session metadata displayed
- ✅ Artifacts list (if available)
- ✅ Status indicator color-coded
- ✅ Breadcrumb back to project (if applicable)

---

### Story 10: Terminal Aesthetic Refinement
**Duration:** 20 min  
**Assignee:** Barry  
**Dependencies:** All previous stories  
**Tasks:**
1. Apply terminal design system across all components:
   - Font: Geist Mono for headers, Geist Sans for body
   - Colors: Terminal palette (green/amber/red accents)
   - Borders: Subtle with hover glow effect
   - Cards: Hover elevation + border color change
2. Add animations:
   - Fade in on page load
   - Pulse on active status badges
   - Shimmer on loading skeletons
3. Test responsive design (desktop, tablet, mobile)
4. Add favicon (matrix-style icon)

**Acceptance Criteria:**
- ✅ Consistent terminal aesthetic across all views
- ✅ Smooth animations (fade in, pulse, shimmer)
- ✅ Responsive on all screen sizes
- ✅ Favicon updated

---

### Story 11: Auto-Refresh + Footer
**Duration:** 15 min  
**Assignee:** Barry  
**Dependencies:** Story 4, Story 5  
**Tasks:**
1. Add footer to `app/layout.tsx`:
   - "Auto-refreshes every 10 seconds"
   - Last update timestamp (client-side, updates on each poll)
2. Create `components/shared/refresh-indicator.tsx`:
   - Shows last refresh time in footer
   - Updates on each SWR revalidation
3. Add manual refresh button (optional)

**Acceptance Criteria:**
- ✅ Footer shows auto-refresh status
- ✅ Last update timestamp updates every 10s
- ✅ Manual refresh button (optional)

---

### Story 12: Testing + Polish
**Duration:** 20 min  
**Assignee:** Barry  
**Dependencies:** All previous stories  
**Tasks:**
1. Test with real factory data:
   - Load factory-state.md with multiple projects
   - Load project-state.json with subagents
   - Test sessions API with active sessions
2. Error handling:
   - API route failures (show error state)
   - Missing project-state.json (show "No data")
   - Empty states (no active projects, no subagents)
3. Performance:
   - Verify Server Components don't re-render unnecessarily
   - Check SWR caching (network tab)
   - Test page load speed (<1s initial load)
4. Accessibility:
   - Keyboard navigation (tab through cards)
   - Screen reader labels (aria-label)
   - Focus states (visible focus ring)

**Acceptance Criteria:**
- ✅ Works with real factory data
- ✅ Error states handled gracefully
- ✅ Fast page loads (<1s)
- ✅ Accessible (keyboard nav, screen reader)

---

## Deployment Instructions

**Location:** `/Users/austenallred/clawd/projects/kelly-dashboard/`

**Start dev server:**
```bash
cd /Users/austenallred/clawd/projects/kelly-dashboard
npm run dev
```

**Access:**
- **Factory View:** http://localhost:3000
- **Project Detail:** http://localhost:3000/project/{projectId}
- **Subagent Detail:** http://localhost:3000/subagent/{sessionKey}

**Port:** 3000 (matches requirement)

**Old dashboard preserved at:** `/Users/austenallred/clawd/factory-dashboard/` (unchanged)

---

## Story Execution Order

### Phase 1: Foundation (Parallel)
- ✅ Story 1: Project scaffold + shadcn/ui (15 min) - Barry
- ✅ Story 2: API routes (20 min) - Barry

### Phase 2: Factory View (Parallel after Phase 1)
- ✅ Story 3: Stats cards (15 min) - Barry
- ✅ Story 4: Active agents list (25 min) - Barry
- ✅ Story 5: Health dashboard (30 min) - Barry
- ✅ Story 6: Historical projects (20 min) - Barry

### Phase 3: Detail Views (Parallel after Phase 2)
- ✅ Story 7: Project detail header + metrics (20 min) - Barry
- ✅ Story 8: Subagent grid (25 min) - Barry
- ✅ Story 9: Subagent detail view (25 min) - Barry

### Phase 4: Polish (Sequential after Phase 3)
- ✅ Story 10: Terminal aesthetic refinement (20 min) - Barry
- ✅ Story 11: Auto-refresh + footer (15 min) - Barry
- ✅ Story 12: Testing + polish (20 min) - Barry

**Total Estimated Duration:** 250 minutes (4h 10m)

**Parallelization:**
- Phase 1: 1 story (20 min)
- Phase 2: 4 stories (max 30 min if parallel)
- Phase 3: 3 stories (max 25 min if parallel)
- Phase 4: 3 stories (55 min sequential)

**Best Case (max parallelization):** ~130 minutes (2h 10m)

---

## Success Criteria

### Functional Requirements
- ✅ Factory view shows all active agents (projects + independent)
- ✅ Project detail shows live/past/queued subagents
- ✅ Subagent detail shows session metadata + artifacts
- ✅ Factory health dashboard shows 6 metrics
- ✅ Auto-refresh every 10 seconds
- ✅ Click navigation works (Factory → Project → Subagent)
- ✅ Breadcrumbs for navigation
- ✅ Timestamps everywhere (relative + absolute)

### Non-Functional Requirements
- ✅ Terminal aesthetic (matrix-inspired, green/amber/red)
- ✅ Fast loading (<1s initial, <500ms navigation)
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Accessible (keyboard nav, screen reader)
- ✅ Error handling (API failures, missing data)
- ✅ Loading states (skeletons)

### Technical Requirements
- ✅ Next.js 15 App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS + shadcn/ui
- ✅ Server Components for static data
- ✅ Client Components for polling
- ✅ API routes (factory-state, project-state, sessions)
- ✅ Real-time data integration (sessions API)
- ✅ File system data integration (project-state.json)

---

## Risk Assessment

### High Risk
1. **Sessions API availability:** OpenClaw Gateway may not be running
   - **Mitigation:** Graceful fallback (show empty state, retry button)
2. **Large transcript files:** Loading full transcripts can be slow
   - **Mitigation:** Load first 500 lines only, add "Load more" button

### Medium Risk
3. **Factory-state.md parsing:** Markdown format may change
   - **Mitigation:** Robust regex, fallback to file system scan if parsing fails
4. **Project-state.json schema:** May evolve over time
   - **Mitigation:** Use optional chaining (`?.`), default values

### Low Risk
5. **Performance with 100+ projects:** Large dataset may slow pagination
   - **Mitigation:** Virtual scrolling (defer to v2 if needed)

---

## Out of Scope (Defer to v2)

1. **New project kickoff UI** (operator manually creates projects for now)
2. **Authentication** (operator-only access assumed, local dev only)
3. **External deployment** (Vercel/Netlify - local dev only for v1)
4. **Session transcript search** (full-text search across transcripts)
5. **Real-time WebSocket updates** (polling sufficient for v1)
6. **Historical analytics** (time-series charts, trends - no data retention yet)
7. **Session logs streaming** (live log tailing - polling sufficient)
8. **Cost breakdown by project** (token accounting not granular enough)

---

## Next Steps

1. ✅ **Review plan** with operator (confirm scope, design, timeline)
2. ✅ **Scaffold project** (Story 1)
3. ✅ **Implement API routes** (Story 2)
4. ✅ **Build Factory View** (Stories 3-6, parallel)
5. ✅ **Build Detail Views** (Stories 7-9, parallel)
6. ✅ **Polish UI** (Stories 10-12)
7. ✅ **Test with real data** (load factory-state.md, project-state.json, sessions API)
8. ✅ **Deploy to localhost:3000**
9. ✅ **Demo to operator** (Factory → Project → Subagent drill-down)
10. ✅ **Collect feedback** (iterate if needed)

**Estimated Delivery:** 2h 10m (best case with parallelization) to 4h 10m (sequential)

**Ready to start implementation!** 🚀
