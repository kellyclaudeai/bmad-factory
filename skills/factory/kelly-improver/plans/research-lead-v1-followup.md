# Research Lead v1 - Follow-Up Decisions

**Date:** 2026-02-16 21:19 CST  
**Status:** Additional architecture decisions and clarifications

---

## Follow-Up Questions & Decisions

### **1. Manual Mode - workflow.yaml Value & User Interaction**

**User feedback:**
> "The workflow.yaml might be of value though? It might be helpful to have a version of the flow that is user-guided, would probably be for the 1 idea and not batch. The default will be auto but we could have a MANUAL MODE of research-lead where the user is asked questions throughout. Exactly which questions are surfaced is a tough decision."

**Analysis:**

**Two Research Lead Modes:**

#### **AUTO MODE (Default)**
- Fully autonomous pipeline
- No user interaction after trigger
- For both Batch and Single pipelines
- Fast, hands-off

#### **MANUAL MODE (Optional, Single pipeline only)**
- User-guided through questions at key decision points
- Leverages BMAD workflow.yaml interactive facilitation
- Only for Single pipeline (not Batch - can't interactively guide 3-5 ideas)
- Slower, but higher quality/customization

---

**Proposed MANUAL MODE Flow:**

```
Phase 1: Problem Framing (INTERACTIVE)
├─ Research Lead asks clarifying questions:
│  - "What problem are you trying to solve?"
│  - "Who is the target user?"
│  - "What are your must-have vs nice-to-have features?"
│  - "What's out of scope?"
│  - "What's your success criteria?"
└─ Output: problem-brief.md (comprehensive, user-validated)

Phase 2: CIS Ideation (AUTO)
├─ Spawn 4 CIS personas autonomously
└─ Generate 20 approaches

Phase 2.5: Consolidation (AUTO)
├─ Research Lead dedupes/merges
└─ 12-15 unique approaches

Phase 3: Mary Validation (PARTIALLY INTERACTIVE)
├─ Mary performs competitive/feasibility analysis (auto)
├─ Mary presents findings to user (interactive)
├─ User weighs in: "This competitor isn't relevant because..."
└─ Mary refines scoring based on user input
└─ Output: Top 3-5 validated approaches

Phase 4: Approach Selection (INTERACTIVE)
├─ Research Lead presents top 3-5 approaches
├─ User picks: "I like #2, but can we combine X from #3?"
└─ Research Lead confirms/refines chosen approach

Phase 5: Product Brief Compilation (PARTIALLY INTERACTIVE)
├─ Research Lead drafts comprehensive product-brief.md
├─ Research Lead asks follow-up questions:
│  - "What's the MVP scope?"
│  - "Any technical constraints I should know?"
│  - "Timeline expectations?"
└─ Output: product-brief.md (user-validated, comprehensive)
```

---

**Which Questions to Surface in MANUAL MODE?**

**Critical questions (definitely ask):**
1. **Problem framing (Phase 1):**
   - "What problem are you solving?"
   - "Who is the target user?"
   - "What's out of scope?"

2. **Approach selection (Phase 4):**
   - "Which approach resonates? Pick by number or describe."
   - "Want to combine elements from multiple approaches?"

3. **Product brief validation (Phase 5):**
   - "What's the MVP scope?"
   - "Any technical constraints?"
   - "Timeline expectations?"

**Optional questions (could ask, but might slow down):**
- "Do you want to challenge any of Mary's competitive findings?"
- "Any specific CIS personas you want to emphasize?"
- "Should we explore any wild ideas from Carson more deeply?"

**Recommendation:**
- **Start with 5-7 critical questions** (Phases 1, 4, 5)
- **Keep Mary and CIS autonomous** (Phases 2, 3) - showing results but not stopping for input
- **Add more interactive points based on user feedback** after MVP

---

**Implementation Strategy:**

**AUTO MODE (MVP priority):**
- Build this first
- No interactive prompts
- Default for both Batch and Single

**MANUAL MODE (Phase 2 enhancement):**
- Add after AUTO MODE works
- Trigger: "Research [idea] --manual" or dedicated command
- Leverage BMAD workflow.yaml patterns for question flow
- Only for Single pipeline
- User can "upgrade" auto-generated brief with manual refinement

---

### **2. Batch Architecture - Efficiency Trade-offs**

**User feedback:**
> "I think it should just be the same workflow, but we either batch it to run it multiple times (probably a separate project lead for each instance? Or would it be more token efficient to batch some of these things? I like the separation/rabbit-hole of having each idea have a research lead, and the output of each research-lead session is 1 product-brief. But that might be inefficient."

**Analysis:**

Two architectural options for Batch mode:

---

#### **Option A: Separate Research Lead Per Idea** (User preference)

**Architecture:**
```
User: "Research productivity tools"
    ↓
Kelly spawns 5 Research Lead sessions (one per idea)
    ↓
Each Research Lead:
  - Gets a different "angle" or "theme"
  - Spawns 4 CIS personas independently
  - Spawns Mary independently
  - Produces 1 product-brief.md
    ↓
Output: 5 separate research sessions
  - research/pomodoro-ai-coach-2026-02-16-21-00/
  - research/meeting-cost-calc-2026-02-16-21-01/
  - research/focus-mode-blocker-2026-02-16-21-02/
  - research/time-tracking-auto-2026-02-16-21-03/
  - research/task-batching-2026-02-16-21-04/
```

**Pros:**
- ✅ Clean separation (1 Research Lead = 1 idea = 1 rabbit hole)
- ✅ Parallelizable (spawn all 5 simultaneously)
- ✅ Isolated contexts (each Research Lead has its own CIS/Mary outputs)
- ✅ Easier to debug (each session is independent)
- ✅ Can inspect each research session separately
- ✅ Operator can review in-progress research for any idea

**Cons:**
- ❌ Token inefficient (duplicate CIS/Mary spawns × 5)
- ❌ Time inefficient (5 full research cycles)
- ❌ How does Kelly generate 5 "angles" from single trigger?
- ❌ More complex orchestration (Kelly manages 5 Research Leads)

**Token cost estimate:**
- 1 Research Lead session ≈ 100K tokens (4 CIS + Mary + compilation)
- 5 Research Leads × 100K = **500K tokens total**

**Time estimate:**
- 1 Research Lead ≈ 60-90 min
- 5 parallel Research Leads ≈ **60-90 min** (same if parallel)
- 5 sequential Research Leads ≈ **5-7.5 hours** (ouch)

---

#### **Option B: Single Research Lead, Batched Internally** (Token efficient)

**Architecture:**
```
User: "Research productivity tools"
    ↓
Kelly spawns 1 Research Lead session (Batch mode)
    ↓
Research Lead (Batch):
  - Phase 1: Problem framing (productivity tools)
  - Phase 2: Spawn 4 CIS personas ONCE
    - Each CIS generates 5 approaches (20 total)
  - Phase 2.5: Consolidation (20 → 12-15 unique)
  - Phase 3: Spawn Mary ONCE
    - Mary validates all 12-15 approaches
    - Selects top 5 (instead of top 3-5)
  - Phase 4: Batch compilation
    - Research Lead compiles 5 separate product briefs
    - Each brief focuses on 1 of the top 5 approaches
    ↓
Output: 1 research session with 5 product briefs
  - research/productivity-tools-batch-2026-02-16-21-00/
      ├─ phase2-ideation/ (shared CIS outputs)
      ├─ mary-validation.md (all 15 scored)
      ├─ product-brief-1-pomodoro-ai.md
      ├─ product-brief-2-meeting-cost.md
      ├─ product-brief-3-focus-blocker.md
      ├─ product-brief-4-time-tracking.md
      └─ product-brief-5-task-batching.md
```

**Pros:**
- ✅ Token efficient (CIS/Mary spawned once, shared across all briefs)
- ✅ Simpler orchestration (Kelly manages 1 Research Lead)
- ✅ Unified context (all ideas validated against each other)
- ✅ Mary can compare approaches directly ("Approach #2 is more novel than #7")

**Cons:**
- ❌ Less separation (1 Research Lead session = 5 ideas mixed)
- ❌ Harder to debug (CIS outputs are shared, not per-idea)
- ❌ Can't inspect individual idea research independently
- ❌ All 5 briefs tied to same research session

**Token cost estimate:**
- 1 Research Lead (Batch) ≈ 100K tokens (same as single)
- **100K tokens total** (5× more efficient)

**Time estimate:**
- Phase 2: 15-20 min (CIS ideation, same as single)
- Phase 3: 25-35 min (Mary validates 15 instead of 12, slight increase)
- Phase 4: 20-30 min (compile 5 briefs instead of 1)
- **Total: 60-85 min** (same as single)

---

#### **Hybrid Option C: Themed Research Leads**

**Architecture:**
```
User: "Research productivity tools"
    ↓
Kelly identifies 3 themes:
  - Theme 1: "Time tracking & measurement"
  - Theme 2: "Focus & distraction blocking"
  - Theme 3: "Meeting efficiency"
    ↓
Kelly spawns 3 Research Lead sessions (one per theme)
    ↓
Each Research Lead:
  - Focuses on its theme
  - Spawns 4 CIS personas with theme context
  - Produces 1-2 product briefs per theme
    ↓
Output: 3 research sessions, 3-6 product briefs total
```

**Pros:**
- ✅ Balanced: More separation than Option B, more efficient than Option A
- ✅ Thematic coherence (ideas grouped by category)
- ✅ Parallelizable (3 Research Leads simultaneously)

**Cons:**
- ❌ How does Kelly identify themes?
- ❌ Still more token-heavy than Option B

---

**Recommendation:**

**MVP: Option B (Single Research Lead, Batched Internally)**
- Most token/time efficient
- Simplest to implement
- Kelly just spawns 1 Research Lead with "batch mode" flag
- Research Lead handles internal batching (compile 3-5 briefs instead of 1)

**Future Enhancement: Option A (Separate Research Leads)**
- If user wants deep rabbit holes per idea
- If token cost isn't a concern
- If parallelization matters more than efficiency

**Implementation:**
```
Kelly spawn logic:

if (trigger includes "batch" or no specific idea):
    spawn_research_lead(mode="batch", count=5)  # Option B
else:
    spawn_research_lead(mode="single")  # Standard single brief
```

---

### **3. Product Naming & Timestamp Strategy**

**User feedback:**
> "We should also name the product ideas, and maybe put a timestamp, so that we know the order they came in, but the name is self explanatory. Part of the product brief should also be to generate a name (or a couple names) for the product."

**Implementation:**

#### **Product Brief Includes Name Generation**

**Phase 5 (Product Brief Compilation):**
```markdown
# Product Brief: [Generated Name]

## Product Names (Suggested)

**Primary:** Screenshot Beautifier  
**Alternatives:**
- SnapPrettify
- ScreenGlow
- ClipCanvas
- ShotPolish

## Overview
...
```

**Name Generation Task for Research Lead:**
- "Generate 1 primary product name and 3-4 alternatives"
- Names should be:
  - Self-explanatory (hints at functionality)
  - Memorable (easy to say/spell)
  - Unique (not obviously conflicting with major brands)
  - Domain-available (bonus - Mary could check .com availability)

---

#### **ideas-queue/ File Structure with Timestamp + Name**

**Format:** `<name-slug>-YYYY-MM-DD-HH-MM/`

```
projects/ideas-queue/
├─ screenshot-beautifier-2026-02-16-21-15/
│   └─ product-brief.md
│
├─ meeting-cost-calculator-2026-02-16-21-20/
│   └─ product-brief.md
│
├─ pomodoro-ai-coach-2026-02-16-21-25/
│   └─ product-brief.md
│
└─ batch-2026-02-16-21-30/  # Batch mode (multiple briefs)
    ├─ focus-mode-blocker/
    │   └─ product-brief.md
    ├─ time-tracking-auto/
    │   └─ product-brief.md
    └─ task-batching-assistant/
        └─ product-brief.md
```

**Naming convention:**
- **Single mode:** `<primary-name-slug>-YYYY-MM-DD-HH-MM/`
- **Batch mode:** `batch-YYYY-MM-DD-HH-MM/<name-slug>/`

**Timestamp format:**
- ISO-8601 simplified: `YYYY-MM-DD-HH-MM`
- Includes hour/minute for ordering within same day
- UTC or local time? **Recommendation: Local time** (easier for operator to correlate)

**Name slug generation:**
- Convert primary name to lowercase-hyphenated slug
- Example: "Screenshot Beautifier" → `screenshot-beautifier`
- Max length: 50 chars

---

#### **Batch Mode Timestamp Strategy**

**Question:** Should batch briefs share a timestamp (batch start) or have individual timestamps (brief completion)?

**Option A: Shared batch timestamp**
```
batch-2026-02-16-21-30/  # Batch started at 21:30
├─ focus-mode-blocker/
├─ time-tracking-auto/
└─ task-batching-assistant/
```
- **Pro:** Clear batch grouping, all ideas from same research session
- **Con:** Can't tell order within batch

**Option B: Individual brief timestamps**
```
focus-mode-blocker-2026-02-16-21-45/
time-tracking-auto-2026-02-16-21-46/
task-batching-assistant-2026-02-16-21-47/
```
- **Pro:** Precise ordering, each brief independent
- **Con:** Loses batch grouping context

**Recommendation: Option A (shared batch timestamp)**
- Batch briefs are conceptually related (same research session, same problem space)
- Operator can see "these 5 ideas came from one batch exploration"
- Batch directory includes `batch-metadata.json` with order:

```json
{
  "batchId": "batch-2026-02-16-21-30",
  "trigger": "Research productivity tools",
  "timestamp": "2026-02-16T21:30:00-06:00",
  "mode": "batch",
  "briefCount": 5,
  "briefs": [
    { "name": "Focus Mode Blocker", "slug": "focus-mode-blocker", "order": 1 },
    { "name": "Time Tracking Auto", "slug": "time-tracking-auto", "order": 2 },
    { "name": "Task Batching Assistant", "slug": "task-batching-assistant", "order": 3 },
    { "name": "Meeting Cost Calculator", "slug": "meeting-cost-calculator", "order": 4 },
    { "name": "Pomodoro AI Coach", "slug": "pomodoro-ai-coach", "order": 5 }
  ]
}
```

---

### **4. BMAD Persona Configuration as Subagent Workspaces**

**User feedback:**
> "Yes [Mary] exists as an installed BMAD persona, but so do the other CIS ones. We'll need to configure them as primary workspaces so they can be spawned as subagents and adopt a specific set of files like AGENTS.md, TOOLS.md, etc."

**Analysis:**

**Current BMAD structure:**
- CIS personas exist as `_bmad/cis/agents/<name>.md` files
- Mary exists as `_bmad/bmm/agents/analyst.md`
- These are BMAD-native (XML persona, menu system, workflow execution)

**OpenClaw subagent requirements:**
- Each subagent needs workspace directory structure
- Workspace contains: `AGENTS.md`, `TOOLS.md`, `SOUL.md`, etc.
- Subagent reads workspace files on spawn

**Problem:**
- BMAD personas ≠ OpenClaw workspace format
- Need to convert BMAD personas → OpenClaw workspace structure

---

#### **Conversion Strategy**

**For each persona (Carson, Victor, Maya, Quinn, Mary):**

1. **Create workspace directory:**
   ```
   /Users/austenallred/.openclaw/agents/<persona-name>/
   ```

2. **Extract from BMAD persona file:**
   - `<persona>` block → becomes `SOUL.md` (identity, style, principles)
   - Menu items + workflows → stripped (not needed for autonomous spawning)
   - Core methodologies → documented in `AGENTS.md`

3. **Create OpenClaw-native files:**

**AGENTS.md:**
```markdown
# {Persona Name} - {Title}

## Role
{From BMAD persona.role}

## Identity
{From BMAD persona.identity}

## Communication Style
{From BMAD persona.communication_style}

## Core Principles
{From BMAD persona.principles}

## Methodologies
{Extract from BMAD workflows/techniques}

## Task Protocol
When spawned as subagent, you will receive:
- Task description (from Research Lead)
- Context files (problem-brief.md, etc.)

Your job:
1. Read task + context
2. Apply your methodologies to generate approaches
3. Output: {Expected output format}
4. Save to: {Output file path}
5. Signal completion to Research Lead

## Output Format
{Specific to each persona}
```

**SOUL.md:**
```markdown
# {Persona Name}

{persona.identity}

**Style:** {persona.communication_style}

**Principles:**
{persona.principles as list}
```

**TOOLS.md:**
```markdown
# Tools

{Any specific tools this persona uses}

For most CIS personas: none (pure ideation)
For Mary: web_search, web_fetch (research tools)
```

---

#### **Workspace Creation Checklist**

**Per persona:**
- [ ] Create `/Users/austenallred/.openclaw/agents/{persona}/`
- [ ] Extract persona from BMAD file
- [ ] Write `AGENTS.md` (role, methodologies, task protocol, output format)
- [ ] Write `SOUL.md` (identity, style, principles)
- [ ] Write `TOOLS.md` (tools available, if any)
- [ ] (Optional) Write `IDENTITY.md` (name, emoji, etc.)

**Total workspaces to create: 5**
1. `carson/` (Brainstorming Coach)
2. `victor/` (Innovation Strategist)
3. `maya/` (Design Thinking Coach)
4. `quinn/` (Creative Problem Solver)
5. `mary/` (Business Analyst)

---

#### **Gateway Config Updates**

**Add to gateway config:**
```yaml
agents:
  carson:
    name: "Carson - Brainstorming Coach"
    model: "anthropic/claude-sonnet-4-5"  # Creative task
    workspace: "/Users/austenallred/.openclaw/agents/carson"
    
  victor:
    name: "Victor - Innovation Strategist"
    model: "anthropic/claude-opus-4-6"  # Strategic thinking
    workspace: "/Users/austenallred/.openclaw/agents/victor"
    
  maya:
    name: "Maya - Design Thinking Coach"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "/Users/austenallred/.openclaw/agents/maya"
    
  quinn:
    name: "Dr. Quinn - Creative Problem Solver"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "/Users/austenallred/.openclaw/agents/quinn"
    
  mary:
    name: "Mary - Business Analyst"
    model: "anthropic/claude-sonnet-4-5"  # Analytical + research
    workspace: "/Users/austenallred/.openclaw/agents/mary"
```

**Model selection rationale:**
- **Carson, Maya, Quinn:** Sonnet 4.5 (creative ideation, good balance)
- **Victor:** Opus 4 (strategic thinking benefits from deepest reasoning)
- **Mary:** Sonnet 4.5 (analytical research, Opus may be overkill)

---

#### **Implementation Task Breakdown**

**Task 1.3 (from original plan) now becomes 6 subtasks:**

**Task 1.3a: Create Carson Workspace**
- Extract from `brainstorming-coach.md`
- Write AGENTS.md, SOUL.md, TOOLS.md
- Time: 30 min

**Task 1.3b: Create Victor Workspace**
- Extract from `innovation-strategist.md`
- Write AGENTS.md, SOUL.md, TOOLS.md
- Time: 30 min

**Task 1.3c: Create Maya Workspace**
- Extract from `design-thinking-coach.md`
- Write AGENTS.md, SOUL.md, TOOLS.md
- Time: 30 min

**Task 1.3d: Create Quinn Workspace**
- Extract from `creative-problem-solver.md`
- Write AGENTS.md, SOUL.md, TOOLS.md
- Time: 30 min

**Task 1.3e: Create Mary Workspace**
- Extract from `analyst.md`
- Write AGENTS.md, SOUL.md, TOOLS.md
- Include Market Research + Technical Research methodologies
- Time: 45 min (more complex - Mary has workflows)

**Total for Task 1.3 (persona workspace creation): 2.5-3 hours**

---

## Summary of New Decisions

### **1. Manual Mode**
✅ **Decision:** Add MANUAL MODE for Single pipeline (not Batch)
- Default: AUTO MODE (fully autonomous)
- Manual mode: User-guided questions at Phases 1, 4, 5
- Start with 5-7 critical questions
- Build after AUTO MODE MVP works

### **2. Batch Architecture**
✅ **Decision:** Option B - Single Research Lead, Batched Internally (MVP)
- More token/time efficient (100K tokens vs 500K)
- Kelly spawns 1 Research Lead in "batch mode"
- Research Lead compiles 3-5 product briefs internally
- Future: Add Option A (separate Research Leads) as enhancement

### **3. Product Naming & Timestamps**
✅ **Decision:** Generate names + timestamp directories
- Product brief includes: 1 primary name + 3-4 alternatives
- Directory structure: `<name-slug>-YYYY-MM-DD-HH-MM/`
- Batch mode: `batch-YYYY-MM-DD-HH-MM/<name-slug>/`
- Include `batch-metadata.json` for ordering

### **4. BMAD Persona Workspaces**
✅ **Decision:** Convert BMAD personas → OpenClaw workspace structure
- Create 5 workspace directories (carson, victor, maya, quinn, mary)
- Extract persona from BMAD files → write AGENTS.md, SOUL.md, TOOLS.md
- Add to gateway config
- Time estimate: 2.5-3 hours (Task 1.3 expansion)

---

## Updated Implementation Timeline

**Original estimate:** 6-8 hours MVP

**With new requirements:**
- Task 1.3 (persona workspaces): +1.5 hours (was 1 hour, now 2.5 hours)
- Product naming logic: +30 min (Phase 5 enhancement)
- ideas-queue/ structure + timestamps: +30 min (file management)
- Batch mode internal logic: +1 hour (compile multiple briefs in Phase 4)
- **Total: 9-11 hours MVP**

**Manual mode (Phase 2 enhancement):**
- Interactive question flow: +2 hours
- BMAD workflow.yaml integration: +2 hours
- **Total: +4 hours**

**Full implementation:**
- **AUTO MODE MVP: 9-11 hours**
- **+ MANUAL MODE: 13-15 hours**

---

## Open Questions

**Q1: Manual mode priority?**
- Build AUTO MODE first, add MANUAL later?
- Or build both in MVP?
- **Recommendation:** AUTO MODE first (simpler, validates core workflow)

**Q2: Batch size configuration?**
- Default 3-5 briefs, or let user specify?
- "Research productivity tools --count=10"
- **Recommendation:** Default 5, make configurable later

**Q3: Model selection for CIS personas?**
- All Sonnet 4.5, or mix with Opus for Victor?
- **Recommendation:** Start all Sonnet 4.5, benchmark quality, upgrade Victor if needed

**Q4: Domain availability check?**
- Should Mary check .com availability for product names?
- Adds time but valuable validation
- **Recommendation:** Phase 2 enhancement, not MVP

**Q5: ideas-queue/ promotion workflow?**
- How does operator signal "move this to projects/"?
- Manual file move? Kelly command?
- **Recommendation:** Manual for MVP, Kelly command later

---

## Next Steps

**Awaiting operator confirmation:**
1. ✅ Manual mode priority (AUTO first vs both in MVP)?
2. ✅ Batch architecture confirmed (Option B)?
3. ✅ Model selection for personas (all Sonnet vs Victor on Opus)?
4. ✅ Timeline acceptable (9-11 hours AUTO, +4 hours MANUAL)?

**Then:**
1. Update main implementation plan (research-lead-v1.md) with all new decisions
2. Start Task 0.1 (Prerequisites verification)
3. Begin persona workspace creation (Task 1.3a-e)

**Ready to proceed?**
