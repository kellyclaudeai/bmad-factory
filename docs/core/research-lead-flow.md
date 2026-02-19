# Research Lead - Product Idea Generation Agent

**Version:** 3.2  
**Last Updated:** 2026-02-18 22:50 CST  
**Status:** In Development

---

## Overview

**Purpose:** Autonomous product idea generation system that discovers unsolved problems, validates demand with quantitative signals, generates novel solutions via CIS personas, and outputs comprehensive product briefs ready for Project Lead implementation.

**Key Principles:**
- **Problem-first** - Start from documented human problems, NOT from hot markets or trending categories
- **Underserved > Crowded** - Prioritize problems with no good solutions over big markets with many competitors
- **Quantitative validation** - Demand proven by search volume, app downloads, community size — not just Reddit upvotes
- **Novel solutions** - CIS generates creative approaches; we don't clone existing competitors
- **Config-driven** - Platform, business model, and stack constraints guide ALL phases
- **Zero input from Kelly** - Fully autonomous discovery within config constraints
- **Registry-aware** - Mary knows what's been researched before and explores new territory
- **LLM-based deduplication** - Semantic similarity detection prevents duplicate pain points

**Timeline:** 34-50 min per Research Lead session  
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
  "stack": "Next.js, React, TypeScript, Firebase, Tailwind CSS",
  // Future expansions:
  "targetRevenue": "subscription",     // subscription | one-time | freemium | usage-based
  "complexity": "solo-dev"             // solo-dev | small-team | enterprise
}
```

### Config Propagation

**Research Lead includes config in EVERY sub-agent spawn:**
- Phase 1: Mary receives config for feasibility filtering and scoring
- Phase 3: All CIS personas receive config for solution ideation
- Phase 4 & 5: Mary receives config reminder for validation phases
- Phase 6: Carson receives config for naming context

**Example spawn from Kelly:**
```bash
openclaw gateway call agent \
  --params '{
    "message": "Generate product idea\n\nConstraints:\n- Platform: web-app\n- Business Model: B2C\n- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS",
    "sessionKey": "agent:research-lead:1",
    "idempotencyKey": "..."
  }'
```

**Default Config (if not specified):**
- Platform: web-app
- Business Model: B2C
- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS

---

## Agent Roster

### Core Agents

**Mary (Business Analyst)**
- Role: Problem discovery, solution gap analysis, solution selection
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phases: Phase 1 (problem discovery + initial naming), Phase 4 (solution selection)

**Carson (Brainstorming Coach)**
- Role: Divergent thinking, creative naming
- Model: Sonnet 4.5
- Phases: Phase 3 (CIS ideation), Phase 6 (creative naming)

**Victor (Innovation Strategist)**
- Role: Blue Ocean strategy, disruptive thinking
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Maya (Design Thinking Coach)**
- Role: Human-centered design, empathy-driven
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Quinn (Devil's Advocate)**
- Role: Skeptical analyst, tries to kill bad ideas before dev time is wasted
- Model: Sonnet 4.5
- Phase: Phase 5 (idea validation — not ideation)

**Research Lead (Orchestrator)**
- Role: Workflow orchestration, registry management, brief compilation
- Model: Sonnet 4.5
- Tools: sessions_spawn, sessions_send, file operations
- Phases: All (coordinator - makes NO decisions, only delegates and writes files)

---

## Complete Workflow

### Phase 1: Problem Discovery - Mary (12-17 min)

**Objective:** Discover documented but UNSOLVED problems — problems where no good solution currently exists

**Core Philosophy:**
Mary is NOT looking for hot markets or trending categories. She is looking for PROBLEMS — documented friction, frustration, and unmet needs. The best opportunities are problems that people have written about but that remain poorly solved.

**Config Awareness:**
Mary receives platform, business model, and stack constraints. These guide:
- Feasibility filtering (web app vs mobile app viability)
- Target customer profiling (consumer vs business personas)
- Which sources to prioritize (App Store for mobile, Chrome Web Store for web)

**Registry Awareness:**
Mary receives a list of previously researched problems from the project registry. She MUST explore different territory:
```
Previously researched problems (DO NOT revisit these domains):
- [Problem 1 from registry]
- [Problem 2 from registry]
- ...
If no previous research exists, explore freely.
```

---

#### Step 1: Problem Discovery (4-6 min)

**Objective:** Find 8-12 documented problems that people are experiencing but that lack good solutions

**Mary is creative in her search approach.** She can mix and match different angles:
- **Review gap mining:** Apps with high downloads but bad ratings — what's missing?
- **Workaround archaeology:** People duct-taping multiple tools together — what single tool do they need?
- **Direct demand signals:** "Why doesn't this exist?", "someone should build..." — people asking for products
- **Enshittification/price revolt:** Products getting worse or more expensive — users actively fleeing

She uses whatever approach makes sense for the platform and constraints, or combines patterns creatively.

**Sources to use:**

**Sources (Tier 1):**
- **Reddit** — Organized by interest, upvotes validate breadth, raw unfiltered pain
- **X.com / Twitter** — Real-time frustrations, trending complaints, emotional signals
- **App Store / Play Store** — Structured review data with star ratings (especially useful for review-based discovery)
- **Product Hunt** — Comments on new launches reveal what people still wish existed
- **Hacker News** — Tech-savvy audience, "Ask HN" threads, "Show HN" comments revealing DIY solutions
- **Google Trends** — Quantitative search volume data for validation (NOT primary discovery source)

**What to capture for each problem:**
- **Direct quotes** showing the problem (exact words people use)
- **Engagement signals** (upvotes, replies, likes — validates multiple people care)
- **Workarounds** people currently use (proves pain is real enough to act on)
- **Timestamps** (recent = fresh pain, old + still mentioned = persistent pain)
- **Source diversity** (same problem on Reddit AND HN AND X = strong signal)

**Output:** 8-12 problem candidates with evidence

**Example output:**
```
Problem Candidate #1: Recipe scaling is broken
- Reddit r/cooking (Feb 2026, 89 upvotes): "Every recipe app scales ingredients linearly but cooking doesn't work that way — you can't just double the salt"
- App Store review of Paprika (3 stars, Jan 2026): "Love this app but the recipe scaling is completely wrong for baking"
- HN comment (Dec 2025): "I built a spreadsheet with proper scaling formulas because no app handles this correctly"
- Evidence sources: [4 Reddit threads, 2 App Store reviews, 1 HN thread]

