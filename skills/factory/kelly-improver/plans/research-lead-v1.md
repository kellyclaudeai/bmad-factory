# Research Lead v1 - Implementation Plan

**Created:** 2026-02-16 20:57 CST  
**Status:** Draft - Awaiting approval  
**Estimated effort:** 4-6 hours to MVP  
**Target completion:** TBD

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Goals](#goals)
4. [CIS Personas Inventory](#cis-personas-inventory)
5. [Persona Selection Strategy](#persona-selection-strategy)
6. [Architecture](#architecture)
7. [File Structure](#file-structure)
8. [Implementation Tasks](#implementation-tasks)
9. [Integration Points](#integration-points)
10. [Testing Strategy](#testing-strategy)
11. [Timeline & Milestones](#timeline--milestones)
12. [Open Questions](#open-questions)

---

## Overview

**Research Lead** is a standalone agent that orchestrates multi-phase idea validation and product brief creation before projects enter the implementation pipeline. It solves the "same 20 ideas" problem by spawning diverse creative personas, validating market fit, and producing comprehensive intake.md files ready for Project Lead execution.

**Position in factory:**
```
Operator: "Research [problem/market]"
    ↓
Kelly spawns Research Lead session
    ↓
Research Lead orchestrates multi-phase workflow
    ↓
Research Lead delivers validated intake.md to Kelly
    ↓
Kelly spawns Project Lead
    ↓
Project Lead → Implementation → TEA → Ship
```

---

## Problem Statement

**Current state:**
- Operator manually brainstorms ideas
- Ideas often fall into "same 20 concepts" trap
- No systematic validation before entering Project Lead
- Intake.md quality varies based on operator's depth
- No creative diversity injection

**Desired state:**
- Systematic idea generation from multiple creative perspectives
- Market validation and competitive analysis before build
- Novel, differentiated approaches (not incremental)
- Comprehensive intake.md with validation data
- Operator chooses from 3-5 pre-validated options

---

## Goals

**Primary:**
1. Generate 15-20 diverse approaches using specialized CIS personas
2. Validate 3-5 approaches (competitive check, feasibility, market evidence)
3. Present validated options to operator for strategic choice
4. Compile comprehensive intake.md for chosen approach
5. Hand off to Kelly for Project Lead spawning

**Secondary:**
1. Build reusable Research Lead orchestration pattern
2. Integrate CIS personas from BMAD installation
3. Create Mary validator agent for analytical filtering
4. Establish research artifact structure
5. Document research protocols for future reference

**Success criteria:**
- Operator receives novel approaches (not "same 20 ideas")
- Final intake.md comprehensive enough for immediate Project Lead start
- Total research time: 30-60 minutes (depending on depth)
- Reproducible workflow for future research sessions

---

## CIS Personas Inventory

**Location:** `/Users/austenallred/clawd/projects/bug-dictionary/_bmad/cis/agents/`

**Complete inventory of 6 CIS personas:**

### 1. **Carson - Brainstorming Coach**
- **File:** `brainstorming-coach.md`
- **Role:** Master Brainstorming Facilitator + Innovation Catalyst
- **Strength:** Divergent thinking, volume generation, "YES AND" building
- **Style:** Enthusiastic improv coach, wild ideas without self-censorship
- **Principle:** "Wild ideas today become innovations tomorrow"
- **Output:** 5+ raw creative explorations, breakthrough possibilities
- **Best for:** Early divergent thinking, quantity over quality phase

### 2. **Victor - Innovation Strategist**
- **File:** `innovation-strategist.md`
- **Role:** Business Model Innovator + Competitive Strategist
- **Strength:** Blue Ocean Strategy, Jobs-to-be-Done, disruptive business models
- **Style:** Chess grandmaster - bold declarations, strategic thinking
- **Principle:** **"Incremental thinking means obsolete"** ← directly addresses "same 20 ideas"
- **Output:** 5+ disruptive business model approaches, competitive differentiation angles
- **Best for:** Strategic positioning, market disruption, avoiding "me-too" products

### 3. **Dr. Quinn - Creative Problem Solver**
- **File:** `creative-problem-solver.md`
- **Role:** TRIZ Expert + Systems Thinker (aerospace engineer background)
- **Strength:** Root cause analysis, Theory of Constraints, systematic innovation
- **Style:** Sherlock Holmes + playful scientist
- **Principle:** Solve root causes, not symptoms
- **Output:** 5+ systematic solutions addressing fundamental problems
- **Best for:** Complex technical challenges, root cause discovery, constraint removal
- **Note:** May overlap with Mary's analytical validation - consider optional for ideation

### 4. **Maya - Design Thinking Coach**
- **File:** `design-thinking-coach.md`
- **Role:** Human-Centered Design Expert + Empathy Specialist
- **Strength:** User journey mapping, empathy-driven innovation, workflow integration
- **Style:** Jazz musician - improvises, sensory metaphors, "design WITH not FOR users"
- **Principle:** Start with human needs, not technology capabilities
- **Output:** 5+ user-centered approaches grounded in real workflows and pain points
- **Best for:** Consumer products, workflow tools, B2C/prosumer markets

### 5. **Caravaggio - Presentation Master**
- **File:** `presentation-master.md`
- **Role:** Visual Communication Expert + Presentation Designer
- **Strength:** Visual storytelling, presentation design, information hierarchy
- **Style:** Energetic creative director with sarcastic wit
- **Principle:** Know your audience, clarity over cleverness
- **Output:** Multi-slide presentations, pitch decks, infographics, visual metaphors
- **Best for:** Post-ideation visualization, pitch preparation, concept illustration
- **Use in Research Lead:** Phase 5 (optional) - visualize chosen approach for stakeholders

### 6. **Sophia - Storyteller**
- **File:** `storyteller/storyteller.md`
- **Role:** Master Storyteller + Narrative Strategist
- **Strength:** Narrative frameworks, emotional psychology, brand stories
- **Style:** Bard weaving epic tales - flowery, whimsical, enrapturing
- **Principle:** Leverage timeless human truths, make abstract concrete
- **Output:** Compelling narratives using proven frameworks
- **Best for:** Post-ideation storytelling, marketing narratives, brand positioning
- **Use in Research Lead:** Phase 5 (optional) - craft compelling product story

**Pre-configured team:**
- **Creative Squad** (`teams/creative-squad.yaml`) - includes all 6 agents

---

## Persona Selection Strategy

### Core Ideation Personas (Phase 2)

**Recommended 3-persona configuration:**

1. **Carson (Brainstorming Coach)** ✅
   - **Why:** Divergent thinking, volume generation
   - **Output:** 5 wild, unfiltered ideas
   - **Rationale:** Breaks conventional thinking patterns, explores unlikely angles

2. **Victor (Innovation Strategist)** ✅
   - **Why:** Strategic differentiation, anti-incremental thinking
   - **Output:** 5 disruptive business model approaches
   - **Rationale:** **Directly solves "same 20 ideas" problem** with "incremental thinking means obsolete" principle

3. **Maya (Design Thinking Coach)** ✅
   - **Why:** Human-centered grounding, empathy-driven design
   - **Output:** 5 user-workflow integrated approaches
   - **Rationale:** Balances wild ideas with real user needs

**Total:** 15 raw approaches from 3 personas

---

### Optional 4th Persona

**Dr. Quinn (Creative Problem Solver)** - ❓ Optional
- **Pros:** Systematic TRIZ methodologies, root cause focus
- **Cons:** Overlaps with Mary's analytical validation phase
- **Recommendation:** Include for complex technical problems; skip for consumer products
- **Decision point:** Let operator choose per-project basis

**If included:** 20 raw approaches from 4 personas

---

### Post-Ideation Personas (Phase 5+)

**Not used in core ideation, available for post-research enhancement:**

**Caravaggio (Presentation Master)** - Phase 5 optional
- **When:** Operator wants visual pitch deck for chosen approach
- **Output:** Multi-slide presentation visualizing product concept
- **Trigger:** Operator requests visualization after choosing approach

**Sophia (Storyteller)** - Phase 5 optional
- **When:** Operator wants narrative framing for marketing/positioning
- **Output:** Compelling product story using narrative frameworks
- **Trigger:** Operator requests story after choosing approach

---

### Persona Selection Rules

**Default (most projects):**
- Use 3 personas: Carson + Victor + Maya
- Total: 15 raw approaches
- Fast, diverse, covers creative + strategic + user-centered angles

**Complex technical:**
- Add Quinn (4 personas total)
- Total: 20 raw approaches
- Adds systematic problem-solving and constraint removal

**Simple consumer apps:**
- Consider 2 personas: Carson + Maya
- Total: 10 raw approaches
- Faster cycle, focus on creativity + user needs

**Operator override:**
- Let operator specify persona mix at research start
- Example: "Research [problem] using Victor and Quinn only"
- Research Lead spawns only requested personas

---

## Architecture

### 5-Phase Workflow

#### **Phase 1: Problem Framing**
**Owner:** Research Lead (with operator input)

**Input:**
- Operator's problem statement or market opportunity
- Context: Target market, constraints, existing solutions

**Process:**
1. Research Lead interviews operator for clarity
2. Document problem brief with:
   - Problem statement (1-2 sentences)
   - Target users/market
   - Key constraints (time, budget, tech stack)
   - Success criteria
   - Out of scope items
3. Confirm with operator before proceeding

**Output:** `problem-brief.md`

**Time:** 5-10 minutes

---

#### **Phase 2: Creative Ideation (CIS Personas)**
**Owner:** CIS personas (Carson, Victor, Maya, ±Quinn)

**Input:** `problem-brief.md`

**Process:**
1. Research Lead spawns CIS personas in parallel
2. Each persona receives problem-brief.md
3. Each persona generates 5+ approaches using their methodology:
   - **Carson:** Divergent brainstorming, wild ideas
   - **Victor:** Disruptive business models, Blue Ocean angles
   - **Maya:** User journey mapping, empathy-driven design
   - **Quinn (optional):** TRIZ systematic innovation, constraint removal
4. Research Lead collects outputs when complete

**Output:**
- `carson-ideas.md` (5+ approaches)
- `victor-ideas.md` (5+ approaches)
- `maya-ideas.md` (5+ approaches)
- `quinn-ideas.md` (5+ approaches, if included)

**Total raw approaches:** 15-20

**Time:** 15-25 minutes (parallel execution)

---

#### **Phase 2.5: Consolidation & Deduplication**
**Owner:** Research Lead

**Input:** All CIS persona outputs

**Process:**
1. Read all CIS outputs
2. Identify semantic duplicates (same core idea, different framing)
3. Merge similar approaches with attribution
4. Preserve diversity (don't over-consolidate)
5. Light filtering (remove clearly infeasible/off-topic)

**Output:** `consolidated-approaches.md` (10-15 unique approaches)

**Time:** 5-10 minutes

---

#### **Phase 3: Validation & Filtering**
**Owner:** Mary (Analytical Validator)

**Input:** `consolidated-approaches.md`

**Process:**
1. Research Lead spawns Mary with consolidated approaches
2. Mary analyzes each approach:
   - **Competitive check:** Does it exist? How saturated is the market?
   - **Feasibility study:** Buildable with available stack/resources?
   - **Pain point evidence:** Is the problem real? Do people search for solutions?
   - **Business model viability:** Can we monetize? What's the pricing model?
   - **Novelty assessment:** Architecturally different or incremental?
   - **Risk analysis:** What could go wrong? Dependencies? Complexity?
3. Mary ranks approaches by composite score:
   - Novelty (0-10)
   - Market evidence (0-10)
   - Feasibility (0-10)
   - Monetization potential (0-10)
4. Mary selects top 3-5 approaches with detailed rationale

**Output:** `mary-validation.md` (3-5 validated approaches with scoring)

**Tools Mary uses:**
- `web_search` - market research, competitor analysis
- `web_fetch` - deep-dive on competitors, pricing research
- Analytical reasoning - feasibility, risk assessment

**Time:** 20-30 minutes (sequential, depth-dependent)

---

#### **Phase 4: Operator Strategic Choice**
**Owner:** Operator (user)

**Input:** `mary-validation.md` (3-5 validated approaches)

**Process:**
1. Research Lead presents Mary's top 3-5 approaches to operator
2. Each approach includes:
   - **Core concept** (1-2 sentences)
   - **Novelty angle** (what makes it different)
   - **Market evidence** (search volume, competitor landscape)
   - **Business model** (monetization strategy)
   - **Feasibility** (tech stack, complexity estimate)
   - **Mary's score** (novelty/market/feasibility/monetization)
   - **Risks** (dependencies, unknowns)
3. Operator reviews and chooses one:
   - "I like #2, go deep on that one"
   - OR: "Combine elements of #1 and #3"
   - OR: "None of these - pivot [direction]"
4. Research Lead confirms choice and captures rationale

**Output:** `operator-choice.md` (decision record)

**Time:** 5-15 minutes (operator decision time)

---

#### **Phase 5: Product Brief Compilation**
**Owner:** Research Lead

**Input:**
- Chosen approach from operator-choice.md
- Full context from problem-brief.md, CIS outputs, mary-validation.md

**Process:**
1. Research Lead compiles comprehensive intake.md:
   - **Problem Statement** (from Phase 1)
   - **Solution Approach** (from chosen approach + CIS context)
   - **Novelty Angle** (what makes it different - from Victor/Mary)
   - **Target Market** (from Maya's user insights + Mary's research)
   - **Competitive Landscape** (from Mary's analysis)
   - **Business Model** (monetization strategy, pricing)
   - **Technical Requirements** (feasibility notes, tech stack)
   - **User Stories** (from Maya's empathy work)
   - **Success Criteria** (measurable outcomes)
   - **Out of Scope** (boundaries)
   - **Risk Mitigation** (from Mary's risk analysis)
   - **Implementation Notes** (for Project Lead)
2. Format as standard intake.md (compatible with Project Lead expectations)
3. Save to research folder
4. Copy to `/projects/<slug>/intake.md` for Project Lead pickup

**Output:** 
- `intake.md` (comprehensive product brief)
- Ready for Project Lead consumption

**Time:** 10-15 minutes

---

#### **Phase 5+ (Optional): Enhancement**
**Available on operator request:**

**Caravaggio (Presentation Master):**
- Create visual pitch deck for chosen approach
- Multi-slide presentation with visual hierarchy
- Output: `pitch-deck.excalidraw` or similar

**Sophia (Storyteller):**
- Craft compelling narrative for product positioning
- Marketing story, brand narrative
- Output: `product-story.md`

**Time:** +15-30 minutes per enhancement

---

### Total Timeline

**Minimum configuration (Carson + Victor + Maya):**
- Phase 1: 5-10 min
- Phase 2: 15-20 min (parallel)
- Phase 2.5: 5-10 min
- Phase 3: 20-25 min (Mary validation)
- Phase 4: 5-10 min (operator choice)
- Phase 5: 10-15 min
- **Total: 60-90 minutes**

**With Quinn (4 personas):**
- Phase 2: +5 min (still parallel)
- Phase 2.5: +5 min (more to consolidate)
- **Total: 70-100 minutes**

**With enhancements (Caravaggio/Sophia):**
- +15-30 min each
- **Total: 90-160 minutes**

---

## File Structure

### Research Workspace

**Location:** `/Users/austenallred/clawd/research/<project-slug>/`

```
research/<project-slug>/
├── problem-brief.md              # Phase 1: Problem framing
│
├── phase2-ideation/              # Phase 2: CIS outputs
│   ├── carson-ideas.md           # Brainstorming Coach output
│   ├── victor-ideas.md           # Innovation Strategist output
│   ├── maya-ideas.md             # Design Thinking Coach output
│   └── quinn-ideas.md            # (optional) Problem Solver output
│
├── consolidated-approaches.md    # Phase 2.5: Research Lead merge
│
├── mary-validation.md            # Phase 3: Analytical validation
│   # Includes: competitive analysis, feasibility, scores, risks
│
├── operator-choice.md            # Phase 4: Decision record
│   # Documents: chosen approach, rationale, any modifications
│
├── intake.md                     # Phase 5: Final product brief
│   # Comprehensive, ready for Project Lead
│
├── enhancements/                 # Phase 5+ (optional)
│   ├── pitch-deck.excalidraw     # Caravaggio visual presentation
│   └── product-story.md          # Sophia narrative framework
│
└── research-state.json           # Progress tracking
    # {
    #   "projectSlug": "screenshot-beautifier",
    #   "phase": 3,
    #   "cisPersonas": ["carson", "victor", "maya"],
    #   "statusPhase1": "complete",
    #   "statusPhase2": "complete",
    #   "statusPhase3": "in-progress",
    #   "marySessionId": "agent:main:subagent:abc123",
    #   "operatorChoice": null,
    #   "intakeComplete": false
    # }
```

---

## Implementation Tasks

### Phase 0: Prerequisites & Discovery

**Task 0.1: Verify CIS Persona Files**
- **Action:** Confirm all CIS persona agent files exist and are accessible
- **Location:** `/Users/austenallred/clawd/projects/bug-dictionary/_bmad/cis/agents/`
- **Files to verify:**
  - ✅ `brainstorming-coach.md` (Carson)
  - ✅ `innovation-strategist.md` (Victor)
  - ✅ `design-thinking-coach.md` (Maya)
  - ✅ `creative-problem-solver.md` (Quinn)
  - ✅ `presentation-master.md` (Caravaggio)
  - ✅ `storyteller/storyteller.md` (Sophia)
- **Deliverable:** Verification checklist
- **Time:** 15 min

**Task 0.2: Extract CIS Persona Instructions**
- **Action:** Read each CIS persona file, extract key sections:
  - Persona identity & role
  - Communication style
  - Core principles
  - Menu/workflow triggers (if applicable)
- **Purpose:** Understand how to adapt CIS personas for OpenClaw spawning
- **Note:** CIS personas are designed for BMAD CLI workflows; may need adaptation
- **Deliverable:** CIS persona summary document
- **Time:** 60 min

**Task 0.3: Check for Mary Validator Agent**
- **Action:** Search for existing Mary agent in OpenClaw agents or BMAD
- **Locations to check:**
  - `/Users/austenallred/.openclaw/agents/mary/`
  - BMAD _bmad/ directories
- **If not found:** Mary needs to be created from scratch
- **Deliverable:** Mary existence status + requirements doc
- **Time:** 15 min

---

### Phase 1: Core Agent Creation

**Task 1.1: Create Research Lead AGENTS.md**
- **Location:** `/Users/austenallred/.openclaw/agents/research-lead/AGENTS.md`
- **Content:**
  - Role: Research orchestrator, idea validator, intake compiler
  - Orchestration logic for 5-phase workflow
  - CIS persona spawning protocol
  - Mary spawning protocol
  - Operator interaction patterns (present options, get choice)
  - Consolidation/deduplication strategies
  - intake.md compilation template
  - Error handling (subagent failures, operator rejection)
  - State management (research-state.json)
- **Model:** Sonnet 4.5 (orchestration + analytical tasks)
- **Deliverable:** Complete AGENTS.md (~200-300 lines)
- **Time:** 90-120 min

**Task 1.2: Create Mary Validator AGENTS.md** (if doesn't exist)
- **Location:** `/Users/austenallred/.openclaw/agents/mary/AGENTS.md`
- **Content:**
  - Role: Analytical validator, competitive analyst, feasibility assessor
  - Validation criteria & scoring rubric
  - Research methodology (web_search + web_fetch patterns)
  - Competitive analysis template
  - Feasibility assessment checklist
  - Business model evaluation framework
  - Risk identification protocol
  - Output format (mary-validation.md structure)
- **Model:** Sonnet 4.5 (analytical reasoning + research)
- **Deliverable:** Complete AGENTS.md (~150-200 lines)
- **Time:** 60-90 min

**Task 1.3: Adapt CIS Personas for OpenClaw Spawning**
- **Challenge:** CIS personas are BMAD CLI agents with menu-driven workflows
- **Goal:** Create OpenClaw-compatible spawn instructions
- **Options:**
  - **A)** Create simplified CIS AGENTS.md files in `/Users/austenallred/.openclaw/agents/`
    - Strip BMAD menu system
    - Focus on persona + core ideation task
    - Spawn as standard OpenClaw subagents
  - **B)** Invoke BMAD CLI from Research Lead
    - Use `exec` tool to run BMAD workflows
    - Parse BMAD output files
    - More complex but preserves full BMAD functionality
- **Recommendation:** Option A (simplified) for MVP, Option B for future enhancement
- **Deliverable:** 
  - `/Users/austenallred/.openclaw/agents/carson/AGENTS.md`
  - `/Users/austenallred/.openclaw/agents/victor/AGENTS.md`
  - `/Users/austenallred/.openclaw/agents/maya/AGENTS.md`
  - (Optional) `/Users/austenallred/.openclaw/agents/quinn/AGENTS.md`
- **Time:** 90-120 min (3-4 personas × 30 min each)

---

### Phase 2: Configuration & Integration

**Task 2.1: Add Research Lead to Gateway Config**
- **File:** Gateway config (via `gateway config.get` / `config.patch`)
- **Changes:**
  - Add `research-lead` agent ID
  - Model: `anthropic/claude-sonnet-4-5`
  - Session key pattern: `agent:research-lead:project-{slug}`
  - Workspace: `/Users/austenallred/clawd/research/{slug}`
  - Tools: sessions_spawn, sessions_send, sessions_list, write, web_search, web_fetch, memory_search
- **Deliverable:** Config patch applied
- **Time:** 15 min

**Task 2.2: Add CIS Personas to Gateway Config**
- **File:** Gateway config
- **Changes:**
  - Add `carson`, `victor`, `maya` (±`quinn`) agent IDs
  - Model: Sonnet 4.5 or Opus 4 (creative tasks)
  - Session key pattern: `agent:main:subagent:{uuid}`
  - Spawn via Research Lead only (not user-accessible)
- **Deliverable:** Config patch applied
- **Time:** 15 min

**Task 2.3: Add Mary to Gateway Config**
- **File:** Gateway config
- **Changes:**
  - Add `mary` agent ID
  - Model: Sonnet 4.5 (analytical reasoning)
  - Session key pattern: `agent:main:subagent:{uuid}`
  - Tools: web_search, web_fetch, memory_search
- **Deliverable:** Config patch applied
- **Time:** 10 min

**Task 2.4: Update Kelly AGENTS.md**
- **File:** `/Users/austenallred/.openclaw/workspace-main/AGENTS.md` (or Kelly's AGENTS.md)
- **Changes:**
  - Add Research Lead spawn protocol
  - Trigger patterns:
    - User says "research [topic/problem]"
    - User says "validate [idea]"
    - User says "explore [market opportunity]"
  - Spawn command: `sessions_spawn(agentId: "research-lead", label: "Research: {topic}", task: "...")`
  - Handoff protocol: Receive intake.md path from Research Lead → spawn Project Lead
- **Deliverable:** Updated Kelly AGENTS.md with Research Lead integration
- **Time:** 30 min

---

### Phase 3: Workflow Documentation & Skills

**Task 3.1: Create Research Lead Skill (Optional)**
- **Location:** `/Users/austenallred/clawd/skills/factory/research-lead/SKILL.md`
- **Content:**
  - Orchestration protocol documentation
  - CIS persona descriptions & selection guidance
  - Mary validation criteria reference
  - Example research sessions
  - Troubleshooting common issues
  - File structure reference
- **Purpose:** Reference for Kelly Improver, future debugging
- **Deliverable:** Comprehensive skill documentation
- **Time:** 60 min

**Task 3.2: Create Research Lead Spawning Protocol**
- **Location:** `/Users/austenallred/clawd/skills/factory/research-lead-spawning/SKILL.md`
- **Content:**
  - Quick reference for Kelly to spawn Research Lead
  - Copy/paste spawn templates
  - Parameter reference (persona selection, depth mode)
  - Handoff protocol (receiving intake.md)
- **Purpose:** Make Kelly spawning consistent
- **Deliverable:** Protocol skill
- **Time:** 30 min

**Task 3.3: Document Research Artifacts Standard**
- **Location:** `/Users/austenallred/clawd/docs/research-artifacts-standard.md`
- **Content:**
  - File structure specification
  - problem-brief.md template
  - consolidated-approaches.md format
  - mary-validation.md structure
  - operator-choice.md format
  - intake.md template (for Research Lead output)
  - research-state.json schema
- **Purpose:** Consistency across research sessions
- **Deliverable:** Standard documentation
- **Time:** 45 min

---

### Phase 4: Testing & Validation

**Task 4.1: Unit Test - Spawn Research Lead**
- **Action:** Kelly spawns Research Lead session
- **Test case:** "Research productivity tools for remote teams"
- **Validation:**
  - Research Lead session created successfully
  - Session key format correct
  - Workspace directory created
  - Research Lead responds with Phase 1 interview
- **Deliverable:** Spawn test passed
- **Time:** 15 min

**Task 4.2: Integration Test - Phase 1 (Problem Framing)**
- **Action:** Research Lead conducts operator interview, creates problem-brief.md
- **Validation:**
  - Problem brief captures key details
  - Operator confirms clarity before proceeding
  - File saved to correct location
- **Deliverable:** Phase 1 test passed
- **Time:** 15 min

**Task 4.3: Integration Test - Phase 2 (CIS Ideation)**
- **Action:** Research Lead spawns CIS personas (start with 2: Carson + Victor)
- **Validation:**
  - CIS persona sessions spawn successfully
  - Each persona receives problem-brief.md
  - Each persona generates 5+ approaches
  - Outputs saved to correct files
  - Research Lead collects all outputs
- **Deliverable:** Phase 2 test passed
- **Time:** 30 min (includes CIS execution time)

**Task 4.4: Integration Test - Phase 2.5 (Consolidation)**
- **Action:** Research Lead consolidates CIS outputs
- **Validation:**
  - Semantic duplicates identified
  - Merged with attribution
  - 8-10 unique approaches preserved
  - consolidated-approaches.md created
- **Deliverable:** Phase 2.5 test passed
- **Time:** 15 min

**Task 4.5: Integration Test - Phase 3 (Mary Validation)**
- **Action:** Research Lead spawns Mary with consolidated approaches
- **Validation:**
  - Mary session spawns successfully
  - Mary performs web_search for competitive analysis
  - Mary scores each approach across 4 dimensions
  - Mary selects top 3-5 with rationale
  - mary-validation.md created with detailed analysis
- **Deliverable:** Phase 3 test passed
- **Time:** 30 min (includes Mary execution time)

**Task 4.6: Integration Test - Phase 4 (Operator Choice)**
- **Action:** Research Lead presents options to operator
- **Validation:**
  - Options clearly formatted
  - Operator can choose by number or description
  - Choice captured in operator-choice.md
- **Deliverable:** Phase 4 test passed
- **Time:** 10 min

**Task 4.7: Integration Test - Phase 5 (Intake Compilation)**
- **Action:** Research Lead compiles comprehensive intake.md
- **Validation:**
  - intake.md includes all required sections
  - Content rich enough for Project Lead start
  - File saved to research folder
  - Copy created in /projects/<slug>/ directory
- **Deliverable:** Phase 5 test passed
- **Time:** 20 min

**Task 4.8: End-to-End Test - Kelly Handoff**
- **Action:** Research Lead signals completion to Kelly, Kelly spawns Project Lead
- **Validation:**
  - Kelly receives intake.md path
  - Kelly spawns Project Lead with intake.md
  - Project Lead begins planning phase
- **Deliverable:** E2E test passed
- **Time:** 15 min

**Task 4.9: Error Handling Test**
- **Test scenarios:**
  - CIS persona spawn failure
  - Mary validation timeout
  - Operator rejects all options (pivot required)
  - Malformed problem brief
- **Validation:** Research Lead handles gracefully, escalates appropriately
- **Deliverable:** Error handling validated
- **Time:** 30 min

---

### Phase 5: Documentation & Launch

**Task 5.1: Create Research Lead Quick Start Guide**
- **Location:** `/Users/austenallred/clawd/docs/research-lead-quick-start.md`
- **Content:**
  - How to trigger a research session
  - What to expect at each phase
  - How to provide good problem briefs
  - How to evaluate Mary's options
  - What makes a good research session
- **Audience:** Operator (user)
- **Deliverable:** User-facing guide
- **Time:** 30 min

**Task 5.2: Update Factory State with Research Lead**
- **File:** `/Users/austenallred/clawd/factory-state.md`
- **Changes:**
  - Add Research Lead to factory infrastructure section
  - Document workflow integration
  - Link to relevant docs
- **Deliverable:** Factory state updated
- **Time:** 15 min

**Task 5.3: Commit & Tag Research Lead v1**
- **Action:** Commit all Research Lead files to git
- **Tag:** `research-lead-v1-mvp`
- **Commit message:** Include implementation summary
- **Deliverable:** Research Lead v1 tagged in repo
- **Time:** 10 min

---

## Integration Points

### Kelly Router Integration

**Trigger detection:**
```
User: "Research productivity tools for remote teams"
User: "Validate this idea: screenshot beautifier"
User: "Explore market opportunities in [domain]"
```

**Kelly spawn logic:**
```
sessions_spawn(
  agentId: "research-lead",
  label: "Research: {extracted-topic}",
  task: "The user wants research on: {problem-statement}. 
         Conduct 5-phase research workflow:
         1. Problem framing interview
         2. Spawn CIS personas (Carson, Victor, Maya) for ideation
         3. Spawn Mary for validation
         4. Present top 3-5 options to operator
         5. Compile comprehensive intake.md for chosen approach
         
         When complete, signal Kelly with intake.md path."
)
```

**Handoff protocol:**
- Research Lead announces completion to Kelly
- Research Lead provides: `intake.md path: /research/{slug}/intake.md`
- Kelly copies intake.md to `/projects/{slug}/intake.md`
- Kelly spawns Project Lead with standard intake.md

---

### Project Lead Integration

**No changes required** - Research Lead outputs standard intake.md format

**Project Lead receives:**
- Comprehensive intake.md with all standard sections
- Additional context: validation data, competitive analysis, novelty angle
- Can proceed with standard planning phase (John → Sally → Winston → John epics → Bob)

---

### Factory State Integration

**Research sessions tracked in factory-state.md:**
```markdown
## Active Research

### screenshot-beautifier (Research Phase 3)
- **Status:** 🔄 **IN PROGRESS** - Mary validation
- **Session:** agent:research-lead:project-screenshot-beautifier
- **Research path:** `research/screenshot-beautifier/`
- **CIS personas:** Carson ✅, Victor ✅, Maya ✅
- **Mary status:** In progress (competitive analysis)
- **Operator choice:** Pending Mary completion
- **Next:** Present options to operator
```

---

## Testing Strategy

### Test Project Selection

**Pick a simple, fast research test case:**
- **Recommended:** "Screenshot Beautifier" (from earlier discussion)
- **Why:** Small scope, clear problem, fast validation
- **Expected result:** 15-20 approaches → 3-5 validated → operator picks one → intake.md ready

**Alternative test cases:**
- "Meeting Cost Calculator"
- "Cron Expression Builder"
- "Pomodoro Timer with twist"

---

### Testing Phases

**MVP Testing (required for launch):**
1. Spawn Research Lead ✓
2. Phase 1: Problem framing ✓
3. Phase 2: CIS ideation (2 personas: Carson + Victor) ✓
4. Phase 2.5: Consolidation ✓
5. Phase 3: Mary validation ✓
6. Phase 4: Operator choice ✓
7. Phase 5: intake.md compilation ✓
8. Kelly handoff → Project Lead spawn ✓

**Full Testing (before production use):**
- All 3 CIS personas (Carson + Victor + Maya)
- Optional 4th persona (Quinn)
- Error scenarios (CIS failure, Mary timeout, pivot)
- Enhancement features (Caravaggio, Sophia)

---

### Success Metrics

**Quantitative:**
- Research session completes in <90 minutes
- CIS generates 15+ raw approaches
- Mary validates 3-5 approaches with scores
- intake.md is ≥2KB (comprehensive)
- Project Lead accepts intake.md without clarification questions

**Qualitative:**
- Approaches feel novel (not "same 20 ideas")
- Mary's competitive analysis is accurate
- Operator feels confident in validation data
- intake.md provides clear direction for Project Lead

---

## Timeline & Milestones

### Milestone 1: Prerequisites Complete
**Tasks:** 0.1, 0.2, 0.3  
**Deliverables:**
- CIS persona verification checklist
- CIS persona summary document
- Mary existence status + requirements
**Time:** 90 minutes  
**Completion criteria:** All CIS personas verified, Mary requirements documented

---

### Milestone 2: Core Agents Created
**Tasks:** 1.1, 1.2, 1.3  
**Deliverables:**
- Research Lead AGENTS.md
- Mary AGENTS.md (if needed)
- CIS persona AGENTS.md files (3-4 personas)
**Time:** 3-4 hours  
**Completion criteria:** All agent files created, reviewed, committed

---

### Milestone 3: Configuration & Integration
**Tasks:** 2.1, 2.2, 2.3, 2.4  
**Deliverables:**
- Gateway config updated with Research Lead + CIS + Mary
- Kelly AGENTS.md updated with spawn protocol
**Time:** 70 minutes  
**Completion criteria:** Config changes applied, Kelly can spawn Research Lead

---

### Milestone 4: Documentation & Skills
**Tasks:** 3.1, 3.2, 3.3  
**Deliverables:**
- Research Lead skill documentation
- Spawning protocol skill
- Research artifacts standard
**Time:** 2.5 hours  
**Completion criteria:** All docs complete, reviewed

---

### Milestone 5: Testing Complete
**Tasks:** 4.1 → 4.9  
**Deliverables:**
- All integration tests passed
- E2E test passed (Kelly → Research Lead → CIS/Mary → Project Lead)
- Error handling validated
**Time:** 3-4 hours  
**Completion criteria:** Full research session executes successfully, Project Lead receives valid intake.md

---

### Milestone 6: Launch
**Tasks:** 5.1, 5.2, 5.3  
**Deliverables:**
- Quick start guide
- Factory state updated
- Git commit + tag
**Time:** 55 minutes  
**Completion criteria:** Research Lead v1 shipped, ready for production use

---

### Total Timeline

**MVP Path (minimum viable):**
- Milestones 1-3 + Task 4.1-4.8 (skip docs/skills initially)
- **Estimated time:** 6-8 hours
- **Calendar time:** 1 full day or 2 half-days

**Full Implementation:**
- All milestones 1-6
- **Estimated time:** 10-14 hours
- **Calendar time:** 2-3 days (with testing/iteration)

**Recommended approach:**
1. **Day 1:** Milestones 1-3 (core agents + config) → MVP functional
2. **Test session:** Run full research on "Screenshot Beautifier"
3. **Day 2:** Milestones 4-6 (docs + polish) → production ready

---

## Open Questions

### Pre-Implementation Decisions

**Q1: CIS persona adaptation strategy?**
- **Option A:** Create simplified OpenClaw AGENTS.md files (strip BMAD menu system)
- **Option B:** Invoke BMAD CLI from Research Lead (preserve full functionality)
- **Recommendation:** A for MVP, B for future enhancement
- **Decision needed:** Operator approval

**Q2: How many CIS personas in default configuration?**
- **Option A:** 2 personas (Carson + Victor) - fast, focused
- **Option B:** 3 personas (Carson + Victor + Maya) - balanced
- **Option C:** 4 personas (all) - comprehensive
- **Recommendation:** B (3 personas) for MVP
- **Decision needed:** Operator preference

**Q3: Quinn inclusion strategy?**
- **Option A:** Always include Quinn (4 personas every time)
- **Option B:** Optional per project (operator decides)
- **Option C:** Never include Quinn (redundant with Mary)
- **Recommendation:** B (optional) - let operator choose
- **Decision needed:** Operator preference

**Q4: Mary creation scope?**
- **If Mary doesn't exist:** Full AGENTS.md creation from scratch
- **Validation criteria depth:** Quick check vs. deep research?
- **Recommendation:** Start with medium-depth validation (20-25 min per session)
- **Decision needed:** Review Task 1.2 spec before implementation

**Q5: Research Lead autonomy level?**
- **Option A:** Full pipeline autonomy (operator only at Phase 4 choice)
- **Option B:** Check-in at each phase (operator approves before proceeding)
- **Option C:** Hybrid (autonomous Phases 2-3, operator at 1, 4, 5)
- **Recommendation:** C (hybrid) for MVP
- **Decision needed:** Operator preference

---

### Implementation Unknowns

**U1: CIS persona file structure compatibility**
- BMAD CIS personas use XML-style agent definitions with menu systems
- OpenClaw uses AGENTS.md (markdown format)
- **Risk:** May need significant adaptation, not just copy/paste
- **Mitigation:** Task 0.2 will reveal adaptation complexity

**U2: Subagent spawn limits**
- Spawning 4-5 subagents simultaneously (CIS personas + Mary)
- **Risk:** Gateway/OpenClaw spawn limits? Performance issues?
- **Mitigation:** Start with 2 personas, scale up during testing

**U3: Mary research depth calibration**
- How much web_search is "enough"?
- **Risk:** Too shallow = poor validation; too deep = time explosion
- **Mitigation:** Define success criteria during testing, iterate

**U4: intake.md compatibility**
- Research Lead outputs intake.md for Project Lead
- **Risk:** Format mismatch causes Project Lead confusion
- **Mitigation:** Task 3.3 defines standard, test with Project Lead in Task 4.8

---

### Post-MVP Enhancements

**E1: Operator persona selection**
- Let operator specify CIS personas at research start
- Example: "Research [problem] using Victor and Quinn only"
- **Benefit:** Flexibility for different project types

**E2: Research depth modes**
- **Quick mode:** 2 personas, light Mary validation (30-45 min total)
- **Standard mode:** 3 personas, medium Mary validation (60-90 min)
- **Deep mode:** 4 personas, comprehensive Mary validation (90-120 min)
- **Benefit:** Time control for operator

**E3: Caravaggio/Sophia integration**
- Add Phase 5+ enhancements as standard options
- **Benefit:** Visual pitches and narrative framing built-in

**E4: Research history & learning**
- Store past research sessions in memory system
- Research Lead recalls: "Similar research done on [date] for [project]"
- **Benefit:** Avoid duplicate research, build on past insights

**E5: BMAD CLI integration (Option B)**
- Full BMAD workflow invocation instead of simplified personas
- **Benefit:** Access full BMAD features (Party Mode, workflows)
- **Cost:** More complex integration

---

## Appendix: Reference Files

**BMAD CIS Installation:**
- Location: `/Users/austenallred/clawd/projects/bug-dictionary/_bmad/cis/`
- Agents: `agents/` directory (6 persona files)
- Teams: `teams/creative-squad.yaml`
- Workflows: `workflows/` directory

**OpenClaw Agents:**
- Location: `/Users/austenallred/.openclaw/agents/`
- Existing: `project-lead/`, `kelly-improver/`, others
- To create: `research-lead/`, `mary/`, `carson/`, `victor/`, `maya/`

**Factory Documentation:**
- Current plan: `/Users/austenallred/clawd/docs/research-lead-plan.md` (high-level)
- This plan: `/Users/austenallred/clawd/skills/factory/kelly-improver/plans/research-lead-v1.md` (implementation)

---

## Sign-Off

**Created by:** Kelly (Factory Router Agent)  
**Date:** 2026-02-16 20:57 CST  
**Status:** Draft - awaiting operator approval  

**Approval checklist:**
- [ ] CIS persona adaptation strategy (Task 1.3 - Option A or B?)
- [ ] Default CIS persona count (2, 3, or 4?)
- [ ] Quinn inclusion strategy (always/optional/never?)
- [ ] Mary creation scope approved
- [ ] Research Lead autonomy level approved
- [ ] Timeline acceptable (6-8 hours MVP or 10-14 hours full?)
- [ ] Test project confirmed (Screenshot Beautifier?)

**Next steps after approval:**
1. Confirm open decisions (Q1-Q5)
2. Begin Milestone 1 (Prerequisites)
3. Create detailed task checklist
4. Start implementation

---

**End of Research Lead v1 Implementation Plan**
