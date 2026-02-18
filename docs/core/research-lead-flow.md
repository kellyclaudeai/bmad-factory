# Research Lead - Product Idea Generation Agent

**Version:** 2.0  
**Last Updated:** 2026-02-18 12:08 CST  
**Status:** In Development

---

## Overview

**Purpose:** Autonomous product idea generation system that discovers market pain points, validates them through research, generates novel solutions via CIS personas, and outputs comprehensive product briefs ready for Project Lead implementation.

**Key Principles:**
- **Config-driven** - Platform, business model, and stack constraints guide ALL phases
- **Zero input from Kelly** - Fully autonomous discovery within config constraints
- **Market-driven** - Ideas based on validated market demand, not abstract ideation
- **Broad → Narrow** - Start with market signals, then dive for specific pain
- **Pain + Market validation** - Both intensity AND market size required
- **LLM-based deduplication** - Semantic similarity detection prevents duplicate pain points

**Timeline:** 34-50 min per Research Lead session
**Model:** Sonnet 4.5 for all agents (balanced, cheap)
**Output:** Entry in `projects/project-registry.json` (state: `discovery`) with full intake data

**Architecture:**
- 1 Research Lead = 1 idea (parallelize for batches)
- Agent configs in `~/.openclaw/agents/{agentId}/config.json`
- Agent workspaces in `~/.openclaw/workspace-{agentId}/` (AGENTS.md, SOUL.md, TOOLS.md, memory/)
- Project Registry (`/Users/austenallred/clawd/projects/project-registry.json`) — single source of truth for all project state and deduplication

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
- Phase 1: Mary receives config for market scanning and feasibility scoring
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
- Role: Market research, pain point discovery, competitive validation, initial naming
- Model: Sonnet 4.5
- Tools: web_search, web_fetch
- Phases: Phase 1 (discovery + initial naming), Phase 4 (selection), Phase 5 (deep-dive)

**Carson (Brainstorming Coach)**
- Role: Divergent thinking, creative naming
- Model: Sonnet 4.5
- Source: `projects/bug-dictionary/_bmad/cis/agents/brainstorming-coach.md`
- Phases: Phase 3 (CIS ideation), Phase 6 (creative naming)

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
- Phases: All (coordinator - makes NO decisions, only delegates and writes files)

---

## Complete Workflow

### Phase 1: Pain Point Discovery - Mary (12-17 min)

**Objective:** Discover and validate a market pain point with BOTH pain intensity AND market size validation

**Config Awareness:**
Mary receives platform, business model, and stack constraints. These guide:
- Market scanning (B2C vs B2B sources)
- Feasibility scoring (web app vs mobile app viability)
- Target customer profiling (consumer vs business personas)

---

#### Step 1: Broad Market Scanning (2-3 min)

**Objective:** Find WHERE demand/activity exists (not specific pain points yet)

**Mary searches for market signals:**

**Sources:**
- **Google Trends:** What's growing? (search volume trends over 90 days)
- **App Store/Play Store rankings:** What categories are hot? What's new and rising?
  - Note: Mobile app success validates PAIN POINTS even if we build web solutions
  - Example: Mobile expense trackers validate budgeting pain → web solution viable
  - Cross-platform opportunity: Web app may be BETTER than mobile for some use cases
- **Product Hunt trending:** What's launching? What's getting traction?
- **VC funding news:** Where is money flowing? (indicates market belief)
- **Tech news/blogs:** What new platforms/regulations/trends are creating needs?
- **Acquisition announcements:** What pain points did acquirers pay for?

**What to look for:**
- Rising search volume (40%+ growth over 90 days)
- New product launches clustering in a space (3+ similar products in 6 months)
- Funding rounds or acquisitions (validates market belief)
- App Store category momentum (trending up, high download counts)
- Platform changes creating new needs (new APIs, regulations, user behaviors)

**Output:** 3-5 "hot zones" with momentum indicators

**Example output:**
```
1. AI productivity tools - 40% search growth, 12 PH launches this month, $200M funding in Q1
2. Subscription management - Truebill acquisition $1.2B, 8 new apps in 6 months, 4M+ downloads
3. Remote work coordination - 60% search growth since 2020, 20+ tools launched
4. Personal finance automation - Mint shutdown creating gap, 5M affected users seeking alternatives
5. Meeting efficiency tools - 35% search growth, Loom valued at $1.5B, persistent complaints
```

---

#### Step 2: Pick ONE Zone + Dive for Pain (3-4 min)

**Objective:** Within a validated market zone, find specific unmet pain

**Mary picks the highest-signal zone from Step 1, then searches for pain:**

**Search Strategy:**
- NOT "find frustration" → "find GAPS in HOT markets"
- Look for: "I use X but wish it could Y", "No tool does Z", "I tried A, B, C and none work for Y"
- Focus on UNMET needs, not just complaints about existing tools