Problem Candidate #2: No way to track home maintenance
- Reddit r/homeowners (Feb 2026, 134 upvotes): "When was the last time I changed my furnace filter? No idea. Wish there was something for this"
- X.com @homeowner (Jan 2026, 200 likes): "Just spent $3000 on AC repair because I forgot to schedule maintenance"
- Product Hunt comment (2025): "All the 'home management' apps are glorified to-do lists, none actually understand maintenance schedules"
- Evidence sources: [3 Reddit threads, 5 tweets, 2 PH comments]
```

---

#### Step 2: Solution Gap Check (2-3 min)

**Objective:** For each problem candidate, check — does a GOOD solution already exist?

**For each of the 8-12 candidates, Mary does a quick search:**

**Questions to answer:**
- Do products exist that specifically address this problem?
- If yes: Are they GOOD? (4+ stars, active development, significant user base)
- If products exist but are BAD: What specifically do they fail at?
- How many competitors are in this space?

**Classification:**

| Situation | Classification | Action |
|-----------|---------------|--------|
| No products exist for this problem | **Wide Open** ✅ | Strong candidate — validate demand |
| Products exist but all are bad (< 3.5 stars) | **Poorly Served** ✅ | Strong candidate — clear opportunity |
| 1-2 decent products exist with notable gaps | **Underserved** ✅ | Good candidate — gap is the opportunity |
| 3+ good products exist, minor gaps only | **Adequately Served** ❌ | Eliminate — not enough opportunity |
| 5+ strong, well-funded competitors | **Crowded** ❌ | Eliminate — too much competition for solo dev |

**Eliminate** any problem classified as Adequately Served or Crowded. These are not opportunities for a solo developer, regardless of how big the market is.

**Output:** Reduced list of 4-8 viable problem candidates (Wide Open, Poorly Served, or Underserved)

---

#### Step 3: Score + Validate (3-5 min)

**Objective:** Score remaining candidates to find the best opportunity — balancing pain intensity, demand evidence, and solution gap

**For each remaining candidate, Mary evaluates binary kill gates first, then scores across four dimensions:**

**KILL GATES (binary — fail any = abort):**

1. **No evidence of spending** — Nobody pays for anything in this space. Zero paid products exist, no discussions about pricing, no evidence people would spend money to solve this.
2. **Cold start problem** — Product needs other users' data to work on day 1. Classic two-sided marketplace or UGC platform with chicken-and-egg dependency.
3. **Can't build with our stack** — Requires technology outside configured stack (specialized ML, real-time video, hardware, proprietary APIs we can't access).
4. **Incumbent fortress** — Well-funded competitor (Series A+) does this exact thing well. Product is actively maintained, users are happy (4+ stars), clear market leader exists.

**If ANY kill gate is triggered → eliminate immediately, regardless of other factors.**

---

**SCORING (4 dimensions, 1-25 each, total /100):**

**1. Pain Intensity (1-25):**
- How severely does this affect people?
- **Evidence:** Strong emotional language ("hate", "nightmare", "impossible", "waste"), financial cost, time waste, stress/anxiety
- **Active solution-seeking:** People trying multiple tools, building DIY solutions, asking "why doesn't this exist?"
- **Frequency vs. Stakes:** Daily annoyances can score high (8-10). BUT high-stakes infrequent pain (tax filing, weddings, moving, gift-giving) can score EQUALLY high if the impact is severe enough.
- **Impact depth:** Does this cost real money? Waste hours? Cause emotional distress?

**2. Willingness to Pay (1-25):** ← REPLACES "Evidence Breadth"
- Are people ALREADY paying for solutions in this space (even bad ones)?
- **10:** Multiple paid products exist, users paying $10-50+/mo, active discussions about pricing
- **8-9:** Some paid solutions exist, or people paying for adjacent tools/workarounds
- **6-7:** Freemium products with paid tiers, or significant time investment in DIY solutions (time = money signal)
- **4-5:** Mostly free solutions, but some evidence of willingness to pay (people asking "is there a paid version?")
- **2-3:** Purely free/ad-supported space, minimal monetization discussion
- **1:** Zero evidence anyone would pay for this (fails kill gate #1)
- **Note:** We care about SPENDING SIGNALS, not just "how many people mentioned it." One person paying $50/mo is stronger signal than 100 Reddit upvotes.

**3. Competition Gap (1-25):** ← RENAMED, SAME INVERTED SCALE
- How poorly served is this currently?
- **10:** No solutions exist at all — people use terrible manual workarounds
- **8-9:** Solutions exist but ALL are bad (low ratings, major feature gaps, abandoned)
- **6-7:** 1-2 decent solutions exist but with significant gaps or overpriced
- **4-5:** Decent solutions exist, minor gaps only
- **2-3:** Good solutions exist, hard to differentiate
- **1:** Excellent solutions already serve this need perfectly (fails kill gate #4)
- **Note:** This is INVERTED. We want UNDERSERVED problems, not crowded markets.

**4. Buildability (1-25):**
- Can this be built with our configured platform and stack?
- **Platform match:** Config says web-app → can this be a web app?
- **Technical complexity:** Solo developer scope (40-60 stories max)?
- **Stack alignment:** Can our configured stack handle this?
- **Legal/compliance:** Consumer tools = low barrier (8-10). Healthcare/finance = high barrier (4-6).
- **Value Source Analysis (CRITICAL):** What is the primary data/content this product needs to deliver its core value?
  - **10:** Self-contained — the software itself creates value (calculator, editor, converter). Works on day 1 with 0 users, no external dependencies.
  - **8-9:** User's own data — user brings their own value (budget tracker, habit app, notes). No cold start problem, no data dependency.
  - **6-7:** External data via reliable, established APIs — data exists and is accessible (weather APIs, public datasets, government data). Verify API actually exists and covers the need.
  - **4-5:** External data via scraping or unreliable sources — data might exist but requires building/maintaining scrapers, or APIs are limited/expensive. High maintenance burden.
  - **2-3:** User-generated content from OTHER users (fails kill gate #2)
  - **1:** Requires data that provably doesn't exist in accessible form (fails kill gate #3)
  - **If value source scores ≤ 3, this fails kill gate #2 or #3** — eliminate before scoring.

**Total Score: 4-100 points per problem**

**Minimum threshold: 70/100 to proceed**

**Disqualifiers (covered by kill gates + threshold):**
- Kill gate failures (no spending, cold start, can't build, incumbent fortress)
- Score below 70/100 (insufficient opportunity even if no kill gates triggered)

---

#### Step 4: Selection + Initial Naming (2-3 min)

**Select highest scoring problem:**
- Pick top score (pain intensity + solution gap balanced together)
- If tied, pick the one with highest **Solution Gap** score (more underserved = more opportunity)
- Document selection rationale

**Generate initial concept name:**
- Mary creates an analytical/descriptive name (e.g., "Home Maintenance Tracker", "Recipe Scaling Tool")
- This is just for registry tracking, NOT the final brand name
- Keep it simple and clear (final creative naming happens in Phase 6)

**Mary's Output Format:**

```markdown
# SELECTED PROBLEM

## Initial Concept Name
[Descriptive name for registry tracking]

## Discovery Approach Used
[Brief description of search approach taken - e.g., "Review gap mining on App Store", "Workaround archaeology on Reddit + HN", "Enshittification research", etc.]

## Kill Gates: PASS ✅
- ✅ Evidence of spending exists
- ✅ No cold start problem
- ✅ Buildable with our stack
- ✅ No incumbent fortress

