# Research Lead v1 - FINAL Implementation Plan

**Date:** 2026-02-16 22:14 CST  
**Status:** FINAL - Ready to implement  
**Target:** 20-28 min per idea, both single and batch modes supported  
**Key innovation:** Research Registry for coordination

---

## Overview

Research Lead validates product ideas through multi-perspective ideation (CIS personas) and analytical validation (Mary), producing comprehensive product briefs ready for Project Lead execution.

**Supports two modes:**
- **Single mode:** 1 specific idea → 1 product brief (20-28 min)
- **Batch mode:** 1 broad topic → 3-5 product briefs (25-30 min, parallel)

**Key feature:** Research Registry coordinates parallel sessions + historical deduplication

---

## Research Registry (Coordination Layer)

**File:** `/Users/austenallred/clawd/research-registry.json`

**Purpose:**
- Track ideas in-progress (parallel Research Lead sessions)
- Track historical ideas (existing projects)
- Enable deduplication across parallel sessions AND history

### Registry Structure

```json
{
  "inProgress": [
    {
      "sessionId": "agent:research-lead:productivity-1",
      "conceptName": "Meeting Cost Tracker",
      "briefDescription": "Real-time meeting cost calculator showing $ spent per second",
      "phase": "validation",
      "timestamp": "2026-02-16T22:00:00-06:00",
      "angle": "meeting efficiency",
      "spawnedBy": "batch-productivity-tools"
    },
    {
      "sessionId": "agent:research-lead:productivity-2",
      "conceptName": "Focus Mode Fortress",
      "briefDescription": "AI-powered distraction blocker with smart whitelist",
      "phase": "ideation",
      "timestamp": "2026-02-16T22:00:15-06:00",
      "angle": "focus & distraction blocking",
      "spawnedBy": "batch-productivity-tools"
    }
  ],
  "historical": [
    {
      "projectPath": "projects-queue/screenshot-beautifier-2026-02-16-21-00/",
      "conceptName": "Screenshot Beautifier",
      "briefDescription": "Add browser chrome, shadows, gradients to screenshots",
      "timestamp": "2026-02-16T21:00:00-06:00"
    },
    {
      "projectPath": "projects/meeting-time-tracker/",
      "conceptName": "Meeting Time Tracker",
      "briefDescription": "Track meeting duration and cost analytics",
      "timestamp": "2026-02-15T14:30:00-06:00"
    }
  ]
}
```

### Registry Operations

**1. REGISTER** (add to inProgress):
```
Research Lead:
  1. Read research-registry.json
  2. Add entry to inProgress array
  3. Write atomically (overwrite file)
```

**2. UPDATE** (modify inProgress entry):
```
Research Lead:
  1. Read research-registry.json
  2. Find entry by sessionId
  3. Update fields (conceptName, phase, briefDescription)
  4. Write atomically
```

**3. CHECK** (detect duplicates):
```
Research Lead:
  1. Read research-registry.json
  2. For each entry in (inProgress + historical):
     - Compare my concept vs entry concept
     - Use Claude: "Is '{myDescription}' substantially the same as '{entryDescription}'?"
  3. Return: DUPLICATE or UNIQUE
```

**4. UNREGISTER** (remove from inProgress):
```
Research Lead:
  1. Read research-registry.json
  2. Remove entry from inProgress (by sessionId)
  3. Add entry to historical (with projectPath)
  4. Write atomically
```

---

## Research Lead Workflow

### Phase 1: Problem Framing (2-3 min)

**Input:** Spawn task from Kelly (includes idea/angle)

**Process:**
1. Extract problem from task
2. Generate initial concept:
   - Concept name (3-5 words)
   - Brief description (1-2 sentences)
   - Target user
   - Core value proposition

**🔒 CHECKPOINT 1: Registry Check**
```
3. READ research-registry.json
4. CHECK for duplicates:
   - Compare my concept vs ALL entries (inProgress + historical)
   - "Is my concept substantially the same?"
5. Decision:
   - If DUPLICATE → ABORT (announce to Kelly, clean up)
   - If UNIQUE → REGISTER concept (add to inProgress), CONTINUE
```

**Output:** problem-brief.md + registry entry

**Time:** 3-4 min (2 min framing + 1-2 min registry check)

---

