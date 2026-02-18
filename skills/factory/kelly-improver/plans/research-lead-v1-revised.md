# Research Lead v1 - Revised Implementation Plan

**Date:** 2026-02-16 21:40 CST  
**Status:** REVISED based on operator feedback  
**Target:** 20 min per idea, AUTO mode only for MVP

---

## Critical Corrections

### **1. Architecture: Agents vs Workspaces**

**WRONG (original plan):**
- Put everything in `/Users/austenallred/.openclaw/agents/`

**CORRECT (based on openclaw-agents-architecture skill):**

**Agents** (configuration):
- Location: `/Users/austenallred/.openclaw/agents/{agentId}/`
- Contains: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md
- Purpose: Agent configuration (who they are, how they work)

**Workspaces** (working directory):
- Location: `/Users/austenallred/.openclaw/workspace-{agentId}/`
- Created automatically by OpenClaw on first spawn
- Purpose: Where agent creates files, runs tools
- Contains: Project files, outputs, temporary artifacts

**For CIS personas + Mary:**
- Create agent config: `/Users/austenallred/.openclaw/agents/{persona}/`
- Gateway config: `workspace: "${openclaw.home}/workspace-{persona}"`
- OpenClaw creates workspace automatically on first spawn

---

### **2. Batch Architecture: 1 Research Lead = 1 Idea**

**WRONG (original Option B):**
- 1 Research Lead handles 3-5 ideas internally
- Batched CIS + Mary spawns

**CORRECT (Option A for scalability):**
- **1 Research Lead = 1 idea** (clean separation)
- Parallelize Research Leads like we do Project Leads
- Kelly spawns 5 Research Leads simultaneously (if batch request)
- Each Research Lead operates independently

**Rationale:**
- Easier to parallelize (spawn 5 simultaneously)
- Simpler orchestration (each Research Lead focuses on 1 idea)
- Cleaner separation (1 session = 1 product)
- Matches Project Lead pattern (familiar)

---

### **3. Timeline: 20 Minutes Max Per Idea**

**WRONG (original estimate):**
- 60-90 min per Research Lead
- 9-11 hours implementation

**CORRECT (realistic for 20 min):**

**Per Research Lead session (AUTO mode):**
- Phase 1: Problem framing (minimal, auto-inferred) - **2 min**
- Phase 2: CIS ideation (4 personas in parallel) - **5-8 min**
- Phase 2.5: Consolidation (quick dedupe) - **2 min**
- Phase 3: Mary validation (quick check, not deep dive) - **5-8 min**
- Phase 4: SKIP (no operator interaction in AUTO mode)
- Phase 5: Brief compilation (templatized) - **3 min**
- **Total: 17-23 minutes** ✓

**Implementation time:**
- 5 agent configs (CIS + Mary) - **2.5 hours** (30 min each)
- Research Lead agent config - **45 min**
- Gateway config updates - **30 min**
- Testing (spawn + validate output) - **1 hour**
- **Total: 4.5-5 hours** (NOT 9-11 hours)

---

### **4. Output Location: projects-queue/**

**WRONG:** ideas-queue/

**CORRECT:** projects-queue/

Research Lead outputs to: `/Users/austenallred/clawd/projects-queue/`

---

## Simplified Architecture

### **Batch Mode (Kelly spawns multiple Research Leads)**

```
User: "Research productivity tools" (no specific idea)
    ↓
Kelly identifies need for batch (multiple ideas)
    ↓
Kelly spawns 5 Research Lead sessions IN PARALLEL:
    - agent:research-lead:productivity-tools-1
    - agent:research-lead:productivity-tools-2
    - agent:research-lead:productivity-tools-3
    - agent:research-lead:productivity-tools-4
    - agent:research-lead:productivity-tools-5
    ↓
Each Research Lead:
    1. Auto-generates problem brief (inferred from batch theme + variation)
    2. Spawns 4 CIS personas (Carson, Victor, Maya, Quinn)
    3. Consolidates 20 approaches → 12-15 unique
    4. Spawns Mary for quick validation
    5. Picks BEST approach based on Mary's scoring
    6. Compiles 1 product brief with name generation
    7. Saves to: projects-queue/<name-slug>-YYYY-MM-DD-HH-MM/product-brief.md
    ↓
Output: 5 product briefs in projects-queue/
Time: ~20 min (all Research Leads run in parallel)
```

