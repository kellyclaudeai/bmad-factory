# Research Lead Plan

**Created:** 2026-02-16 20:06 CST  
**Status:** Draft

## Context

Need to identify simple, sellable app ideas for fast mode testing and potential production deployment.

## Criteria for Fast Mode Test Projects

### Technical Requirements
- **Build time:** 30-60 minutes total (planning + implementation + TEA)
- **Tech stack:** Simple web app (React/Next.js + lightweight backend or client-only)
- **Complexity:** Single-page or minimal multi-page UI
- **No heavy integrations:** Avoid complex APIs unless they're core to the value prop

### Business Requirements
- **Has utility:** Solves a real problem people search for
- **Sellable:** Clear monetization path (freemium, one-time purchase, subscription)
- **Not oversaturated:** Doesn't already have 100 free alternatives
- **Visual impact:** Can show screenshots/demos that look valuable

### Success Metrics
- Builds and deploys without issues
- Core functionality works end-to-end
- User can see immediate value in first 30 seconds
- Could theoretically charge $5-20/month for premium features

---

## Ideas Generated (2026-02-16)

### Batch 1 (Rejected)
1. **QR Code Generator** - rejected (already exists everywhere)

### Batch 2 (Strong Candidates)

#### 1. Screenshot Beautifier 📸
- **Concept:** Drop screenshot → add browser chrome, shadows, gradient backgrounds
- **Target market:** Content creators (docs, tweets, presentations)
- **Tech:** React + canvas API
- **Monetization:** Free with watermark, $5/mo unlimited
- **Build time:** 45-60 min
- **Why strong:** Visual impact, immediate "wow" factor, clear value

#### 2. Meeting Cost Calculator 💸
- **Concept:** Real-time meeting cost ticker based on attendee salaries/titles
- **Target market:** Productivity advocates, managers
- **Tech:** React + timer (client-only)
- **Monetization:** Free tool → lead gen, or freemium with team analytics
- **Build time:** 30-45 min
- **Why strong:** Makes people feel the pain viscerally, viral potential

#### 3. Cron Expression Builder ⏰
- **Concept:** Visual interface → generates cron syntax + shows next 5 run times
- **Target market:** Developers (everyone googles "cron expression")
- **Tech:** React + cronstrue library
- **Monetization:** Free basic, charge for webhook testing or team schedules
- **Build time:** 45-60 min
- **Why strong:** Clear utility, technical audience willing to pay

### Batch 3 (Existing Projects - Web Conversions)

#### 4. Fasting Timer (Web) ⏱️
- **Concept:** Convert iOS fasting-timer to web app
- **Source:** `/projects/fasting-timer/intake.md`
- **Features:** Timer, progress ring, history, localStorage
- **Target market:** Intermittent fasting users (huge market)
- **Build time:** 45-60 min
- **Why strong:** Proven concept, daily-use tool, wellness market

#### 5. Hydration Tracker (Web) 💧
- **Concept:** Convert iOS hydration-tracker to web
- **Source:** `/projects/hydration-tracker/intake.md`
- **Features:** Water intake tracking, daily goals, visual progress
- **Build time:** 30-45 min

#### 6. Bug Dictionary (Web) 🐛
- **Concept:** Web version of bug identifier
- **Source:** `/projects/bug-dictionary/intake.md`
- **Features:** Upload photo → AI identifies bug
- **Build time:** 45-60 min (API integration adds complexity)

---

## Missing Context: Project Ideas Queue

**Issue:** User mentioned ~40 app ideas from previous brainstorming sessions saved somewhere in `/clawd`

**Search conducted:**
- All markdown/txt/json files in `/clawd` (3 levels deep)
- Memory files, docs, business-plans, skills, scripts
- Git history for deleted files
- Files with 40+ list items
- Archived folders (skipped - very large)

**Not found:** No file matching "queue", "ideas", "backlog" with large list of app concepts