### Phase 2: CIS Ideation (5-8 min, parallel)

**Process:**
1. Spawn 4 CIS personas simultaneously:
   - Carson (Brainstorming Coach)
   - Victor (Innovation Strategist)
   - Maya (Design Thinking Coach)
   - Quinn (Creative Problem Solver)

2. Task for each:
   ```
   "Generate 5 approaches to: {problem}.
    Focus angle: {angle} (if provided).
    Use your methodology. Output: markdown list."
   ```

3. Wait for all 4 to complete

**Output:**
- carson-ideas.md (5 approaches)
- victor-ideas.md (5 approaches)
- maya-ideas.md (5 approaches)
- quinn-ideas.md (5 approaches)
- **Total: 20 raw approaches**

**Time:** 5-8 min (parallel execution)

---

### Phase 2.5: Consolidation (2-3 min)

**Process:**
1. Read all 4 CIS outputs (20 approaches total)
2. Identify semantic duplicates:
   - "Are approach #3 and #7 substantially the same?"
   - Same problem + same solution → MERGE
   - Same problem + different solution → KEEP BOTH
3. Merge similar ideas with attribution
4. Select BEST concept from consolidated set:
   - Most novel
   - Best alignment with angle
   - Strongest value proposition

**🔒 CHECKPOINT 2: Registry Check**
```
5. Refined concept may have evolved during ideation
6. READ research-registry.json
7. CHECK for duplicates again (another session might have registered similar)
8. Decision:
   - If NOW DUPLICATE → ABORT
   - If STILL UNIQUE → UPDATE registry entry (refined description), CONTINUE
```

**Output:** consolidated-approaches.md (8-15 unique approaches) + best concept selected

**Time:** 3-4 min (2 min consolidation + 1-2 min registry check)

---

### Phase 3: Mary Validation (8-12 min)

**Process:**
1. Spawn Mary with best concept

2. Task for Mary:
   ```
   "Validate this product concept:
    
    Concept: {conceptName}
    Description: {briefDescription}
    
    Perform:
    1. Competitive check (web_search for competitors, how saturated?)
    2. Feasibility study (buildable with our stack? Complexity 1-10)
    3. Market evidence (do people search for this? Search volume estimates)
    4. Business model viability (can we monetize? Pricing strategy)
    5. Novelty score (1-10: incremental vs disruptive)
    
    Output: mary-validation.md with scores + detailed rationale."
   ```

3. Wait for Mary completion

**Output:** mary-validation.md (validation scores + competitive analysis)

