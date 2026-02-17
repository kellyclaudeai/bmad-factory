# Research Flow Diagrams

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            OPERATOR REQUEST                              │
│              "Find 20 AI productivity ideas" OR                          │
│              "Deep dive on async meeting recorder"                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │    Kelly Router        │
                    │  (Route + Monitor)     │
                    └────────────┬───────────┘
                                 │
                                 │ Instantiate/Route
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Research Lead        │
                    │   (Orchestrator)       │
                    │ Session: research-{id} │
                    └────────┬───────┬───────┘
                             │       │
              ┌──────────────┘       └──────────────┐
              │                                     │
              ▼                                     ▼
    ┌──────────────────┐                 ┌──────────────────┐
    │  Mary (Analyst)  │                 │   CIS Agents     │
    │ Market Research  │                 │  Brainstorming   │
    │ Domain Research  │                 │  Innovation      │
    │ Technical Study  │                 │  Problem Solving │
    └──────────────────┘                 └──────────────────┘
              │                                     │
              └──────────────┬──────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │  Research Lead         │
                │  Synthesizes +         │
                │  Validates             │
                └────────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      Flow 1: 20 Ranked           Flow 2: Product Brief
      Idea Buds                   → Project Lead
```

## Flow 1: Idea Bud Discovery

```
Operator: "Find me 20 idea buds for {domain}"
              │
              ▼
    ┌─────────────────────┐
    │  Research Lead      │  Creates research project
    │  Receives Request   │  /projects/research-{id}/
    └──────────┬──────────┘
               │
               ├─────► Spawn Mary (Market Research)
               │       "Analyze {domain} - trends, gaps, unmet needs"
               │       Output: market-research.md
               │
               ├─────► Spawn CIS (Brainstorming)
               │       "Generate 50+ idea seeds for {domain}"
               │       Output: brainstorm-raw.md
               │
               ├─────► Spawn CIS (Innovation)
               │       "Apply novelty filters - what's truly different?"
               │       Output: novelty-analysis.md
               │
               └─────► Research Lead Synthesis
                       1. Cross-reference Mary's gaps with CIS ideas
                       2. Web search validation (pain point evidence)
                       3. Rank by: Pain × Market × Novelty × Feasibility
                       4. Output: discovery-state.md (20 ranked ideas)
                       │
                       ▼
              ┌─────────────────────┐
              │ Deliver to Operator │
              │ "Here are top 20    │
              │  opportunities..."  │
              └─────────────────────┘
```

### Example discovery-state.md Output

```markdown
# Idea Bud Discovery: AI Productivity Tools

## Top 20 Ranked Opportunities

### 1. AI Meeting Transcript → Action Item Extractor
**Pain Point:** Remote teams lose 30% of meeting decisions to "we'll follow up" 
             that never happens. Existing tools transcribe but don't extract 
             commitments with ownership.
**Market Signal:** 
  - Reddit r/productivity: 47 threads on "action items disappearing"
  - Zoom/Meet transcripts = 90% unused (just archived)
  - Competitors (Otter, Fireflies) = transcript only
**Novelty:** Auto-assigns action items to calendar + Slack DMs with context
**Complexity:** Medium (NLP for commitment extraction, calendar integrations)
**Recommended:** YES (clear pain, big market, achievable differentiation)

### 2. Async Standup Bot with Context Awareness
[...]

[18 more ideas]
```

## Flow 2: Deep Dive & Validation

```
Operator: "Deep dive on idea #3" OR new standalone idea
              │
              ▼
    ┌─────────────────────┐
    │  Research Lead      │  Load idea context
    │  Receives Request   │  Start validation pipeline
    └──────────┬──────────┘
               │
               ├─────► Mary: Market Research
               │       - Competitive analysis (5+ solutions)
               │       - TAM/SAM estimates
               │       - Pricing models in market
               │       Output: market-research-deep.md
               │
               ├─────► Mary: Domain Research
               │       - Industry-specific validation
               │       - Regulations/compliance needs
               │       - Terminology/jargon
               │       Output: domain-research.md
               │
               ├─────► Mary: Technical Research
               │       - Feasibility study
               │       - Tech stack recommendations
               │       - Integration requirements
               │       Output: technical-research.md
               │
               ├─────► CIS: Problem Refinement
               │       - Sharpen problem statement
               │       - Explore solution variations
               │       Output: problem-refinement.md
               │
               ├─────► CIS: Design Thinking
               │       - User journey mapping
               │       - Persona development
               │       Output: user-scenarios.md
               │
               └─────► Research Lead Validation
                       1. Pain Point Evidence (web search - forums, reviews)
                       2. Competitive Gap Analysis (why do existing solutions fail?)
                       3. Novelty Statement (specific unique angle)
                       4. Quality Gates (evidence-backed, 3+ competitors, etc.)
                       │
                       ▼
               ┌─────────────────────┐
               │ Compile Product     │
               │ Brief (PRD-ready    │
               │ format)             │
               └──────────┬──────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
    Deliver to Operator         Auto-create Project +
    "Brief ready for            Handoff to Project Lead
     review..."                 (optional mode)