**Sources (rotate, don't hit same ones every session):**
- **Reddit:** "What tools do you use for X?" threads → read replies for gaps
  - Look for: multiple people asking "does anyone know a tool that...", upvoted feature requests
  - Subreddits: r/productivity, r/Entrepreneur, r/SaaS, domain-specific subs
- **Hacker News:** "Ask HN: Best way to X?" → pain points in responses
  - Look for: "I built my own because nothing does Y", "we just use spreadsheets"
- **Twitter/X:** Complaints about existing tools, feature requests
  - Search: "[tool name] doesn't" or "wish [tool] could" or "why can't I"
- **Product reviews (App Store, Chrome Store, G2, Capterra):** 3-star reviews reveal gaps
  - Look for: "Great but missing X", "Would be perfect if it had Y"
- **Product Hunt comments:** What do users wish products had?
- **Support forums:** What do people struggle with repeatedly?
- **Community Discords/Slacks:** Pain points shared in #feedback or #feature-requests channels

**Time Horizons:**
- Vary between "last 7 days" (fresh, trending) and "last 6 months" (persistent, validated)
- Both are valuable: fresh = emerging opportunity, persistent = real pain

**What to capture:**
- Direct quotes showing pain ("this is impossible", "I hate that", "no tool does this")
- Upvote/engagement counts (validates multiple people care)
- Workarounds people built (proves pain is real enough to DIY)
- Comparisons across tools (gaps no one is solving)

**Output:** 8-12 pain point candidates with evidence

**Example output:**
```
Pain Point Candidate #1: Meeting cost invisibility
- Reddit r/managers (Feb 2026, 47 upvotes): "We have no idea how much meetings actually cost us"
- HN comment (Jan 2026): "I built a spreadsheet to track meeting costs, wish there was a tool"
- Twitter @startup_founder (Feb 2026, 120 likes): "Just realized our daily standup costs $2400/week in salaries"
- Evidence sources: [3 Reddit threads, 1 HN thread, 5 tweets]

Pain Point Candidate #2: ...
```

---

#### Step 3: Score for BOTH Pain AND Market (4-6 min)

**Objective:** Validate that pain is BOTH intense AND has market potential

**For each of the 8-12 candidates, Mary scores 1-10 across five dimensions:**

**1. Pain Severity (1-10):**
- How intense is the frustration?
- Evidence: extreme language ("hate", "nightmare", "impossible", "waste")
- Active solution-seeking behavior (people trying multiple tools, building DIY solutions)
- Urgency indicators (people need this NOW, not nice-to-have)
- Frequency of individual pain (daily annoyance > monthly annoyance)

**2. Pain Frequency (1-10):**
- How many people mention this pain?
- Engagement signals: upvotes, replies, retweets, "me too" comments
- Multiple independent sources (Reddit + HN + Twitter + reviews = strong signal)
- Geographic spread (just SF tech bubble, or nationwide/global?)
- Consistent over time (mentioned last week AND 6 months ago = persistent)

**3. Market Size (1-10):** ← CRITICAL, PREVENTS "LOUD MINORITY" TRAPS
- **Existing market validation:**
  - Competitors exist with revenue? (proves people pay)
  - Recent acquisitions/funding? (validates market belief)
  - Example: Truebill acquisition $1.2B = subscription management market validated
- **Search volume (absolute numbers, not just growth):**
  - Google Trends: 10K+ searches/month = decent, 100K+ = strong
  - Search volume is more important than growth rate (1000% growth from 100 searches = still tiny market)
- **Willingness to pay:**
  - Price discussions ("I'd pay $X/mo for this")
  - Budget allocation mentions ("we spend $X on [related tools]")
  - Competitor pricing (if people pay $20/mo for inferior solution, they'll pay for better one)
- **Target customer revenue potential:**
  - B2C consumer: $5-20/mo typical, need high volume
  - B2C prosumer: $20-50/mo, moderate volume OK
  - B2B SMB: $50-200/mo, lower volume OK
  - Platform config should guide expectations (if we're set to B2C, score B2B opportunities LOW)

**4. SaaS Feasibility (1-10):** ← PLATFORM-AWARE
- **Platform match:**
  - Config says "web-app" → Can this be built as a browser-based web application?
  - Config says "mobile-app" → Does this need native mobile features?
  - Config says "browser-extension" → Does this need browser integration?
  - Mobile-only pain points score LOW if config is web-app (unless web solution is viable)
  - Example: "Photo editing on mobile" → LOW for web-app config, HIGH for mobile-app config
  - Example: "Subscription tracking" → HIGH for web-app even though competitors are mobile (web is viable, maybe better)
- **Technical complexity:**
  - Can this be built with our stack? (specified in config)
  - Solo developer scope? (40-60 stories max, 8-12 epics)
  - No proprietary datasets needed? (can't rely on data we can't get)
  - No specialized hardware? (cameras, sensors, etc.)
  - No deep ML required? (basic API calls OK, training models not OK)
- **Legal/compliance barriers:**
  - Healthcare (HIPAA) = HIGH barrier unless we avoid PHI
  - Finance (PCI-DSS, banking regs) = HIGH barrier unless we avoid storing payment data
  - Education (FERPA) = medium barrier
  - Consumer tools = LOW barrier (just need privacy policy, ToS)
- **Competitive landscape:**
  - Competitors exist (validates market) BUT gaps exist (opportunity)
  - NOT saturated (10+ strong players with VC backing = hard to compete)
  - Market isn't "winner-take-all" (can niche players succeed, or does network effect lock in one winner?)

**5. Competitive Gap (1-10):**
- **Gap clarity:**
  - Competitors exist (proves market) BUT have clear weaknesses
  - User complaints about existing tools ("X is great but terrible at Y")
  - Feature requests that no one has implemented
  - Pricing gaps (premium tools expensive, cheap tools limited, opening in middle)
- **Differentiation opportunity:**
  - Can we build something BETTER, not just different?
  - Technical advantage (faster, simpler, more reliable)?
  - UX advantage (existing tools are clunky)?
  - Pricing advantage (freemium where others charge, or vice versa)?
  - Platform advantage (web app where others are mobile-only)?
- **Avoid:**
  - No competitors + no search volume = no market validation (score LOW)
  - Tons of competitors + no gap = saturated (score LOW)
  - Gap exists but requires tech we don't have = not feasible (score LOW in Feasibility, not here)

**Total Score: 5-50 points per pain point**

**Disqualifiers (immediate elimination, regardless of score):**
- Zero competitors AND zero search volume (no market validation)
- Requires hardware/physical product (config is software-focused)
- Needs proprietary data we can't access (e.g., real-time stock feeds, medical records)
- Heavily regulated (healthcare, banking) without clear compliance path
- Saturated market (10+ strong competitors, no clear gap)
- Technical complexity beyond web app scope (real-time video processing, custom ML models)
- No monetization path (purely free/open-source space with zero willingness to pay)
- Platform mismatch (mobile-only pain when config is web-app, unless web solution viable)

---

#### Step 4: Selection + Initial Naming (2-3 min)

**Select highest scoring pain point:**
- Pick top score (pain × market validated together)
- If tied, pick the one with strongest **Market Size** score (revenue beats volume)
- Document selection rationale

**Generate initial concept name:**
- Mary creates an analytical/descriptive name (e.g., "Subscription Management Tool", "Meeting Cost Tracker")
- This is just for registry tracking, NOT the final brand name
- Keep it simple and clear (final creative naming happens in Phase 6)

**Mary's Output Format:**

```markdown
# SELECTED PAIN POINT

## Initial Concept Name
[Descriptive name for registry tracking]

## Score: 42/50
- **Pain Severity:** 9/10 - Intense frustration, users actively seeking solutions, describing as "nightmare"
- **Pain Frequency:** 8/10 - 147 mentions across Reddit/HN in 30 days, trending upward
- **Market Size:** 8/10 - Truebill acquired $1.2B validates market, 10M+ searches/month, users discussing $10-30/mo pricing
- **SaaS Feasibility:** 9/10 - Web app viable, moderate complexity, clear tech stack fit, B2C matches config
- **Competitive Gap:** 8/10 - 3 major competitors, all missing [specific feature], users complaining about [weakness]

## Pain Point Description
[2-3 sentence description of the pain point]

## Market Validation
**Market Size Indicators:**
- Competitors: [Competitor A] ($1.2B acquisition), [Competitor B] (4M+ users), [Competitor C] ($50M funding)
- Search volume: 10M+ monthly searches for "[related terms]"
- Willingness to pay: Reddit threads show $10-30/mo acceptable, competitor pricing at $5-15/mo

**Willingness to Pay Evidence:**
- Reddit r/personalfinance: "I'd pay $20/mo if it actually worked"
- Competitor revenue: Truebill $100M ARR before acquisition (proves monetization)
- Budget discussions: Users mention $15/mo for existing tools

**Target Customer:**
- Primary: B2C consumers (matches config), ages 25-45, tech-savvy
- Secondary: Prosumers (freelancers, side hustlers)
- Revenue potential: $15/mo avg, 100K users = $18M ARR at scale

## Pain Evidence
**Reddit Threads:**
- r/productivity (Feb 2026, 47 upvotes): "[direct quote showing pain]"
- r/Frugal (Jan 2026, 120 upvotes): "[direct quote]"

**Hacker News:**
- "Ask HN: Best tool for X?" (Jan 2026, 34 comments): "[quote from comment]"
- "Show HN: I built Y to solve Z" (Feb 2026): "[pain description]"

**Twitter/X:**
- @user (Feb 2026, 85 likes): "[tweet showing pain]"
- @another_user (Jan 2026, 200 retweets): "[tweet]"

**Product Reviews:**
- [Competitor A] App Store (3-star reviews): "Great but missing [feature]"
- [Competitor B] Chrome Store: "Would be 5 stars if it could [feature]"

**Evidence Summary:**
- 23 Reddit posts (15-50 upvotes each)
- 12 HN threads/comments (high engagement)
- 34 tweets (100+ likes/retweets)
- 400+ combined app reviews mentioning gap

## Competitive Landscape
**Direct Competitors:**
- **[Competitor A]:** [What they do], [weakness/gap], [pricing]
- **[Competitor B]:** [What they do], [weakness/gap], [pricing]
- **[Competitor C]:** [What they do], [weakness/gap], [pricing]

**Indirect Competitors:**
- [Related tool 1]: Solves adjacent problem
- [Related tool 2]: Partial solution, not focused on this pain

**Gap Identified:**
All competitors are missing [specific feature/approach]. Users in reviews and forums consistently asking for [specific capability]. Our differentiation opportunity: [how we'd be better].

**Market Positioning:**
- Existing solutions serve [segment], we can target [different segment or approach]
- Pricing gap: Premium at $30+/mo, basic at $5/mo → opportunity at $15/mo sweet spot
- Platform gap: All mobile-only → web app could be BETTER for [use case]

## Target User Profile
- **Who:** [Demographics, role, context]
- **Pain frequency:** [How often they experience this - daily, weekly, monthly]
- **Current workaround:** [What they do now - DIY, multiple tools, manual process]
- **Impact:** [Cost/time/stress impact of the pain]
- **Willingness to pay:** [Price sensitivity, budget availability]

## Selection Rationale
[Why this pain point scored highest - balance of pain intensity, market size, feasibility, and competitive gap]
```

**This output is handed to Research Lead for Phase 2.**

---

### Phase 2: Registration + Deduplication (3-4 min)

**Research Lead actions:**

#### Registry Checkpoint - CHECK 1 (LLM-Based Pain Point Deduplication)

**Objective:** Prevent researching duplicate pain points (even if solution approaches differ)

**Process:**

1. **Read registry:** Extract all existing pain point descriptions
   - `inProgress[]` - active Research Lead sessions
   - `historical[]` - completed projects

2. **If registry is empty:** Skip dedup check, proceed to registration

3. **If registry has entries:** Evaluate semantic similarity using reasoning

**Research Lead evaluates (with thinking enabled):**

```markdown
Task: Determine if the new pain point is fundamentally the same as any existing pain point.

New Pain Point:
[Mary's pain point description - 2-3 sentences]

Existing Pain Points:
1. [Historical entry 1 pain point]
2. [Historical entry 2 pain point]
3. [InProgress entry 1 pain point]
...

Question: Does the NEW pain point address the same underlying problem as any EXISTING pain point?

Critical distinction:
- **Different SOLUTIONS to the same PAIN = DUPLICATE** ❌
  - Example: "Subscription cancellation tool" vs "Subscription tracking dashboard" → BOTH solve "forgotten subscription waste" → DUPLICATE
  - Example: "Meeting scheduler" vs "Meeting cost tracker" → DIFFERENT problems (scheduling friction vs cost visibility) → NOT duplicate
  
- **Different PAINS in the same DOMAIN = NOT duplicate** ✅
  - Example: "Email inbox overload" vs "Email tracking for sales" → Same domain (email), different pains → NOT duplicate
  
- **Rephrasing the same PAIN = DUPLICATE** ❌
  - Example: "Consumers forget to cancel subscriptions" vs "Recurring charges waste money" → Same pain, different wording → DUPLICATE

Evaluate each existing pain point:
- Is the CORE PROBLEM the same?
- Would solving one fully solve the other?
- Are they targeting the same user frustration?

Answer: YES_DUPLICATE or NO_DUPLICATE

If YES_DUPLICATE, specify which existing entry matches and explain why.
```

**Decision:**
- **If `YES_DUPLICATE`:**
  - Abort session immediately
  - Clean up registry (remove this session from inProgress if added)
  - Announce to Kelly: "Duplicate pain point detected: [new] matches [existing entry]. Session aborted. Registry cleaned."
  - Clean exit
  
- **If `NO_DUPLICATE`:**
  - Proceed to registry registration

---

#### Registry Registration

**After dedup check passes, Research Lead registers concept in the project registry:**

**Registry location:** `/Users/austenallred/clawd/projects/project-registry.json`

**New entry format:**
```json
{
  "id": "subscription-tracker-2026-02-18-1200",
  "name": "Subscription Management Tool",
  "state": "discovery",
  "paused": false,
  "pausedReason": null,
  "researchSession": "agent:research-lead:20260218-1200",
  "researchPhase": "ideation",
  "timeline": {
    "discoveredAt": "2026-02-18T12:00:00-06:00",
    "lastUpdated": "2026-02-18T12:00:00-06:00"
  },
  "intake": {
    "problem": "Consumers waste $500-1500/year on forgotten subscriptions they intended to cancel but forget about until the charge hits",
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
- `researchSession`: This Research Lead session identifier
- `researchPhase`: `"ideation"` (tracks research progress within discovery state)
- `intake.problem`: Full pain point description (used for LLM dedup in future sessions)
- `intake.solution/targetAudience/keyFeatures`: Populated later in Phase 4-6

**Registry operations must be atomic:**
```javascript
const registryPath = '/Users/austenallred/clawd/projects/project-registry.json';
const tempPath = registryPath + '.tmp';

// Read existing
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Add new entry
registry.projects.push(newEntry);

// Atomic write (temp file + rename)
fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
fs.renameSync(tempPath, registryPath);
```

**Output:** Concept registered in `projects[]` with state `"discovery"`, proceed to Phase 3

---

### Phase 3: CIS Ideation (5-8 min)

**Objective:** Generate 15-20 novel solutions to the validated pain point

**Research Lead spawns 4 CIS personas in parallel.**

**Prompt structure for each persona:**

```markdown
Pain Point: [Mary's pain point from Phase 1]

Evidence Summary: [Key evidence - Reddit threads, user quotes, market size signals]

Target Customer: [From Mary's output]

Your task: Generate 4-5 novel solutions that address this pain point.

Constraints (CRITICAL - apply to all solutions):
- **Platform:** [from config - e.g., "Web application (browser-based)"]
- **Business Model:** [from config - e.g., "B2C (consumer-facing)"]
- **Stack:** [from config - e.g., "Next.js, React, TypeScript, Firebase, Tailwind CSS"]
- **Scope:** Solo developer, 40-60 stories max (8-12 epics)
- No hardware, no proprietary data requirements

Focus on your unique methodology:
- [Carson: Divergent thinking, volume over judgment]
- [Victor: Blue Ocean strategy, disruptive angles]
- [Maya: Human-centered design, empathy-driven]
- [Quinn: TRIZ, systems thinking, root cause analysis]

Output: 4-5 solution concepts with:
- Name (creative, varied - not all compound words)
- 2-3 sentence description
- How it solves the pain point
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
Research Lead reminds Mary of constraints:
```markdown
Constraints (reminder):
- Platform: [from config]
- Business Model: [from config]
- Stack: [from config]

Evaluate solutions within these constraints.
```

**Mary's process:**

#### 1. Quick Competitive Scan (3-4 min)
For each solution, search:
- Does this specific solution exist?
- How saturated is this solution space?
- What's the differentiation angle?
- User sentiment on existing solutions (reviews, complaints)

#### 2. Score Each Solution (2-3 min)

**5 dimensions (1-10 each):**

**Novelty (1-10):**
- How unique is this approach?
- Does a direct competitor already do this exact thing?
- Is there a novel angle or twist?

**Market Fit (1-10):**
- Does this actually solve the pain point well?
- Would target customers see immediate value?
- Is the solution aligned with how customers think about the problem?

**Feasibility (1-10):**
- Can this be built as a [platform from config]?
- Does it fit our stack?
- Complexity within solo dev scope (40-60 stories)?
- Technical risks manageable?

**Differentiation (1-10):**
- How much better than existing solutions?
- Clear competitive advantage?
- Defensibility (can competitors easily copy)?

**Monetizability (1-10):**
- Clear path to revenue?
- Obvious pricing model? (subscription, one-time, freemium, usage-based)
- Willingness to pay validated?
- Retention/stickiness potential?

**Total: 5-50 points per solution**

#### 3. Select Top Solution (1 min)

- Pick highest scoring solution
- If tied, prefer higher **Differentiation** score (unique > incremental)
- Document reasoning

**Mary's Output:**

```markdown
# SELECTED SOLUTION

## Concept: [Name from CIS]
[2-3 sentence description from CIS]

## Score: 44/50
- **Novelty:** 9/10 - No direct competitor does this approach, fresh angle on the pain
- **Market Fit:** 9/10 - Directly addresses the core pain, intuitive for target customer
- **Feasibility:** 9/10 - Straightforward web app build, fits our stack perfectly, ~50 stories estimated
- **Differentiation:** 9/10 - Clear advantage over existing tools ([specific advantage])
- **Monetizability:** 8/10 - Obvious SaaS subscription model, users already paying competitors $15-30/mo

## Why This Solution Won
[Mary's reasoning for selection - what made this stand out from the other 15-19 ideas]

## Initial Competitive Analysis
**Direct Competitors:**
- **[Competitor A]:** Does X, missing Y (weakness we exploit)
- **[Competitor B]:** Does Z, but [limitation] (our advantage)

**Our Differentiation:**
- [Specific feature/approach that competitors lack]
- [Platform advantage - e.g., web app vs mobile-only]
- [Pricing advantage - e.g., freemium where competitors charge]
- [UX advantage - e.g., simpler, faster, more intuitive]

## Platform/Stack Alignment
- ✅ Fits web app platform perfectly (no native mobile needed)
- ✅ Next.js + Firebase sufficient for core features
- ✅ B2C consumer model matches config
- ✅ Solo dev scope (estimated 45-55 stories)
```

---

**Registry Checkpoint - CHECK 2 (Solution-Level Deduplication):**

**Research Lead checks solution against registry:**
- Compare `conceptName` + `briefDescription` of selected solution
- Same keyword overlap logic as original (3+ significant keywords = potential duplicate)
- This catches: "Meeting Cost Calculator" vs "MeetCost Dashboard" as similar
- **If duplicate:** Abort, announce to Kelly
- **If unique:** Update registry phase to "validation", proceed to Phase 5

**Registry update (update existing entry in project-registry.json):**
```json
{
  "researchPhase": "validation",
  "intake.solution": "Automated subscription tracking and cancellation service",
  "timeline.lastUpdated": "2026-02-18T12:08:00-06:00"
}
```

---

### Phase 5: Competitive Deep-Dive - Mary (8-12 min)

**Objective:** Deep validation of the selected solution

**Config Reminder:**
Research Lead reminds Mary:
```markdown
Constraints (reminder):
- Platform: [from config]
- Business Model: [from config]
- Stack: [from config]

Validate feasibility and competitive position within these constraints.
```

**Mary's deep research:**

#### 1. Competitive Analysis (3-4 min)

**Identify all competitors:**
- Direct competitors (same solution to same pain)
- Indirect competitors (different solution to same pain)
- Adjacent competitors (same target customer, different pain)

**For each competitor, research:**
- Features offered
- Pricing model and tiers
- User sentiment (reviews, ratings, complaints)
- Market positioning (who do they serve?)
- Recent updates (active development or stagnant?)
- Funding/traction (users, revenue, growth)

**Feature comparison matrix:**
| Feature | Competitor A | Competitor B | Our Approach |
|---------|-------------|--------------|--------------|
| [Core feature 1] | ✅ | ❌ | ✅ |
| [Core feature 2] | ❌ | ✅ | ✅ Better |
| [Our differentiator] | ❌ | ❌ | ✅ Unique |
| [Platform] | Mobile-only | Mobile-only | Web (advantage for desktop users) |

#### 2. Novelty Assessment (2-3 min)

**Is our approach truly novel?**
- Patent search (basic, just check obvious conflicts via Google Patents)
- Similar products that failed (why did they fail? can we avoid those mistakes?)
- What makes our angle different from all competitors?
- Risk of replication (how easily can competitors copy us?)

#### 3. Feasibility Deep-Dive (2-3 min)

**Technical requirements validation:**
- **APIs needed:** Do they exist? Cost? Rate limits? Reliability?
  - Example: Plaid for bank connections ($0.30-1.00 per user), Stripe for payments ($0.30 + 2.9%)
- **Data requirements:** Can we get the data we need? Legal to scrape? Available via API?
  - Example: Subscription data requires bank transaction access (Plaid) or manual entry
- **Platform fit:** Does this align with our platform config?
  - Web app config → validate no native mobile features required
  - Mobile app config → validate web-only approach won't work
- **Stack fit:** Can our configured stack handle this?
  - Next.js + Firebase: Great for CRUD apps, real-time, auth
  - Limitations: Heavy computation, video processing, ML training (need specialized services)
- **Regulatory considerations:**
  - Privacy (GDPR, CCPA) - need privacy policy, data handling procedures
  - Compliance (PCI-DSS if handling payments, HIPAA if health data) - can we avoid storing sensitive data?
  - Terms of Service for third-party APIs (can we legally scrape? use their data?)
- **Development complexity estimate:**
  - Story count range (based on feature set)
  - Epic breakdown (major feature areas)
  - Technical risks (complex integrations, rate limits, data quality issues)

#### 4. Business Model Validation (1-2 min)

**Pricing strategy:**
- Based on competitor analysis
- Value-based pricing (what's it worth to solve this pain?)
- Cost-based pricing (our costs + margin)
- Psychological pricing ($9/mo vs $10/mo, annual discount)

**Revenue potential:**
- Market size (TAM/SAM from Phase 1)
- Penetration assumptions (realistic % of market we can capture)
- Rough calculation: [market size] × [penetration %] × [avg revenue per user] = [potential ARR]
- Example: 10M potential users × 1% penetration × $15/mo = $18M ARR

**Customer acquisition:**
- Organic channels (SEO, content marketing, word-of-mouth)
- Paid channels (ads, sponsorships)
- Community channels (Reddit, Product Hunt, niche communities)
- Partnership channels (integrations, affiliate programs)

**Retention indicators:**
- Switching costs (data lock-in, habit formation)
- Network effects (value increases with usage)
- Habit formation potential (daily use vs occasional)

**Mary's Output:**

```markdown
# COMPETITIVE DEEP-DIVE

## Market Landscape

**Market Size:**
- **TAM (Total Addressable Market):** [Estimate based on search volume, competitor users]
- **SAM (Serviceable Addressable Market):** [Our realistic target within TAM]
- **Evidence:** [Competitor users, search volume, industry reports]

**Direct Competitors:**
1. **[Competitor A]** - [URL]
   - Features: [What they do well]
   - Weakness: [Gap we exploit]
   - Pricing: [Tiers and prices]
   - Users: [Traction data if available]
   - Sentiment: [App Store rating, review themes]

2. **[Competitor B]** - [URL]
   - Features: [What they do well]
   - Weakness: [Gap we exploit]
   - Pricing: [Tiers and prices]
   - Users: [Traction data]
   - Sentiment: [Rating, review themes]

**Indirect Competitors:**
- [Related tool 1]: Solves adjacent problem
- [Related tool 2]: Partial solution, not focused

## Feature Comparison Matrix

| Feature | Competitor A | Competitor B | Our Approach | Advantage |
|---------|-------------|--------------|--------------|-----------|
| [Feature 1] | ✅ | ❌ | ✅ | Same |
| [Feature 2] | ❌ | ✅ | ✅ Better | [How it's better] |
| [Differentiator] | ❌ | ❌ | ✅ Unique | [Why it matters] |
| Platform | Mobile-only | Mobile-only | Web | Desktop users underserved |

## Novelty Score: 8/10

**What's New:**
[Our unique approach - specific feature, UX innovation, platform advantage, pricing model]

**Why It Matters:**
[User benefit - faster, cheaper, easier, more reliable, better UX]

**Risk of Replication:**
- Low: [If hard to copy - technical moat, data moat, brand]
- Medium: [If copyable in 6-12 months]
- High: [If trivial to copy - feature parity in weeks]
- **Assessment:** [Low/Medium/High] - [Reasoning]

**Similar Products That Failed:**
- [Product name] (shut down [year]): [Why it failed - timing, execution, market]
- Lesson learned: [What we'll do differently]

## Feasibility Assessment

**Technical Stack:**
- ✅ Platform: Web app fits perfectly (no native mobile needed)
- ✅ Stack: Next.js + Firebase sufficient for [core features]
- ✅ Frontend: React + Tailwind for [UI requirements]
- ✅ Backend: Firebase Auth + Firestore for [data model]

**APIs Needed:**
1. **[API name]** - [Purpose]
   - Cost: [Pricing model]
   - Availability: [Free tier? Rate limits?]
   - Reliability: [Uptime, stability]
   - Legal: [ToS allows our use case?]

2. **[API name]** - [Purpose]
   - [Details]

**Data Requirements:**
- [What data we need]: Available via [API/manual entry/scraping]
- [Privacy considerations]: [How we'll handle sensitive data]
- [Data quality risks]: [Accuracy, completeness, freshness]

**Development Estimate:**
- **Story count:** 40-60 stories (typical for this complexity)
- **Epic breakdown:**
  1. [Epic 1]: [Description] (~8 stories)
  2. [Epic 2]: [Description] (~12 stories)
  3. [Epic 3]: [Description] (~10 stories)
  4. [Epic 4]: [Description] (~8 stories)
  5. [Epic 5]: [Description] (~6 stories)
  6. [Epic 6]: [Description] (~8 stories)
- **Development time:** 4-6 weeks solo developer

**Technical Risks:**
1. [Risk]: [Description] - **Mitigation:** [How we'll handle it]
2. [Risk]: [Description] - **Mitigation:** [How we'll handle it]

**Regulatory Considerations:**
- ✅ Privacy: Need privacy policy, GDPR/CCPA compliance (standard for B2C)
- ✅ Payments: Use Stripe (PCI-DSS compliant), we don't store card data
- ❌ No healthcare data (HIPAA not needed)
- ❌ No financial institution (banking regs not needed)
- [Other compliance needs if any]

## Business Model

**Pricing Strategy:**
- **Recommended:** $[X]/mo (based on competitor range $[Y]-$[Z], positioned at [low/mid/high] tier)
- **Rationale:** [Value justification, competitor comparison]
- **Tiers:**
  - Free: [Limited features to hook users]
  - Pro ($[X]/mo): [Core features, target tier for most users]
  - Premium ($[Y]/mo): [Advanced features for power users] (optional)

**Revenue Potential:**
- Market size: [SAM from above]
- Realistic penetration: [0.5-2%] in first 2 years
- Avg revenue per user: $[X]/mo × 12 = $[Y]/year
- **Year 1 projection:** [Users] × $[Y] = $[ARR]
- **Year 2 projection:** [Users] × $[Y] = $[ARR]

**Customer Acquisition Channels:**

**Organic (Primary):**
1. **SEO:** Target keywords [list], content marketing around [topics]
2. **Product Hunt:** Launch campaign, aim for Product of the Day
3. **Reddit:** [Relevant subreddits] - helpful participation, not spammy promotion
4. **Word-of-mouth:** Referral program, social sharing incentives

**Paid (Secondary, if needed):**
1. **Google Ads:** Target high-intent keywords [list]
2. **Social ads:** Facebook/Instagram for B2C, LinkedIn for prosumer
3. **Sponsorships:** Podcasts, newsletters in [niche]

**Partnerships:**
1. **Integrations:** [Complementary tools] - mutual referrals
2. **Affiliates:** [Influencers, bloggers] in [niche]

**Retention Indicators:**
- **Switching costs:** [Data lock-in? Habit formation? Network effects?]
- **Usage frequency:** [Daily/weekly/monthly] - affects stickiness
- **Value accumulation:** [Does product get better with usage? Historical data?]
- **Expected churn:** [Industry benchmark for this type of product]

## Recommendation: GO / NO-GO

**[GO]** ✅

**Reasoning:**
- ✅ Strong differentiation ([specific advantage])
- ✅ Clear market gap (competitors missing [feature], users complaining)
- ✅ Feasible as web app (fits our platform config perfectly)
- ✅ Validated willingness to pay ($[X]/mo range proven by competitors)
- ✅ Clear monetization path (subscription model, proven pricing)
- ✅ Technical risks manageable (APIs available, stack alignment)
- ✅ Market size sufficient ([SAM], realistic penetration yields [ARR potential])

**[or NO-GO]** ❌

**Reasoning:**
- ❌ Too saturated ([X] strong competitors, no clear gap)
- ❌ Too complex (requires [technology] beyond our stack)
- ❌ No clear monetization path (free/open-source space, zero willingness to pay)
- ❌ Regulatory barriers (HIPAA/banking regs we can't navigate)
- ❌ Platform mismatch (requires native mobile, we're building web app)
```

**If Mary recommends NO-GO:**
- Research Lead aborts session
- Announces to Kelly with reasoning
- Cleans up registry (removes from `inProgress[]`)
- Clean exit

**If Mary recommends GO:**
- Research Lead proceeds to Phase 6 (Compilation + Naming)

---

### Phase 6: Compilation & Finalization (5-7 min)

**Research Lead actions:**

#### Registry Checkpoint - CHECK 3 (Final Safety)

1. Read registry one last time
2. Compare final concept against `inProgress[]` + `historical[]`
3. **If duplicate found:** Abort (unlikely at this stage, but safety net)
4. **If unique:** Proceed to compilation

---

#### Compilation Steps

**1. Creative Naming - Carson (2-3 min)**

**Research Lead spawns Carson for creative naming:**

```markdown
Task: Generate creative product names for this concept

Concept: [Selected solution name and description from CIS Phase 3]

Pain Point: [From Mary Phase 1]

Target Customer: [From Mary Phase 1]

Constraints:
- Platform: [from config]
- Business Model: [from config]

Requirements:
- Generate 1 PRIMARY name (your best recommendation)
- Generate 3-4 ALTERNATIVE names
- VARY naming styles (do NOT make them all compound words)

Naming styles to use:
1. **Compound Words** - MeetCost, EventSquad, TaskFlow
2. **Single Evocative Words** - Redux, Clarity, Anchor, Peace
3. **Playful/Casual** - Done-ish, Oops, Nope
4. **Descriptive Phrases** - Clear Cut, Fair Share, Now or Never
5. **Made-up Words** - Fleai (flea market + AI), Calendify
6. **Domain-style** - try.app, use.app (when concept fits)
7. **Metaphorical** - Lighthouse, Compass, Canvas
8. **Action-oriented** - Cancel, Pause, Track, Fix
9. **Outcome-focused** - Peace, Clarity, Freedom, Flow

Pick 3-4 DIFFERENT styles for the alternatives (not all the same pattern).

Output format:
**PRIMARY:** [Name] ([Style]) - [1 sentence rationale]

**ALTERNATIVES:**
- [Name 2] ([Style]) - [Why this works]
- [Name 3] ([Style]) - [Why this works]
- [Name 4] ([Style]) - [Why this works]
- [Name 5] ([Style]) - [Why this works] (optional)
```

**Carson responds with creative names using varied styles.**

---

**2. Update Registry Entry (30 sec)**

Update the existing project-registry.json entry (created in Phase 2) with final name and full intake data:

```json
{
  "id": "<slug>-YYYY-MM-DD-HHMM",
  "name": "[PRIMARY NAME from Carson]",
  "researchPhase": "complete",
  "timeline.lastUpdated": "2026-02-18T12:15:00-06:00",
  "intake": {
    "problem": "[Full pain point from Phase 1]",
    "solution": "[Solution description from Phase 4]",
    "targetAudience": "[From Phase 1 + 5]",
    "keyFeatures": ["feature1", "feature2", "..."]
  }
}
```

**ID convention:**
- Format: `<name-slug>-YYYY-MM-DD-HHMM`
- Name slug: lowercase, hyphens (e.g., "clear-cut", "done-ish", "meet-cost")
- Timestamp: Ensures ordering and uniqueness
- Example: `clear-cut-2026-02-18-1215`

---

**3. Compile intake.md (2-3 min)**

**Research Lead compiles all outputs into final brief:**

```markdown
# [PRIMARY NAME from Carson]

**Alternative Names:** [Name2], [Name3], [Name4] [, Name5]  
**Generated:** 2026-02-18 12:15 CST  
**Research Lead Session:** agent:research-lead:20260218-1200

---

## Problem Statement

### Pain Point Discovered
[Mary's pain point description from Phase 1]

### Evidence
[Summary of Mary's Phase 1 evidence - Reddit threads, HN discussions, search volume, acquisition data, etc.]

**Evidence Sources:**
- **Reddit:** [X] posts across [subreddits] (engagement: [upvotes, comments])
- **Hacker News:** [Y] threads/comments (high engagement)
- **Twitter/X:** [Z] tweets (likes/retweets)
- **Product Reviews:** [N] reviews mentioning gap/frustration
- **Search Volume:** [Google Trends data]
- **Market Validation:** [Competitor acquisitions, funding rounds]

### Target User
[User profile from Mary Phase 1]
- **Who:** [Demographics, role, context]
- **Pain frequency:** [Daily/weekly/monthly]
- **Current workaround:** [What they do now]
- **Impact:** [Cost/time/stress impact]

### Market Signals
[Willingness to pay indicators from Phase 1]
- **Competitor revenue:** [Examples with numbers]
- **Pricing discussions:** [User quotes about acceptable pricing]
- **Market size:** [TAM/SAM estimates]
- **Budget allocation:** [What users spend on related tools]

---

## Solution Concept

### Overview
[2-3 paragraph description of the selected solution from Phase 4]

### Key Features
[From CIS ideation Phase 3 and Mary's selection Phase 4]
1. **[Feature 1]:** [Description - what it does, why it matters]
2. **[Feature 2]:** [Description]
3. **[Feature 3]:** [Description]
4. **[Feature 4]:** [Description]
5. **[Feature 5]:** [Description]

### Differentiation
[What makes this different from competitors - from Mary Phase 5]
- **[Advantage 1]:** [Specific competitive edge]
- **[Advantage 2]:** [Platform/UX/pricing advantage]
- **[Advantage 3]:** [Novel approach competitors lack]

### User Journey
[Brief description of how a user would use this product - signup to value realization]

1. **Discovery:** [How user finds the product]
2. **Onboarding:** [First-time setup, minimal friction]
3. **Core loop:** [Regular usage pattern]
4. **Value moment:** [When user realizes benefit]
5. **Retention:** [Why they keep using it]

---

## Market Validation

### Competitive Landscape
[Summary from Mary's Phase 5 competitive analysis]

**Direct Competitors:**
1. **[Competitor A]** - [What they do] - **Weakness:** [Gap we exploit] - **Pricing:** [Their pricing]
2. **[Competitor B]** - [What they do] - **Weakness:** [Gap] - **Pricing:** [Their pricing]
3. **[Competitor C]** - [What they do] - **Weakness:** [Gap] - **Pricing:** [Their pricing] (if exists)

**Indirect Competitors:**
- [Related tool 1]: [How they partially address the pain]
- [Related tool 2]: [How they partially address the pain]

**Our Advantage:**
[Key differentiators that set us apart]

### Market Size
**TAM (Total Addressable Market):** [Estimate from Phase 5]  
**SAM (Serviceable Addressable Market):** [Our realistic target]  
**Evidence:** [Competitor users, search volume, industry data]

### Novelty Score
**8/10** (from Mary Phase 5)
- **What's new:** [Our unique approach]
- **Why it matters:** [User benefit]
- **Risk of replication:** [Low/Medium/High + reasoning]

---

## Technical Feasibility

### Platform & Stack
[From config + Mary's validation Phase 5]
- **Platform:** [Web app / Mobile app / Browser extension]
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore)
- **Hosting:** Vercel
- **Additional Services:** [APIs needed - Stripe, Plaid, etc.]

### Development Estimate
[From Mary Phase 5]
- **Story count:** 40-60 stories (typical for this scope)
- **Epic breakdown:**
  1. [Epic 1]: [Description] (~X stories)
  2. [Epic 2]: [Description] (~X stories)
  3. [Epic 3]: [Description] (~X stories)
  4. [Epic 4]: [Description] (~X stories)
  5. [Epic 5]: [Description] (~X stories)
  6. [Epic 6]: [Description] (~X stories) (if exists)
- **Timeline:** 4-6 weeks solo developer

### Technical Risks
[From Mary Phase 5]
1. **[Risk]:** [Description] - **Mitigation:** [How we'll handle it]
2. **[Risk]:** [Description] - **Mitigation:** [How we'll handle it]

### Regulatory Considerations
[From Mary Phase 5]
- [Privacy/compliance requirements]
- [What we need: privacy policy, ToS, etc.]
- [What we DON'T need: HIPAA, PCI-DSS (if avoided), etc.]

---

## Business Model

### Pricing Strategy
[From Mary Phase 5]
- **Recommended:** $[X]/mo (positioned [low/mid/high] tier relative to competitors)
- **Competitor range:** $[Y]-$[Z]/mo
- **Rationale:** [Value justification]

**Tiers (if applicable):**
- **Free:** [Limited features to hook users]
- **Pro ($[X]/mo):** [Core features, target tier]
- **Premium ($[Y]/mo):** [Advanced features] (optional)

### Target Customer
[Refined from Phase 1 + Phase 5]
- **Primary:** [Persona - demographics, role, needs]
- **Secondary:** [If exists - adjacent persona]
- **Business model alignment:** [B2C consumer / B2B SMB / Prosumer]

### Customer Acquisition Channels
[From Mary Phase 5]

**Organic (Primary):**
- **SEO:** [Target keywords]
- **Product Hunt:** [Launch strategy]
- **Communities:** [Reddit, forums, Discord where target users hang out]
- **Content marketing:** [Blog topics, helpful resources]
- **Word-of-mouth:** [Referral program, social sharing]

**Paid (Secondary):**
- **Ads:** [Platforms - Google, Facebook, LinkedIn]
- **Sponsorships:** [Podcasts, newsletters]

**Partnerships:**
- **Integrations:** [Complementary tools for mutual benefit]
- **Affiliates:** [Influencers in niche]

### Revenue Potential
[From Mary Phase 5]
- **Market size:** [SAM]
- **Penetration assumption:** [0.5-2%] realistic in first 2 years
- **Avg revenue per user:** $[X]/mo × 12 = $[Y]/year
- **Year 1 projection:** [Users] × $[Y] = $[ARR]
- **Year 2 projection:** [Users] × $[Y] = $[ARR]

### Success Metrics
- **Signups:** [Target] in first 30 days
- **Activation:** [Target %] complete core action (e.g., connect first account, create first project)
- **Conversion rate (free → paid):** [Target %] (industry benchmark: 2-5% for SaaS)
- **Retention:** [Target %] active after 30/60/90 days
- **NPS:** [Target score] (promoters - detractors)
- **Revenue:** $[Target] MRR by month 6, $[Target] by month 12

---

## Go-to-Market Considerations

### Launch Strategy
[Tactical plan for first 30-60 days]

**Pre-launch (Weeks 1-2):**
- Build landing page with email capture
- Create Product Hunt teaser
- Engage in relevant communities (Reddit, forums) - build credibility
- Content marketing: [X] blog posts on [topics]

**Launch (Week 3-4):**
- Product Hunt launch (aim for Product of the Day)
- Reddit posts in [subreddits] (follow community rules, provide value)
- Twitter/X announcement + engagement
- Reach out to early adopters from research phase

**Post-launch (Weeks 5-8):**
- Iterate based on feedback
- Double down on acquisition channels that work
- Build integrations with [complementary tools]
- Content marketing: [Success stories, use cases]

### Differentiation Messaging
**Positioning:** [One-sentence pitch]
- **vs [Competitor A]:** We're [our advantage]
- **vs [Competitor B]:** We're [our advantage]
- **vs [DIY approach]:** We're [easier/faster/more reliable] than [spreadsheets/manual process]

---

## Appendix

### Research Session Details
- **Research Lead Session:** agent:research-lead:20260218-1200
- **Duration:** [XX] minutes
- **Config:**
  - Platform: [from config]
  - Business Model: [from config]
  - Stack: [from config]

### CIS Personas Used
- **Carson** (Brainstorming Coach): Divergent thinking, volume generation
- **Victor** (Innovation Strategist): Blue Ocean strategy, disruptive angles
- **Maya** (Design Thinking Coach): Human-centered design, empathy-driven
- **Quinn** (Creative Problem Solver): TRIZ, systems thinking, root cause

### Mary's Research Phases
1. **Phase 1:** Pain Point Discovery (broad market scan → narrow pain dive → scoring + selection)
2. **Phase 4:** Solution Selection (competitive scan, scoring, selection from 16-20 CIS ideas)
3. **Phase 5:** Competitive Deep-Dive (market landscape, novelty, feasibility, business model)

### Source Links
[Links to Reddit threads, HN discussions, competitor sites, App Store listings, etc. - for reference and verification]

**Pain Point Evidence:**
- [Reddit thread 1]: [URL]
- [Reddit thread 2]: [URL]
- [HN thread]: [URL]
- [Twitter thread]: [URL]
- [Competitor review page]: [URL]

**Competitive Analysis:**
- [Competitor A]: [URL]
- [Competitor B]: [URL]
- [Competitor C]: [URL] (if exists)

**Market Data:**
- [Google Trends]: [URL or data snapshot]
- [App Store ranking]: [URL]
- [Funding news]: [URL]

---

**Status:** Ready for Project Lead intake  
**Next Step:** Kelly routes to Project Lead for planning

**Implementation Readiness:**
- ✅ Pain point validated (market size + pain intensity)
- ✅ Solution validated (competitive gap + feasibility)
- ✅ Business model validated (pricing + acquisition + revenue potential)
- ✅ Technical feasibility confirmed (platform fit + stack alignment)
- ✅ Go-to-market strategy outlined

**Recommended Action:** Proceed to Project Lead → BMAD planning → implementation
```

---

**4. Registry Finalization (30 sec)**

The entry already exists in `project-registry.json` (created Phase 2, updated Phase 4 and Step 2 above). Research Lead just confirms final state:

```json
{
  "researchPhase": "complete",
  "timeline.lastUpdated": "2026-02-18T12:15:00-06:00"
}
```

**Note:** Entry persists in registry FOREVER with state `"discovery"` until Project Lead picks it up and transitions to `"in-progress"`. The `intake.problem` field serves as permanent deduplication record across all future Research Lead sessions.

---

**5. Announce to Kelly (30 sec)**

```
✅ Research Complete: ClearCut

📋 Registered in project-registry.json (state: discovery)

**Pain Point:** Subscription management waste ($500-1500/year lost)
**Solution:** Automated tracking + cancellation service
**Competitive Score:** 44/50 (high novelty, strong differentiation, clear monetization)
**Development Estimate:** 45-55 stories (~5 weeks)
**Platform:** Web app (matches config)
**Business Model:** B2C subscription ($15-25/mo, proven pricing)

✅ Ready for Project Lead intake.
```

**Research Lead session ends.**

---

## Project Registry (Research Lead's Perspective)

### File Location
`/Users/austenallred/clawd/projects/project-registry.json`

**Full lifecycle spec:** `docs/core/project-registry-workflow.md`

### Structure (Research Lead relevant fields)
```json
{
  "version": "1.0",
  "projects": [
    {
      "id": "clear-cut-2026-02-18-1200",
      "name": "ClearCut",
      "state": "discovery",
      "paused": false,
      "pausedReason": null,
      "researchSession": "agent:research-lead:20260218-1200",
      "researchPhase": "complete",
      "timeline": {
        "discoveredAt": "2026-02-18T12:00:00-06:00",
        "lastUpdated": "2026-02-18T12:15:00-06:00"
      },
      "intake": {
        "problem": "Consumers waste $500-1500/year on forgotten subscriptions they intended to cancel but forget about until the charge hits",
        "solution": "Automated subscription tracking and cancellation service",
        "targetAudience": "B2C consumers, ages 25-45, tech-savvy",
        "keyFeatures": ["Email parsing for trials", "Pre-charge reminders", "One-click cancel"]
      },
      "implementation": null,
      "followup": []
    }
  ]
}
```

### Research Lead's Registry Lifecycle

**Phase 2 (Registration):**
- Create new entry in `projects[]` with state `"discovery"`, researchPhase `"ideation"`
- Populate `intake.problem` (used for dedup by future sessions)

**Phase 4 (Solution selected):**
- Update researchPhase to `"validation"`
- Populate `intake.solution`

**Phase 6 (Compilation complete):**
- Update researchPhase to `"complete"`
- Populate remaining intake fields (targetAudience, keyFeatures)
- Update `name` with Carson's creative name

**After Research Lead exits:**
- Entry stays in registry with state `"discovery"`, researchPhase `"complete"`
- Project Lead picks it up and transitions state to `"in-progress"` (see `project-registry-workflow.md`)

### Deduplication Strategy

**3 Registry Checkpoints:**

**CHECK 1 (Phase 2) - Pain Point Deduplication:**
- **Purpose:** Catch duplicate pain points early (saves 40+ min)
- **Method:** LLM-based semantic similarity (Research Lead evaluates with thinking)
- **Compares:** New pain point description vs all existing `intake.problem` fields in `projects[]`
- **Scope:** ALL entries regardless of state (discovery, in-progress, shipped, followup, paused)
- **Question:** "Is this fundamentally the same underlying problem?"
- **Action:** Abort if YES_DUPLICATE, register if NO_DUPLICATE

**CHECK 2 (Phase 4) - Solution Name Deduplication:**
- **Purpose:** Catch duplicate solution names after CIS ideation
- **Method:** Keyword overlap (3+ significant keywords in name + intake.solution)
- **Compares:** Selected solution vs all existing entries in `projects[]`
- **Action:** Abort if duplicate, update researchPhase if unique

**CHECK 3 (Phase 6) - Final Safety Net:**
- **Purpose:** Last-chance check before compilation
- **Method:** Same as CHECK 2
- **Compares:** Final concept vs all entries
- **Action:** Abort if duplicate (unlikely), proceed if unique

### Why Two Dedup Methods?

**CHECK 1 uses LLM reasoning** because:
- Pain points are conceptual (need semantic understanding)
- "Subscription waste" vs "recurring charges forgotten" = same pain, different wording
- Keyword matching too brittle for concepts

**CHECK 2/3 use keyword matching** because:
- Solution names are more literal ("ClearCut" vs "SubCancel")
- Faster than LLM call (already validated pain is unique)
- Good enough for final safety check

### Atomic Operations

**All registry operations must be atomic to prevent corruption in parallel runs:**

```javascript
const registryPath = '/Users/austenallred/clawd/projects/project-registry.json';
const tempPath = registryPath + '.tmp';

// Read existing
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Modify (add/update)
registry.projects.push(newEntry);
// or update existing:
const idx = registry.projects.findIndex(p => p.id === entryId);
registry.projects[idx] = { ...registry.projects[idx], ...updates };

// Atomic write (temp file + rename prevents corruption)
fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
fs.renameSync(tempPath, registryPath);  // atomic operation
```

**Why atomic?**
- Multiple Research Lead sessions run in parallel
- Simultaneous writes could corrupt JSON file
- Temp file + rename is atomic on all OS (either succeeds completely or fails, no partial writes)

---

## Timeline

### Per Research Lead Session

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Pain Point Discovery (Mary) | 12-17 min | 12-17 min |
| Phase 2: Registration + LLM Dedup (RL) | 3-4 min | 15-21 min |
| Phase 3: CIS Ideation (4 personas parallel) | 5-8 min | 20-29 min |
| Phase 4: Solution Selection (Mary) | 5-8 min | 25-37 min |
| Phase 5: Competitive Deep-Dive (Mary) | 8-12 min | 33-49 min |
| Phase 6: Compilation + Naming (RL + Carson) | 5-7 min | 38-56 min |

**Total: 38-56 minutes per Research Lead session** (target: ~45 min average)

**Early abort scenarios:**
- Duplicate caught at CHECK 1 (Phase 2): Saves 35-50 min
- Duplicate caught at CHECK 2 (Phase 4): Saves 15-25 min
- Mary recommends NO-GO (Phase 5): Saves 5-10 min
- Duplicate caught at CHECK 3 (Phase 6): Saves 5-7 min (rare)

### Implementation Timeline

| Phase | Task | Duration |
|-------|------|----------|
| **Phase 1** | Update CIS Agent Configs | 2 hours |
| | - Carson: Add naming task to AGENTS.md | 20 min |
| | - Victor: Update with config awareness | 20 min |
| | - Maya: Update with config awareness | 20 min |
| | - Quinn: Update with config awareness | 20 min |
| | - Test all 4 CIS agents | 40 min |
| **Phase 2** | Update Mary Agent Config | 1.5 hours |
| | - Phase 1: New discovery protocol (broad→narrow, market size) | 40 min |
| | - Phase 4: Config-aware selection | 15 min |
| | - Phase 5: Deep-dive validation | 15 min |
| | - Test Mary's new workflow | 20 min |
| **Phase 3** | Update Research Lead Agent Config | 1.5 hours |
| | - Phase 2: LLM dedup logic | 30 min |
| | - Phase 3: Config propagation to CIS spawns | 15 min |
| | - Phase 6: Carson naming spawn | 15 min |
| | - Registry management updates | 15 min |
| | - Test RL orchestration | 15 min |
| **Phase 4** | Update This Doc + Kelly AGENTS.md | 30 min |
| | - This doc already updated ✅ | - |
| | - Update Kelly spawn protocol with config passing | 15 min |
| | - Update Kelly announcement handling | 15 min |
| **Phase 5** | Testing | 1.5 hours |
| | - Single Research Lead with config | 20 min |
| | - LLM dedup test (create duplicate manually) | 20 min |
| | - Parallel 3 Research Leads (diversity check) | 30 min |
| | - Config variations test (web vs mobile, B2C vs B2B) | 20 min |

**Total Implementation: 6.5-7 hours**

---

## Batch Mode Strategy

### Kelly's Role

When user requests batch generation:
```
"Generate 5 product ideas"
```

**Kelly spawns 5 Research Leads in parallel:**

```bash
# Spawn 5 parallel Research Leads with same config
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
- Runs independently with same config constraints
- Mary discovers different pain points (internet changes hourly, sources rotate)
- LLM dedup prevents "subscription management" duplicates across sessions
- CIS generates different solutions
- Carson creates varied names (different naming styles)

**Expected outcomes:**
- 3-5 unique briefs (1-2 may abort due to duplicate pain points caught by CHECK 1)
- Total time: ~45-50 min (longest session determines batch time)
- Output: 3-5 diverse entries in `project-registry.json` (state: discovery) ready for implementation
- Diversity improved by: config-driven constraints, stochastic research (sources rotate), LLM dedup

**Kelly's announcement:**

```
🔬 Research Batch Complete (47 minutes)

Results:
✅ ClearCut - Subscription tracking & cancellation (B2C web app, $15/mo model)
✅ MeetingPulse - Meeting efficiency dashboard (B2C web app, freemium)
✅ Redux - Book re-reading tracker with timeline (B2C web app, $8/mo)
❌ Duplicate: SubGuard (matches ClearCut - same "subscription waste" pain point)
❌ NO-GO: CryptoPortfolio (Mary found market too saturated, 12 strong competitors)

3 ideas registered in project-registry.json (state: discovery)
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

### Config Constraints

**Default config:**
- Platform: web-app
- Business Model: B2C
- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS

**User can override** by specifying in request:
- "Generate a mobile app idea" → Platform: mobile-app
- "Generate a B2B idea" → Business Model: B2B
- "Browser extension idea" → Platform: browser-extension

### Single Idea

**User:** "Generate a product idea"

**Kelly action:**
```bash
openclaw gateway call agent \
  --params '{
    "message": "Generate product idea\n\nConstraints:\n- Platform: web-app\n- Business Model: B2C\n- Stack: Next.js, React, TypeScript, Firebase, Tailwind CSS",
    "sessionKey": "agent:research-lead:'$(date +%Y%m%d-%H%M)'",
    "idempotencyKey": "'$(uuidgen)'"
  }' \
  --expect-final --timeout 3600000
```

Monitor for completion (~45 min), then announce result.

### Batch Ideas

**User:** "Generate 5 product ideas"

**Kelly action:**
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

Monitor all sessions, announce batch results.

### After Research Complete

1. Idea registered in `projects/project-registry.json` (state: `discovery`)
2. Announce to user:
   - Project name (Carson's creative name)
   - Pain point summary
   - Solution summary
   - Platform/business model alignment
   - Development estimate
   - Revenue potential
3. Ask: "Ready to implement?" → spawn Project Lead if yes
```

---

## Success Metrics

### MVP Success (After 2 Weeks, 20+ Ideas Generated)

**Diversity:**
- ✅ No more than 2 ideas in same pain point category (e.g., max 2 subscription-related)
- ✅ Varied naming styles (not all compound words)
- ✅ Multiple target customer segments

**Quality:**
- ✅ Pain point evidence: 3+ sources per brief (Reddit + HN + Twitter minimum)
- ✅ Market size validation: Competitor revenue or search volume data in every brief
- ✅ Competitive analysis: 2+ direct competitors identified
- ✅ Feasibility: 100% of briefs match platform config constraints
- ✅ 90%+ briefs pass Project Lead intake review (John accepts without major changes)

**Efficiency:**
- ✅ Average session time: 40-50 min (target)
- ✅ <10% abort rate due to duplicates (LLM dedup working)
- ✅ <5% NO-GO rate from Mary (pain points are pre-validated by market scanning)

### Quality Metrics

**Per brief:**
- Pain severity: 7+ / 10
- Market size: 7+ / 10
- SaaS feasibility: 8+ / 10
- Competitive gap: 7+ / 10
- Overall score: 40+ / 50

**Evidence standards:**
- 3+ independent sources (Reddit, HN, Twitter, reviews)
- Quantitative data (search volume, competitor users, engagement metrics)
- Direct user quotes showing pain
- Willingness to pay signals (pricing discussions, competitor revenue)

---

## Future Enhancements (Post-MVP)

### Manual Mode
- User provides specific problem or domain
- Mary researches that specific area (skip Step 1, go straight to Step 2 with user-defined zone)
- Rest of flow unchanged
- Timeline: +2 hours implementation (Kelly AGENTS.md update)

### Enhanced Config Options
```json
{
  "platform": "web-app | mobile-app | browser-extension | desktop-app",
  "businessModel": "B2C | B2B | prosumer | marketplace",
  "targetRevenue": "subscription | one-time | freemium | usage-based | ads",
  "complexity": "solo-dev | small-team | enterprise",
  "geography": "US-only | global | emerging-markets",
  "niche": "productivity | health | finance | social | education | entertainment"
}
```

### Multi-Angle Batching
- User provides 5 different configs (5 platform/business model combinations)
- Each Research Lead gets different config
- Ensures diversity across batch (web app + mobile app + extension all in one batch)

### Feedback Loop
- Track which briefs get implemented (Project Lead acceptance rate)
- Track which projects ship successfully (completion rate)
- Track which projects get user traction (success rate)
- Tune Mary's scoring weights based on outcomes
- Refine config constraints based on success patterns

### Registry Analytics
- Track most common pain point categories
- Identify gaps in research coverage (underserved verticals)
- Monitor duplicate patterns (which pain points keep getting rediscovered?)
- Suggest new config combinations to explore

---

## Rollback Plan

If Research Lead v2 fails in production:

### Immediate Actions

1. **Disable spawning:**
   - Comment out Research Lead spawn protocol in Kelly AGENTS.md
   - Restart gateway
   - Stop any running Research Lead sessions

2. **Preserve work:**
   - Keep all agent configs (for debugging)
   - Keep registry (for analysis)
   - Keep any generated briefs (may still be valuable)

3. **Revert to v1 (if needed):**
   - Git checkout previous version of docs/core/research-lead-flow.md
   - Restore old Mary/Carson/RL AGENTS.md files from git
   - Clear registry and start fresh

### Investigation

1. **Check Research Lead transcripts:**
   - Which phase failed?
   - LLM dedup working correctly?
   - Config propagation working?

2. **Check Mary transcripts:**
   - New discovery protocol working?
   - Market scanning finding diverse pain points?
   - Scoring logic producing good results?

3. **Check CIS transcripts:**
   - Receiving config constraints?
   - Naming diversity improved?

4. **Check registry:**
   - Corruption from parallel writes?
   - Dedup logic catching real duplicates?
   - False positives (unique ideas marked duplicate)?

### Quick Fixes

**Common issues + solutions:**

1. **LLM dedup too aggressive (false positives):**
   - Refine prompt: clarify "different solutions to same pain = duplicate"
   - Add examples to prompt
   - Increase threshold (require stronger similarity)

2. **LLM dedup too lenient (false negatives):**
   - Strengthen prompt: emphasize "same core problem = duplicate"
   - Add more examples of duplicates
   - Decrease threshold (catch looser similarities)

3. **Mary not finding diverse pain points:**
   - Check source rotation logic
   - Verify freshness (is she looking at recent discussions?)
   - Add more sources to Step 1 list

4. **Config not propagating:**
   - Check RL spawn messages to sub-agents
   - Verify config parsing
   - Add logging to confirm config received

5. **Carson naming still repetitive:**
   - Strengthen naming diversity requirement in prompt
   - Add negative examples ("don't do this")
   - Increase variety requirement (4-5 different styles, not 3-4)

6. **Registry corruption:**
   - Check atomic write operations
   - Add file locking if needed
   - Implement retry logic for write failures

### Re-enable

1. **Test in isolation:**
   - Single Research Lead spawn
   - Manual verification of each phase
   - Check registry operations

2. **Test config variations:**
   - Web app vs mobile app
   - B2C vs B2B
   - Verify constraints applied correctly

3. **Test parallel runs:**
   - 3 Research Leads simultaneously
   - Verify no registry corruption
   - Check diversity of outputs

4. **Re-enable Kelly spawn protocol:**
   - Uncomment in AGENTS.md
   - Restart gateway
   - Monitor first few production runs closely

---

## Notes for Implementer

### Key Principles

1. **Research Lead is DUMB**
   - Pure orchestrator, zero decisions
   - Only spawns agents, collects outputs, writes files
   - All intelligence lives in Mary and CIS personas

2. **Mary is SMART**
   - All research, all scoring, all selections
   - Understands config constraints deeply
   - Validates market size + pain intensity together

3. **Carson is CREATIVE**
   - Handles ALL naming (final brand names)
   - Mary only creates temp analytical names for registry
   - Varies naming styles to prevent repetition

4. **CIS are FOCUSED**
   - Each has unique methodology (divergent, Blue Ocean, empathy, TRIZ)
   - Receive config constraints, apply to their domain
   - Generate solutions, don't validate (Mary validates)

5. **Config is KING**
   - Drives ALL decisions (Mary's market scanning, feasibility scoring, CIS solution generation)
   - Propagates to every phase
   - Ensures output matches operator intent (web app, B2C, etc.)

6. **LLM Dedup is CRITICAL**
   - Keyword matching too brittle for concepts
   - LLM reasoning catches "same pain, different wording"
   - Prevents wasting 40 min researching duplicates

### Common Pitfalls to Avoid

- ❌ Don't make Research Lead choose solutions (that's Mary's job)
- ❌ Don't make CIS validate ideas (that's Mary's job)
- ❌ Don't make Mary generate final creative names (that's Carson's job)
- ❌ Don't skip config in sub-agent spawns (breaks constraint awareness)
- ❌ Don't use keyword matching for pain point dedup (use LLM reasoning)
- ❌ Don't forget atomic registry writes (parallel runs will corrupt JSON)

### Debugging Tips

**Research Lead transcript:**
- Shows all phase transitions
- Shows registry checkpoint results (duplicate? unique?)
- Shows spawn messages to sub-agents (config included?)

**Mary transcript:**
- Shows discovery sources (is she rotating sources?)
- Shows scoring logic (are scores reasonable?)
- Shows selection reasoning (why this pain point / solution?)

**CIS transcripts:**
- Show solution ideas (are they creative? diverse?)
- Show config awareness (do solutions fit platform constraints?)
- Show naming styles (are they varied?)

**Carson transcript (Phase 6):**
- Shows naming rationale
- Shows style diversity
- Check for repetitive patterns

**Registry file:**
- Shows coordination state
- Check for duplicates (should be caught before registration)
- Check for corruption (malformed JSON)

### Performance Tuning

**If phases too slow:**
- Phase 1: Reduce source count in Step 1 (5 zones → 3 zones)
- Phase 3: Reduce CIS output (4-5 ideas each → 3-4 ideas each)
- Phase 5: Reduce competitive analysis depth (less detail in feature matrix)
- Phase 6: Carson naming can be shortened if quality maintained

**If too many duplicates:**
- Strengthen LLM dedup prompt (more examples)
- Add CHECK 2.5 (solution-level LLM dedup instead of keyword matching)

**If not enough diversity:**
- Strengthen source rotation requirement (Mary must use different sources each session)
- Add temporal variation (vary time horizons - last 7 days vs last 6 months)
- Add config variations (Kelly spawns with different business models)

**Target timeline: 45 min average** (acceptable range: 38-56 min)

---

**Status:** Ready for implementation 🚀  
**Version:** 2.0  
**Last Updated:** 2026-02-18 12:08 CST  
**Next Step:** Begin implementation - update agent configs (Mary, Carson, Research Lead), then test single run