**Possible locations:**
- Archived folders (not yet searched)
- Different machine/workspace
- External storage (Supabase, Google Docs, notes app)
- Never committed to disk

**Action needed:** User to clarify location or recreate list

---

## Recommended Next Steps

### Immediate (Fast Mode Test #2)
1. **Pick one project from Batch 2 or 3** - recommend **Screenshot Beautifier** (highest visual impact)
2. Create intake.md with detailed requirements
3. Route to Project Lead with fast mode flag
4. Monitor Barry quick-spec → parallel stories → TEA workflow
5. Deploy to Vercel for immediate testing

### Short-term (Project Ideas Pipeline)
1. **Locate or recreate ideas list** - the ~40 brainstormed concepts
2. **Categorize by effort:** Quick wins (30-60min), Medium (2-4hr), Complex (1-2 days)
3. **Prioritize by market:** Search volume, competition, monetization potential
4. **Create lightweight intake.md templates** for top 10 ideas

### Medium-term (Research Lead Multi-Phase Workflow)

**Proposed 4-Phase Research Pipeline:**

#### **Phase 1: Problem Framing**
- **Owner:** Operator (user) or Research Lead orchestrator
- **Input:** Problem statement or market opportunity
- **Output:** Clear problem brief for ideation

#### **Phase 2: Creative Ideation (CIS Personas)**
**CIS = Creative and Innovation Specialists**

Spawn 3-4 specialized personas in parallel:

**Carson (Brainstorming Coach):**
- **Role:** Master Brainstorming Facilitator + Innovation Catalyst
- **Strength:** Divergent thinking, volume generation, "YES AND" building
- **Style:** Enthusiastic improv coach, wild ideas without self-censorship
- **Output:** 5 raw creative explorations, breakthrough possibilities
- **Principle:** "Wild ideas today become innovations tomorrow"

**Victor (Innovation Strategist):**
- **Role:** Business model innovation, Blue Ocean Strategy, Jobs-to-be-Done
- **Strength:** Strategic thinking, disruptive angles, competitive differentiation
- **Style:** Chess grandmaster - bold declarations
- **Output:** 5 disruptive business model approaches
- **Principle:** "Incremental thinking means obsolete" ← **directly addresses "avoid same 20 ideas" goal**

**Dr. Quinn (Creative Problem Solver):**
- **Role:** TRIZ, Theory of Constraints, Systems Thinking (aerospace engineer background)
- **Strength:** Root cause analysis, systematic problem-solving
- **Style:** Sherlock Holmes + playful scientist
- **Output:** 5 systematic solutions addressing root causes
- **Note:** May overlap with Mary's Phase 3 validation - consider optional

**Maya (Design Thinking Coach):**
- **Role:** Human-centered design, empathy mapping, user journey focus
- **Strength:** User-centered innovation grounded in real workflows
- **Style:** Jazz musician - improvises, sensory metaphors
- **Output:** 5 empathy-driven design approaches
- **Principle:** "Design WITH users not FOR them"

**Phase 2 Output:** 15-20 raw approaches (5 per persona)

---

#### **Phase 3: Validation & Filtering (Mary)**
- **Owner:** Mary (Analytical Validator) - single subagent
- **Input:** 15-20 raw approaches from CIS personas
- **Validation criteria:**
  - **Competitive check:** Does it already exist? How saturated?
  - **Feasibility study:** Is it buildable with our stack/resources?
  - **Pain point evidence:** Is the problem real? Do people search for solutions?
  - **Business model viability:** Can we monetize? What's the pricing model?
  - **Novelty assessment:** Is it architecturally different or incremental?
- **Tools:** web_search, web_fetch, competitor analysis, market research
- **Output:** 3-5 validated approaches (ranked by viability)

---

#### **Phase 4: Operator Strategic Choice**
- **Owner:** Operator (user)
- **Input:** 3-5 validated approaches from Mary
- **Decision:** Pick one approach to develop fully
- **Output:** "I like #2, go deep on that one"

