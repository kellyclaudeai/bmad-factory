# Research Lead - Product Idea Generation Agent

**Version:** 1.0 (Final)  
**Last Updated:** 2026-02-16 23:08 CST  
**Status:** Ready for Implementation

---

## Overview

**Purpose:** Autonomous product idea generation system that discovers market pain points, validates them through research, generates novel solutions via CIS personas, and outputs comprehensive product briefs ready for Project Lead implementation.

**Key Constraints:**
- **Zero input from Kelly** - fully autonomous discovery
- **Market-driven** - ideas based on real pain points, not abstract ideation
- **SaaS-focused** - web/mobile apps (stack determined during BMAD architecture phase)
- **Timeline:** 34-48 min per Research Lead session
- **Model:** Sonnet 4.5 for all agents (balanced, cheap)
- **Output:** `projects-queue/` directory with intake.md

**Architecture:**
- 1 Research Lead = 1 idea (parallelize like Project Leads)
- Agent configs in `~/.openclaw/agents/{agentId}/config.json`
- Agent workspaces in `~/.openclaw/workspace-{agentId}/` (AGENTS.md, SOUL.md, TOOLS.md, memory/)
- Research Registry for deduplication

---

## Agent Roster

### Core Agents

**Mary (Business Analyst)**
- Role: Market research, pain point discovery, competitive validation
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phases: Phase 1 (discovery), Phase 4 (selection), Phase 5 (deep-dive)

**Carson (Brainstorming Coach)**
- Role: Divergent thinking, volume generation
- Model: Sonnet 4.5
- Source: `projects/bug-dictionary/_bmad/cis/agents/brainstorming-coach.md`
- Phase: Phase 3 (CIS ideation)

**Victor (Innovation Strategist)**
- Role: Blue Ocean strategy, disruptive thinking
- Model: Sonnet 4.5
- Source: `projects/bug-dictionary/_bmad/cis/agents/innovation-strategist.md`
- Phase: Phase 3 (CIS ideation)

**Maya (Design Thinking Coach)**
- Role: Human-centered design, empathy-driven
- Model: Sonnet 4.5
- Source: `projects/bug-dictionary/_bmad/cis/agents/design-thinking-coach.md`
- Phase: Phase 3 (CIS ideation)

**Quinn (Creative Problem Solver)**
- Role: TRIZ, systems thinking, root cause analysis
- Model: Sonnet 4.5
- Source: `projects/bug-dictionary/_bmad/cis/agents/creative-problem-solver.md`
- Phase: Phase 3 (CIS ideation)

**Research Lead (Orchestrator)**
- Role: Workflow orchestration, registry management, brief compilation
- Model: Sonnet 4.5
- Tools: sessions_spawn, sessions_send, file operations
- Phases: All (coordinator)

---

## Complete Workflow

### Phase 1: Pain Point Discovery - Mary (12-17 min)

**Objective:** Autonomously discover a validated market pain point

#### Step 1: Source Sweep (5-7 min)

**Approach: Exploratory Discovery**

Mary should NOT follow a fixed checklist. Instead, she should explore freely using web_search and web_fetch to discover real frustrations people are expressing online. The goal is genuine discovery, not mechanical scraping.

**Starting points (not exhaustive — Mary should follow her curiosity):**
- Community forums where people complain about tools (Reddit, HN, indie hacker communities, etc.)
- Product review sites and app stores (negative reviews reveal pain)
- Social media frustration signals
- Trend data showing emerging problems
- Competitor comment sections and feature request threads

**Randomization:** Each session, Mary should intentionally vary her approach:
- Pick a random industry vertical or user persona to start from
- Follow unexpected threads (a complaint in one area may reveal a bigger adjacent problem)
- Explore at least one source she hasn't used before
- Let serendipity guide — if something interesting appears mid-search, follow it
- Vary time horizons (sometimes look at last week, sometimes last 6 months)

**What to look for:**
- Recurring complaints across multiple independent sources
- People actively seeking solutions (not just venting)
- Frustrations with high engagement (upvotes, replies, "me too" signals)
- Gaps between what exists and what people wish existed
- New problems created by emerging technologies or trends

**Anti-patterns to avoid:**
- Don't just search "I wish there was an app for" — be more creative
- Don't limit to tech/developer audiences — business users, creatives, and niche professionals often have underserved needs
- Don't only look at English-language sources if multilingual search is available

**Output:** 8-12 pain point candidates with evidence links

---

#### Step 2: Filter + Score (4-6 min)

For each of the 8-12 candidates, score 1-10 across five dimensions:

**1. Severity (1-10):**
- How intense is the frustration?
- Evidence of real pain (not just "nice to have")
- Users describing it as "painful", "hate", "nightmare", "impossible"
- Urgency indicators (actively seeking solutions NOW)

**2. Frequency (1-10):**
- How many mentions across sources?
- Volume indicators: upvotes, engagement, search trends
- Is this a one-off complaint or widespread pattern?
- Multiple independent sources mentioning same problem

