# Barry Fast Mode Plan - Session Detail Enhancement

## Goal
Enhance the subagent/session detail view with persona/role display, enhanced timestamps, and log location preview.

## Assumptions
- Project uses Next.js 15+ (App Router)
- TypeScript with existing component structure
- project-state.json may contain persona/role fields for new subagents
- Graceful degradation required for legacy data
- Session transcripts exist at ~/.openclaw/sessions/{sessionKey}/transcript.jsonl

## Workstreams

### W1: Data Model & Extraction
**Files:** 
- `app/session/[sessionKey]/page.tsx` (SessionData interface, getSessionData function)

**Dependencies:** None

**Tasks:**
- Add `persona?: string` and `role?: string` to SessionData interface
- Update getSessionData to extract persona/role from project-state.json subagent entries
- Handle graceful degradation for old subagents without persona field

**Success criteria:** 
- SessionData interface includes optional persona/role fields
- getSessionData extracts persona/role when available
- No runtime errors for legacy data

---

### W2: Header Enhancement
**Files:**
- `app/session/[sessionKey]/page.tsx` (header section)

**Dependencies:** W1 (needs SessionData with persona/role)

**Tasks:**
- Add persona badge to header (e.g., "Barry • Developer")
- Style badge with terminal aesthetic
- Show role as secondary text if available
- Gracefully hide when persona/role not present

**Success criteria:**
- Persona/role visible in header when present
- Consistent terminal styling
- Clean fallback for missing data

---

### W3: Enhanced Timestamps
**Files:**
- `components/subagent-view/session-metadata.tsx`

**Dependencies:** None

**Tasks:**
- Update timestamp display to show both absolute and relative formats
- Absolute: "Feb 16, 2026 1:45:32 PM CST"
- Relative: "2 hours ago"
- Use existing Timestamp component as base or enhance it
- Apply to startedAt, completedAt, lastActivity fields

**Success criteria:**
- All timestamps show both absolute and relative time
- Timezone handling works correctly (CST)
- Relative time updates appropriately

---

### W4: Logs Section Component
**Files:**
- `components/subagent-view/logs-section.tsx` (new file)
- `app/session/[sessionKey]/page.tsx` (add LogsSection to page)

**Dependencies:** None

**Tasks:**
- Create LogsSection component that accepts sessionKey
- Show transcript path: ~/.openclaw/sessions/{sessionKey}/transcript.jsonl
- Read last 10 lines of transcript using fs.promises.readFile
- Display preview in terminal-styled code block
- Handle errors gracefully (file not found, read errors)
- Add "Full transcript" link hint

**Success criteria:**
- LogsSection component created and integrated
- Transcript path displayed correctly
- Last 10 lines preview works
- Graceful error handling for missing/unreadable transcripts
- Terminal aesthetic matches existing components

---

## Integration Steps
1. Test each workstream independently in dev server
2. Verify on sample session with all fields (completed subagent)
3. Verify on legacy session without persona/role
4. Verify on session without transcript
5. Check responsive layout (mobile/desktop)
6. Final visual QA pass

## Verification Checklist
- [ ] Persona/role displays in header when available
- [ ] No errors for sessions without persona/role
- [ ] Timestamps show both absolute (full format) and relative ("X ago")
- [ ] Logs section shows transcript path
- [ ] Last 10 lines of transcript render correctly
- [ ] Error handling works for missing transcripts
- [ ] Terminal aesthetic consistent across all new UI
- [ ] Responsive layout works on mobile
- [ ] No console errors
- [ ] TypeScript compiles without errors