```

### Product Brief Output Structure

```markdown
# Product Brief: {Idea Name}

## Executive Summary
[What it is, who it's for, why now, what makes it novel]

## Market Validation
├─ Competitive Landscape (5+ solutions analyzed)
├─ Market Opportunity (TAM/SAM, growth trends)
└─ User Research (pain point evidence - quotes, forum links)

## Pain Point Articulation
[Deep dive on core problem - evidence-backed]

## Target Users
[Specific personas - not broad categories]

## Novelty Statement
[What's architecturally/approach-wise different - NOT just "better UX"]

## Success Metrics
[How we'll measure success]

## Technical Considerations
[Feasibility, recommended stack, risks]

## Recommended Next Steps
[Planning → PRD → Implementation]
```

## Handoff to Project Lead

```
Research Lead Completes Brief
              │
              ▼
    ┌─────────────────────┐
    │  Quality Gates      │
    │  - Pain backed by   │
    │    evidence?        │
    │  - 3+ competitors?  │
    │  - Novelty specific?│
    │  - Users specific?  │
    └──────────┬──────────┘
               │ PASS
               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ Operator Approval   │────────►│ Kelly Router        │
    │ "Build this"        │         │ Creates Project     │
    └─────────────────────┘         └──────────┬──────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │  Project Lead        │
                                    │  (Planning Phase)    │
                                    │  1. Validate brief   │
                                    │  2. Spawn John (PM)  │
                                    │  3. Create PRD       │
                                    └──────────────────────┘
```

## Session Architecture

```
Main Sessions (Persistent):
├─ agent:project-lead:project-{projectId}         (Kelly instantiates per project)
└─ agent:research-lead:research-{researchId}      (Kelly instantiates per research)

Sub-Agent Sessions (Ephemeral):
├─ agent:mary-analyst:subagent-{UUID}             (Research Lead spawns)
├─ agent:cis-brainstorming:subagent-{UUID}        (Research Lead spawns)
├─ agent:cis-innovation:subagent-{UUID}           (Research Lead spawns)
└─ agent:cis-problem-solver:subagent-{UUID}       (Research Lead spawns)

Labels (Human-Readable):
├─ mary-market-{researchId}
├─ carson-brainstorm-{researchId}
├─ innovate-novelty-{researchId}
└─ problem-refine-{researchId}
```

## State Management

```
Kelly Router (factory-state.md):
┌─────────────────────────────────────────────┐
│ ## Research Projects                        │
│ | ID | Status | Stage | Request |           │
│ |research-001|active|discovery|20 SaaS ideas|│
│ |research-002|complete|validated|Meeting AI| │
└─────────────────────────────────────────────┘

Research Lead (research-state.json):
┌─────────────────────────────────────────────┐
│ {                                           │
│   "researchId": "research-001",             │
│   "status": "active",                       │
│   "stage": "discovery",                     │
│   "flow": "idea-bud-discovery",             │
│   "subagents": [                            │
│     {                                       │
│       "label": "mary-market-001",           │
│       "status": "complete",                 │
│       "output": "market-research.md"        │
│     },                                      │
│     {                                       │
│       "label": "carson-brainstorm-001",     │
│       "status": "running"                   │
│     }                                       │
│   ],                                        │
│   "outputs": {                              │
│     "ideaInventory": "discovery-state.md"   │
│   }                                         │
│ }                                           │
└─────────────────────────────────────────────┘
```

## Parallel Research Capability

```
Operator runs 3 research projects simultaneously:

┌──────────────────────────────────────────────────────────────┐
│                      Kelly Router                            │
│  Monitors 3 research sessions + 5 project sessions           │
└────┬─────────────────────┬─────────────────────┬────────────┘
     │                     │                     │
     ▼                     ▼                     ▼
research-001          research-002          research-003
(Discovering 20       (Deep dive on         (Deep dive on
 SaaS ideas)          Meeting AI)           Async Standup)
     │                     │                     │
  Mary +               Mary +               Mary +
  Carson              Problem Solver        Innovation
```

---

**Key Design Principles:**

1. **Separation of Concerns:** Research Lead orchestrates research, Project Lead orchestrates building
2. **Progressive Disclosure:** Flow 1 = quick scan (2hrs), Flow 2 = deep validation (4-6hrs)
3. **Evidence-Based:** Every pain point claim backed by web evidence (forums, reviews, etc.)
4. **Novelty Enforcement:** "AI-powered" is not enough - must articulate architectural/approach difference
5. **Quality Gates:** Research Lead validates before delivery, Project Lead validates on receipt
6. **Parallel Execution:** Multiple research streams can run simultaneously (separate sessions)
