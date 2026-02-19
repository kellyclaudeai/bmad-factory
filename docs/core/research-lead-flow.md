# Research Lead - Product Idea Generation Agent

**Version:** 3.0  
**Last Updated:** 2026-02-18 16:25 CST  
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
- Role: Problem discovery, solution gap analysis, competitive validation, initial naming
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phases: Phase 1 (problem discovery + initial naming), Phase 4 (solution selection), Phase 5 (deep-dive)

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

**Quinn (Creative Problem Solver)**
- Role: TRIZ, systems thinking, root cause analysis
- Model: Sonnet 4.5
- Phase: Phase 3 (CIS ideation)

**Research Lead (Orchestrator)**
- Role: Workflow orchestration, strategy assignment, registry management, brief compilation
- Model: Sonnet 4.5
- Tools: sessions_spawn, sessions_send, file operations
- Phases: All (coordinator - makes NO decisions, only delegates and writes files)

---

## Discovery Strategies

Research Lead assigns Mary ONE discovery strategy per session. Strategies are rotated across sessions to ensure diversity. Each strategy uses different search patterns, which naturally surfaces different problems.

### Strategy 1: Review Gap Mining

**Premise:** Popular apps with bad ratings = proven demand + bad execution = opportunity

**How it works:**
1. Browse App Store / Play Store / Chrome Web Store trending and top charts
2. Find apps with HIGH downloads but LOW/MIXED ratings (2.5-3.5 stars)
3. Read 2-3 star reviews systematically — these reveal exactly what's missing
4. Cross-reference gaps across multiple competing apps in same category
5. The gap that multiple apps fail at = the unsolved problem

**Search patterns:**
- App Store: Browse categories, sort by "most popular", filter by mixed ratings
- Chrome Web Store: Same approach for browser-based tools
- Cross-reference: "Great but missing X" patterns across 3+ similar apps

**What to look for:**
- "Would be 5 stars if it could [feature]"
- "Great concept but [fundamental flaw]"
- "I've tried [App A], [App B], [App C] — none of them do [thing]"
- Features requested in reviews that NO app in the category provides

### Strategy 2: Workaround Archaeology

**Premise:** People duct-taping 3 tools together = the single tool they need doesn't exist

**How it works:**
1. Search for people describing multi-tool workflows and manual processes
2. Identify the friction points where tools don't connect or manual steps are required
3. The manual step or the glue between tools = the unsolved problem

**Search patterns:**
- Reddit: "my workflow for...", "how I manage...", "here's my system for..."
- HN: "I built a script to...", "we just use spreadsheets for..."
- X.com: "my janky setup for...", "I automate this by..."
- Product Hunt: Comments describing workarounds on newly launched products

**What to look for:**
- "I use Zapier to connect X to Y, then manually..."
- "I built a spreadsheet that..." (spreadsheet = missing product)
- "Every morning I have to open 3 apps and..."
- "I wrote a Python script to..." (developer building tools for themselves)
- Multi-step processes that should be one step

### Strategy 3: "Why Doesn't This Exist?"

**Premise:** People directly asking for products that don't exist = clearest demand signal possible