---

#### **Phase 5: Product Brief Compilation**
- **Owner:** Research Lead (orchestrator)
- **Input:** Operator's chosen approach + Mary's validation data
- **Output:** Complete intake.md ready for Project Lead
  - Problem statement
  - Solution approach (with novelty angle)
  - Target market (validated)
  - Competitive landscape
  - Business model + monetization
  - Technical requirements
  - Success criteria

---

## Consolidation Strategy Options

### **Option 1: Tiered Filtering (RECOMMENDED)**

```
Phase 2: Generate (Parallel)
├─ Carson: 5 wild ideas
├─ Victor: 5 disruptive angles
└─ Maya: 5 user-centered approaches
= 15 raw approaches

Research Lead: Merge + light dedupe (semantic similarity)
= 10-12 unique approaches

Phase 3: Mary Validation
├─ Competitive check (does it exist?)
├─ Feasibility study (is it buildable?)
├─ Pain point evidence (is problem real?)
└─ Business model viability (can we monetize?)
= 3-5 validated approaches

Phase 4: Operator Choice (Final Pick)
Research Lead presents 3-5 validated approaches
Operator: "I like #2, go deep on that"

Phase 5: Research Lead compiles full product brief
```

**Advantages:**
- CIS generates diversity (15 approaches)
- Mary filters feasibility (3-5 pass validation)
- Operator picks strategic direction (final choice)
- Clear separation: CIS = creativity, Mary = validation, Operator = decision

---

### **Option 2: CIS Consensus Round**

```
Phase 2A: Generate (Parallel)
├─ Carson: 5 ideas
├─ Victor: 5 ideas
└─ Maya: 5 ideas
= 15 approaches

Phase 2B: CIS Consolidation (One persona judges)
Spawn Victor again (or a "judge" CIS persona):
Input: All 15 approaches
Task: "Rank top 5 by: novelty × market fit × feasibility"
Output: 5 ranked finalists

Phase 3: Mary Validation (deep dive on top 5)
= 3-5 validated

Phase 4: Operator Choice
```

**Advantages:**
- CIS self-filters (strategic judgment in Phase 2B)
- Mary only validates pre-filtered ideas (faster)
- Still operator final choice

**Disadvantages:**
- Extra CIS spawn (adds time)
- Victor judging his own ideas (bias risk)

---

### **Option 3: Minimal (Mary Does Everything)**

```
Phase 1: Operator describes problem
Phase 2: Mary spawns once
- Generates 5-8 ideas
- Validates feasibility
- Recommends top 3
Phase 3: Operator picks one
Phase 4: Mary writes intake.md
```

**Advantages:**
- Fastest (1 subagent vs 4+)
- Simplest orchestration

**Disadvantages:**
- Less creative diversity
- No divergent thinking phase
- Risk of "same 20 ideas" (Mary is analytical, not wildly creative)

---

## Architecture Decision (2026-02-16 20:45 CST)

**✅ Research Lead = Standalone Agent** (like Project Lead)

**Rationale:**
- Research Lead orchestrates multi-phase workflow (CIS → Mary → intake compilation)
- Kelly remains top-level router/orchestrator
- Clean separation of concerns:
  - **Kelly:** Factory orchestrator, routes work, monitors health
  - **Research Lead:** Idea validation orchestrator, drafts solid projects
  - **Project Lead:** Implementation orchestrator, ships code

**Flow:**
```
Operator: "Research [problem/market opportunity]"
    ↓
Kelly spawns Research Lead session
    ↓
Research Lead orchestrates:
  - Phase 1: Problem framing
  - Phase 2: Spawn CIS personas (Carson, Victor, Maya, Quinn?)
  - Phase 3: Spawn Mary for validation
  - Phase 4: Present options to operator
  - Phase 5: Compile intake.md for chosen approach
    ↓
Research Lead delivers intake.md to Kelly
    ↓
Kelly spawns Project Lead with validated intake.md
    ↓
Project Lead implements → TEA → Ship
```