**3. Market Signals (1-10):**
- People saying they'd pay for this?
- Competitors making revenue? (validates market exists)
- Search volume trends (rising = growing problem)
- Existing solutions have paying customers?
- Price sensitivity clues (budget discussions)

**4. SaaS Feasibility (1-10):**
- Can it be built as a web/mobile app?
- Scope reasonable for a modern web stack? (specific stack chosen later in BMAD architecture phase)
- Technical complexity manageable?
- Competitive landscape: gaps exist or saturated?
- Data requirements reasonable (no proprietary datasets needed)?
- Legal/compliance barriers low?

**5. Monetizability (1-10):**
- Clear willingness to pay? (people already paying for inferior alternatives)
- Obvious pricing model? (subscription, usage-based, freemium, etc.)
- Revenue per user potential? (B2B > B2C typically)
- Path to first dollar? (how fast could this generate revenue)
- Retention/stickiness signals? (switching costs, data lock-in, habit-forming)
- Market size sufficient? (niche is fine if willingness to pay is high)

**Total Score: 5-50 points per pain point**

**Disqualifiers (immediate elimination):**
- Requires hardware/physical product
- Needs proprietary data we can't access
- Heavily regulated industry (healthcare, finance) without clear path
- Saturated market with 10+ strong competitors and no clear gap
- Technical complexity clearly beyond web app scope (custom ML models, real-time video processing, etc.)
- No monetization path (purely free/open-source space with zero willingness to pay)

---

#### Step 3: Selection (2-3 min)

- Pick **highest scoring** pain point (top 1)
- If tied, pick the one with strongest severity score (pain > volume)
- Document selection rationale

---

#### Mary's Output Format:

```markdown
# SELECTED PAIN POINT

## Description
[2-3 sentence description of the pain point]

## Score: 42/50
- **Severity:** 9/10 - Intense frustration, users actively seeking solutions, describing as "nightmare"
- **Frequency:** 8/10 - 147 mentions across Reddit/HN in 30 days, trending upward
- **Market:** 8/10 - Search volume rising 40%, users discussing pricing willingness ($10-30/mo)
- **Feasibility:** 9/10 - Web app, moderate complexity, clear gap in market
- **Monetizability:** 8/10 - Users discussing $10-30/mo pricing, competitors generating revenue

## Evidence Summary
- **Reddit r/productivity:** 23 posts mentioning problem (15-50 upvotes each)
- **HN comments:** 12 threads discussing workarounds, "surprised this doesn't exist"
- **Google Trends:** 40% increase in related searches over 90 days
- **App Store:** Top 3 competitors have 400+ combined reviews mentioning this gap
- **Twitter:** 34 tweets with 100+ likes expressing frustration

## Competitive Landscape
- **Existing solutions:** [Competitor A], [Competitor B] (2 main players)
- **Gap identified:** Both missing [specific feature/approach]
- **User sentiment:** Actively looking for alternatives (switching discussions)
- **Differentiation opportunity:** [specific angle that addresses the gap]

## Target User Profile
[Who experiences this pain? Role, context, frequency]

## Willingness to Pay Indicators
[Evidence that users would pay: pricing discussions, competitor revenue, budget allocation mentions]
```

**This output is handed to Research Lead for Phase 2.**

---

### Phase 2: Registration (2 min)

**Research Lead actions:**
1. Receive Mary's pain point selection
2. Generate initial concept name (descriptive, based on pain point)
3. Generate brief description (1-2 sentences)

**Registry Checkpoint - CHECK 1:**
- Read `/Users/austenallred/clawd/research-registry.json`
- Compare concept against:
  - `inProgress[]` - active Research Lead sessions
  - `historical[]` - completed projects
- **If duplicate found:** Abort session, announce to Kelly, clean exit
- **If unique:** Register in `inProgress[]`:

```json
{
  "sessionId": "agent:research-lead:20260216-2300",
  "conceptName": "Meeting Cost Calculator",
  "briefDescription": "Real-time display of meeting costs based on attendee salaries",
  "painPoint": "Meeting efficiency waste, no visibility into cost",
  "timestamp": "2026-02-16T23:00:00-06:00",
  "phase": "ideation"
}
```

**Output:** Concept registered, proceed to Phase 3

---

### Phase 3: CIS Ideation (5-8 min)

**Objective:** Generate 15-20 novel solutions to the validated pain point

**Research Lead spawns 4 CIS personas in parallel:**

**Prompt structure for each persona:**
```
Pain Point: [Mary's pain point from Phase 1]

Evidence: [Summary of Mary's evidence]

Your task: Generate 4-5 novel solutions that address this pain point.

Constraints:
- Web or mobile SaaS application
- Buildable with: Next.js, React, TypeScript, Firebase, Tailwind CSS
- No hardware, no proprietary data requirements
- Focus on your unique methodology (divergent thinking / Blue Ocean / human-centered / TRIZ)

Output: 4-5 solution concepts with brief descriptions.
```