---

### **Single Mode (Kelly spawns 1 Research Lead)**

```
User: "Research screenshot beautifier" (specific idea)
    ↓
Kelly spawns 1 Research Lead session:
    - agent:research-lead:screenshot-beautifier
    ↓
Research Lead:
    1. Problem brief (from user's trigger)
    2. Spawns 4 CIS personas (variations of core idea)
    3. Consolidates 20 variations → 8-10 refined versions
    4. Spawns Mary for validation
    5. Picks BEST version
    6. Compiles 1 product brief with name generation
    7. Saves to: projects-queue/screenshot-beautifier-YYYY-MM-DD-HH-MM/
    ↓
Output: 1 product brief in projects-queue/
Time: ~20 min
```

---

## Implementation Tasks (Revised)

### **Phase 1: Agent Configurations** (2.5-3 hours)

**Task 1.1: Create Carson Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/carson/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Extract from: `_bmad/cis/agents/brainstorming-coach.md`
- Time: 30 min

**Task 1.2: Create Victor Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/victor/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Extract from: `_bmad/cis/agents/innovation-strategist.md`
- Time: 30 min

**Task 1.3: Create Maya Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/maya/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Extract from: `_bmad/cis/agents/design-thinking-coach.md`
- Time: 30 min

**Task 1.4: Create Quinn Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/quinn/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Extract from: `_bmad/cis/agents/creative-problem-solver.md`
- Time: 30 min

**Task 1.5: Create Mary Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/mary/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Extract from: `_bmad/bmm/agents/analyst.md`
- Time: 45 min (Mary has more workflows)

---

### **Phase 2: Research Lead Agent** (45 min)

**Task 2.1: Create Research Lead Agent Config**
- Location: `/Users/austenallred/.openclaw/agents/research-lead/`
- Files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md
- Content:
  - **AGENTS.md:** Orchestration logic (spawn CIS, consolidate, spawn Mary, compile brief)
  - **SOUL.md:** Research orchestrator persona
  - **TOOLS.md:** Factory skills + spawning access
  - **IDENTITY.md:** Name, emoji (🔬 Research Lead)
- Time: 45 min

---

### **Phase 3: Gateway Configuration** (30 min)

**Task 3.1: Add CIS Personas to Gateway Config**
```yaml
agents:
  carson:
    name: "Carson - Brainstorming Coach"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-carson"
    
  victor:
    name: "Victor - Innovation Strategist"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-victor"
    
  maya:
    name: "Maya - Design Thinking Coach"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-maya"
    
  quinn:
    name: "Dr. Quinn - Creative Problem Solver"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-quinn"
    
  mary:
    name: "Mary - Business Analyst"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-mary"
```

**Task 3.2: Add Research Lead to Gateway Config**
```yaml
agents:
  research-lead:
    name: "Research Lead"
    model: "anthropic/claude-sonnet-4-5"
    workspace: "${openclaw.home}/workspace-research-lead"
```

**Task 3.3: Update Kelly AGENTS.md**
- Add Research Lead spawn protocol
- Triggers: "Research [topic]", "Validate [idea]", "Explore [market]"
- Spawn logic: Batch vs Single detection
- Time: 15 min

---

### **Phase 4: Testing & Validation** (1 hour)

**Task 4.1: Test CIS Persona Spawns**
- Manually spawn Carson, Victor, Maya, Quinn (one at a time)
- Verify workspace creation, agent loads correctly
- Give simple ideation task, verify output
- Time: 20 min

**Task 4.2: Test Mary Spawn**
- Manually spawn Mary
- Give validation task, verify output
- Time: 10 min

