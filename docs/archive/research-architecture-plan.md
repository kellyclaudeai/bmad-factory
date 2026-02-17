# Research Architecture Plan

**Created:** 2026-02-16  
**Status:** Planning Phase (No Implementation Yet)

## Executive Summary

This document outlines the architecture for a research pipeline that generates validated, novel product ideas ("idea buds") and delivers production-ready product briefs to Project Lead for implementation.

## Core Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Research Pipeline                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├──► Flow 1: Idea Bud Discovery
                              │    "Find me 20 idea buds"
                              │    Output: Idea inventory (ranked opportunities)
                              │
                              └──► Flow 2: Deep Dive & Validation
                                   "Take this idea bud and deep dive"
                                   Output: Product brief → Project Lead

```

## Key Requirements

### Input Requirements
1. **Flow 1 (Discovery):** Research domain/theme/pain point area
2. **Flow 2 (Deep Dive):** Specific idea bud from discovery OR standalone idea

### Output Requirements
1. **Flow 1:** 20 ranked idea buds with:
   - Pain point summary
   - Market validation signals
   - Novelty assessment
   - Implementation complexity estimate
   - Recommended for deep dive? (Yes/Maybe/No)

2. **Flow 2:** Product brief matching Project Lead's expected format:
   - Executive summary
   - Market validation (competitive analysis, user research)
   - Pain point articulation with evidence
   - Target users with specificity
   - Success metrics
   - Technical considerations
   - Novelty statement (what's different/unique)

## Proposed Agent Architecture

### Option A: Research Lead Orchestrator (Recommended)

**Research Lead** (new OpenClaw agent)
- **Role:** Orchestrates research projects from discovery → validated brief
- **Spawns:**
  - Mary (BMAD Analyst) for market/domain/technical research
  - CIS agents (brainstorming/creative problem-solving) for novelty generation
  - Internal validation steps (pain point verification, competitive gap analysis)
- **State Management:** Research project state files (similar to Project Lead's project-state.json)
- **Session Key Pattern:** `agent:research-lead:research-{researchId}`

**Advantages:**
- Clean separation of concerns (Kelly routes to Research Lead, Research Lead orchestrates)
- Reusable across multiple research projects
- Can track long-running research (days/weeks)
- Parallel research (multiple idea explorations simultaneously)

**Disadvantages:**
- Additional orchestration layer
- More complexity in factory architecture

### Option B: Kelly Direct Orchestration (Simpler)

**Kelly Router** directly spawns Mary + CIS agents
- Kelly manages research state in `factory-state.md`
- No dedicated Research Lead agent
- Lighter weight for one-off research requests

**Advantages:**
- Simpler architecture (fewer agents)
- Faster for single research requests

**Disadvantages:**
- Kelly's AGENTS.md grows (more operational burden)
- Harder to parallelize research projects
- State tracking mixed with project tracking

### Recommendation: **Option A** (Research Lead)

Rationale:
- Research can be long-running (multi-day deep dives)
- Operator may want to run multiple research streams in parallel
- Keeps Kelly focused on routing/monitoring (not orchestrating research)
- Future-proofs for advanced research workflows (A/B testing ideas, iterative validation)

## Agent Capabilities Breakdown

### Research Lead (New Agent)

**Responsibilities:**
- Manage research project lifecycle (discovery → validation → brief delivery)
- Spawn Mary for structured research (market, domain, technical)
- Spawn CIS agents for creative/brainstorming tasks (novelty generation)
- Synthesize multi-agent outputs into ranked idea lists or validated briefs
- Validate pain points (web search + competitive analysis)
- Deliver product brief to Project Lead (or operator)

**State Files:**
```
/projects/research-{researchId}/
  research-state.json       # Pipeline stage, active sub-agents, findings
  discovery-state.md        # Flow 1: Idea bud inventory
  validation-state.md       # Flow 2: Deep dive progress
  product-brief.md          # Final deliverable
  research/                 # Mary/CIS outputs
    market-research.md
    domain-research.md
    competitive-analysis.md
    pain-point-evidence.md