**Time:** 8-12 min (Mary's research + analysis)

---

### Phase 5: Product Brief Compilation (3 min)

**🔒 CHECKPOINT 3: Final Registry Check**
```
1. READ research-registry.json
2. CHECK for duplicates one last time (final safety net)
3. Decision:
   - If DUPLICATE → ABORT
   - If UNIQUE → PROCEED to compilation
```

**Compilation:**
4. Generate product name:
   - 1 primary name
   - 3-4 alternative names
   - Criteria: self-explanatory, memorable, domain-available (bonus)

5. Compile comprehensive product-brief.md:
   - Product names
   - Problem statement
   - Solution approach (with novelty angle)
   - Target market
   - Competitive landscape (from Mary)
   - Business model + monetization
   - Technical requirements (feasibility notes)
   - User stories (from Maya)
   - Success criteria
   - Out of scope
   - Risk mitigation (from Mary)

6. Create name slug: `{primary-name-lowercase-hyphenated}`

7. Save to: `projects-queue/{name-slug}-YYYY-MM-DD-HH-MM/product-brief.md`

**🔓 UNREGISTER from Registry**
```
8. READ research-registry.json
9. REMOVE entry from inProgress (by sessionId)
10. ADD entry to historical:
    {
      "projectPath": "projects-queue/{name-slug}-{timestamp}/",
      "conceptName": "{conceptName}",
      "briefDescription": "{briefDescription}",
      "timestamp": "{now}"
    }
11. WRITE research-registry.json
```

12. Signal Kelly: "Product brief complete: {conceptName}"

**Output:** 
- projects-queue/{name-slug}-{timestamp}/product-brief.md
- Registry updated (inProgress → historical)

**Time:** 4 min (3 min compilation + 1 min registry update)

---

### Abort Protocol

**When duplicate detected at any checkpoint:**

```markdown
### Abort Sequence

1. Log abort details:
   - Phase: {checkpoint-where-detected}
   - Duplicate of: {matching-concept-name}
   - Session ID: {matching-session-id or project-path}
   - Time saved: ~{10-20} min

2. Announce to Kelly:
   "Research Lead ABORTED: Duplicate concept detected
    My concept: '{myConceptName}'
    Matches: '{duplicateConceptName}'
    Phase: {phase}
    Time saved: {minutes} min"

3. Clean up:
   - UNREGISTER from inProgress (remove my entry)
   - Delete workspace artifacts (optional)
   - Mark session complete

4. Exit gracefully

Kelly handling:
- Don't wait for aborted Research Lead
- In batch mode: Expected behavior (1-2 aborts normal)
- Continue with remaining Research Leads
```

---

## Timeline Summary

### Single Mode (1 idea)
- Phase 1: Problem framing + CHECK 1: **3-4 min**
- Phase 2: CIS ideation (parallel): **5-8 min**
- Phase 2.5: Consolidation + CHECK 2: **3-4 min**
- Phase 3: Mary validation: **8-12 min**
- Phase 5: Compilation + CHECK 3 + UNREGISTER: **4 min**
- **Total: 23-32 min** (worst case, no abort)

**Early abort savings:**
- Abort at CHECK 1: Save ~20 min
- Abort at CHECK 2: Save ~15 min
- Abort at CHECK 3: Save ~4 min

### Batch Mode (5 ideas)
Kelly spawns 5 Research Leads in parallel:
- All 5 start simultaneously
- 1-2 may abort early (duplicates detected)
- 3-5 complete successfully
- **Total: 25-32 min** (parallel, longest Research Lead determines batch time)
- **Output: 3-5 guaranteed unique product briefs**

---

## Kelly Integration

### Trigger Detection

**Single mode:**
- "Research screenshot beautifier" ← specific product
- "Validate this idea: meeting cost calculator" ← concrete idea
- User mentions specific product name

**Batch mode:**
- "Research productivity tools" ← broad category
- "Generate app ideas for remote teams" ← open-ended
- "Explore wellness app opportunities" ← vague topic

### Single Mode Spawn

```
Kelly receives: "Research screenshot beautifier"
    ↓
Kelly spawns 1 Research Lead:
  sessions_spawn(
    agentId: "research-lead",
    label: "Research: screenshot beautifier",
    task: "Research and validate product idea: 'screenshot beautifier'.
           Generate comprehensive product brief.
           Output to: projects-queue/"
  )
```

### Batch Mode Orchestration

```markdown
Kelly receives: "Research productivity tools"
    ↓
Kelly Step 1: Generate 5 Diverse Angles (2-3 min)

Use Claude:
"Given broad topic 'productivity tools', generate 5 distinct angles/sub-categories 
that approach it from very different perspectives. Make them diverse enough that 
solutions will be architecturally different, not incremental variations.

Output: JSON array of objects with 'angle' and 'focus' fields."

Example output:
[
  { "angle": "time-tracking", "focus": "Measurement & accountability" },
  { "angle": "focus-protection", "focus": "Distraction blocking & deep work" },
  { "angle": "meeting-efficiency", "focus": "Meeting cost & optimization" },
  { "angle": "async-communication", "focus": "Reduce synchronous interruptions" },
  { "angle": "energy-management", "focus": "Team wellbeing & burnout prevention" }
]
    ↓
Kelly Step 2: Spawn 5 Research Leads (parallel)

For each angle:
  sessions_spawn(
    agentId: "research-lead",
    label: "Research: {topic} - {angle}",
    task: "Research and validate product idea for: '{topic}'.
           Focus angle: '{angle}' - {focus}.
           Constrain ideation to this angle.
           Generate comprehensive product brief.
           Output to: projects-queue/"
  )

Example spawns:
- Research Lead #1: productivity-tools / time-tracking
- Research Lead #2: productivity-tools / focus-protection
- Research Lead #3: productivity-tools / meeting-efficiency
- Research Lead #4: productivity-tools / async-communication
- Research Lead #5: productivity-tools / energy-management
    ↓
Kelly Step 3: Monitor Completion

Wait for all sessions to complete (or abort).

Expected outcomes:
- 3-5 sessions complete successfully (unique briefs)
- 0-2 sessions abort (duplicates detected)
    ↓
Kelly Step 4: Package Batch

Read projects-queue/ for briefs from this batch (timestamp-based).

Create batch folder:
  projects-queue/batch-{topic-slug}-{timestamp}/
    ├── batch-metadata.json
    ├── {brief-1-slug}/
    │   └── product-brief.md
    ├── {brief-2-slug}/
    │   └── product-brief.md
    ├── {brief-3-slug}/
    │   └── product-brief.md
    └── {brief-4-slug}/
        └── product-brief.md

batch-metadata.json:
{
  "topic": "productivity tools",
  "timestamp": "2026-02-16T22:00:00-06:00",
  "anglesGenerated": 5,
  "researchLeadsSpawned": 5,
  "briefsCompleted": 4,
  "sessionsAborted": 1,
  "briefs": [
    {
      "name": "Meeting Cost Tracker",
      "slug": "meeting-cost-tracker",
      "angle": "meeting-efficiency",
      "path": "meeting-cost-tracker/"
    },
    ...
  ],
  "aborts": [
    {
      "sessionId": "agent:research-lead:productivity-2",
      "reason": "Duplicate of meeting-cost-tracker",
      "phase": "problem-framing"
    }
  ]
}
    ↓
Kelly announces:
"Batch research complete: {N} unique product briefs for '{topic}' in projects-queue/batch-{slug}/"
```

**Note:** Kelly does NOT need post-dedup logic. Research Registry handles all deduplication automatically.

---

## Architecture Summary

### Agents & Workspaces

**Agent configurations (AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md):**
- `/Users/austenallred/.openclaw/agents/carson/`
- `/Users/austenallred/.openclaw/agents/victor/`
- `/Users/austenallred/.openclaw/agents/maya/`
- `/Users/austenallred/.openclaw/agents/quinn/`
- `/Users/austenallred/.openclaw/agents/mary/`
- `/Users/austenallred/.openclaw/agents/research-lead/`

**Workspaces (auto-created by OpenClaw):**
- `/Users/austenallred/.openclaw/workspace-carson/`
- `/Users/austenallred/.openclaw/workspace-victor/`
- `/Users/austenallred/.openclaw/workspace-maya/`
- `/Users/austenallred/.openclaw/workspace-quinn/`
- `/Users/austenallred/.openclaw/workspace-mary/`
- `/Users/austenallred/.openclaw/workspace-research-lead/`

**Shared coordination:**
- `/Users/austenallred/clawd/research-registry.json`

**Output:**
- `/Users/austenallred/clawd/projects-queue/{name-slug}-{timestamp}/`
- `/Users/austenallred/clawd/projects-queue/batch-{topic-slug}-{timestamp}/`

---

## Implementation Tasks

### Phase 1: Agent Configurations (2.5-3 hours)

**Task 1.1: Create Carson Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/carson/`
- Extract from: `_bmad/cis/agents/brainstorming-coach.md`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Time: 30 min

**Task 1.2: Create Victor Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/victor/`
- Extract from: `_bmad/cis/agents/innovation-strategist.md`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Time: 30 min

**Task 1.3: Create Maya Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/maya/`
- Extract from: `_bmad/cis/agents/design-thinking-coach.md`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Time: 30 min

**Task 1.4: Create Quinn Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/quinn/`
- Extract from: `_bmad/cis/agents/creative-problem-solver.md`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Time: 30 min

**Task 1.5: Create Mary Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/mary/`
- Extract from: `_bmad/bmm/agents/analyst.md`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Include: Market research + competitive analysis methodologies
- Time: 45 min

---

### Phase 2: Research Lead Agent (1 hour)

**Task 2.1: Create Research Lead Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/research-lead/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md

**AGENTS.md content:**
- 5-phase workflow (problem framing → CIS → consolidation → Mary → compilation)
- Registry operations (register, check, update, unregister)
- 3 checkpoint protocols (CHECK 1, CHECK 2, CHECK 3)
- Abort protocol
- Spawning protocols (CIS + Mary)
- Output format (product-brief.md structure)

**SOUL.md:**
- Research orchestrator persona
- Analytical + creative balance
- Systematic but flexible

**TOOLS.md:**
- sessions_spawn, sessions_send, sessions_list
- read, write, edit (registry + output)
- web_search (historical project scan)

**IDENTITY.md:**
- Name: Research Lead
- Emoji: 🔬
- Creature: Research Orchestrator

**Time: 1 hour**

---

### Phase 3: Infrastructure Setup (30 min)

**Task 3.1: Initialize Research Registry**
- Create: `/Users/austenallred/clawd/research-registry.json`
- Initial content:
  ```json
  {
    "inProgress": [],
    "historical": []
  }
  ```
- Time: 5 min

**Task 3.2: Scan Existing Projects (populate historical)**
- Scan: `projects/*/intake.md` or `projects/*/product-brief.md`
- Scan: `projects-queue/*/product-brief.md`
- Extract: concept names + descriptions
- Populate: registry.historical
- Time: 10 min

**Task 3.3: Gateway Configuration**
- Add 6 agents to gateway config (carson, victor, maya, quinn, mary, research-lead)
- All use Sonnet 4.5
- Workspace paths: `${openclaw.home}/workspace-{agentId}`
- Time: 15 min

---

### Phase 4: Kelly Integration (30 min)

**Task 4.1: Update Kelly AGENTS.md**
- Add: Research Lead trigger detection (single vs batch)
- Add: Batch angle generation logic
- Add: Research Lead spawn protocol (single + batch)
- Add: Batch packaging logic
- Time: 20 min

**Task 4.2: Create Kelly Factory Skill (optional)**
- Location: `/Users/austenallred/clawd/skills/factory/research-lead-spawning/SKILL.md`
- Content: Detailed spawn templates, angle generation examples
- Purpose: Keep Kelly AGENTS.md concise
- Time: 10 min

---

### Phase 5: Testing & Validation (1-1.5 hours)

**Task 5.1: Test CIS Persona Spawns**
- Manually spawn each CIS persona (carson, victor, maya, quinn)
- Verify: workspace creation, AGENTS.md loads, task execution
- Give simple ideation task, check output format
- Time: 20 min

**Task 5.2: Test Mary Spawn**
- Manually spawn Mary
- Give validation task, verify output
- Check web_search usage
- Time: 10 min

**Task 5.3: Test Research Registry Operations**
- Manually test: register, check, update, unregister
- Verify: atomic writes, duplicate detection works
- Test: parallel reads (simulate 2 Research Leads checking simultaneously)
- Time: 15 min

**Task 5.4: Test Research Lead (Single Mode)**
- User triggers: "Research pomodoro timer"
- Kelly spawns Research Lead
- Verify: Full pipeline executes (CIS → Mary → brief)
- Verify: Registry checkpoints work
- Verify: Product brief quality
- Time: 30 min (includes Research Lead runtime)

**Task 5.5: Test Batch Mode**
- User triggers: "Research productivity tools"
- Kelly generates angles
- Kelly spawns 5 Research Leads
- Verify: Parallel execution, registry coordination
- Verify: 1-2 aborts expected (normal behavior)
- Verify: Batch packaging works
- Time: 40 min (includes Research Lead runtimes + Kelly orchestration)

**Task 5.6: Test Abort Protocol**
- Manually trigger duplicate scenario
- Verify: Abort detected, session cleaned up, Kelly notified
- Time: 10 min

---

## Total Implementation Timeline

**Phase 1:** CIS + Mary agent configs - **2.5-3 hours**  
**Phase 2:** Research Lead agent config - **1 hour**  
**Phase 3:** Infrastructure setup (registry + gateway config) - **30 min**  
**Phase 4:** Kelly integration - **30 min**  
**Phase 5:** Testing - **1-1.5 hours**

**Total: 5.5-6.5 hours**

---

## Success Criteria

**MVP is successful when:**

✅ **Single mode works:**
- User triggers "Research {specific-idea}"
- Research Lead completes in <30 min
- Product brief saved to projects-queue/
- Brief is comprehensive (all sections complete)
- Historical dedup works (doesn't rebuild existing projects)

✅ **Batch mode works:**
- User triggers "Research {broad-topic}"
- Kelly generates 5 diverse angles
- 5 Research Leads spawn in parallel
- 3-5 complete successfully, 0-2 abort (expected)
- 3-5 unique product briefs in batch folder
- Within-batch dedup works (no duplicate briefs)

✅ **Registry coordination works:**
- Parallel Research Leads detect duplicates
- Aborts happen at appropriate checkpoints
- inProgress → historical transition works
- No race conditions (atomic writes)

✅ **Quality checks:**
- Product briefs are comprehensive
- Mary's validation is accurate
- CIS personas generate diverse approaches
- Concept names are self-explanatory

---

## Future Enhancements (Post-MVP)

**Manual Mode:**
- User-guided research with questions at key phases
- Leverages BMAD workflow.yaml patterns
- +4 hours implementation

**Caravaggio/Sophia Integration:**
- Visual pitch decks (Caravaggio)
- Narrative storytelling (Sophia)
- Phase 5+ optional enhancements

**Research History Analytics:**
- Track: which angles produce best ideas
- Track: abort rate per topic
- Optimize: angle generation based on history

**Registry Cleanup:**
- Periodic scan for stale inProgress entries (sessions that crashed)
- Archive old historical entries (>6 months)

**Domain Availability Check:**
- Mary checks .com availability for suggested names
- Filters out unavailable domains

---

## Files to Create

**Agent configs (6 directories × 4 files each = 24 files):**
- `/Users/austenallred/.openclaw/agents/carson/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`
- `/Users/austenallred/.openclaw/agents/victor/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`
- `/Users/austenallred/.openclaw/agents/maya/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`
- `/Users/austenallred/.openclaw/agents/quinn/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`
- `/Users/austenallred/.openclaw/agents/mary/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`
- `/Users/austenallred/.openclaw/agents/research-lead/{AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md}`

**Infrastructure:**
- `/Users/austenallred/clawd/research-registry.json`

**Documentation (optional but recommended):**
- `/Users/austenallred/clawd/skills/factory/research-lead-spawning/SKILL.md`
- `/Users/austenallred/clawd/docs/research-registry-protocol.md`

---

## Edge Cases & Error Handling

**All Research Leads abort (batch mode):**
- Scenario: All 5 detect duplicates
- Kelly announces: "Batch research complete: 0 unique briefs (all duplicates). Recommend pivot or broader angle."
- Operator can: manually trigger different angles, or skip

**Registry corruption:**
- If research-registry.json is malformed
- Research Lead: Log error, attempt recovery (use backup)
- Fallback: Create new registry, scan projects-queue/ to rebuild historical

**Research Lead crashes mid-session:**
- Stale inProgress entry remains
- Next Research Lead: Compares against stale entry, may false-positive duplicate
- Mitigation: Add timestamp check (ignore inProgress entries >1 hour old)

**Mary spawn failure:**
- Research Lead retries once
- If second failure: Skip validation, compile brief with "UNVALIDATED" marker
- Brief still saved (operator can manually validate)

**CIS persona spawn failure:**
- If <2 personas succeed: Abort (insufficient diversity)
- If 2-3 succeed: Continue with reduced input (note in brief)

---

## Open Questions (Minimal)

**Q1: Registry timestamp staleness threshold?**
- How long before we consider inProgress entry "stale" (crashed session)?
- **Recommendation:** 1 hour (Research Lead should complete in <30 min)

**Q2: Historical registry pruning?**
- Do we ever remove old historical entries?
- **Recommendation:** Keep forever (disk space negligible), or archive after 6 months

**Q3: Batch size configuration?**
- Always 5, or let user specify? ("Research productivity tools --count=10")
- **Recommendation:** Default 5, make configurable later

---

## Summary of Final Architecture

✅ **1 Research Lead = 1 idea** (clean, simple)

✅ **Research Registry** coordinates parallel sessions + historical dedup

✅ **3 checkpoints** catch duplicates early (save time)

✅ **Both modes supported:** Single (20-28 min) + Batch (25-32 min)

✅ **Kelly orchestrates:** Angle generation + parallel spawn

✅ **All Sonnet 4.5:** Balanced, cheap, fast

✅ **Output:** projects-queue/ (ready for Project Lead)

✅ **Timeline:** 5.5-6.5 hours to MVP

---

**Ready to implement!** 🚀

---

**End of Final Implementation Plan**