## Score: [X]/100 (minimum 70 required)
- **Pain Intensity:** X/25 - [Evidence summary]
- **Willingness to Pay:** X/25 - [What people currently pay, spending signals]
- **Competition Gap:** X/25 - [Current solution landscape - what exists, why it's bad/missing]
- **Buildability:** X/25 - [Platform fit, stack alignment, complexity estimate, value source]

## Problem Description
[2-3 sentence description of the unsolved problem]

## Why This Problem Is Underserved
**Current landscape:**
- [What solutions exist (if any)]
- [Why they're inadequate — specific failures, missing features, bad UX, wrong platform, overpriced]
- [What people do instead — workarounds, manual processes, DIY tools]

**Solution gap classification:** [Wide Open / Poorly Served / Underserved]

## Evidence
**Reddit:**
- [subreddit] ([date], [upvotes]): "[direct quote showing problem]"
- [subreddit] ([date], [upvotes]): "[direct quote]"

**Hacker News:**
- [thread title] ([date], [comments]): "[quote]"

**X.com / Twitter:**
- @[user] ([date], [engagement]): "[tweet]"

**App Store / Product Reviews:** (if applicable)
- [App name] ([rating] stars): "[review quote showing gap]"

**Quantitative Demand:**
- Google Trends: [search volume for related queries]
- Related app downloads: [download counts for existing (even bad) solutions]
- Community size: [relevant subreddit/forum membership]

## Target User Profile
- **Who:** [Demographics, role, context]
- **Pain frequency:** [How often they experience this — daily, weekly, monthly]
- **Current workaround:** [What they do now — DIY, multiple tools, manual process, nothing]
- **Impact:** [Cost/time/stress impact of the problem]
- **Willingness to pay:** [Any evidence of price sensitivity or budget availability]

## Selection Rationale
[Why this problem scored highest — what makes it the best opportunity for a solo dev product]
```

**This output is handed to Research Lead for Phase 2.**

---

### Phase 2: Registration + Deduplication (3-4 min)

**Research Lead actions:**

#### Registry Checkpoint - CHECK 1 (LLM-Based Problem Deduplication)

**Objective:** Prevent researching duplicate problems (even if solution approaches differ)

**Process:**

1. **Read registry:** Extract all existing problem descriptions from `projects[]`

2. **If registry is empty:** Skip dedup check, proceed to registration

3. **If registry has entries:** Evaluate semantic similarity using reasoning

**Research Lead evaluates (with thinking enabled):**

```markdown
Task: Determine if the new problem is fundamentally the same as any existing problem.

New Problem:
[Mary's problem description - 2-3 sentences]

Existing Problems:
1. [Entry 1 intake.problem]
2. [Entry 2 intake.problem]
...

Question: Does the NEW problem address the same underlying frustration as any EXISTING problem?

Critical distinction:
- **Different SOLUTIONS to the same PROBLEM = DUPLICATE** ❌
  - Example: "Subscription cancellation tool" vs "Subscription tracking dashboard" → BOTH address "forgotten subscription waste" → DUPLICATE
  - Example: "Meeting scheduler" vs "Meeting cost tracker" → DIFFERENT problems → NOT duplicate
  
- **Different PROBLEMS in the same DOMAIN = NOT duplicate** ✅
  - Example: "Recipe scaling inaccuracy" vs "Meal planning is tedious" → Same domain (cooking), different problems → NOT duplicate
  
- **Rephrasing the same PROBLEM = DUPLICATE** ❌
  - Example: "Consumers forget to cancel subscriptions" vs "Recurring charges waste money" → Same problem → DUPLICATE

Answer: YES_DUPLICATE or NO_DUPLICATE
If YES_DUPLICATE, specify which existing entry matches and explain why.
```

**Decision:**
- **If `YES_DUPLICATE`:** Abort session, clean up registry, announce to Kelly, **self-close session** (Phase 6 step 6)
- **If `NO_DUPLICATE`:** Proceed to registry registration

---

#### Registry Registration

**After dedup check passes, Research Lead registers problem in the project registry:**

**Registry location:** `/Users/austenallred/clawd/projects/project-registry.json`

**New entry format:**
```json
{
  "id": "home-maintenance-tracker-2026-02-18-1200",
  "name": "Home Maintenance Tracker",
  "state": "discovery",
  "paused": false,
  "pausedReason": null,
  "researchDir": null,
  "researchSession": "agent:research-lead:20260218-1200",
  "researchPhase": "ideation",
  "discoveryStrategy": "workaround-archaeology",
  "timeline": {
    "discoveredAt": "2026-02-18T12:00:00-06:00",
    "lastUpdated": "2026-02-18T12:00:00-06:00"
  },
  "intake": {
    "problem": "Homeowners have no systematic way to track home maintenance schedules, leading to forgotten maintenance that causes expensive repairs",
    "solution": null,
    "targetAudience": null,
    "keyFeatures": []
  },
  "implementation": null,
  "followup": []
}
```

**Fields:**
- `id`: Kebab-case slug + timestamp (unique identifier)
- `name`: Mary's initial analytical name (temporary, updated in Phase 6 with Carson's creative name)
- `state`: `"discovery"` (lifecycle state — see `docs/core/project-registry-workflow.md`)
- `researchDir`: null initially; set to `"ideas/<project-id>"` in Phase 6 when idea directory created
- `researchSession`: This Research Lead session identifier
- `researchPhase`: `"ideation"` (tracks research progress within discovery state)
- `discoveryStrategy`: Which strategy was used (for diversity tracking)
- `intake.problem`: Full problem description (used for LLM dedup in future sessions)

**Registry operations must be atomic** (temp file + rename to prevent corruption in parallel runs).

**Output:** Problem registered in `projects[]` with state `"discovery"`, proceed to Phase 3

---

### Phase 3: CIS Ideation (5-8 min)

**Objective:** Generate 15 novel solutions to the discovered problem

**Research Lead spawns 3 CIS personas in parallel** (Carson, Victor, Maya). Each generates 5 solutions = 15 total.

**Prompt structure for each persona:**

```markdown
Problem: [Mary's problem description from Phase 1]

Evidence Summary: [Key evidence — quotes, workarounds, solution gap]

Target Customer: [From Mary's output]

Current Landscape: [What exists now and why it's inadequate]

Your task: Generate 5 novel solutions that address this problem.

Constraints (CRITICAL — apply to all solutions):
- **Platform:** [from config — e.g., "Web application (browser-based)"]
- **Business Model:** [from config — e.g., "B2C (consumer-facing)"]
- **Stack:** [from config — e.g., "Next.js, React, TypeScript, Firebase, Tailwind CSS"]
- **Scope:** Solo developer, 40-60 stories max (8-12 epics)
- No hardware, no proprietary data requirements

IMPORTANT: Do NOT simply clone existing competitors with minor tweaks. 
The goal is NOVEL approaches to this problem. Think about:
- Completely different angles on the same problem
- Solutions that address the ROOT CAUSE, not just symptoms
- Approaches that existing products haven't tried
- Novel UX paradigms, business models, or delivery mechanisms

Focus on your unique methodology:
- [Carson: Divergent thinking, volume over judgment]
- [Victor: Blue Ocean strategy, disruptive angles]
- [Maya: Human-centered design, empathy-driven]

Output: 5 solution concepts with:
- Name (creative, varied — not all compound words)
- 2-3 sentence description
- How it solves the problem (specifically, not generically)
- What's NOVEL about this approach (why hasn't anyone done this?)
- Why it fits the constraints (platform, business model, stack)
```

**Carson (Brainstorming Coach):**
- Divergent thinking, volume over judgment
- 5 wild ideas, some unconventional
- Naming style: Playful, unexpected (e.g., "Done-ish", "Oops")

**Victor (Innovation Strategist):**
- Blue Ocean strategy, disruptive angles
- 5 ideas that avoid incremental thinking
- Naming style: Metaphorical, strategic (e.g., "Lighthouse", "Canvas")

**Maya (Design Thinking Coach):**
- Human-centered, empathy-driven
- 5 ideas focused on user experience and emotional needs
- Naming style: Evocative, emotional (e.g., "Peace", "Clarity")

**Research Lead collects all solutions (15 total), prepares for Phase 4**

---

### Phase 4: Solution Selection - Mary (5-8 min)

**Objective:** Select the best solution from the 16-20 CIS-generated ideas

**Config Reminder:**
Research Lead reminds Mary of constraints and the problem's solution gap:
```markdown
Constraints (reminder):
- Platform: [from config]
- Business Model: [from config]
- Stack: [from config]

Problem context:
- Solution gap: [Wide Open / Poorly Served / Underserved]
- Existing competitors (if any): [list from Phase 1]
- Why they're inadequate: [from Phase 1]

Evaluate solutions within these constraints. Prioritize NOVELTY — we want 
approaches that existing competitors haven't tried, not incremental improvements.
```

**Mary's process:**

#### 1. Quick Competitive Scan (3-4 min)
For each solution, search:
- Does this specific approach exist already?
- How different is this from what's already out there?
- Would users immediately see why this is better/different?

#### 2. Score Each Solution (2-3 min)

**4 dimensions (1-25 each, total /100):**

**1. Novelty (1-25):**
- How genuinely unique is this approach?
- Does a direct competitor already do this exact thing?
- Is there a genuinely novel angle or insight?
- Would someone say "huh, clever" — not "oh, another [category] app"?

**2. Problem-Solution Fit (1-25):**
- Does this actually solve the discovered problem well?
- Does it address the ROOT CAUSE or just symptoms?
- Would target customers see immediate value?
- Is the solution aligned with how customers experience the problem?

**3. Feasibility (1-25):**
- Can this be built as a [platform from config]?
- Does it fit our stack?
- Complexity within solo dev scope (40-60 stories)?
- Technical risks manageable?
- **Value Source Check:** What data/content powers the core value?
  - Self-contained or user's own data (8-10) → user brings their own value, no dependencies
  - Reliable external APIs (6-7) → verify the API actually exists and covers the need
  - Scraping or unreliable sources (4-5) → high maintenance, fragile
  - Other users' contributions (2-3) → cold start problem, app useless on day 1
  - Data doesn't exist in accessible form (1) → disqualify
  - **Ask: "On day 1 with 0 users, does this product deliver value?"** If no, cap Feasibility at 10/25.

**4. Revenue Thesis (1-25):**
- Can Mary write a compelling one-paragraph revenue thesis?
- **Format:** "People currently [pay $X for / spend Y hours on] [inferior solution]. We charge $Z/mo. At realistic users × conversion, Year 1 ARR = $W."
- **22-25:** Clear thesis with realistic assumptions, defensible math, proven willingness to pay
- **18-21:** Solid thesis but some assumptions require mild optimism
- **13-17:** Plausible but requires several optimistic assumptions
- **8-12:** Weak thesis, relies on heroic conversion rates or unproven pricing
- **3-7:** Very speculative, minimal evidence of willingness to pay
- **1-2:** Cannot write a coherent revenue thesis with realistic assumptions
- **If the math requires heroic assumptions → score low**

**Total: 4-100 points per solution**

**Minimum threshold: 70/100 to proceed**

#### 3. Rank All Qualifying Solutions (1-2 min)

- Rank all 15 solutions by score descending
- **Report every solution that scores ≥70/100** — these are the qualified candidates
- If tied, prefer higher **Novelty** score (novel > incremental)
- Document reasoning for the #1 pick — specifically WHY this approach is different from existing solutions

**Why all qualifying?** If Quinn kills #1 in Phase 5, we fall through to #2, then #3, etc. — working down the ranked list until one survives or none do. If zero solutions clear 70/100, abort before Phase 5.

**Mary must write a revenue thesis paragraph for every qualifying solution.**

**Mary's Output:**

```markdown
# QUALIFIED SOLUTIONS (scored ≥70/100)

**[N] of 15 solutions qualified. [15-N] eliminated (below 70/100 threshold).**

---

## Rank #1: [Name from CIS] — [X]/100

[2-3 sentence description from CIS]

### Score Breakdown
- **Novelty:** X/25 - [What's genuinely new about this approach]
- **Problem-Solution Fit:** X/25 - [How well it addresses the discovered problem]
- **Feasibility:** X/25 - [Technical fit assessment, value source check]
- **Revenue Thesis:** X/25 - [Can we write a compelling revenue story?]

### Revenue Thesis
[One paragraph: "People currently [pay $X for / spend Y hours on] [inferior solution]. We charge $Z/mo. At realistic users × conversion, Year 1 ARR = $W." Include justification for pricing, conversion assumptions, and why this is defensible.]

### Why #1
[What made this stand out — specifically the novel angle]

### How It's Different From What Exists
[If competitors exist: specific comparison showing our novel approach]
[If no competitors: why this approach is the right first-mover strategy]

### Platform/Stack Alignment
- ✅/❌ [Platform fit]
- ✅/❌ [Stack fit]
- ✅/❌ [Business model fit]
- ✅/❌ [Scope fit]

---

## Rank #2: [Name from CIS] — [X]/100

[2-3 sentence description]

### Score Breakdown
- **Novelty:** X/25 - [Brief]
- **Problem-Solution Fit:** X/25 - [Brief]
- **Feasibility:** X/25 - [Brief]
- **Revenue Thesis:** X/25 - [Brief]

### Revenue Thesis
[Same format as #1]

---

## Rank #3: [Name from CIS] — [X]/100
[... same format, repeat for all qualifying solutions ...]
```

---

**Registry Checkpoint - CHECK 2 (Solution-Level Deduplication):**

**Research Lead checks solution against registry:**
- Compare selected solution's concept + description against existing entries
- 3+ significant keyword overlap in name + intake.solution = potential duplicate
- **If duplicate:** Abort, announce to Kelly, **self-close session** (Phase 6 step 6)
- **If unique:** Update registry phase to "validation", proceed to Phase 5

**Registry update:**
```json
{
  "researchPhase": "validation",
  "intake.solution": "[Selected solution description]",
  "timeline.lastUpdated": "[current timestamp]"
}
```

---

### Phase 5: Devil's Advocate - Quinn (8-12 min)

**Objective:** Try to KILL the idea. Find the strongest reasons this will fail BEFORE we waste dev time building it.

**Philosophy:** A good Devil's Advocate kills 30-40% of ideas that make it to Phase 5. This is NOT a rubber stamp — Quinn's job is genuine skepticism.

**Research Lead spawns Quinn with:**
- Mary's problem statement (Phase 1)
- The current candidate solution (starting with #1) from Phase 4
- Mary's revenue thesis for that solution (Phase 4)
- How many qualified fallbacks remain in the queue
- All CIS solutions that were NOT selected (for context — what alternatives were considered?)

**Quinn's Research (8-12 min):**

#### 1. Strongest Counterargument (2-3 min)

**What's the #1 reason this will fail?**
- Not "what could go wrong" — what WILL go wrong?
- What's the fatal flaw in the logic?
- What assumption is most likely to be wrong?
- What have we overlooked?

**Examples of strong counterarguments:**
- "This assumes people WANT to track this, but the problem is they don't care enough to open an app daily."
- "The 'novel' approach is actually just feature bloat — simpler competitors will win."
- "This solves a problem people complain about but won't pay to fix."

#### 2. Demand Skepticism (2-3 min)

**Is the "evidence" cherry-picked?**
- Mary found Reddit posts and tweets — but do people ACTUALLY want this or just complain online?
- How many of those upvotes translate to paying customers?
- Is this a "nice to have" or a genuine pain point?
- Search for COUNTER-evidence: posts saying "this isn't actually a problem" or "I tried this and didn't care"

**Red flags:**
- High Reddit engagement but zero successful products (suggests people like complaining, not paying)
- Evidence from 2+ years ago with no recent mentions (problem may have faded)
- All evidence from one niche community (not representative)

#### 3. Revenue Attack (2-3 min)

**Poke holes in Mary's revenue thesis:**
- Are the pricing assumptions realistic? Would people actually pay $X/mo for this?
- Is the conversion rate assumption heroic? (5% is common, 10%+ is optimistic, 20%+ is fantasy)
- Is the user acquisition assumption realistic? "If we just get 1000 users" — HOW?
- Compare to similar products — what do THEY charge? What's THEIR conversion?
- If no direct comparables exist, is that because the monetization is genuinely hard?

**Examples of revenue attacks:**
- "Mary assumes $15/mo but competitor charges $5/mo — we'd need 3x better to justify premium."
- "Revenue thesis assumes 1000 users Year 1 but doesn't explain HOW we acquire them."
- "This is a 'use once and done' tool — no recurring value, subscription won't work."

#### 4. Competitive Blind Spots (2-3 min)

**What competitors or substitutes did Mary miss?**
- Search more aggressively for competitors (different keywords, adjacent categories)
- Look for FAILED predecessors — products that tried this and shut down (why did they fail? are we making the same mistake?)
- Free substitutes (spreadsheets, pen & paper, existing tools used creatively)
- "Good enough" alternatives that don't solve the problem perfectly but are free/cheap

**Questions to answer:**
- Why hasn't this been built already if the opportunity is so clear?
- If competitors failed, what makes us think we'll succeed?
- Are there structural reasons this market is hard?

#### 5. Retention Risk (1-2 min)

**Will users keep paying month 2, 6, 12?**
- Is this a one-time novelty or sustained habit?
- Does the product get MORE valuable over time (data accumulation, habit formation)?
- Or does it solve a problem once and then users churn?
- What's the usage frequency? Daily use → high retention. Monthly → risky. Annually → unsustainable.

**Red flags:**
- Problem only matters occasionally (e.g., once a year)
- No data lock-in or switching costs
- Value doesn't compound over time
- Competitors can easily poach users

---

**Quinn's Output:**

```markdown
# DEVIL'S ADVOCATE ANALYSIS

## Recommendation: KILL / PROCEED

[One sentence: Kill this idea, or proceed with caution]

---

## 1. Strongest Counterargument

**The Fatal Flaw:**
[2-3 sentences: What's the #1 reason this will fail?]

**Why This Matters:**
[1-2 sentences: Why this flaw is likely to be fatal, not just a challenge]

---

## 2. Demand Skepticism

**Is The Evidence Real?**
[2-4 sentences: Cherry-picked? Do people actually want this or just complain? Counter-evidence found?]

**Red Flags:**
- [Specific red flag 1]
- [Specific red flag 2]
- [Specific red flag 3]

---

## 3. Revenue Thesis Attack

**Holes in the Math:**
[2-4 sentences: What assumptions are unrealistic? Pricing too high? Conversion too optimistic? User acquisition hand-waved?]

**Comparable Products:**
- [Competitor/analog]: $X/mo, Y users, Z% conversion
- [Our assumption]: $A/mo, B users, C% conversion
- [Reality check]: [Why our assumptions may be off]

---

## 4. Competitive Blind Spots

**What Mary Missed:**
[2-4 sentences: Competitors, failed predecessors, free substitutes she didn't consider]

**Failed Predecessors:**
- [Product 1]: Shut down in [year] — [why it failed]
- [Product 2]: Pivoted away from this — [reason]

**Why This Market Is Hard:**
[1-2 sentences: Structural challenges in this space]

---

## 5. Retention Risk

**Will Users Stay?**
[2-3 sentences: One-time novelty or sustained habit? Does value compound over time?]

**Churn Risk:** [Low / Medium / High]
- Usage frequency: [Daily / Weekly / Monthly / Annually]
- Data lock-in: [Strong / Weak / None]
- Value accumulation: [Yes / No]

---

## Final Verdict

**If KILL:**
[2-3 sentences: Why this idea should be aborted. What's the strongest reason NOT to build this?]

**If PROCEED:**
[2-3 sentences: What are the BIGGEST risks we need to watch out for? This is not a green light — it's a yellow light with warnings.]

---

## Alternative Solutions Worth Reconsidering

[If one of the NON-selected CIS solutions from Phase 4 actually seems stronger after this analysis, mention it here. Sometimes the "clever" solution is worse than the "boring" solution.]
```

---

**Research Lead Decision (Fallback Queue):**

Research Lead works through Mary's ranked list of qualified solutions (all ≥70/100) from top to bottom:

```
QUEUE = [all solutions scoring ≥70/100, ranked by score descending]

while QUEUE is not empty:
    candidate = QUEUE.pop(0)          # take highest remaining
    spawn Quinn on candidate
    
    if Quinn says PROCEED:
        → continue to Phase 6 with this candidate
        → include Quinn's analysis as "Risk Assessment" in PRD
        → DONE
    
    if Quinn says KILL:
        → log: "Quinn killed [name] ([score]/100) — [reason]"
        → if QUEUE still has candidates:
            → announce to Kelly: "⚠️ Quinn killed [name]. Trying next: [next name] ([score]/100). [N] candidates remain."
            → continue loop
        → if QUEUE is empty:
            → abort pipeline
            → remove registry entry
            → announce to Kelly: "❌ Quinn killed all [N] qualified solutions. Pipeline aborted."
            → self-close session (Phase 6 step 6)
            → SESSION ENDS

if QUEUE was empty from the start (zero solutions scored ≥70/100):
    → abort before spawning Quinn
    → announce to Kelly: "❌ No solutions scored ≥70/100. Pipeline aborted at Phase 4."
    → self-close session
```

**Key behavior:**
- Quinn sees each candidate fresh — no bias from killing previous ones
- Each Quinn spawn gets the candidate's solution, revenue thesis, and problem statement
- Research Lead logs every kill with reason (included in final artifacts if a later candidate survives)
- No artificial cap on fallback depth — if 5 solutions qualified, Quinn can review up to 5

---

### Phase 6: Compilation & Finalization (5-7 min)

**Research Lead actions:**

#### Registry Checkpoint - CHECK 3 (Final Safety)

1. Read registry one last time
2. Compare final concept against all entries
3. **If duplicate found:** Abort (unlikely at this stage, safety net)
4. **If unique:** Proceed to compilation

---

#### Compilation Steps

**1. Creative Naming - Carson (2-3 min)**

**Research Lead spawns Carson for creative naming:**

```markdown
Task: Generate creative product names for this concept

Concept: [Selected solution name and description from CIS Phase 3]

Problem: [From Mary Phase 1]

Target Customer: [From Mary Phase 1]

Constraints:
- Platform: [from config]
- Business Model: [from config]

Requirements:
- Generate 1 PRIMARY name (your best recommendation)
- Generate 3-4 ALTERNATIVE names
- VARY naming styles (do NOT make them all compound words)

Naming styles to use (pick 3-4 DIFFERENT styles):
1. Compound Words - MeetCost, EventSquad, TaskFlow
2. Single Evocative Words - Redux, Clarity, Anchor, Peace
3. Playful/Casual - Done-ish, Oops, Nope
4. Descriptive Phrases - Clear Cut, Fair Share, Now or Never
5. Made-up Words - Fleai (flea market + AI), Calendify
6. Metaphorical - Lighthouse, Compass, Canvas
7. Action-oriented - Cancel, Pause, Track, Fix
8. Outcome-focused - Peace, Clarity, Freedom, Flow

Output format:
**PRIMARY:** [Name] ([Style]) - [1 sentence rationale]

**ALTERNATIVES:**
- [Name 2] ([Style]) - [Why this works]
- [Name 3] ([Style]) - [Why this works]
- [Name 4] ([Style]) - [Why this works]
```

---

**2. Create Idea Directory (10 sec)**

Research Lead creates idea directory under `projects/ideas/`:

```bash
PROJECT_ID="<slug>-YYYY-MM-DD-HHMM"
mkdir -p "/Users/austenallred/clawd/projects/ideas/${PROJECT_ID}"
```

Copy working files from Research Lead workspace:
- `solution-scoring.md` → `projects/ideas/${PROJECT_ID}/solution-scoring.md`
- `competitive-deepdive.md` → `projects/ideas/${PROJECT_ID}/competitive-deepdive.md`
- `creative-naming.md` → `projects/ideas/${PROJECT_ID}/creative-naming.md`

---

**3. Compile Product Research Document (2-3 min)**

Research Lead compiles all outputs into final brief at `projects/ideas/${PROJECT_ID}/{idea-name}-prd.md` (e.g., `bounce-prd.md`) following the PRD template:

```markdown
# [PRIMARY NAME from Carson]

**Alternative Names:** [Name2], [Name3], [Name4]
**Generated:** [Date] CST
**Research Lead Session:** [session key]
**Discovery Approach:** [Mary's search approach description]

---

## Executive Summary

**Title:** [PRIMARY NAME from Carson]

**Description:**  
[2-3 sentence description - what we're building, how it works, what makes it different]

**Pain Point:**  
[2-3 sentence problem description - who experiences this, what the pain is, why current solutions fail]

---

## Problem Statement

### Problem Discovered
[Mary's problem description from Phase 1]

### Why This Problem Is Underserved
[Solution gap analysis — what exists, why it's bad/missing]
- Solution gap classification: [Wide Open / Poorly Served / Underserved]
- Current workarounds: [What people do now]

### Evidence
[Summary of evidence from Phase 1]

**Evidence Sources:**
- **Reddit:** [X] posts across [subreddits] (engagement: [upvotes, comments])
- **Hacker News:** [Y] threads/comments
- **X.com:** [Z] tweets (engagement)
- **App Store / Reviews:** [N] reviews showing gap (if applicable)
- **Google Trends:** [Search volume data]

### Target User
- **Who:** [Demographics, role, context]
- **Pain frequency:** [Daily/weekly/monthly]
- **Current workaround:** [What they do now]
- **Impact:** [Cost/time/stress impact]

### Demand Validation
- **Search volume:** [Google Trends data]
- **Related app downloads:** [If applicable]
- **Community size:** [Relevant subreddits/forums]
- **Willingness to pay:** [Evidence]

---

## Solution Concept

### Overview
[2-3 paragraph description of the selected solution]

### What's Novel About This Approach
[Specifically what makes this different from existing solutions or workarounds]

### Key Features
1. **[Feature 1]:** [Description]
2. **[Feature 2]:** [Description]
3. **[Feature 3]:** [Description]
4. **[Feature 4]:** [Description]
5. **[Feature 5]:** [Description]

### User Journey
1. **Discovery:** [How user finds the product]
2. **Onboarding:** [First-time setup]
3. **Core loop:** [Regular usage]
4. **Value moment:** [When user realizes benefit]
5. **Retention:** [Why they keep using it]

---

## Market Validation

### Competitive Landscape
[From Phase 5]

**Direct Competitors:** (if any)
1. **[Competitor]** - [What they do] - **Why they're inadequate:** [Gap]

**Indirect Competitors / Workarounds:**
- [What people currently use instead]

### Market Size
**TAM:** [Estimate]
**SAM:** [Our realistic target]

### Novelty Assessment
- **What's new:** [Our unique approach]
- **Risk of replication:** [Low/Medium/High]
- **Failed predecessors:** [If any — what went wrong, what we'll do differently]

---

## Technical Feasibility

### Platform & Stack
- **Platform:** [from config]
- **Stack:** [from config]
- **Additional Services:** [APIs needed]

### Development Estimate
- **Story count:** [range]
- **Epic breakdown:** [list]
- **Timeline:** [estimate]

### Technical Risks
1. **[Risk]:** [Mitigation]
2. **[Risk]:** [Mitigation]

---

## Business Model

### Pricing Strategy
- **Recommended:** $[X]/mo
- **Rationale:** [Why this price point]

### Revenue Potential
- **Year 1:** [projection]
- **Year 2:** [projection]

### Customer Acquisition
- **Primary channels:** [list]
- **Target communities:** [where users hang out]

---

## Risk Assessment (Devil's Advocate - Quinn)

**Quinn's Verdict:** [PROCEED with caution / concerns noted]

### Strongest Counterargument
[Quinn's #1 reason this could fail]

### Demand Skepticism
[Is the evidence cherry-picked? Do people actually want this?]
- **Red Flags:** [List from Quinn]

### Revenue Thesis Concerns
[Holes Quinn found in the math: pricing, conversion, user acquisition assumptions]
- **Comparable Products:** [What similar products actually charge/convert]

### Competitive Blind Spots
[Competitors, failed predecessors, or free substitutes Quinn found that Mary missed]

### Retention Risk
- **Churn Risk:** [Low / Medium / High]
- **Usage Frequency:** [Daily / Weekly / Monthly]
- **Value Accumulation:** [Does product get more valuable over time?]

### Key Risks to Watch
[2-3 biggest risks from Quinn's analysis — what could kill this project?]

---

## Appendix

### Research Session Details
- **Session:** [key]
- **Duration:** [minutes]
- **Discovery Approach:** [Mary's search approach]
- **Config:** [platform, business model, stack]

### Source Links
[All URLs referenced during research]

---

**Status:** Ready for Project Lead intake
**Next Step:** Kelly routes to Project Lead for planning
```

---

**4. Update Registry Entry (30 sec)**

Update existing project-registry.json entry with final name, research directory, and full intake data:

```json
{
  "id": "<slug>-YYYY-MM-DD-HHMM",
  "name": "[PRIMARY NAME from Carson]",
  "researchPhase": "complete",
  "researchDir": "ideas/<slug>-YYYY-MM-DD-HHMM",
  "timeline.lastUpdated": "[current timestamp]",
  "intake": {
    "problem": "[Full problem description from Phase 1]",
    "solution": "[Solution description from Phase 4]",
    "targetAudience": "[From Phase 1 + 5]",
    "keyFeatures": ["feature1", "feature2", "..."]
  }
}
```

---

**5. Announce to Kelly (30 sec)**

```
✅ Research Complete: [Name]

📋 Registered in project-registry.json (state: discovery)
🔍 Discovery Approach: [Mary's approach description]

**Problem:** [1-sentence problem description]
**Why Underserved:** [1-sentence solution gap]
**Solution:** [1-sentence solution description]
**What's Novel:** [1-sentence novelty pitch]
**Solution Score:** [X]/100
**Quinn's Verdict:** [PROCEED / concerns noted]
**Development Estimate:** [stories] stories (~[weeks] weeks)
**Platform:** [from config]
**Business Model:** [from config]

✅ Ready for Project Lead intake.
```

---

**6. Self-Close Session (10 sec)**

Research Lead closes its own session as the FINAL action. This removes it from the dashboard's "Active Research" list.

```bash
# Research Lead runs the session-closer on itself
SKILL_DIR="/Users/austenallred/clawd/skills/factory/session-closer"
SESSION_KEY="<this session's key, e.g. agent:research-lead:2>"

# Extract the session suffix from the key (everything after "agent:research-lead:")
SESSION_SUFFIX="${SESSION_KEY#agent:research-lead:}"

"${SKILL_DIR}/bin/close-project" --agent research-lead "${SESSION_SUFFIX}"
```

**What this does:**
1. Removes session entry from `~/.openclaw/agents/research-lead/sessions/sessions.json`
2. Archives transcript as `*.deleted.<timestamp>`
3. Restarts gateway so dashboard reflects the change immediately

**This must be the LAST action** — after self-close, the session can no longer execute.

**On early abort (duplicate, NO-GO):** Also self-close. Any exit path from the workflow should end with self-close.

**Research Lead session ends.**

---

## Output Structure

### Directory Layout

**Root:** `/Users/austenallred/clawd/projects/`

```
projects/
├── project-registry.json                          # Summary registry (all projects)
├── ideas/                                          # Research Lead outputs (idea stage)
│   ├── <project-id>/                               # One directory per researched idea
│   │   ├── <idea-name>-prd.md                     # Product research document (e.g., bounce-prd.md)
│   │   ├── solution-scoring.md                    # Detailed scoring for all 15 solutions
│   │   ├── competitive-deepdive.md                # Full competitive analysis
│   │   └── creative-naming.md                     # Naming options and rationale
│   └── archived/                                   # Failed/duplicate research (NO-GO, dedup aborts)
├── <project-name>/                                 # Project Lead implementation (created by PL)
│   ├── _bmad-output/
│   ├── src/
│   └── ...
└── ...
```

**Key separation:**
- `ideas/<project-id>/` — Research Lead creates during discovery. Never modified by Project Lead.
- `<project-name>/` — Project Lead creates when starting implementation.
- Registry `researchDir` links to ideas directory; `implementation.projectDir` links to project directory.

### Project ID Format

**Pattern:** `<slug>-YYYY-MM-DD-HHMM`

**Examples:**
- `smart-receipt-budgeting-tracker-2026-02-18-1656`
- `home-maintenance-tracker-2026-02-18-1200`

**Slug generation:** Kebab-case version of Mary's initial analytical name (Phase 1)

### File Descriptions

| File | Purpose | Created By | Phase |
|------|---------|------------|-------|
| **{idea-name}-prd.md** | Product research document with executive summary and all research phases | Research Lead | Phase 6 |
| **solution-scoring.md** | Full scoring matrix for all 15 CIS solutions with rationale | Research Lead | Phase 4 |
| **competitive-deepdive.md** | Detailed competitive analysis, novelty assessment, feasibility | Research Lead or Mary | Phase 5 |
| **creative-naming.md** | Primary name + alternatives with rationale | Carson | Phase 6 |

**Note:** These are working files in `ideas/<project-id>/`. The registry entry (`project-registry.json`) contains only summary data for fast lookups and deduplication. The `researchDir` field in the registry points to the idea directory (relative to `projects/`).

---

## Project Registry (Research Lead's Perspective)

### File Location
`/Users/austenallred/clawd/projects/project-registry.json`

**Full lifecycle spec:** `docs/core/project-registry-workflow.md`

### Structure (Research Lead relevant fields)
```json
{
  "version": "1.1",
  "projects": [
    {
      "id": "home-upkeep-2026-02-18-1200",
      "name": "HomeUpkeep",
      "state": "discovery",
      "paused": false,
      "pausedReason": null,
      "researchDir": "ideas/home-upkeep-2026-02-18-1200",
      "researchSession": "agent:research-lead:20260218-1200",
      "researchPhase": "complete",
      "discoveryStrategy": "workaround-archaeology",
      "timeline": {
        "discoveredAt": "2026-02-18T12:00:00-06:00",
        "lastUpdated": "2026-02-18T12:15:00-06:00"
      },
      "intake": {
        "problem": "Homeowners have no systematic way to track maintenance schedules, leading to forgotten maintenance that causes expensive repairs ($1000s annually)",
        "solution": "Intelligent home maintenance scheduler that learns from your home's age, systems, and local climate to proactively remind and guide maintenance",
        "targetAudience": "B2C homeowners, ages 28-55, first-time and experienced",
        "keyFeatures": ["Home profile builder", "Climate-aware scheduling", "Cost tracking", "Contractor directory", "Maintenance guides"]
      },
      "implementation": null,
      "followup": []
    }
  ]
}
```

### Research Lead's Registry Lifecycle

**Phase 2 (Registration):**
- Create new entry with state `"discovery"`, researchPhase `"ideation"`
- Populate `intake.problem` and `discoveryStrategy`
- `researchDir` is null at this stage (set in Phase 6)

**Phase 4 (Solution selected):**
- Update researchPhase to `"validation"`
- Populate `intake.solution`

**Phase 6 (Compilation complete):**
- Update researchPhase to `"complete"`
- Populate remaining intake fields
- Update `name` with Carson's creative name
- Set `researchDir` to `"ideas/<project-id>"`

**After Research Lead exits:**
- Entry stays with state `"discovery"`, researchPhase `"complete"`
- Full research artifacts at `projects/ideas/<project-id>/`
- Project Lead reads from `researchDir` when picking up the project

### Deduplication Strategy

**3 Registry Checkpoints:**

| Check | Phase | Method | What It Catches |
|-------|-------|--------|----------------|
| CHECK 1 | Phase 2 | LLM semantic similarity | Duplicate problems (different wording, same pain) |
| CHECK 2 | Phase 4 | Keyword overlap | Duplicate solution names |
| CHECK 3 | Phase 6 | Keyword overlap | Final safety net |

**CHECK 1 uses LLM reasoning** because problems are conceptual (need semantic understanding).
**CHECK 2/3 use keyword matching** because solution names are more literal (faster, good enough).

### Atomic Operations

All registry operations use temp file + rename to prevent corruption in parallel runs.

---

## Discovery Approach Tracking

The `discoveryStrategy` field in the project registry passively tracks which search approach Mary used for each idea. This data can be analyzed later to identify patterns:
- Which approaches tend to find the highest-scoring opportunities
- Whether certain approaches work better for specific platforms or business models
- Overall diversity of discovery methods across the pipeline

No active rotation logic—Mary chooses her approach based on the constraints and what makes sense.

---

## Timeline

### Per Research Lead Session

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Problem Discovery (Mary) | 12-17 min | 12-17 min |
| Phase 2: Registration + LLM Dedup (RL) | 3-4 min | 15-21 min |
| Phase 3: CIS Ideation (3 personas parallel) | 5-8 min | 20-29 min |
| Phase 4: Solution Selection (Mary) | 5-8 min | 25-37 min |
| Phase 5: Devil's Advocate (Quinn) | 8-12 min | 33-49 min |
| Phase 6: Compilation + Naming (RL + Carson) | 5-7 min | 38-56 min |

**Total: 38-56 minutes per session** (target: ~45 min average)

**Early abort scenarios:**
- Duplicate caught at CHECK 1 (Phase 2): Saves 35-50 min
- Duplicate caught at CHECK 2 (Phase 4): Saves 15-25 min
- Zero solutions score ≥70/100 (Phase 4): Saves 10-20 min (skips Quinn entirely)
- Quinn kills all qualified solutions (Phase 5): Full Quinn time spent but no wasted dev time

---

## Batch Mode Strategy

### Kelly's Role

When user requests batch generation:

**Kelly spawns N Research Leads in parallel:**

```bash
for i in {1..5}; do
  openclaw gateway call agent \
    --params "{
      \"message\":\"Generate product idea\\n\\nConstraints:\\n- Platform: web-app\\n- Business Model: B2C\\n- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS\",
      \"sessionKey\":\"agent:research-lead:$i\",
      \"idempotencyKey\":\"$(uuidgen)\"
    }" \
    --expect-final --timeout 3600000 &
done
wait
```

**Each Research Lead:**
- Mary receives registry awareness (avoids duplicate problems)
- Mary chooses her own discovery approach based on constraints
- LLM dedup prevents convergence across parallel sessions
- CIS generates novel solutions per problem

**Expected outcomes:**
- 3-5 unique briefs (1-2 may abort due to duplicate problems)
- Total time: ~45-50 min (longest session determines batch time)
- Diversity ensured by: Mary's creative search approaches + registry awareness + LLM dedup

---

## Success Metrics

### MVP Success (After 2 Weeks, 20+ Ideas Generated)

**Diversity:**
- ✅ No more than 2 ideas addressing the same domain
- ✅ Variety of discovery approaches used (review mining, workaround archaeology, demand signals, etc.)
- ✅ Multiple different target customer segments represented

**Quality:**
- ✅ Problem evidence: 3+ independent sources per brief
- ✅ Solution gap confirmed: Every problem classified as Wide Open, Poorly Served, or Underserved
- ✅ Demand validated: Quantitative signals (search volume, downloads, community size) in every brief
- ✅ Novel solution: Every brief's solution clearly differentiated from existing products
- ✅ 90%+ briefs pass Project Lead intake review

**Anti-metrics (things that should NOT happen):**
- ❌ Same problem discovered more than twice (dedup failure)
- ❌ Problem in crowded market with 5+ strong competitors (filtering failure)
- ❌ Solution that's just "existing competitor but slightly better" (novelty failure)

---

## Notes for Implementer

### Key Principles

1. **Research Lead is DUMB** — Pure orchestrator, zero decisions, only delegates
2. **Mary is SMART** — All research, scoring, selections. Understands problem-first philosophy.
3. **Carson is CREATIVE** — All final naming, varied styles
4. **CIS are FOCUSED** — Each has unique methodology, generates novel solutions (not clones)
5. **Config is KING** — Drives all decisions, propagates to every phase
6. **Problems over Markets** — Mary searches for UNSOLVED PROBLEMS, not hot markets
7. **Underserved over Crowded** — Strong competitors = skip, not validate
8. **LLM Dedup is CRITICAL** — Prevents wasting 40 min researching duplicates

### Common Pitfalls to Avoid

- ❌ Don't start from "trending markets" or "hot categories" (converges to crowded spaces)
- ❌ Don't treat existing competitors as validation (treat them as competition)
- ❌ Don't reward market size in scoring (reward solution gap instead)
- ❌ Don't let CIS generate "competitor but better" ideas (demand novelty)
- ❌ Don't skip registry awareness (Mary must know what's been researched)
- ❌ Don't prescribe rigid discovery strategies (let Mary be creative with search approaches)

---

**Version History:**
- **v3.2** (2026-02-18 22:50 CST): Added fallback queue logic. Phase 4 now ranks ALL solutions scoring ≥70/100 (not just top pick). If Quinn kills #1, Research Lead works down the ranked queue until one survives or all are exhausted. No artificial cap — but the 70/100 floor prevents weak ideas from ever entering the queue.
- **v3.1** (2026-02-18 19:59 CST): Simplified discovery approach system. Removed rigid strategy rotation—Mary now chooses search approaches creatively based on constraints. `discoveryStrategy` field becomes passive tracking of approach used.
- **v3.0** (2026-02-18 16:25 CST): Problem-first rewrite. Inverted discovery from market-first to problem-first. Rebalanced scoring to penalize crowded markets and reward underserved problems. Added registry awareness to Phase 1. Added solution gap check (Step 2). Updated CIS prompts to demand novelty.
- **v2.0** (2026-02-18 12:08 CST): Config-driven system, LLM dedup, CIS naming via Carson.
- **v1.0** (2026-02-17): Initial implementation.