---

## Implementation Questions

**Still open:**
1. **CIS persona selection:** Always use all 4? Or let operator pick 2-3 based on problem type?
2. **Quinn necessity:** His systematic approach overlaps with Mary's validation - worth the extra spawn?
3. **Time budget per phase:** How much research depth before diminishing returns?
4. **Persona files:** Do Carson, Victor, Quinn, Maya AGENTS.md files exist in `/clawd` or need creation?
5. **Research Lead session key format:** `agent:research-lead:project-<slug>` or something else?
6. **Handoff protocol:** Research Lead updates Kelly with intake.md path, or writes to standardized location?

---

## Research Lead Agent Requirements

**Session details:**
- **Session key format:** `agent:research-lead:project-<slug>` (parallels Project Lead)
- **Agent ID:** `research-lead` (needs AGENTS.md + config)
- **Model:** Sonnet 4.5 (orchestration + compilation tasks)
- **Workspace:** Works in `/Users/austenallred/clawd/research/<project-slug>/`

**Core responsibilities:**
1. **Spawn subagents:** CIS personas (Carson, Victor, Maya, Quinn) + Mary
2. **Consolidate outputs:** Merge/dedupe CIS raw approaches
3. **Present options:** Deliver 3-5 validated approaches to operator for choice
4. **Compile intake.md:** Full product brief with validation data
5. **Route to Kelly:** Signal completion + pass intake.md path

**Files produced:**
```
research/<project-slug>/
├── problem-brief.md           # Phase 1 output
├── carson-ideas.md            # Phase 2 Carson output
├── victor-ideas.md            # Phase 2 Victor output
├── maya-ideas.md              # Phase 2 Maya output
├── quinn-ideas.md             # Phase 2 Quinn output (optional)
├── consolidated-approaches.md # Research Lead dedupe/merge
├── mary-validation.md         # Phase 3 Mary output
├── operator-choice.md         # Phase 4 decision record
└── intake.md                  # Phase 5 final product brief
```

**Tools needed:**
- `sessions_spawn` - spawn CIS personas + Mary
- `sessions_send` - collect outputs from subagents
- `sessions_list` - monitor subagent progress
- `write` - compile intake.md
- `memory_search` / `memory_get` - recall past research patterns
- `web_search` / `web_fetch` - lightweight research (delegate heavy lifting to Mary)

**Success criteria:**
- Operator receives 3-5 validated, novel approaches (not "same 20 ideas")
- Final intake.md is comprehensive enough for Project Lead to start immediately
- Total research time: 30-60 minutes (depends on CIS persona count + Mary depth)

---

## Decision Log

**2026-02-16 20:06 CST:**
- Created this plan to capture fast mode test criteria and ideas
- Identified Screenshot Beautifier as top candidate for test #2
- Documented missing ideas queue issue
- Proposed Research Lead concept for future exploration

**2026-02-16 20:09 CST:**
- Added detailed CIS (Creative and Innovation Specialists) persona breakdown
- Documented 4 personas: Carson (Brainstorming), Victor (Innovation Strategy), Quinn (Problem Solving), Maya (Design Thinking)
- Outlined 5-phase Research Lead workflow: Problem Framing → CIS Ideation → Mary Validation → Operator Choice → Product Brief
- Documented 3 consolidation strategy options (Tiered Filtering recommended)
- Key insight: Victor's "incremental thinking means obsolete" principle directly addresses "avoid same 20 ideas" goal
- Open questions: standalone agent vs skill, persona selection, Quinn necessity, research depth limits