**Carson** (Brainstorming Coach):
- Divergent thinking, volume over judgment
- 4-5 wild ideas, some unconventional

**Victor** (Innovation Strategist):
- Blue Ocean strategy, disruptive angles
- 4-5 ideas that avoid incremental thinking

**Maya** (Design Thinking Coach):
- Human-centered, empathy-driven
- 4-5 ideas focused on user experience and emotional needs

**Quinn** (Creative Problem Solver):
- TRIZ, systems thinking, root cause
- 4-5 ideas that solve underlying system issues

**Total output:** 16-20 solution concepts

**Research Lead collects all solutions, prepares for Phase 4**

---

### Phase 4: Solution Selection - Mary (5-8 min)

**Objective:** Select the best solution from the 16-20 CIS-generated ideas

**Mary's process:**

1. **Quick competitive scan** (3-4 min)
   - For each solution, search: does this exist?
   - How saturated is this specific solution space?
   - What's the differentiation angle?

2. **Score each solution** (2-3 min)
   - **Novelty (1-10):** How unique is this approach?
   - **Market Fit (1-10):** Does this actually solve the pain point well?
   - **Feasibility (1-10):** Can this be built as a web/mobile app?
   - **Differentiation (1-10):** How much better than existing solutions?
   - **Monetizability (1-10):** Clear path to revenue?

3. **Select top solution** (1 min)
   - Pick highest scoring solution
   - Document why this one wins

**Mary's Output:**
```markdown
# SELECTED SOLUTION

## Concept: [Name]
[2-3 sentence description]

## Score: 44/50
- Novelty: 9/10 - No direct competitor does this approach
- Market Fit: 9/10 - Directly addresses the core pain
- Feasibility: 9/10 - Straightforward web app build
- Differentiation: 9/10 - Clear advantage over existing tools
- Monetizability: 8/10 - Obvious SaaS subscription model, users already paying competitors

## Why This One:
[Mary's reasoning for selection]

## Initial Competitive Analysis:
- Competitor A: Does X, missing Y
- Competitor B: Does Z, but [weakness]
- Our angle: [differentiation]
```

**Research Lead receives Mary's selection, proceeds to registry check**

---

**Registry Checkpoint - CHECK 2:**

Research Lead actions:
1. Take Mary's selected solution
2. Compare against registry (concept may have evolved from Phase 2)
3. **If now duplicate:** Abort, announce to Kelly
4. **If still unique:** Update `inProgress[]` entry:

```json
{
  "sessionId": "agent:research-lead:20260216-2300",
  "conceptName": "Meeting Cost Dashboard", // may have evolved
  "briefDescription": "Live meeting cost tracker with Slack/Calendar integration",
  "painPoint": "Meeting efficiency waste, no visibility into cost",
  "timestamp": "2026-02-16T23:05:00-06:00",
  "phase": "validation"
}
```

**Output:** Proceed to Phase 5

---

### Phase 5: Competitive Deep-Dive - Mary (8-12 min)

**Objective:** Deep validation of the specific solution selected in Phase 4

**Mary's deep research:**

1. **Competitive Analysis** (3-4 min)
   - Identify all direct and indirect competitors
   - Feature comparison matrix
   - Pricing analysis
   - User sentiment on each competitor (reviews, complaints)
   - Market positioning (who serves what segment)

2. **Novelty Assessment** (2-3 min)
   - Is our approach truly novel?
   - Patent search (basic, just to check obvious conflicts)
   - Similar products that failed (why?)
   - What makes our angle different?

3. **Feasibility Deep-Dive** (2-3 min)
   - Technical requirements validation
   - API dependencies (do they exist? cost?)
   - Data requirements (can we get what we need?)
   - Regulatory considerations (privacy, compliance)
   - Estimated development complexity (story count range)

4. **Business Model Validation** (1-2 min)
   - Pricing strategy (based on competitors)
   - Revenue potential (market size × penetration assumptions)
   - Customer acquisition channels
   - Retention indicators

**Mary's Output:**
```markdown
# COMPETITIVE DEEP-DIVE

## Market Landscape
- **Direct Competitors:** [List with URLs]
- **Indirect Competitors:** [List]
- **Market Size:** [Estimated TAM/SAM based on search volume, competitor users]

## Feature Comparison Matrix
| Feature | Competitor A | Competitor B | Our Approach |
|---------|-------------|--------------|--------------|
| [Key feature 1] | ✅ | ❌ | ✅ Better |
| [Key feature 2] | ❌ | ✅ | ✅ Novel approach |
| [Differentiator] | ❌ | ❌ | ✅ Unique |

## Novelty Score: 8/10
- **What's new:** [Our unique approach]
- **Why it matters:** [User benefit]
- **Risk of replication:** [Low/Medium/High + reasoning]

## Feasibility Assessment
- **Technical Stack:** [Stack requirements, alignment with ours]
- **APIs Needed:** [List with availability/cost]
- **Development Estimate:** 40-60 stories (8-12 epics)
- **Risks:** [Technical or business risks identified]

## Business Model
- **Pricing Strategy:** $15-25/mo per user (based on competitor range)
- **Target Customer:** [Specific persona]
- **Acquisition Channels:** [SEO, Product Hunt, Reddit, LinkedIn, etc.]
- **Revenue Potential:** [Rough calculation based on TAM assumptions]

## Recommendation: GO / NO-GO
**GO** - Strong differentiation, clear market gap, feasible as web app, validated willingness to pay, clear monetization path.

[or]

**NO-GO** - [Reason: too saturated / too complex / no clear monetization path]
```