```

**Session Management:**
- Dedicated session per research project: `agent:research-lead:research-{researchId}`
- Kelly instantiates via `project-lead-instantiator` pattern (same mechanism, different agent)
- Operator can message Research Lead directly for status/pivots

### Mary (BMAD Analyst) - Existing

**When Research Lead Spawns Mary:**
- **Market Research:** Industry trends, competitive landscape, customer needs
- **Domain Research:** Subject matter expertise, terminology, industry depth
- **Technical Research:** Feasibility, architecture options, implementation approaches
- **Product Brief Creation:** Guided experience to document validated idea

**Output Format:**
- Structured markdown reports in `_bmad-output/planning-artifacts/`
- Research Lead reads and synthesizes these into idea inventory or final brief

### CIS Agents (BMAD CIS Module) - Need Configuration

**Available CIS Agents:**
1. **Carson (Brainstorming Coach)** - Idea generation, divergent thinking
2. **Innovation Strategist** - Novel angle finding, differentiation
3. **Creative Problem Solver** - Pain point → solution brainstorming
4. **Design Thinking Coach** - User-centered ideation
5. **Storyteller** - Narrative framing for product ideas
6. **Presentation Master** - Brief polishing (optional)

**When Research Lead Spawns CIS:**
- **Flow 1 (Discovery):** Spawn brainstorming coach + innovation strategist to generate 20+ idea seeds
- **Flow 2 (Validation):** Spawn creative problem solver to refine selected idea, design thinking coach for user scenarios

**Configuration Needed:**
- Add CIS agents to OpenClaw config (`agents.list[]`)
- Create workspace directories for CIS agents
- Define session key patterns (e.g., `agent:cis-brainstorming-coach:subagent-{UUID}`)

## Workflow Details

### Flow 1: Idea Bud Discovery

**Input:** Research domain/theme (e.g., "SaaS tools for remote teams", "AI-powered productivity apps")

**Steps:**
1. **Research Lead receives request** (from operator via Kelly Router)
2. **Spawn Mary (Market Research):**
   - Analyze market trends in domain
   - Identify underserved segments
   - Map competitive landscape gaps
3. **Spawn CIS agents (Brainstorming):**
   - Generate 50+ raw idea seeds
   - Apply novelty filters (what's truly different?)
4. **Research Lead synthesizes:**
   - Cross-reference Mary's gaps with CIS ideas
   - Validate pain points via web search (real complaints, forum discussions)
   - Rank by: Pain severity × Market size × Novelty × Feasibility
   - Output: 20 ranked idea buds in `discovery-state.md`
5. **Deliver to operator:**
   - Present ranked list with summaries
   - Await selection for deep dive

**Output Format (discovery-state.md):**
```markdown
# Idea Bud Discovery: {Domain}

## Top 20 Ranked Opportunities

