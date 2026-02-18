# Story 16: Add Active Research Section to Dashboard

**Type:** Feature Enhancement  
**Priority:** Medium  
**Estimate:** 2-3 hours

---

## User Story

**As Kelly,**  
**I want to see active and completed Research Lead sessions on the dashboard,**  
**So that I can monitor research tasks that generate project intakes.**

---

## Context

Research Lead sessions generate project intakes (`projects-queue/{name}/intake.md`) before Project Leads take over. Currently, these sessions are invisible on the dashboard.

**Key differences from Projects:**
- No phases/stories/subagents (one-off research tasks)
- Output: `research-state.json` in Research Lead workspace
- Each research session tracks: topic, status, findings, output path

---

## Acceptance Criteria

### 1. Homepage: Active Research Section

```
┌─ Active Research (2) ──────────────────────┐
│ ┌─────────────────┐ ┌─────────────────┐   │
│ │ AI Marketplace  │ │ Meeting Tracker │   │
│ │ active          │ │ complete        │   │
│ │ Running: 12m    │ │ Completed: 2h   │   │
│ └─────────────────┘ └─────────────────┘   │
└────────────────────────────────────────────┘
```

**Requirements:**
- Show all Research Lead sessions from last 7 days
- Display research topic (from research-state.json or session label)
- Show status badge (active, complete, failed)
- Show runtime (elapsed if active, total if complete)
- Clickable cards → navigate to `/research/[sessionKey]`

### 2. Research Detail Page (`/research/[sessionKey]/page.tsx`)

**Layout:**

```
┌─ AI Marketplace Research ────────────────────┐
│ Status: complete                             │
│ Started: Feb 17, 2026 4:30 PM CST           │
│ Duration: 1h 23m                             │
└─────────────────────────────────────────────┘

┌─ Research Session ───────────────────────────┐
│ Session Key: agent:research-lead:main        │
│ Model: claude-sonnet-4-5                     │
│ Topic: Multi-chain crypto marketplace        │
│ Output: projects-queue/ai-marketplace/...    │
└─────────────────────────────────────────────┘

┌─ Session Logs ───────────────────────────────┐
│ [Cassio-style message display]               │
│ (Same format as Project session logs)        │
└─────────────────────────────────────────────┘
```

**Requirements:**
- Show research metadata (topic, status, duration)
- Show session details (key, model, output path)
- Display session transcript (Cassio-style, same as Project detail)
- Link to output file if research completed

### 3. API Routes

**`/api/research-sessions` (new)**
```typescript
GET /api/research-sessions
Returns: ResearchSession[]

type ResearchSession = {
  sessionKey: string
  sessionId: string
  topic: string
  status: "active" | "complete" | "failed"
  startedAt: string
  completedAt?: string
  duration?: number
  outputPath?: string
  lastActivity: string
  model?: string
}
```

**Implementation:**
- Call OpenClaw Gateway `/tools/invoke` → `sessions_list`
- Filter for `agentType === "research-lead"`
- Read `research-state.json` from Research Lead workspace if exists
- Fallback to session label if no state file

**`/api/research-state` (new)**
```typescript
GET /api/research-state?sessionKey=agent:research-lead:main
Returns: ResearchState

type ResearchState = {
  researchId: string
  topic: string
  status: "active" | "complete" | "failed"
  startedAt: string
  completedAt?: string
  findings?: string[]
  outputPath?: string
  lastHeartbeat?: string
}
```

**Implementation:**
- Read `~/.openclaw/agents/research-lead/workspace/research-state.json`
- Return 404 if not found (older research sessions may not have state)

### 4. Components to Create

**`components/research-view/research-cards.tsx`**
- Grid of research session cards
- Status badges, runtime display
- Click → navigate to detail page

**`components/research-view/research-header.tsx`**
- Research topic as title
- Status badge
- Metadata (started, duration, model)

**`app/research/[sessionKey]/page.tsx`**
- SSR fetch research state + session transcript
- Display research metadata
- Render Cassio-style logs (reuse existing component)

---

## Research Lead State File Schema

**Location:** `~/.openclaw/agents/research-lead/workspace/research-state.json`

**Schema:**
```json
{
  "researchId": "ai-marketplace",
  "topic": "Multi-chain crypto marketplace with agentic commerce",
  "status": "active",
  "startedAt": "2026-02-17T16:30:00Z",
  "completedAt": null,
  "findings": [
    "Crossmint supports Solana + Ethereum",
    "Printful API for fulfillment",
    "Agent Payments Protocol (AP2) for autonomous buying"
  ],
  "outputPath": "projects-queue/ai-marketplace/intake.md",
  "lastHeartbeat": "2026-02-17T16:45:00Z"
}
```

**Research Lead must:**
- Create this file on initialization
- Update status on completion/failure
- Add findings as research progresses
- Set outputPath when intake.md is written

---

## Technical Notes

### Path Resolution
- Research Lead workspace: `~/.openclaw/agents/research-lead/workspace/`
- API must read from agent workspace, not project directories

### Session Filtering
- `agentType === "research-lead"` from sessions_list
- Include sessions from last 7 days (activeMinutes: 10080)

### Reuse Existing Components
- Session logs: Use existing Cassio-style formatter from Project detail
- Card layout: Similar to Project Lead cards (adjust content)
- Badge styles: Reuse terminal-green/amber/red status colors

---

## Testing Checklist

- [ ] Active Research section appears on homepage
- [ ] Research cards show correct status/runtime
- [ ] Clicking card navigates to research detail page
- [ ] Research detail shows session metadata correctly
- [ ] Session logs render in Cassio-style format
- [ ] Completed research shows outputPath link
- [ ] API returns empty array when no research sessions exist
- [ ] Works for research sessions WITHOUT research-state.json (graceful fallback)

---

## Dependencies

**Before implementing:**
1. Update Research Lead AGENTS.md to require research-state.json
2. Define research-state.json schema (see above)
3. Research Lead must create/update this file during execution

**After implementing:**
- Test with live Research Lead session
- Verify state file updates correctly
- Check dashboard displays research accurately

---

## Future Enhancements (Out of Scope)

- Historical research archive (completed research older than 7 days)
- Research findings preview on cards
- Research success/failure metrics
- Research → Project intake flow visualization

---

## Design Notes

**Visual Consistency:**
- Match Project Lead card styling (terminal aesthetic)
- Use same collapsible section pattern as Active Projects
- Reuse existing Cassio-style log formatting
- Keep "Active Research" and "Active Projects" sections visually similar

**Empty State:**
- Show "No active research" when no sessions exist
- Include brief explanation: "Research sessions appear here while generating project intakes"

---

**Story Status:** Ready for Implementation  
**Assigned To:** Barry (Dashboard Enhancement)  
**Blocks:** None  
**Blocked By:** Research Lead AGENTS.md update (research-state.json requirement)
