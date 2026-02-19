# Research Lead - Product Idea Generation Agent

**Version:** 3.3  
**Last Updated:** 2026-02-19 10:05 CST  
**Status:** Active

---

## Overview

**Purpose:** Autonomous product idea generation system that discovers unsolved problems, validates demand with quantitative signals, generates novel solutions via CIS personas, and outputs comprehensive product briefs ready for Project Lead implementation.

**Key Principles:**
- **Problem-first** - Start from documented human problems, NOT from hot markets or trending categories
- **Underserved > Crowded** - Prioritize problems with no good solutions over big markets with many competitors
- **Adversarial validation** - Quinn scores everything with skeptical lens (no rubber stamps)
- **Novel solutions** - CIS generates creative approaches; we don't clone existing competitors
- **Config-driven** - Platform, business model, and stack constraints guide ALL phases
- **Zero input from Kelly** - Fully autonomous discovery within config constraints
- **Registry-aware** - Mary knows what's been researched before and explores new territory

**Timeline:** 35-50 min per Research Lead session  
**Model:** Sonnet 4.5 for all agents (balanced, cheap)  
**Output:** 
- Summary entry in `projects/project-registry.json` (state: `discovery`)
- Full research artifacts in `projects/ideas/<project-id>/` directory

**Architecture:**
- 1 Research Lead = 1 idea (parallelize for batches)
- Agent configs in `~/.openclaw/agents/{agentId}/config.json`
- Agent workspaces in `~/.openclaw/workspace-{agentId}/` (AGENTS.md, SOUL.md, TOOLS.md, memory/)
- Project Registry (`/Users/austenallred/clawd/projects/project-registry.json`) — summary registry for all projects
- Research Artifacts (`/Users/austenallred/clawd/projects/ideas/<project-id>/`) — full research documents per idea

---

## Configuration System

### Config Structure

Research Lead receives constraints on spawn that guide the entire workflow:

```json
{
  "platform": "web-app",              // web-app | mobile-app | browser-extension | chrome-extension
  "businessModel": "B2C",              // B2C | B2B | prosumer
  "stack": "Next.js, React, TypeScript, Firebase, Tailwind CSS"
}
```

### Config Propagation

**Research Lead includes config in EVERY sub-agent spawn:**
- Phase 1: Mary receives config for feasibility filtering
- Phase 2: Quinn receives config for problem scoring
- Phase 3: All CIS personas receive config for solution ideation
- Phase 4: Quinn receives config for solution scoring

**Default Config (if not specified):**
- Platform: web-app
- Business Model: B2C
- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS

---

## Agent Roster

### Core Agents

**Mary (Business Analyst)**
- Role: Problem discovery, competitive landscape mapping
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phase: Phase 1 (problem discovery + competitive gap analysis)