### 1. [Idea Name]
**Pain Point:** [1-2 sentence description]
**Market Signal:** [Evidence of demand - search volume, forum mentions, competitor gaps]
**Novelty:** [What's different from existing solutions]
**Complexity:** [Low/Medium/High implementation estimate]
**Recommended:** [Yes/Maybe/No for deep dive]

[Repeat for 20 ideas]
```

### Flow 2: Deep Dive & Validation

**Input:** Specific idea bud (from Flow 1 or standalone)

**Steps:**
1. **Research Lead receives deep dive request**
2. **Spawn Mary (Multi-phase Research):**
   - **Market Research:** Competitive analysis, TAM/SAM, pricing models
   - **Domain Research:** Industry-specific validation, regulations, terminology
   - **Technical Research:** Feasibility, tech stack recommendations, integrations
3. **Spawn CIS agents (Refinement):**
   - **Creative Problem Solver:** Refine problem statement, explore solution variations
   - **Design Thinking Coach:** User journey mapping, persona development
4. **Research Lead validates:**
   - **Pain Point Evidence:** Web search for real user complaints, discussions, reviews
   - **Competitive Gap Analysis:** Why do existing solutions fail? What's missing?
   - **Novelty Statement:** Articulate unique angle (not just "better UX")
5. **Research Lead compiles product brief:**
   - Synthesize all research into Project Lead's expected format
   - Include market validation data, pain point evidence, novelty statement
   - Save to `product-brief.md`
6. **Deliver to Project Lead:**
   - Use `sessions_send` to pass brief to Project Lead's session
   - Project Lead validates brief quality, proceeds to planning phase

**Output Format (product-brief.md):**
```markdown
# Product Brief: {Idea Name}

**Author:** Research Lead (Research Project: research-{id})
**Date:** {YYYY-MM-DD}

## Executive Summary
[2-3 paragraphs: What is it, who it's for, why now, what makes it novel]

## Market Validation

### Competitive Landscape
[Existing solutions, their gaps, why users are dissatisfied]

### Market Opportunity
[TAM/SAM estimates, growth trends, adoption signals]

### User Research
[Pain point evidence - quotes, forum links, survey data if available]

## Pain Point Articulation
[Deep dive on the core problem - why it matters, who feels it, current workarounds]

## Target Users
[Specific personas - not "developers", but "junior frontend devs at startups"]

## Novelty Statement
[What makes this different? NOT just "better UX" - architectural, approach, positioning]

## Success Metrics
[How we'll know it's working - usage, retention, revenue]

## Technical Considerations
[Feasibility notes, recommended tech stack, integration points, risks]

## Recommended Next Steps
[Planning phase → BMAD PRD creation]
```

## Integration with Project Lead

### Handoff Protocol

**Scenario 1: Operator Approves Brief**
1. Research Lead marks project complete (`research-state.json: status="complete"`)
2. Operator says "Build this" to Kelly Router
3. Kelly Router:
   - Creates new project directory: `/projects/{projectId}/`
   - Copies `product-brief.md` → `/projects/{projectId}/planning-artifacts/product-brief.md`
   - Instantiates Project Lead session: `agent:project-lead:project-{projectId}`
   - Sends message to Project Lead: "New project {projectId} ready. Product brief at planning-artifacts/product-brief.md. Proceed to planning phase."
4. Project Lead loads brief, validates, spawns John (PM) for PRD creation

**Scenario 2: Auto-Handoff (Optional)**
- Research Lead automatically creates project + instantiates Project Lead
- Announces to operator: "Research complete. Project {projectId} created and ready for planning."
- Operator reviews at convenience

### Brief Quality Gates

**Research Lead must validate before delivery:**
- [ ] Pain point backed by evidence (not speculation)
- [ ] Competitive analysis includes 3+ existing solutions
- [ ] Novelty statement is specific (not generic "AI-powered")
- [ ] Target users are specific (not broad categories)
- [ ] Technical feasibility confirmed (not "probably possible")

**Project Lead validates on receipt:**
- [ ] Brief format matches expected structure
- [ ] Sufficient detail for John (PM) to create PRD
- [ ] Market validation is credible
- [ ] If quality issues: escalate to operator, do NOT proceed to planning

## CIS Agent Configuration Tasks

### Add to OpenClaw Config

**File:** `~/.openclaw/openclaw.json`

```json
{
  "agents": {
    "list": [
      {"id": "project-lead", "heartbeat": {"every": "60s", "target": "none"}},
      {"id": "research-lead", "heartbeat": {"every": "0", "target": "none"}},
      {"id": "cis-brainstorming-coach"},
      {"id": "cis-innovation-strategist"},
      {"id": "cis-creative-problem-solver"},
      {"id": "cis-design-thinking-coach"}
    ]
  }
}
```

### Create Workspace Directories

```bash
mkdir -p /Users/austenallred/clawd/workspace-research-lead
mkdir -p /Users/austenallred/clawd/workspace-cis-brainstorming-coach
mkdir -p /Users/austenallred/clawd/workspace-cis-innovation-strategist
mkdir -p /Users/austenallred/clawd/workspace-cis-creative-problem-solver
mkdir -p /Users/austenallred/clawd/workspace-cis-design-thinking-coach
```

### Create Agent Files (AGENTS.md, SOUL.md, etc.)

Each agent needs:
- `AGENTS.md` - Operational instructions (BMAD persona activation, workflow handling)
- `SOUL.md` - Persona from BMAD agent definition
- `TOOLS.md` - Skills available (BMAD skills, web-search, etc.)
- `IDENTITY.md` - Name, emoji, creature type

**Note:** Mary (BMAD Analyst) is already configured as a BMAD persona. CIS agents follow same pattern.

## Research Lead Skills (New)

**Location:** `/Users/austenallred/clawd/skills/factory/research-lead/`

**Proposed Skills:**
1. **spawning-protocol/** - How to spawn Mary + CIS agents with correct task directives
2. **state-management/** - Research project state file schemas
3. **validation-protocol/** - Pain point validation, competitive gap analysis patterns
4. **brief-synthesis/** - How to compile multi-agent outputs into product brief

**Pattern:** Same as Project Lead's factory skills (progressive disclosure)

## Session Key Patterns

**Research Lead (main):**
```
agent:research-lead:research-{researchId}
```

**Mary (subagent of Research Lead):**
```
agent:mary-analyst:subagent-{UUID}
```

**CIS agents (subagent of Research Lead):**
```
agent:cis-{agentType}:subagent-{UUID}
```

**Labels:**
- `mary-market-{researchId}`
- `carson-brainstorm-{researchId}`
- `innovate-{researchId}`

## Factory State Tracking

### Kelly Router's View

**factory-state.md:**
```markdown
## Research Projects

| Research ID | Status | Stage | Started | Operator Request |
|-------------|--------|-------|---------|------------------|
| research-20260216-001 | active | discovery | 2026-02-16 | "Find 20 SaaS ideas for remote teams" |
| research-20260215-003 | complete | deep-dive | 2026-02-15 | "Deep dive on Slack alternative for async teams" |
```

### Research Lead's View

**research-state.json:**
```json
{
  "researchId": "research-20260216-001",
  "status": "active",
  "stage": "discovery",
  "flow": "idea-bud-discovery",
  "started": "2026-02-16T19:00:00Z",
  "operatorRequest": "Find 20 SaaS ideas for remote teams",
  "subagents": [
    {
      "label": "mary-market-research-20260216-001",
      "persona": "mary-analyst",
      "task": "Market research: SaaS remote team tools",
      "status": "running",
      "started": "2026-02-16T19:05:00Z"
    }
  ],
  "outputs": {
    "marketResearch": "_bmad-output/planning-artifacts/market-research.md",
    "ideaInventory": "discovery-state.md"
  }
}
```

## Open Questions & Decisions

### Q1: Should Research Lead auto-create projects?
**Options:**
- A: Research Lead delivers brief → Operator approves → Kelly creates project
- B: Research Lead auto-creates project + instantiates Project Lead (hands-off)

**Recommendation:** Option A (operator approval gate)
- Gives operator chance to reject/pivot before planning phase
- Cleaner separation (research doesn't assume implementation)

### Q2: How many CIS agents to configure?
**Options:**
- Minimal: Brainstorming Coach only (covers most creativity needs)
- Full suite: All 6 CIS agents (maximum flexibility)

**Recommendation:** Start with 3:
1. Brainstorming Coach (Carson) - Idea generation
2. Innovation Strategist - Novelty/differentiation
3. Creative Problem Solver - Refinement

Add others as needed (Design Thinking Coach, Storyteller, Presentation Master).

### Q3: Should Mary be an OpenClaw agent or just BMAD persona?
**Current State:** Mary is a BMAD persona (not OpenClaw agent)
**Options:**
- A: Keep as BMAD persona (Research Lead spawns via BMAD workflows)
- B: Create OpenClaw agent wrapping Mary persona

**Recommendation:** Option B (OpenClaw agent)
- Cleaner session management (consistent with CIS agents)
- Easier state tracking (sessions_list, sessions_send)
- Can add OpenClaw-specific skills (web-search integration, etc.)

### Q4: Validation depth for Flow 1 (Idea Buds)?
**Options:**
- Light: Quick web search + competitive scan (5-10 min per idea)
- Deep: Full competitive analysis + pain point evidence (30+ min per idea)

**Recommendation:** Light for Flow 1, Deep for Flow 2
- Flow 1 goal: Surface options quickly (quantity over depth)
- Flow 2: Selected idea gets full validation

## Success Metrics

**Flow 1 (Idea Bud Discovery):**
- Can generate 20 ranked ideas in <2 hours
- 80%+ of top 10 ideas have verifiable pain point evidence
- Operator selects ≥1 idea for deep dive per research project

**Flow 2 (Deep Dive):**
- Product briefs pass Project Lead's quality gates 90%+ of time
- Briefs include 3+ competitive solutions analyzed
- Pain points backed by evidence (forum links, reviews, etc.)
- Novelty statement is specific (not generic)

**Overall Research Pipeline:**
- Research → Planning → Implementation handoff with zero operator intervention
- Operator spends <30 min reviewing research (not participating in it)
- Ideas built have 50%+ operator satisfaction ("this is what I wanted")

## Next Steps (Implementation Phase)

**Phase 1: Configuration (No Coding)**
1. Create Research Lead workspace + agent files (AGENTS.md, SOUL.md, etc.)
2. Create CIS agent workspaces (3 agents: Brainstorming, Innovation, Problem Solver)
3. Add agents to OpenClaw config
4. Create factory/research-lead/ skills (spawning, state management, validation, synthesis)

**Phase 2: Test Flow 1 (Idea Discovery)**
1. Operator requests: "Find 20 SaaS ideas for remote teams"
2. Kelly routes to Research Lead
3. Research Lead spawns Mary + CIS agents
4. Validate output quality (ranked idea list)

**Phase 3: Test Flow 2 (Deep Dive)**
1. Operator selects idea from Flow 1
2. Research Lead deep dives (Mary research + CIS refinement)
3. Validate product brief quality
4. Test handoff to Project Lead

**Phase 4: Iterate & Refine**
1. Adjust validation depth based on brief quality
2. Tune CIS agent prompts for better novelty generation
3. Optimize research time (target: Flow 1 in 2hrs, Flow 2 in 4-6hrs)

## Related Documentation

- **Project Lead Architecture:** `/skills/factory/project-lead/` (reference for orchestration patterns)
- **BMAD Method:** `/skills/factory/kelly-improver/bmad/` (Mary + CIS personas)
- **OpenClaw Agents:** `/skills/factory/kelly-improver/openclaw-agents-architecture/` (workspace structure)
- **Spawning Protocol:** `/skills/factory/project-lead/spawning-protocol/` (adapt for Research Lead)

---

**Status:** Planning complete. Ready for operator approval before implementation.