**If Mary recommends NO-GO:** Research Lead aborts, announces to Kelly, cleans up registry

**If Mary recommends GO:** Research Lead proceeds to Phase 6

---

### Phase 6: Compilation & Finalization (4-5 min)

**Research Lead actions:**

**Registry Checkpoint - CHECK 3 (Final Safety):**
1. Read registry one last time
2. Compare final concept against `inProgress[]` + `historical[]`
3. **If duplicate found:** Abort (unlikely at this stage, but safety check)
4. **If unique:** Proceed to compilation

---

**Compilation Steps:**

1. **Generate Product Names** (1 min)
   - 1 primary name (descriptive, memorable)
   - 3-4 alternative names
   - Example: Primary: "MeetCost", Alternatives: "CostClock", "MeetingMeter", "TimeCost"

2. **Create Directory Structure** (30 sec)
   ```
   projects-queue/
     meet-cost-2026-02-16-2310/
       intake.md
   ```
   - Directory name: `<name-slug>-YYYY-MM-DD-HHMM`
   - Timestamp ensures ordering

3. **Compile intake.md** (2-3 min)

**intake.md Format:**
```markdown
# [Primary Name]

**Alternative Names:** [Name2], [Name3], [Name4]  
**Generated:** 2026-02-16 23:10 CST  
**Research Lead Session:** agent:research-lead:20260216-2300

---

## Problem Statement

### Pain Point Discovered
[Mary's Phase 1 pain point description]

### Evidence
[Summary of Mary's Phase 1 evidence - Reddit threads, HN discussions, search volume, etc.]

### Target User
[User profile from Phase 1]

### Market Signals
[Willingness to pay indicators from Phase 1]

---

## Solution Concept

### Overview
[2-3 paragraph description of the selected solution]

### Key Features
1. [Feature 1 - from CIS ideation]
2. [Feature 2]
3. [Feature 3]
4. [Feature 4]
5. [Feature 5]

### Differentiation
[What makes this different from competitors - from Phase 5]

### User Journey
[Brief description of how a user would use this product]

---

## Market Validation

### Competitive Landscape
[Summary from Mary's Phase 5 competitive analysis]

**Direct Competitors:**
- [Competitor A] - [Weakness/Gap]
- [Competitor B] - [Weakness/Gap]

**Our Advantage:**
[Key differentiators]

### Market Size
[TAM/SAM estimate from Phase 5]

### Novelty Score
[Score from Phase 5 with reasoning]

---

## Technical Feasibility

### Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Firebase (Auth, Firestore)
- Hosting: Vercel
- [Additional APIs/services needed]

### Development Estimate
[Story count estimate from Phase 5]

### Technical Risks
[Any risks identified in Phase 5]

---

## Business Model

### Pricing Strategy
[Pricing from Phase 5 - monthly subscription, freemium, etc.]

### Target Customer
[Specific persona - role, company size, use case]

### Acquisition Channels
[Channels from Phase 5 - SEO, Product Hunt, communities, etc.]

### Revenue Potential
[High-level revenue calculation from Phase 5]

---

## Go-to-Market Considerations

### Launch Strategy
[Initial thoughts on launch - Product Hunt, communities, content marketing, etc.]

### Success Metrics
- Signups in first 30 days
- Conversion rate (free → paid)
- Retention rate
- NPS

---

## Appendix

### Research Session Details
- **Research Lead Session:** agent:research-lead:20260216-2300
- **Duration:** 42 minutes
- **CIS Personas Used:** Carson, Victor, Maya, Quinn
- **Mary Phases:** Pain Point Discovery, Solution Selection, Competitive Deep-Dive

### Source Links
[Links to Reddit threads, HN discussions, competitor sites, etc. - for reference]

---

**Status:** Ready for Project Lead intake  
**Next Step:** Kelly routes to Project Lead for planning
```

4. **Registry Update** (30 sec)
   - Remove from `inProgress[]`
   - Add to `historical[]`:

```json
{
  "projectPath": "projects-queue/meet-cost-2026-02-16-2310/",
  "conceptName": "MeetCost",
  "briefDescription": "Live meeting cost tracker with Slack/Calendar integration",
  "timestamp": "2026-02-16T23:10:00-06:00"
}
```