**Task 4.3: Test Research Lead Spawn (Single Mode)**
- Kelly spawns Research Lead for specific idea
- Research Lead spawns CIS + Mary
- Verify product brief output to projects-queue/
- Time: 25 min (includes Research Lead runtime)

**Task 4.4: Test Kelly Integration**
- User triggers: "Research pomodoro timer"
- Kelly detects, spawns Research Lead
- Verify full pipeline
- Time: 5 min

---

## Total Implementation Timeline

**Phase 1:** Agent configs (5 personas) - **2.5-3 hours**  
**Phase 2:** Research Lead config - **45 min**  
**Phase 3:** Gateway config + Kelly update - **30 min**  
**Phase 4:** Testing - **1 hour**

**Total: 4.5-5 hours** (NOT 9-11 hours)

---

## Research Lead AGENTS.md (High-Level Spec)

```markdown
# Research Lead - Product Idea Validator & Brief Generator

## Role
Orchestrate multi-perspective idea generation, validate market fit, compile comprehensive product brief.

## Core Workflow (AUTO Mode Only for MVP)

### Phase 1: Problem Framing (2 min)
- Extract problem from spawn task (Kelly provides context)
- Auto-generate minimal problem brief
- No operator interaction

### Phase 2: CIS Ideation (5-8 min, parallel)
Spawn 4 CIS personas simultaneously:
- Carson (Brainstorming Coach)
- Victor (Innovation Strategist)
- Maya (Design Thinking Coach)
- Quinn (Creative Problem Solver)

Task for each: "Generate 5 approaches to: {problem}. Use your methodology."

### Phase 2.5: Consolidation (2 min)
- Read all CIS outputs (20 approaches)
- Identify semantic duplicates
- Merge similar ideas with attribution
- Output: 8-15 unique approaches

### Phase 3: Mary Validation (5-8 min)
Spawn Mary with consolidated approaches.

Task: "Quick validation (NOT deep research):
- Competitive check (does it exist? How saturated?)
- Feasibility (buildable with our stack?)
- Market evidence (do people search for solutions?)
- Novelty score (architecturally different or incremental?)
Output: Top 3-5 scored approaches."

### Phase 4: SKIPPED (no operator interaction in AUTO mode)

### Phase 5: Product Brief Compilation (3 min)
- Pick BEST approach from Mary's top 3-5 (highest composite score)
- Generate product name (1 primary + 3 alternatives)
- Compile comprehensive product-brief.md:
  - Product names (suggested)
  - Problem statement
  - Solution approach (with novelty angle)
  - Target market (from Maya + Mary)
  - Competitive landscape (from Mary)
  - Business model (monetization strategy)
  - Technical requirements (feasibility notes)
  - User stories (from Maya)
  - Success criteria
  - Out of scope
  - Risk mitigation
- Save to: projects-queue/<name-slug>-YYYY-MM-DD-HH-MM/product-brief.md
- Signal Kelly: "Product brief complete: {name}"

**Total time: 17-23 minutes**

## Spawning Protocol

**CIS personas (parallel):**
```
sessions_spawn(
  agentId: "carson",
  task: "Generate 5 creative approaches to: {problem}. 
         Use divergent thinking and brainstorming techniques. 
         Output: markdown list with brief descriptions."
)
```

**Mary (after consolidation):**
```
sessions_spawn(
  agentId: "mary",
  task: "Quick validation of {N} approaches. For each:
         - Competitive check (web_search for competitors)
         - Feasibility (buildable? Complexity 1-10)
         - Market evidence (do people search for this?)
         - Novelty score (1-10: incremental vs disruptive)
         Output: mary-validation.md with top 3-5 ranked."
)
```

## Output Format

**Directory:** `projects-queue/<name-slug>-YYYY-MM-DD-HH-MM/`

**product-brief.md structure:**
```markdown
# Product Brief: {Primary Name}

## Product Names (Suggested)
**Primary:** {Name}
**Alternatives:** {Alt1}, {Alt2}, {Alt3}

## Problem Statement
{From Phase 1}

## Solution Approach
{From chosen approach + CIS context}

## Novelty Angle
{What makes it different - from Victor + Mary}