**2026-02-16 20:45 CST:**
- **Architecture decision:** Research Lead = standalone agent (like Project Lead)
- Research Lead orchestrates CIS + Mary, compiles intake.md, routes to Kelly
- Kelly remains top-level orchestrator
- Flow: Operator → Kelly → Research Lead → (CIS + Mary) → Operator choice → intake.md → Kelly → Project Lead
- Documented Research Lead agent requirements (session key format, workspace, tools, files produced)
- Success criteria: 3-5 novel approaches, comprehensive intake.md, 30-60 min total time

---

## Next Actions

### Immediate (Fast Mode Test #2)
**User decisions:**
1. ✅ Approve Screenshot Beautifier for fast mode test #2 (or pick different one)
2. ❓ Help locate the ~40 ideas list (or recreate it)

**Kelly next:**
- Wait for project selection
- Create intake.md for chosen project
- Spawn Project Lead with fast mode workflow

---

### Research Lead Agent Implementation
**Prerequisites:**
1. ✅ Architecture decision: Standalone agent confirmed
2. ❓ CIS persona AGENTS.md files - check if they exist or need creation:
   - `/Users/austenallred/.openclaw/agents/carson/AGENTS.md`
   - `/Users/austenallred/.openclaw/agents/victor/AGENTS.md`
   - `/Users/austenallred/.openclaw/agents/maya/AGENTS.md`
   - `/Users/austenallred/.openclaw/agents/quinn/AGENTS.md`
3. ❓ Mary validator agent - exists or needs creation?
   - `/Users/austenallred/.openclaw/agents/mary/AGENTS.md`

**Build tasks:**
1. **Create Research Lead AGENTS.md**
   - Location: `/Users/austenallred/.openclaw/agents/research-lead/AGENTS.md`
   - Orchestration logic for 5-phase workflow
   - CIS persona spawning protocol
   - Mary validation spawn protocol
   - Operator interaction protocol (present options, get choice)
   - intake.md compilation template

2. **Create CIS persona AGENTS.md files** (if missing)
   - Carson: Divergent thinking, brainstorming facilitator
   - Victor: Innovation strategy, Blue Ocean, disruptive business models
   - Maya: Design thinking, human-centered design, empathy
   - Quinn: TRIZ, systems thinking, root cause analysis (optional)

3. **Create Mary validator AGENTS.md** (if missing)
   - Competitive analysis
   - Feasibility assessment
   - Pain point validation
   - Business model analysis
   - Novelty scoring

4. **Add Research Lead to gateway config**
   - Agent ID: `research-lead`
   - Model: `anthropic/claude-sonnet-4-5`
   - Session key format: `agent:research-lead:project-<slug>`

5. **Create Research Lead skill** (optional)
   - `/Users/austenallred/clawd/skills/factory/research-lead/SKILL.md`
   - Orchestration protocol documentation
   - CIS persona descriptions
   - Mary validation criteria
   - Example research sessions

6. **Update Kelly AGENTS.md**
   - Add Research Lead spawn protocol
   - Trigger: User says "research [topic]" or "validate [idea]"
   - Handoff: Receive intake.md from Research Lead → spawn Project Lead

**Test plan:**
1. Pick a simple test problem (e.g., "Research productivity tools for remote teams")
2. Kelly spawns Research Lead
3. Research Lead spawns CIS personas (start with 2-3, not all 4)
4. Research Lead spawns Mary
5. Operator reviews 3-5 options
6. Research Lead compiles intake.md
7. Validate intake.md quality (comprehensive enough for Project Lead)

**Timeline estimate:**
- CIS + Mary AGENTS.md creation: 2-3 hours (if from scratch)
- Research Lead AGENTS.md: 1-2 hours
- Config updates + testing: 1 hour
- **Total:** 4-6 hours to MVP

**Open decisions:**
1. Start with 2-3 CIS personas or all 4?
2. Quinn included in MVP or add later?
3. Mary validation depth (quick check vs deep research)?
4. Research Lead autonomy level (ask operator at each phase vs run full pipeline)?