5. **Announce to Kelly** (30 sec)
   ```
   ✅ Research Complete: MeetCost

   Brief saved to: projects-queue/meet-cost-2026-02-16-2310/

   Pain Point: Meeting efficiency waste, no cost visibility
   Solution: Live meeting cost dashboard with integrations
   Competitive Score: 44/50 (high novelty, strong differentiation, clear monetization)
   Development Estimate: 40-60 stories

   Ready for Project Lead intake.
   ```

**Research Lead session ends**

---

## Research Registry

### File Location
`/Users/austenallred/clawd/research-registry.json`

### Structure
```json
{
  "inProgress": [
    {
      "sessionId": "agent:research-lead:20260216-2300",
      "conceptName": "Meeting Cost Calculator",
      "briefDescription": "Real-time meeting cost tracker",
      "painPoint": "Meeting efficiency waste",
      "timestamp": "2026-02-16T23:00:00-06:00",
      "phase": "ideation"
    }
  ],
  "historical": [
    {
      "projectPath": "projects-queue/screenshot-beautifier-2026-02-15-1800/",
      "conceptName": "Screenshot Beautifier",
      "briefDescription": "Add browser chrome and shadows to screenshots",
      "timestamp": "2026-02-15T18:15:00-06:00"
    }
  ]
}
```

### Lifecycle

**`inProgress[]` - Active Research Lead Sessions**
- **Added:** Phase 2 (after pain point selection, CHECK 1)
- **Updated:** Phase 4 (after solution selection, CHECK 2 - if concept evolved)
- **Removed:** Phase 6 (after brief saved, before moving to historical)

**`historical[]` - Completed Projects**
- **Added:** Phase 6 (after brief saved to projects-queue)
- **Removed:** ONLY when project manually deleted from projects-queue
- **Persists:** Even after project moves to implementation (permanent dedup record)

### Checkpoint Summary

**3 Registry Checkpoints:**
1. **CHECK 1 (Phase 2):** After pain point selection, before CIS ideation
   - Purpose: Catch duplicates early (saves 30+ min)
   - Action: Register if unique, abort if duplicate

2. **CHECK 2 (Phase 4):** After solution selection, before deep-dive
   - Purpose: Concept may have evolved during CIS ideation
   - Action: Update registry if still unique, abort if now duplicate

3. **CHECK 3 (Phase 6):** Before compilation, final safety net
   - Purpose: Last check before committing effort
   - Action: Proceed if unique, abort if duplicate (unlikely)

### Atomic Operations

**Read registry:**
```javascript
const registry = JSON.parse(fs.readFileSync('/Users/austenallred/clawd/research-registry.json', 'utf8'));
```

**Write registry (atomic):**
```javascript
const registryPath = '/Users/austenallred/clawd/research-registry.json';
const tempPath = registryPath + '.tmp';
fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
fs.renameSync(tempPath, registryPath); // atomic
```

**Deduplication Logic:**
```javascript
function isDuplicate(conceptName, briefDescription, registry) {
  const allConcepts = [
    ...registry.inProgress.map(x => ({ name: x.conceptName, desc: x.briefDescription })),
    ...registry.historical.map(x => ({ name: x.conceptName, desc: x.briefDescription }))
  ];
  
  // Exact name match
  if (allConcepts.some(c => c.name.toLowerCase() === conceptName.toLowerCase())) {
    return true;
  }
  
  // Semantic similarity (simple keyword overlap check)
  // More sophisticated similarity can be added later
  const keywords = briefDescription.toLowerCase().split(/\W+/);
  for (const concept of allConcepts) {
    const existingKeywords = concept.desc.toLowerCase().split(/\W+/);
    const overlap = keywords.filter(k => existingKeywords.includes(k) && k.length > 4).length;
    if (overlap >= 3) { // 3+ significant keyword overlap = likely duplicate
      return true;
    }
  }
  
  return false;
}
```

---

## Timeline

### Per Research Lead Session
| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Pain Point Discovery (Mary) | 12-17 min | 12-17 min |
| Phase 2: Registration (Research Lead) | 2 min | 14-19 min |
| Phase 3: CIS Ideation (4 personas parallel) | 5-8 min | 19-27 min |
| Phase 4: Solution Selection (Mary) | 5-8 min | 24-35 min |
| Phase 5: Competitive Deep-Dive (Mary) | 8-12 min | 32-47 min |
| Phase 6: Compilation (Research Lead) | 4-5 min | 36-52 min |

**Total: 36-52 minutes per Research Lead session** (target: ~40 min average)

**Early abort scenarios:**
- Duplicate caught at CHECK 1: Saves 30-40 min
- Duplicate caught at CHECK 2: Saves 15-20 min
- Mary recommends NO-GO: Saves 5-10 min

### Implementation Timeline