**Quinn (Devil's Advocate / Scorer)**
- Role: Adversarial scoring and validation at BOTH gates
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phases: Phase 2 (problem scoring + gate), Phase 4 (solution scoring + gate)
- Philosophy: Skeptical analyst - tries to kill bad ideas before dev time is wasted

**Carson (Brainstorming Coach)**
- Role: Divergent thinking, creative ideation
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Victor (Innovation Strategist)**
- Role: Blue Ocean strategy, disruptive thinking
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Maya (Design Thinking Coach)**
- Role: Human-centered design, empathy-driven
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Research Lead (Orchestrator)**
- Role: Workflow orchestration, registry management, brief compilation
- Model: Sonnet 4.5
- Tools: sessions_spawn, sessions_send, file operations
- Phases: All (coordinator - makes NO decisions, only delegates and writes files)

---

## Complete Workflow (5 Phases)

### Phase 1: Problem Discovery - Mary (8-12 min)

**Objective:** Discover documented but UNSOLVED problems with competitive context

**Registry Awareness:**
Research Lead provides Mary with list of previously researched problems from registry. Mary MUST explore different territory.

#### Step 1: Problem Discovery (4-6 min)

**Mary finds 8-12 documented problems** using creative search approaches:
- **Review gap mining:** Apps with high downloads but bad ratings
- **Workaround archaeology:** People duct-taping multiple tools together
- **Direct demand signals:** "Why doesn't this exist?" posts
- **Enshittification/price revolt:** Users actively fleeing products

**Sources:**
- Reddit, Twitter/X, App Store/Play Store reviews
- Product Hunt comments, Hacker News
- Google Trends for validation (not primary discovery)

**What to capture:**
- Direct quotes showing the problem
- Engagement signals (upvotes, replies, likes)
- Workarounds people currently use
- Timestamps and source diversity

**Output:** 8-12 problem candidates with evidence

---

#### Step 2: Solution Gap Check (2-3 min)

**For each problem, Mary does quick competitive scan:**

**Questions:**
- Do products exist for this problem?
- If yes: Are they GOOD? (4+ stars, active development, significant user base)
- How many competitors in this space?

**Classification:**

| Situation | Classification | Action |
|-----------|---------------|--------|
| No products exist | **Wide Open** ✅ | Keep - strong candidate |
| Products exist but all bad (<3.5 stars) | **Poorly Served** ✅ | Keep - clear opportunity |
| 1-2 decent products with notable gaps | **Underserved** ✅ | Keep - gap is opportunity |
| 3+ good products, minor gaps only | **Adequately Served** ❌ | Eliminate |
| 5+ strong, well-funded competitors | **Crowded** ❌ | Eliminate |

**Eliminate** Adequately Served and Crowded immediately.

**Output:** 4-8 viable problem candidates (Wide Open, Poorly Served, or Underserved) with competitive classification

---

#### Step 3: Write Problem Report (1-2 min)

**Mary's Output:**

```markdown
# Problem Discovery Report

**Config constraints:** [platform, business model, stack]
**Previously researched:** [X problems from registry]
**New problems discovered:** [4-8 qualifying problems]

---

## Problem #1: [Brief title]

**Classification:** Wide Open / Poorly Served / Underserved

**Problem Description:**
[2-3 sentences describing the problem]

**Evidence:**
- [Quote 1 with source + engagement]
- [Quote 2 with source + engagement]
- [Quote 3 with source + engagement]

**Competitive Landscape:**
[What exists, why it's inadequate, or why nothing exists]

**Workarounds:**
[What people currently do to solve this]

---

## Problem #2: [Brief title]
[... same format ...]
```

**Research Lead checkpoint:** Receives Mary's report, passes to Quinn for scoring.

---

### Phase 2: Problem Scoring & Gate - Quinn (8-12 min)

**Objective:** Score problems with adversarial lens, filter ≥70/100, rank, pick #1

**Quinn receives:**
- Mary's problem report (4-8 problems with competitive context)
- Config constraints
- Previously researched problems (to avoid duplicates)

**Quinn's Philosophy:**
NOT a rubber stamp. Job is genuine skepticism - find the strongest reasons these problems are NOT opportunities. Score harshly. Kill 30-40% of inputs.

---

#### Scoring Framework (4 dimensions, 1-25 each, total /100)

**1. Pain Intensity (1-25):**
- How severely does this affect people?
- **Evidence:** Strong emotional language ("hate", "nightmare", "impossible"), financial cost, time waste, stress
- **Active solution-seeking:** People trying multiple tools, building DIY solutions
- **Frequency vs. Stakes:** Daily annoyances OR high-stakes infrequent pain both qualify if impact is real

**Skeptical questions:**
- Are the complaints cherry-picked or widespread?
- Do people complain but not act?
- Is this a "nice to have" or genuinely painful?

**2. Willingness to Pay (1-25):**
- Are people ALREADY paying for solutions in this space (even bad ones)?
- **Strong (20-25):** Multiple paid products exist, users paying $10-50+/mo
- **Moderate (10-19):** Some paid products, evidence of spending
- **Weak (1-9):** Only free solutions, no evidence people will pay

**Skeptical questions:**
- Do the existing paid products actually make money?
- Is this something people expect for free?
- Would they pay or just complain?

**3. Solution Gap (1-25):**
- Is this gap REAL or is there a reason nobody's solved it?
- **Use Mary's classification:**
  - Wide Open (22-25): No products exist
  - Poorly Served (16-21): Products exist but all bad
  - Underserved (10-15): 1-2 decent products with gaps
  - Adequately Served (4-9): Multiple good products (shouldn't reach Quinn)
  - Crowded (1-3): 5+ strong competitors (shouldn't reach Quinn)

**Skeptical questions:**
- WHY doesn't this exist? Technical barrier? Economics don't work?
- Are existing solutions "bad" or are users just picky?
- Can a solo dev realistically compete here?

**4. Market Size (1-25):**
- Viable scale for a solo dev product?
- **Evidence:** Search volume, community size, app downloads, subreddit members

**Skeptical questions:**
- Is this problem too niche (addressable market <10k people)?
- Or too broad (would need massive scale to compete)?
- Can we reach these people?

**Total: 4-100 points per problem**

---

#### Quinn's Output

```markdown
# Problem Scoring Report (Quinn - Adversarial Lens)

**[N] problems received from Mary**

---

## Problem #1: [Title] — [X]/100

**Classification:** [Mary's competitive classification]

### Score Breakdown
- **Pain Intensity:** X/25 - [Harsh assessment of whether pain is real]
- **Willingness to Pay:** X/25 - [Skeptical view on spending evidence]
- **Solution Gap:** X/25 - [Why gap exists, is it real opportunity?]
- **Market Size:** X/25 - [Realistic assessment of addressable market]

### Strongest Counterargument
[What's the #1 reason this WON'T work?]

### Verdict
[VIABLE if ≥70 / REJECT if <70]

---

## Problem #2: [Title] — [X]/100
[... same format ...]

---

## FINAL RANKING (Problems scoring ≥70 only)

1. [Problem title] — [X]/100
2. [Problem title] — [X]/100
3. [Problem title] — [X]/100

**Proceeding with:** [#1 from ranking]
```

---

#### Gate Logic

**IF zero problems score ≥70:**
- → ABORT entire pipeline
- → Announce to Kelly: "❌ No viable problems found. Quinn scored 0/X problems ≥70/100."
- → Research Lead session ends

**IF 1+ problems score ≥70:**
- → Create ranked queue [#1, #2, #3, ...]
- → Check #1 against registry (problem-level deduplication)
- → IF duplicate: Try #2, then #3, etc.
- → IF unique: Create registry entry, proceed to Phase 3

---

#### Registry Write #1: Discovery Entry (After Problem Selection)

```json
{
  "id": "problem-{name}-{timestamp}",
  "state": "discovery",
  "researchPhase": "cis-ideation",
  "researchSession": "agent:research-lead:{number}",
  "intake": {
    "problem": "[selected problem description]"
  },
  "timeline": {
    "discoveredAt": "[timestamp]",
    "lastUpdated": "[timestamp]"
  }
}
```

---

### Phase 3: CIS Solution Generation (10-14 min)

**Objective:** Generate 10 novel solutions for the selected problem using CIS personas

**Research Lead spawns 3 CIS personas in parallel:**
- Carson (Brainstorming Coach)
- Victor (Innovation Strategist)
- Maya (Design Thinking Coach)

**Each receives:**
- Selected problem from Phase 2
- Mary's competitive landscape context
- Config constraints (platform, business model, stack)

**Each persona generates 3-5 solutions** with distinct approaches:
- Carson: Divergent thinking, wild ideas, combinatorial creativity
- Victor: Blue Ocean strategy, disruptive business models
- Maya: Human-centered design, empathy-driven solutions

**Research Lead collects all solutions:** ~10-15 total

**Output:** 10-15 solution concepts (name, description, key features, novel angle)

---

### Phase 4: Solution Scoring & Gate - Quinn (8-12 min)

**Objective:** Score solutions with adversarial lens, filter ≥70/100, rank, pick #1

**Quinn receives:**
- Problem description (from Phase 2)
- 10-15 solution concepts (from Phase 3)
- Mary's competitive landscape
- Config constraints

**Quinn's Philosophy:**
Try to kill these solutions. Find the fatal flaws. Novelty claims must be defensible. Revenue thesis must be realistic. Score harshly.

---

#### Scoring Framework (4 dimensions, 1-25 each, total /100)

**1. Novelty (1-25):**
- Is this approach genuinely new or just incremental improvement?
- **Novel (20-25):** Fundamentally different approach, unique value prop
- **Differentiated (13-19):** Clear twist on existing solutions
- **Incremental (6-12):** Minor improvement over competitors
- **Me-too (1-5):** Clone of existing products

**Skeptical questions:**
- What's actually NEW here vs. feature bloat?
- Has someone already tried this and failed?
- Is the "novel" approach actually better or just different?

**2. Problem-Solution Fit (1-25):**
- Does this solution actually solve the discovered problem?
- Would target customers see immediate value?
- Is the solution aligned with how customers experience the problem?

**Skeptical questions:**
- Does this solve the REAL problem or a tangential one?
- Is this what users actually want or what we think they want?
- Would users adopt this workflow?

**3. Feasibility (1-25):**
- Can this be built as [platform] with [stack]?
- Complexity within solo dev scope (40-60 stories)?
- **Value Source Check:** What data/content powers the core value?
  - Self-contained or user's own data (20-25) → no dependencies
  - Reliable external APIs (14-19) → verify API exists and covers need
  - Scraping or unreliable sources (8-13) → high maintenance, fragile
  - Other users' contributions (3-7) → cold start problem
  - Data doesn't exist (1-2) → disqualify

**Skeptical questions:**
- On day 1 with 0 users, does this deliver value?
- What's the hardest technical challenge?
- What could go wrong?

**4. Revenue Thesis (1-25):**
- Can Quinn write a compelling one-paragraph revenue thesis?
- **Format:** "People currently [pay $X for / spend Y hours on] [inferior solution]. We charge $Z/mo. At realistic users × conversion, Year 1 ARR = $W."
- **Strong (20-25):** Clear thesis, realistic assumptions, defensible math, proven willingness to pay
- **Moderate (10-19):** Plausible but requires some optimistic assumptions
- **Weak (1-9):** Very speculative, minimal evidence of willingness to pay

**Skeptical questions:**
- Are the pricing assumptions realistic?
- Would people pay this much?
- What's the realistic conversion rate? (2-5%, not 12-15%)

**Total: 4-100 points per solution**

---

#### Quinn's Output

```markdown
# Solution Scoring Report (Quinn - Adversarial Lens)

**Problem:** [From Phase 2]
**[N] solutions received from CIS**

---

## Solution #1: [Name] — [X]/100

**Description:** [2-3 sentence solution description]

### Score Breakdown
- **Novelty:** X/25 - [Is this actually new or incremental?]
- **Problem-Solution Fit:** X/25 - [Does this really solve it?]
- **Feasibility:** X/25 - [Can we build this? Value source check?]
- **Revenue Thesis:** X/25 - [Can we write a compelling revenue story?]

### Revenue Thesis
[One paragraph with realistic math or CANNOT WRITE THESIS]

### Strongest Counterargument
[What's the #1 reason this will FAIL?]

### Verdict
[VIABLE if ≥70 / REJECT if <70]

---

## Solution #2: [Name] — [X]/100
[... same format ...]

---

## FINAL RANKING (Solutions scoring ≥70 only)

1. [Solution name] — [X]/100
2. [Solution name] — [X]/100
3. [Solution name] — [X]/100

**Proceeding with:** [#1 from ranking]
```

---

#### Gate Logic

**IF zero solutions score ≥70 for problem #1:**
- → Try next problem from Phase 2 queue (#2)
- → Run Phase 3 again (CIS on problem #2)
- → Run Phase 4 again (Quinn scores problem #2 solutions)
- → Repeat until solutions ≥70 OR problem queue exhausted

**IF 1+ solutions score ≥70:**
- → Pick #1 from ranking
- → Check against registry (solution-level deduplication)
- → IF duplicate: Try #2, then #3, etc.
- → IF unique: Update registry with solution, proceed to Phase 5

**IF all problems exhausted with no solutions ≥70:**
- → ABORT entire pipeline
- → Announce to Kelly: "❌ No viable solutions found. Tried X problems, 0 solutions scored ≥70/100."
- → Research Lead session ends

---

#### Registry Write #2: Add Solution (After Solution Selection)

```json
{
  "researchPhase": "complete",
  "intake": {
    "problem": "[from Phase 2]",
    "solution": "[selected solution]",
    "targetAudience": "[derived from problem + solution]",
    "keyFeatures": ["[from CIS solution]"]
  },
  "timeline": {
    "lastUpdated": "[timestamp]"
  }
}
```

---

### Phase 5: Create intake.md (3-5 min)

**Objective:** Compile comprehensive product brief ready for Project Lead

**Research Lead writes intake.md:**

```markdown
# [Product Name] - Product Brief

**Generated:** [timestamp]
**Research Session:** agent:research-lead:{number}
**Discovery Strategy:** [Mary's approach]

---

## Problem

[Problem description from Phase 2]

### Evidence

[Key quotes and sources from Mary's research]

### Competitive Landscape

[Mary's competitive classification + specific gaps]

### Why This Matters

[Pain intensity + willingness to pay insights from Quinn]

---

## Solution

[Solution description from Phase 4]

### Key Features

[From CIS solution]

### What Makes This Different

[Novelty insights from Quinn - why this is novel]

### Target Audience

[Who experiences this problem + would use this solution]

---

## Revenue Thesis

[Quinn's revenue thesis paragraph from Phase 4]

---

## Risk Assessment

**Quinn's Strongest Counterargument:**
[What's most likely to go wrong]

**Feasibility Notes:**
[Technical risks, value source, cold start considerations]

---

## Next Steps

Ready for Project Lead implementation:
1. Create project directory: `projects/{project-name}/`
2. Copy this intake.md
3. Run BMAD Phase 1 (PRD generation)
```

---

#### Registry Write #3: Mark Complete (After intake.md Created)

```json
{
  "researchPhase": "complete",
  "researchDir": "ideas/{project-id}",
  "timeline": {
    "lastUpdated": "[timestamp]"
  }
}
```

**Research Lead announces to Kelly:**
"✅ Product idea complete: **{name}**. Intake ready at `projects/ideas/{project-id}/intake.md`. Quinn scored problem {X}/100, solution {Y}/100."

---

## Fallback & Error Handling

### Problem-Level Failures (Phase 2)

**Scenario 1: Zero problems score ≥70**
- Quinn finds no viable problems
- ABORT pipeline immediately
- Announce: "❌ No viable problems. 0/X scored ≥70."

**Scenario 2: All qualifying problems are duplicates**
- All problems ≥70 match existing registry entries
- ABORT pipeline (no new territory to explore)
- Announce: "❌ All viable problems already researched."

### Solution-Level Failures (Phase 4)

**Scenario 3: Problem #1 produces no viable solutions**
- CIS runs on problem #1
- Quinn scores all solutions <70
- Fall back to problem #2 from Phase 2 queue
- Run CIS on problem #2
- Continue until solutions ≥70 OR problem queue exhausted

**Scenario 4: All problems exhausted, no solutions ≥70**
- Tried 3 problems, CIS ran 3 times
- Every solution scored <70
- ABORT pipeline
- Announce: "❌ No viable solutions. Tried 3 problems, 0 solutions scored ≥70."

**Scenario 5: All qualifying solutions are duplicates**
- Solutions score ≥70 but match existing registry
- Try next solution in ranking
- If all exhausted, fall back to next problem

---

## Timeline Breakdown

**Total: 35-50 min per Research Lead session**

| Phase | Time | Activity |
|-------|------|----------|
| Phase 1: Mary Problem Discovery | 8-12 min | Find problems + competitive gap check |
| Phase 2: Quinn Problem Gate | 8-12 min | Score 4-8 problems, filter, rank, pick |
| Phase 3: CIS Solution Generation | 10-14 min | 3 personas generate 10-15 solutions |
| Phase 4: Quinn Solution Gate | 8-12 min | Score solutions, filter, rank, pick |
| Phase 5: intake.md Creation | 3-5 min | Compile final brief |

**Variability factors:**
- Problem fallbacks: +10-14 min per fallback iteration (CIS + Quinn scoring)
- Deduplication loops: +2-3 min per duplicate check
- Complex competitive landscapes: +2-4 min in Phase 1

---

## Key Differences from v3.2

**v3.2 (Old):**
- Mary scores problems AND solutions
- Quinn validates at end (Phase 5 only)
- 5+ phases with validation/deep dive steps
- ~40-55 min timeline

**v3.3 (New - Simplified):**
- **Quinn scores everything** (adversarial lens throughout)
- **Two Quinn gates:** problem + solution
- Mary focuses on discovery + competitive landscape (no scoring)
- Cleaner 5-phase structure
- ~35-50 min timeline
- **Fallback queues at both gates** (no dead ends with bad scores)

---

## Related Documentation

- `docs/core/kelly-router-flow.md` - Kelly's role in spawning Research Lead
- `docs/core/project-lead-flow.md` - What happens after intake.md is created
- `docs/core/project-registry-workflow.md` - Registry schema and lifecycle
- `~/.openclaw/workspace-bmad-bmm-mary/AGENTS.md` - Mary's detailed instructions
- `~/.openclaw/workspace-bmad-cis-quinn/AGENTS.md` - Quinn's detailed instructions
- `~/.openclaw/workspace-bmad-cis-carson/AGENTS.md` - Carson's CIS approach
- `~/.openclaw/workspace-bmad-cis-victor/AGENTS.md` - Victor's CIS approach
- `~/.openclaw/workspace-bmad-cis-maya/AGENTS.md` - Maya's CIS approach

---

**Document Status:** Active (v3.3)  
**Supersedes:** research-lead-flow.md v3.2 (2026-02-18)
