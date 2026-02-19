# Kelly Dashboard Changelog

## 2026-02-18 - Active Research Session Handling

### Fixed
- **Research Details Page:** Active sessions now display "Research in Progress" notice instead of errors
  - Shows amber status card with pulse animation
  - Displays expected completion time (20-30 minutes)
  - Session logs visible for real-time monitoring
  - Progressive disclosure: subagents appear as they spawn
  - **Commit:** fd66c26

### Bug Reports Resolved
- `bug-active-research-details.md` - Research Details page error for active sessions

### Documentation Added
- `docs/fix-active-research-sessions.md` - Comprehensive fix documentation
- `docs/fix-event-handler-error.md` - Event handler error resolution
- `docs/research-subagent-tracking.md` - Research subagent implementation guide

---

## 2026-02-18 - Research Subagent Tracking

### Added
- **Research Details Page:** Subagent tracking sections
  - Active Subagents section (expanded by default)
  - Completed Subagents section (collapsed by default)
  - Tracks Mary, Carson, Victor, Maya, Quinn personas
  - Shows duration, status, timestamps
  - Clickable cards for drill-down to subagent details
  - **Commit:** 02084e7

### Components
- `components/research-view/research-subagent-grid.tsx` - New component for research subagents
- Uses existing `SubagentCard` component for consistency

### API Enhancements
- `app/api/research-state/route.ts` - Added subagent data support
  - Reads from `/Users/austenallred/clawd/workspaces/research-lead/research-state.json`
  - Maintains backward compatibility with project registry

---

## 2026-02-18 - Build Fixes

### Fixed
- **Card Component:** Added `'use client'` directive to fix event handler errors
  - Allows SubagentCard and CollapsibleSection to pass event handlers
  - **Commit:** d5a7835

- **TypeScript:** Added `projectId?: string` to Session type in section-counts
  - Fixes build error blocking deployment
  - **Commit:** 74a9d66

### Build Maintenance
- Cleared stale build caches (`.next/`, `node_modules/.cache`)
- Removed dev lock files to resolve port conflicts
- Dev server running successfully on port 3000

---

## Architecture

### Research Lead Integration Points

**Dashboard → Research Lead:**
- Dashboard reads from research-lead workspace: `research-state.json`
- Expected structure:
  ```json
  {
    "researchId": "project-id",
    "topic": "Research topic",
    "status": "active|complete|failed",
    "startedAt": "ISO-8601",
    "completedAt": "ISO-8601",
    "findings": ["finding 1", "finding 2"],
    "outputPath": "ideas/{name}-{timestamp}/",
    "subagents": [
      {
        "persona": "Carson|Victor|Maya|Quinn|Mary",
        "role": "Brainstorming Coach|...",
        "task": "ideate-solutions|validate-concept",
        "status": "active|complete",
        "startedAt": "ISO-8601",
        "completedAt": "ISO-8601",
        "duration": "5m 12s",
        "sessionKey": "agent:carson:research-1"
      }
    ]
  }
  ```

**Research Lead Workflow:**
1. Problem Framing (2-3 min)
2. CIS Ideation (5-8 min, parallel) - spawn Carson, Victor, Maya, Quinn
3. Consolidation (2-3 min)
4. Mary Validation (8-12 min)
5. Product Brief Compilation (3 min)

**Dashboard Updates:**
- Shows "Research in Progress" during phases 1-4
- Shows subagents as they spawn (phase 2)
- Shows findings when complete (phase 5)

---

## Future Enhancements

### Research Lead Features
- [ ] Real-time progress updates (current phase indicator)
- [ ] Estimated time remaining based on subagent progress
- [ ] Partial findings display (streaming as generated)
- [ ] Cancel button for active research sessions
- [ ] Registry check results visualization

### Project Lead Features
- [ ] Phase progress indicators
- [ ] Dependency graph visualization
- [ ] Story velocity metrics
- [ ] Quality gate details (Murat reports)
- [ ] Batch story spawn visualization

---

## Technical Debt

### Known Issues
- Research sessions share single `research-state.json` file
  - Multiple concurrent research sessions may conflict
  - TODO: Per-session state files

- Session logs API performance
  - Large transcripts slow down page load
  - TODO: Pagination or lazy loading

### Performance Optimizations
- [ ] Implement proper caching for sessions API
- [ ] Add WebSocket support for real-time updates
- [ ] Optimize subagent grid rendering for large lists

---

**Last Updated:** 2026-02-18 18:30 CST