| Phase | Task | Duration |
|-------|------|----------|
| **Phase 1** | Create CIS Agent Configs | 2.5-3 hours |
| | - Carson (Brainstorming Coach) | 30-45 min |
| | - Victor (Innovation Strategist) | 30-45 min |
| | - Maya (Design Thinking Coach) | 30-45 min |
| | - Quinn (Creative Problem Solver) | 30-45 min |
| | - Mary (Business Analyst) | 30-45 min |
| **Phase 2** | Create Research Lead Agent Config | 45 min |
| | - AGENTS.md (orchestration + registry logic) | 20 min |
| | - SOUL.md, TOOLS.md, IDENTITY.md | 15 min |
| | - Registry logic implementation | 10 min |
| **Phase 3** | Gateway Config + Kelly Update | 30 min |
| | - Add 6 agents to gateway config | 15 min |
| | - Update Kelly AGENTS.md with spawn protocol | 15 min |
| **Phase 4** | Testing | 1 hour |
| | - Single Research Lead spawn test | 15 min |
| | - Registry coordination test | 15 min |
| | - Parallel Research Lead test | 20 min |
| | - End-to-end validation | 10 min |

**Total Implementation: 5-5.5 hours**

---

## Batch Mode Strategy

### Kelly's Role
When user requests batch generation:
```
"Generate 5 product ideas"
```

**Kelly spawns 5 Research Leads in parallel:**
```bash
openclaw tui --agent research-lead --label "research-1"
openclaw tui --agent research-lead --label "research-2"
openclaw tui --agent research-lead --label "research-3"
openclaw tui --agent research-lead --label "research-4"
openclaw tui --agent research-lead --label "research-5"
```

**Each Research Lead:**
- Runs independently
- Mary discovers different pain points (trending topics vary)
- CIS generates different solutions
- Registry coordination prevents duplicates

**Expected outcomes:**
- 3-5 unique briefs (1-2 aborted due to duplicates)
- Total time: ~40-45 min (longest session determines batch time)
- Output: 3-5 projects in `projects-queue/` ready for implementation

**Kelly's announcement:**
```
🔬 Research Batch Complete (43 minutes)

Results:
✅ MeetCost - Meeting cost visibility tool
✅ CodeSnap - Screenshot beautifier for developers
✅ TaskFlow - Visual project management for solo founders
❌ Duplicate: Calendar AI (similar to existing project)
❌ Duplicate: Meeting scheduler (caught in Phase 4)

3 briefs ready in projects-queue/
Ready to implement?
```

---

## Kelly Spawn Protocol

### Location
`/Users/austenallred/.openclaw/agents/kelly/workspace/AGENTS.md`

### New Section to Add

```markdown
## Research Lead Spawning

When user requests product idea generation:

### Single Idea
User: "Generate a product idea"

Response:
1. Spawn Research Lead (no input needed)
2. Monitor for completion (~40 min)
3. Announce result

Template:
```bash
openclaw tui --agent research-lead --label "research-$(date +%Y%m%d-%H%M)"
```

### Batch Ideas
User: "Generate 5 product ideas"

Response:
1. Spawn 5 Research Leads in parallel
2. Monitor all sessions
3. Announce batch results

Template:
```bash
for i in {1..5}; do
  openclaw tui --agent research-lead --label "research-batch-$i" &
done
```

### After Research Complete
1. Brief saved to `projects-queue/<name>-<timestamp>/`
2. Announce to user
3. Ask: "Ready to implement?" → spawn Project Lead if yes
```

---

## Agent Configuration Details

### Directory Structure
```
/Users/austenallred/.openclaw/agents/
├── carson/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── IDENTITY.md
├── victor/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── IDENTITY.md
├── maya/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── IDENTITY.md
├── quinn/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── IDENTITY.md
├── mary/
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── TOOLS.md
│   └── IDENTITY.md
└── research-lead/
    ├── AGENTS.md
    ├── SOUL.md
    ├── TOOLS.md
    ├── IDENTITY.md
    └── HEARTBEAT.md (optional)
```

### Per-Agent Files

**AGENTS.md Template:**
```markdown
# [Agent Name] - [Role]

## Role
[1-2 sentence description]

## Workflow
[Specific methodology - from BMAD source files]

## Constraints
- Web/mobile SaaS only
- Our stack: Next.js, Firebase, Tailwind
- [Additional constraints]

## Output Format
[Expected output structure]
```

**SOUL.md Template:**
```markdown
# SOUL.md - Who You Are

## Core Identity
[Persona from BMAD files - tone, personality, approach]

## Boundaries
- Stay focused on [role]
- Don't make decisions outside your domain
- Collaborate, don't compete
```

**TOOLS.md Template:**
```markdown
# TOOLS.md

## Available Tools
- web_search: Market research, trend discovery
- web_fetch: Deep-dive on specific sources
- [Additional tools if needed]

## Usage Guidelines
[Tool-specific instructions]
```

**IDENTITY.md Template:**
```markdown
# IDENTITY.md

- **Name:** [Agent Name]
- **Creature:** [AI/robot/consultant/etc.]
- **Vibe:** [Personality description]
- **Emoji:** [Signature emoji]
```