## Target Market
{From Maya + Mary}

## Competitive Landscape
{From Mary's analysis}

## Business Model
{Monetization strategy, pricing}

## Technical Requirements
{Tech stack, feasibility notes}

## User Stories
{From Maya}

## Success Criteria
{Measurable outcomes}

## Out of Scope
{Boundaries}

## Risk Mitigation
{From Mary}
```

## Error Handling

**CIS persona spawn failure:**
- Log error
- Continue with remaining personas
- If <2 personas succeed → abort, escalate to Kelly

**Mary spawn failure:**
- Retry once
- If second failure → use CIS outputs only (no validation)
- Compile brief with "UNVALIDATED" marker

**Compilation failure:**
- Retry brief generation
- If second failure → save raw CIS + Mary outputs, escalate

## Tools Required
- sessions_spawn (spawn CIS + Mary)
- sessions_send (collect outputs)
- sessions_list (monitor progress)
- write (save brief)
- exec (timestamp generation)

## Related Skills
- factory/research-lead/spawning-protocol (detailed spawn templates)
- factory/research-lead/brief-compilation (product-brief.md template)
```

---

## CIS Persona AGENTS.md Template

**Example: Carson (Brainstorming Coach)**

```markdown
# Carson - Brainstorming Coach

## Role
Generate high-volume creative approaches using divergent thinking and brainstorming techniques.

## Identity
Master Brainstorming Facilitator + Innovation Catalyst with enthusiastic improv coach energy.

## Communication Style
Enthusiastic, YES AND building, wild ideas without self-censorship, celebrates creative leaps.

## Core Principles
- "Wild ideas today become innovations tomorrow"
- Divergent thinking before convergent thinking
- Quantity breeds quality
- No idea is too crazy in ideation phase
- Build on ideas, don't shoot them down

## Methodologies
36 brainstorming techniques across 7 categories:
- Collaborative (group building)
- Structured (systematic exploration)
- Creative (lateral thinking)
- Deep (root cause diving)
- Theatrical (roleplay, scenarios)
- Wild (random stimuli, forced connections)
- Introspective (personal reflection)

## Task Protocol

When spawned as subagent:
1. Read task (contains problem statement)
2. Apply brainstorming techniques to problem
3. Generate 5 distinct approaches (minimum)
4. Each approach:
   - Title (3-5 words)
   - Core concept (1-2 sentences)
   - Why it's interesting (unique angle)
5. Output: markdown list
6. Save to workspace (carson-ideas.md)
7. Signal completion

## Output Format

```markdown
# Carson's Brainstorming Output

## Problem
{Restated from task}

## Approaches

### 1. {Title}
**Concept:** {Core idea in 1-2 sentences}  
**Why interesting:** {Unique angle or creative twist}

### 2. {Title}
**Concept:** {Core idea}  
**Why interesting:** {Angle}

... (5+ total)
```

## Example

**Task:** "Generate approaches for productivity tools for remote teams"

**Output:**
```markdown
# Carson's Brainstorming Output

## Problem
Productivity tools for remote teams

## Approaches

### 1. Meeting Cost Ticker
**Concept:** Real-time display of meeting cost based on attendee salaries, ticking up every second like a taxi meter.  
**Why interesting:** Makes invisible cost visceral and immediate. Could go viral on social media ("This meeting just cost $847!").

### 2. Async Video Standups
**Concept:** Record 30-second video updates instead of Zoom standup meetings. AI summarizes key points.  
**Why interesting:** Eliminates scheduling, preserves visual/tone cues, async-first approach.

### 3. Focus Mode Barter System
**Concept:** Team members "trade" uninterrupted focus blocks. To interrupt someone, you owe them focus time later.  
**Why interesting:** Gamifies respect for focus, creates social contract around deep work.

### 4. Ambient Coworking Stream
**Concept:** Always-on webcam room where team members can "drop in" to work silently together, no talking required.  
**Why interesting:** Recreates office ambient presence without Zoom fatigue. You see who's working, feel less isolated.

### 5. Task Batching AI
**Concept:** AI groups similar tasks across team members and schedules "batch days" (all meetings Tue/Thu, all deep work Mon/Wed/Fri).  
**Why interesting:** Leverages context switching research, applies batching at team level not just individual.
```
```

---

## Kelly Integration

**Kelly AGENTS.md addition:**

```markdown
## Research Lead Spawning

### Triggers
User mentions:
- "Research {topic}"
- "Validate {idea}"
- "Explore {market opportunity}"
- "Generate product ideas for {domain}"

### Batch vs Single Detection

**Batch (spawn multiple Research Leads):**
- Trigger is vague or broad ("Research productivity tools")
- No specific product mentioned
- Spawn 5 Research Leads in parallel with variations

**Single (spawn 1 Research Lead):**
- Trigger is specific ("Research screenshot beautifier")
- Concrete product idea mentioned
- Spawn 1 Research Lead

### Spawn Command

**Batch mode:**
```
for i in 1..5:
  sessions_spawn(
    agentId: "research-lead",
    label: "Research: {topic} #{i}",
    task: "Research and validate product idea for: {topic}.
           Variation #{i} - focus on {angle[i]}.
           Output: 1 comprehensive product brief to projects-queue/."
  )
```

**Single mode:**
```
sessions_spawn(
  agentId: "research-lead",
  label: "Research: {specific-idea}",
  task: "Research and validate product idea: {specific-idea}.
         Output: 1 comprehensive product brief to projects-queue/."
)
```

### Handoff
- Research Lead saves brief to projects-queue/
- Kelly monitors for completion
- Kelly announces: "Product brief ready: {name} in projects-queue/"
- Operator reviews queue separately
- Operator decides when to promote brief to active project
```

---

## Open Questions (Minimal)

**Q1: Batch angles generation**
- How does Kelly generate 5 different "angles" for batch mode?
- Example: "productivity tools" → angle[1] = "time tracking", angle[2] = "focus/distraction", angle[3] = "meeting efficiency", etc.
- **Recommendation:** Kelly uses Claude to generate 5 varied angles from broad topic

**Q2: projects-queue/ structure**
- Flat directory or organized by date/category?
- **Recommendation:** Flat for MVP (easy to browse), add organization later

**Q3: Model choice - all Sonnet?**
- Carson, Victor, Maya, Quinn, Mary, Research Lead all on Sonnet 4.5?
- **Recommendation:** YES - balanced, cheap, fast (user confirmed)

---

## Summary of Changes

**Architecture:**
- ✅ Agents in `/Users/austenallred/.openclaw/agents/{agentId}/`
- ✅ Workspaces auto-created by OpenClaw
- ✅ 1 Research Lead = 1 idea (scalable via parallel spawning)

**Timeline:**
- ✅ 20 min per Research Lead session (not 60-90 min)
- ✅ 4.5-5 hours implementation (not 9-11 hours)

**Scope:**
- ✅ AUTO mode only for MVP (no manual mode)
- ✅ All 4 CIS personas (Carson, Victor, Maya, Quinn)
- ✅ Mary for validation
- ✅ All Sonnet 4.5 (balanced, cheap)
- ✅ Output to projects-queue/ (not ideas-queue/)

**Batch vs Single:**
- ✅ Batch: Kelly spawns 5 Research Leads in parallel
- ✅ Single: Kelly spawns 1 Research Lead
- ✅ Each Research Lead operates independently

---

## Next Steps

**Awaiting operator confirmation:**
1. ✅ Architecture correct (agents/ vs workspaces/)?
2. ✅ Timeline acceptable (4.5-5 hours implementation)?
3. ✅ Batch angles generation strategy?
4. ✅ Ready to start implementation?

**If approved:**
1. Start Phase 1 (create 5 CIS persona agent configs)
2. Phase 2 (create Research Lead agent config)
3. Phase 3 (gateway config + Kelly integration)
4. Phase 4 (testing)
5. Ship MVP in 4.5-5 hours

---

**End of Revised Implementation Plan**