**How it works:**
1. Search for direct demand signals — people explicitly asking for tools/products
2. These are the clearest problem signals because the person has already imagined the solution gap
3. Look for agreement/engagement on these requests (validates it's not just one person)

**Search patterns:**
- Reddit: "why isn't there a...", "someone should build...", "I'd pay for...", "does anyone know a tool that..."
- HN: "Ask HN: Is there a tool for...?", "I wish there was..."
- X.com: "why can't I just...", "take my money if someone builds..."
- Quora: "Is there an app for...?", "How do I..."

**What to look for:**
- Multiple people asking for the same thing independently
- High upvotes/engagement on "does this exist?" posts
- Replies saying "no, I've been looking too" (confirms gap)
- Old threads (6+ months) with the same unmet need (persistent demand)

### Strategy 4: Enshittification / Price Revolt

**Premise:** Products getting worse or more expensive → users actively fleeing → immediate demand for alternatives

**How it works:**
1. Find products that recently raised prices, degraded features, added paywalls, or shut down
2. Identify the user exodus and what they're looking for as a replacement
3. The specific complaints about the degraded product reveal what matters most to users

**Search patterns:**
- Reddit: "[tool] alternatives", "[tool] too expensive", "[tool] getting worse", "[tool] shutting down"
- HN: "[company] raises prices", "[product] enshittification"
- X.com: complaints about specific product changes, pricing outrage
- Google Trends: Spikes in "[product] alternative" searches

**What to look for:**
- "They just raised prices from $X to $Y, what else is there?"
- "Ever since [product] was acquired by [company], it's gone downhill"
- "[Product] just added [restriction/paywall], anyone know alternatives?"
- Products that shut down with vocal, orphaned user bases
- Free tiers being eliminated or heavily restricted

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

**Mary applies the assigned discovery strategy** (see Discovery Strategies section above) using these sources:

**Sources (Tier 1):**
- **Reddit** — Organized by interest, upvotes validate breadth, raw unfiltered pain
- **X.com / Twitter** — Real-time frustrations, trending complaints, emotional signals
- **App Store / Play Store** — Structured review data with star ratings (especially for Review Gap Mining strategy)
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

**For each remaining candidate, Mary scores 1-10 across five dimensions:**

**1. Pain Intensity (1-10):**
- How badly does this problem affect people?
- Evidence: strong language ("hate", "nightmare", "impossible", "waste")
- Active solution-seeking behavior (people trying multiple tools, building DIY solutions)
- Frequency: daily annoyance > monthly annoyance
- Impact: costs money, wastes significant time, causes stress/anxiety

**2. Evidence Breadth (1-10):**
- How many INDEPENDENT sources document this problem?
- Multiple platforms: Reddit + HN + X + Reviews = strong (8-10)
- Single platform, multiple threads: decent (5-7)
- Single thread, high engagement: weak but notable (3-4)
- Geographic spread: global > just SF tech bubble
- Time spread: mentioned last week AND 6 months ago = persistent

**3. Solution Gap (1-10):** ← CRITICAL — INVERTED FROM v2.0
- How POORLY served is this problem currently?
- **10:** No solutions exist at all — people use terrible manual workarounds
- **8-9:** Solutions exist but ALL are bad (low ratings, major feature gaps, abandoned)
- **6-7:** 1-2 decent solutions exist but with significant gaps or overpriced
- **4-5:** Decent solutions exist, minor gaps only
- **2-3:** Good solutions exist, hard to differentiate
- **1:** Excellent solutions already serve this need perfectly — no opportunity
- **Note:** This is the OPPOSITE of "market size validation." A problem with 10 well-funded competitors scores LOW here, not high. We want problems that are UNDERSERVED.

**4. Buildability (1-10):**
- Can this be built with our configured platform and stack?
- **Platform match:** Config says web-app → can this be a web app?
- **Technical complexity:** Solo developer scope (40-60 stories max)?
- **Data requirements:** Can we access the data needed? No proprietary datasets?
- **No specialized tech:** No custom ML models, no real-time video, no hardware
- **Legal/compliance:** Consumer tools = low barrier. Healthcare/finance = high barrier.

**5. Demand Validation (1-10):** ← QUANTITATIVE SIGNALS, NOT COMPETITOR FUNDING
- Is there QUANTITATIVE evidence that enough people have this problem?
- **Google Trends:** Search volume for related queries (10K+/mo = decent, 100K+ = strong)
- **App downloads:** Related (even bad) apps have significant downloads? (100K+ = validated demand)
- **Community size:** Relevant subreddits, forums, Discord servers have large memberships?
- **Engagement:** Problem-related posts consistently get high engagement (not one-off viral post)?
- **Willingness to pay:** Any evidence people would pay? (discussions about pricing, existing paid products in adjacent space)
- **Note:** This replaces "Market Size" from v2.0. We're validating DEMAND (people want this solved) without rewarding CROWDEDNESS (lots of competitors).

**Total Score: 5-50 points per problem**

**Disqualifiers (immediate elimination, regardless of score):**
- Well-served problem (3+ good products with 4+ star ratings, active development)
- Crowded market (5+ funded competitors, even if gaps exist)
- Requires hardware/physical product (config is software-focused)
- Needs proprietary data we can't access (e.g., real-time stock feeds, medical records)
- Heavily regulated without clear compliance path (HIPAA, banking regs)
- Technical complexity beyond configured stack scope
- No monetization path (purely free/open-source space, zero willingness to pay)
- Platform mismatch (mobile-only problem when config is web-app, unless web solution viable)
- Zero demand validation (no search volume, no app downloads, no community — just one Reddit post)

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

## Discovery Strategy Used
[Which of the 4 strategies was applied]

## Score: [X]/50
- **Pain Intensity:** X/10 - [Evidence summary]
- **Evidence Breadth:** X/10 - [Source count and diversity]
- **Solution Gap:** X/10 - [Current solution landscape - what exists, why it's bad/missing]
- **Buildability:** X/10 - [Platform fit, stack alignment, complexity estimate]
- **Demand Validation:** X/10 - [Search volume, app downloads, community size]

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

**Objective:** Generate 15-20 novel solutions to the discovered problem

**Research Lead spawns 4 CIS personas in parallel.**

**Prompt structure for each persona:**

```markdown
Problem: [Mary's problem description from Phase 1]

Evidence Summary: [Key evidence — quotes, workarounds, solution gap]

Target Customer: [From Mary's output]

Current Landscape: [What exists now and why it's inadequate]

Your task: Generate 4-5 novel solutions that address this problem.

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
- [Quinn: TRIZ, systems thinking, root cause analysis]

Output: 4-5 solution concepts with:
- Name (creative, varied — not all compound words)
- 2-3 sentence description
- How it solves the problem (specifically, not generically)
- What's NOVEL about this approach (why hasn't anyone done this?)
- Why it fits the constraints (platform, business model, stack)
```

**Carson (Brainstorming Coach):**
- Divergent thinking, volume over judgment
- 4-5 wild ideas, some unconventional
- Naming style: Playful, unexpected (e.g., "Done-ish", "Oops")

**Victor (Innovation Strategist):**
- Blue Ocean strategy, disruptive angles
- 4-5 ideas that avoid incremental thinking
- Naming style: Metaphorical, strategic (e.g., "Lighthouse", "Canvas")

**Maya (Design Thinking Coach):**
- Human-centered, empathy-driven
- 4-5 ideas focused on user experience and emotional needs
- Naming style: Evocative, emotional (e.g., "Peace", "Clarity")

**Quinn (Creative Problem Solver):**
- TRIZ, systems thinking, root cause
- 4-5 ideas that solve underlying system issues
- Naming style: Action-oriented, outcome-focused (e.g., "Track", "Fix")

**Research Lead collects all solutions (16-20 total), prepares for Phase 4**

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

**5 dimensions (1-10 each):**

**Novelty (1-10):**
- How unique is this approach?
- Does a direct competitor already do this exact thing?
- Is there a genuinely novel angle or insight?
- Would this make someone say "huh, that's clever" — not just "oh, another [category] app"?

**Problem-Solution Fit (1-10):**
- Does this actually solve the discovered problem well?
- Does it address the ROOT CAUSE or just symptoms?
- Would target customers see immediate value?
- Is the solution aligned with how customers experience the problem?

**Feasibility (1-10):**
- Can this be built as a [platform from config]?
- Does it fit our stack?
- Complexity within solo dev scope (40-60 stories)?
- Technical risks manageable?

**Differentiation (1-10):**
- How clearly does this stand apart from existing solutions?
- Could you explain the difference in one sentence?
- Defensibility — can competitors easily copy the novel aspect?

**Monetizability (1-10):**
- Clear path to revenue?
- Obvious pricing model? (subscription, one-time, freemium, usage-based)
- Willingness to pay validated or inferable?
- Retention/stickiness potential?

**Total: 5-50 points per solution**

#### 3. Select Top Solution (1 min)

- Pick highest scoring solution
- If tied, prefer higher **Novelty** score (novel > incremental)
- Document reasoning — specifically WHY this approach is different from existing solutions

**Mary's Output:**

```markdown
# SELECTED SOLUTION

## Concept: [Name from CIS]
[2-3 sentence description from CIS]

## Score: [X]/50
- **Novelty:** X/10 - [What's genuinely new about this approach]
- **Problem-Solution Fit:** X/10 - [How well it addresses the discovered problem]
- **Feasibility:** X/10 - [Technical fit assessment]
- **Differentiation:** X/10 - [How it stands apart]
- **Monetizability:** X/10 - [Revenue path assessment]

## Why This Solution Won
[What made this stand out — specifically the novel angle]

## How It's Different From What Exists
[If competitors exist: specific comparison showing our novel approach]
[If no competitors: why this approach is the right first-mover strategy]

## Platform/Stack Alignment
- ✅/❌ [Platform fit]
- ✅/❌ [Stack fit]
- ✅/❌ [Business model fit]
- ✅/❌ [Scope fit]
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

### Phase 5: Competitive Deep-Dive - Mary (8-12 min)

**Objective:** Deep validation of the selected solution — feasibility, competitive position, business model

**Config Reminder:**
Research Lead reminds Mary:
```markdown
Constraints (reminder):
- Platform: [from config]
- Business Model: [from config]
- Stack: [from config]

Validate feasibility and competitive position within these constraints.
Remember: We chose this problem BECAUSE it's underserved. The deep-dive should 
confirm that and flesh out the business case, not re-validate market size.
```

**Mary's deep research:**

#### 1. Competitive Analysis (3-4 min)

**Identify all competitors (if any):**
- Direct competitors (same solution to same problem)
- Indirect competitors (different solution to same problem)
- Adjacent competitors (same target customer, different problem)

**For each competitor, research:**
- Features offered and what's missing
- Pricing model and tiers
- User sentiment (reviews, ratings, complaints)
- Active development or stagnant?
- Funding/traction (users, revenue, growth)

**Feature comparison matrix:**
| Feature | Competitor A | Competitor B | Our Approach |
|---------|-------------|--------------|--------------|
| [Core feature 1] | ✅ | ❌ | ✅ |
| [Core feature 2] | ❌ | ✅ | ✅ Better |
| [Our novel approach] | ❌ | ❌ | ✅ Unique |

**If no direct competitors exist:** Research adjacent solutions and workarounds people use. This validates the problem is real AND confirms the solution space is open.

#### 2. Novelty Assessment (2-3 min)

**Is our approach truly novel?**
- Similar products that tried and failed? (why did they fail? can we avoid those mistakes?)
- What makes our angle fundamentally different?
- Risk of replication (how easily can competitors copy us?)

#### 3. Feasibility Deep-Dive (2-3 min)

**Technical requirements validation:**
- **APIs needed:** Do they exist? Cost? Rate limits?
- **Data requirements:** Can we get the data needed? Legal?
- **Platform fit:** Confirmed alignment with config
- **Stack fit:** Can our configured stack handle this?
- **Regulatory considerations:** Privacy, compliance, ToS
- **Development complexity estimate:** Story count, epic breakdown, technical risks

#### 4. Business Model Validation (1-2 min)

**Pricing strategy:**
- Based on competitor analysis (or adjacent market pricing if no direct competitors)
- Value-based pricing (what's it worth to solve this problem?)
- Willingness to pay signals

**Revenue potential:**
- Market size estimate (TAM/SAM)
- Penetration assumptions
- Revenue projection

**Customer acquisition:**
- Organic channels (SEO, content, communities, Product Hunt)
- Where do target users hang out online?

**Retention indicators:**
- Usage frequency
- Switching costs / data lock-in
- Value accumulation over time

**Mary's Output:** Full competitive deep-dive report (same format as v2.0)

**GO / NO-GO decision:**
- **GO:** Proceed to Phase 6
- **NO-GO:** Abort session, clean registry, announce to Kelly with reasoning, **self-close session** (Phase 6 step 6)

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

**3. Compile intake.md (2-3 min)**

Research Lead compiles all outputs into final brief at `projects/ideas/${PROJECT_ID}/intake.md` following the intake template:

```markdown
# [PRIMARY NAME from Carson]

**Alternative Names:** [Name2], [Name3], [Name4]
**Generated:** [Date] CST
**Research Lead Session:** [session key]
**Discovery Strategy:** [Which strategy was used]

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

## Appendix

### Research Session Details
- **Session:** [key]
- **Duration:** [minutes]
- **Discovery Strategy:** [which one]
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
🔍 Discovery Strategy: [strategy used]

**Problem:** [1-sentence problem description]
**Why Underserved:** [1-sentence solution gap]
**Solution:** [1-sentence solution description]
**What's Novel:** [1-sentence novelty pitch]
**Score:** [X]/50
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
│   │   ├── intake.md                              # Comprehensive research document
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
| **intake.md** | Comprehensive research brief with all phases compiled | Research Lead | Phase 6 |
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

## Strategy Rotation

### Research Lead's Responsibility

Before spawning Mary, Research Lead:
1. Reads project registry
2. Checks which strategies have been used recently (`discoveryStrategy` field)
3. Assigns a DIFFERENT strategy than recent sessions
4. Extracts previous problem descriptions for registry awareness

**Rotation logic:**
- If all 4 strategies used recently: restart rotation
- If batch run (5 parallel): assign different strategies to each (with overlap if >4)
- Track via `discoveryStrategy` field in registry entries

### Strategy Effectiveness Tracking

Over time, track which strategies produce:
- Highest scoring problems (best opportunities)
- Most diverse output (least convergence)
- Highest implementation success rate

Use this data to weight strategy assignment (future enhancement).

---

## Timeline

### Per Research Lead Session

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Problem Discovery (Mary) | 12-17 min | 12-17 min |
| Phase 2: Registration + LLM Dedup (RL) | 3-4 min | 15-21 min |
| Phase 3: CIS Ideation (4 personas parallel) | 5-8 min | 20-29 min |
| Phase 4: Solution Selection (Mary) | 5-8 min | 25-37 min |
| Phase 5: Competitive Deep-Dive (Mary) | 8-12 min | 33-49 min |
| Phase 6: Compilation + Naming (RL + Carson) | 5-7 min | 38-56 min |

**Total: 38-56 minutes per session** (target: ~45 min average)

**Early abort scenarios:**
- Duplicate caught at CHECK 1 (Phase 2): Saves 35-50 min
- Duplicate caught at CHECK 2 (Phase 4): Saves 15-25 min
- Mary recommends NO-GO (Phase 5): Saves 5-10 min

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
- Assigned different discovery strategy (rotated)
- Mary receives registry awareness (avoids duplicate problems)
- LLM dedup prevents convergence across parallel sessions
- CIS generates novel solutions per problem

**Expected outcomes:**
- 3-5 unique briefs (1-2 may abort due to duplicate problems)
- Total time: ~45-50 min (longest session determines batch time)
- Diversity ensured by: strategy rotation + registry awareness + LLM dedup

---

## Success Metrics

### MVP Success (After 2 Weeks, 20+ Ideas Generated)

**Diversity:**
- ✅ No more than 2 ideas addressing the same domain
- ✅ At least 3 of 4 discovery strategies used across batch
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
- ❌ Don't use same discovery strategy every run (rotate for diversity)

---

**Version History:**
- **v3.0** (2026-02-18 16:25 CST): Problem-first rewrite. Inverted discovery from market-first to problem-first. Added 4 discovery strategies with rotation. Rebalanced scoring to penalize crowded markets and reward underserved problems. Added registry awareness to Phase 1. Added solution gap check (Step 2). Updated CIS prompts to demand novelty.
- **v2.0** (2026-02-18 12:08 CST): Config-driven system, LLM dedup, CIS naming via Carson.
- **v1.0** (2026-02-17): Initial implementation.