---

## Gateway Configuration

### Location
`/Users/austenallred/.openclaw/gateway-config.yaml`

### Agents to Add
```yaml
agents:
  # Existing agents...
  
  # Research Lead system
  - id: carson
    name: Carson
    description: Brainstorming Coach (CIS) - Divergent thinking, volume generation
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
    
  - id: victor
    name: Victor
    description: Innovation Strategist (CIS) - Blue Ocean strategy, disruptive thinking
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
    
  - id: maya
    name: Maya
    description: Design Thinking Coach (CIS) - Human-centered design, empathy-driven
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
    
  - id: quinn
    name: Quinn
    description: Creative Problem Solver (CIS) - TRIZ, systems thinking, root cause
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
    
  - id: mary
    name: Mary
    description: Business Analyst - Market research, competitive validation
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
    
  - id: research-lead
    name: Research Lead
    description: Product idea generation orchestrator
    model: anthropic/claude-sonnet-4-5
    sessionKind: isolated
```

---

## Testing Plan

### Test 1: Single Research Lead Spawn (15 min)
**Objective:** Verify end-to-end workflow

1. Kelly spawns Research Lead
2. Monitor Phase 1: Mary discovers pain point
3. Monitor Phase 2: Registry registration
4. Monitor Phase 3: CIS personas spawn and ideate
5. Monitor Phase 4: Mary selects solution
6. Monitor Phase 5: Mary deep-dive validation
7. Monitor Phase 6: Brief compilation
8. Verify: intake.md created in projects-queue/
9. Verify: Registry updated (inProgress → historical)

**Success Criteria:**
- Complete workflow in 36-52 min
- Valid intake.md generated
- Registry correctly updated
- All phases complete without errors

---

### Test 2: Registry Coordination (15 min)
**Objective:** Verify deduplication logic

1. Manually add fake entry to registry historical:
   ```json
   {
     "projectPath": "projects-queue/test-duplicate/",
     "conceptName": "Meeting Cost Tracker",
     "briefDescription": "Track meeting costs in real-time"
   }
   ```
2. Spawn Research Lead
3. Hope Mary discovers similar pain point (meeting costs)
4. Verify: CHECK 1, CHECK 2, or CHECK 3 catches duplicate
5. Verify: Research Lead aborts gracefully
6. Verify: Announcement sent to Kelly

**Success Criteria:**
- Duplicate detected at any checkpoint
- Graceful abort (no crash)
- Registry not corrupted
- Clear abort message

---

### Test 3: Parallel Research Leads (20 min)
**Objective:** Verify parallel execution without conflicts

1. Kelly spawns 3 Research Leads simultaneously
2. Monitor all sessions in parallel
3. Verify: Different pain points discovered
4. Verify: No registry write conflicts (atomic operations)
5. Verify: At least 2 unique briefs generated
6. Verify: If duplicate found, correct session aborts

**Success Criteria:**
- 2-3 unique briefs in projects-queue/
- No registry corruption
- Different pain points/solutions across sessions
- Total time ~40-50 min (parallel, not sequential)

---

### Test 4: End-to-End Validation (10 min)
**Objective:** Verify Project Lead can consume Research Lead output

1. Take intake.md from Test 1 output
2. Kelly routes to Project Lead
3. Project Lead reads intake.md
4. Verify: Project Lead understands brief structure
5. Verify: Project Lead can spawn John with intake.md

**Success Criteria:**
- Project Lead successfully parses intake.md
- John creates PRD from intake.md
- No confusion about format or missing fields

---

## Success Metrics

### MVP Success (After 2 Weeks)
- 10+ product briefs generated
- 3+ briefs selected for implementation
- 0 duplicate projects created
- Average session time: 35-45 min
- 90%+ briefs pass Project Lead intake review

### Quality Metrics
- Pain point evidence: 3+ sources per brief
- Competitive analysis: 2+ direct competitors identified
- Feasibility: All briefs buildable as web/mobile apps
- Market validation: Search volume or user demand evidence

---

## Future Enhancements (Post-MVP)

### Manual Mode
- User provides specific problem or domain
- Mary researches that specific area
- Rest of flow same as AUTO mode
- Timeline: +4 hours implementation

### Enhanced Deduplication
- Semantic similarity (embeddings)
- More sophisticated keyword matching
- Historical project analysis (beyond projects-queue)

### Multi-Angle Batching
- User provides 5 domains/angles
- Each Research Lead constrained to one angle
- Ensures diversity across batch

### Feedback Loop
- Track which briefs get implemented
- Track which projects succeed
- Tune Mary's scoring based on outcomes

---

## Implementation Checklist

### Phase 1: CIS Agent Configs (2.5-3 hours)
- [ ] Carson
  - [ ] Read BMAD source: `projects/bug-dictionary/_bmad/cis/agents/brainstorming-coach.md`
  - [ ] Create AGENTS.md (methodology, constraints)
  - [ ] Create SOUL.md (persona, tone)
  - [ ] Create TOOLS.md (web_search, web_fetch)
  - [ ] Create IDENTITY.md (name, vibe, emoji)
- [ ] Victor
  - [ ] Read BMAD source: `projects/bug-dictionary/_bmad/cis/agents/innovation-strategist.md`
  - [ ] Create AGENTS.md
  - [ ] Create SOUL.md
  - [ ] Create TOOLS.md
  - [ ] Create IDENTITY.md
- [ ] Maya
  - [ ] Read BMAD source: `projects/bug-dictionary/_bmad/cis/agents/design-thinking-coach.md`
  - [ ] Create AGENTS.md
  - [ ] Create SOUL.md
  - [ ] Create TOOLS.md
  - [ ] Create IDENTITY.md
- [ ] Quinn
  - [ ] Read BMAD source: `projects/bug-dictionary/_bmad/cis/agents/creative-problem-solver.md`
  - [ ] Create AGENTS.md
  - [ ] Create SOUL.md
  - [ ] Create TOOLS.md
  - [ ] Create IDENTITY.md
- [ ] Mary
  - [ ] Read BMAD source: `projects/bug-dictionary/_bmad/bmm/agents/analyst.md`
  - [ ] Create AGENTS.md (discovery + validation workflows)
  - [ ] Create SOUL.md
  - [ ] Create TOOLS.md
  - [ ] Create IDENTITY.md

### Phase 2: Research Lead Config (45 min)
- [ ] Create AGENTS.md
  - [ ] Orchestration logic (spawn, collect, route)
  - [ ] Registry protocol (read, check, write)
  - [ ] Abort protocol (duplicate handling)
  - [ ] Brief compilation logic
- [ ] Create SOUL.md (coordinator persona)
- [ ] Create TOOLS.md (sessions_spawn, sessions_send, file ops)
- [ ] Create IDENTITY.md
- [ ] (Optional) Create HEARTBEAT.md for registry maintenance

### Phase 3: Gateway Config + Kelly Update (30 min)
- [ ] Update gateway-config.yaml
  - [ ] Add carson agent
  - [ ] Add victor agent
  - [ ] Add maya agent
  - [ ] Add quinn agent
  - [ ] Add mary agent
  - [ ] Add research-lead agent
- [ ] Update Kelly AGENTS.md
  - [ ] Add Research Lead spawn protocol
  - [ ] Add batch spawn template
  - [ ] Add post-research routing logic
- [ ] Restart gateway

### Phase 4: Testing (1 hour)
- [ ] Test 1: Single Research Lead spawn
- [ ] Test 2: Registry coordination (duplicate detection)
- [ ] Test 3: Parallel Research Leads (3 simultaneous)
- [ ] Test 4: End-to-end validation (Project Lead intake)

### Phase 5: Documentation (included in above)
- [ ] Update factory-state.md with Research Lead status
- [ ] Update memory with implementation notes
- [ ] Document any issues/learnings

---

## Rollback Plan

If Research Lead fails in production:

1. **Disable spawning:**
   - Comment out Research Lead spawn protocol in Kelly AGENTS.md
   - Restart gateway

2. **Preserve work:**
   - Keep all agent configs (for debugging)
   - Keep registry (for analysis)
   - Keep any generated briefs

3. **Investigate:**
   - Check Research Lead transcripts
   - Identify failure point (which phase?)
   - Check registry for corruption

4. **Quick fixes:**
   - Registry logic bugs → patch Research Lead AGENTS.md
   - CIS persona issues → patch specific agent AGENTS.md
   - Mary search failures → update search sources/patterns

5. **Re-enable:**
   - Test in isolation (single spawn)
   - Re-enable Kelly spawn protocol
   - Monitor first few production runs

---

## Notes for Implementer

### Key Principles
1. **Research Lead is DUMB** - pure orchestrator, no decisions
2. **Mary is SMART** - all research, all selections
3. **CIS is CREATIVE** - generate ideas, no judgment
4. **Registry is SIMPLE** - JSON file, atomic ops, basic dedup

### Common Pitfalls to Avoid
- Don't make Research Lead choose solutions (that's Mary's job)
- Don't make CIS validate ideas (that's Mary's job)
- Don't over-engineer registry (KISS principle)
- Don't skip registry checks (they save time)

### Debugging Tips
- Research Lead transcript shows all phases
- Registry shows coordination state
- Mary's outputs show research quality
- CIS transcripts show ideation diversity

### Performance Tuning
- If Phase 1 too slow: reduce source count
- If Phase 3 too slow: reduce CIS output (15 ideas instead of 20)
- If Phase 5 too slow: reduce competitive analysis depth
- Target: 40 min average (acceptable range: 35-50 min)

---

**Status:** Ready for implementation 🚀  
**Next Step:** Begin Phase 1 - Create Carson agent config
