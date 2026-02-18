# Planning State - Research Lead Implementation

**Last Updated:** 2026-02-16 23:10 CST

## Current Phase: Architecture Planning (COMPLETE)

**Status:** ✅ FINAL architecture approved, awaiting operator go signal

## Planning Pipeline

| Phase | Status | Duration | Completion |
|-------|--------|----------|------------|
| Initial Discovery | ✅ Complete | 1 hour | 2026-02-16 20:06 CST |
| High-Level Plan | ✅ Complete | 20 min | 2026-02-16 20:26 CST |
| Detailed Plan | ✅ Complete | 45 min | 2026-02-16 21:11 CST |
| Q&A Session | ✅ Complete | 8 min | 2026-02-16 21:19 CST |
| Operator Feedback | ✅ Complete | 21 min | 2026-02-16 21:40 CST |
| Architecture Revision | ✅ Complete | 34 min | 2026-02-16 22:14 CST |
| Final Architecture | ✅ Complete | 30 min | 2026-02-16 22:44 CST |
| **Implementation** | ⏸ Awaiting Go | - | - |

## Architecture Decisions (LOCKED)

### Core Architecture
- **Pattern:** 1 Research Lead = 1 idea (parallelize like Project Leads)
- **Agent configs:** `.openclaw/agents/{agentId}/` (AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md)
- **Workspaces:** `.openclaw/workspace-{agentId}/` (auto-created by OpenClaw)
- **Model:** Sonnet 4.5 for all agents (Carson, Victor, Maya, Quinn, Mary, Research Lead)
- **Output:** `projects-queue/` directory structure
- **Scope:** AUTO mode only (MVP)

### Research Registry Pattern
- **Location:** `/Users/austenallred/clawd/research-registry.json`
- **Purpose:** Deduplication across parallel sessions + historical projects
- **Structure:**
  - `inProgress[]`: Active Research Lead sessions
  - `historical[]`: Completed projects (from projects-queue + projects)
- **Checkpoints:** 4 registry checks (Phase 1, Phase 2, Phase 3.5, Phase 5)
- **Abort protocol:** Early exit if duplicate detected (saves 10-20 min)

### Phase Sequence (FINAL)
1. **Phase 1: Pain Point Discovery - Mary** (12-17 min)
   - **ZERO INPUT** - Mary autonomously searches across:
     - Reddit (r/SaaS, r/Entrepreneur, r/productivity, etc.)
     - Hacker News (Ask HN, Show HN comments)
     - Twitter/X (trending complaints)
     - Google Trends (rising queries)
     - Product Hunt (comment sections)
     - App Store/Play Store reviews (1-2 stars)
   - Collect 8-12 pain point candidates
   - Score each on: Severity, Frequency, Market Signals, SaaS Feasibility (4-40 points)
   - Mary selects HIGHEST scoring pain point
   - Output: Single validated pain point with evidence

2. **Phase 2: Registration** (2 min)
   - Research Lead generates concept name
   - CHECK 1: Registry dedup
   - Register in inProgress if unique, abort if duplicate

3. **Phase 3: CIS Ideation** (5-8 min)
   - Spawn 4 personas in parallel: Carson, Victor, Maya, Quinn
   - Generate 15-20 novel solutions to Mary's pain point
   - Constrained: SaaS-solvable, web/mobile, our stack

4. **Phase 4: Solution Selection - Mary** (5-8 min)
   - Mary scores all 15-20 solutions: Novelty, Market Fit, Feasibility, Differentiation
   - Mary selects BEST solution
   - Research Lead receives Mary's selection
   - CHECK 2: Registry dedup (concept may have evolved)

5. **Phase 5: Competitive Deep-Dive - Mary** (8-12 min)
   - Deep validation of Mary's selected solution
   - Competitive analysis, novelty assessment, feasibility, business model
   - GO/NO-GO recommendation

6. **Phase 6: Compilation** (4-5 min)
   - CHECK 3: Final registry dedup
   - Generate 1 primary + 3-4 alternative names
   - Compile comprehensive brief (intake.md format)
   - Save to `projects-queue/<name-slug>-YYYY-MM-DD-HH-MM/`
   - Unregister (inProgress → historical)

**Total Timeline:** 36-52 min per Research Lead session (target: ~40 min average)

**Key constraint:** Mary makes ALL decisions (pain point + solution). Research Lead is pure orchestrator.

## Implementation Breakdown

### Phase 1: Create CIS Agent Configs (2.5-3 hours)
- [ ] Carson (Brainstorming Coach) - 30-45 min
- [ ] Victor (Innovation Strategist) - 30-45 min
- [ ] Maya (Design Thinking Coach) - 30-45 min
- [ ] Quinn (Creative Problem Solver) - 30-45 min
- [ ] Mary (Business Analyst) - 30-45 min

**Per agent:**
- Extract persona from BMAD markdown
- Create AGENTS.md (role, workflow, constraints)
- Create SOUL.md (personality, tone, boundaries)
- Create TOOLS.md (web_search, web_fetch, memory)
- Create IDENTITY.md (name, creature, vibe, emoji)

**Source files:**
- Carson: `projects/bug-dictionary/_bmad/cis/agents/brainstorming-coach.md`
- Victor: `projects/bug-dictionary/_bmad/cis/agents/innovation-strategist.md`
- Maya: `projects/bug-dictionary/_bmad/cis/agents/design-thinking-coach.md`
- Quinn: `projects/bug-dictionary/_bmad/cis/agents/creative-problem-solver.md`
- Mary: `projects/bug-dictionary/_bmad/bmm/agents/analyst.md`

### Phase 2: Create Research Lead Agent Config (45 min)
- [ ] AGENTS.md (orchestration logic + registry protocol)
- [ ] SOUL.md (coordinator persona)
- [ ] TOOLS.md (sessions_spawn, sessions_send, file ops)
- [ ] IDENTITY.md (Research Lead identity)
- [ ] HEARTBEAT.md (registry maintenance, if needed)

**Registry logic:**
- Atomic read/write operations
- 4 checkpoint checks
- Abort protocol if duplicate
- Update inProgress → historical after completion

### Phase 3: Gateway Config + Kelly Update (30 min)
- [ ] Add 6 agents to gateway config (Carson, Victor, Maya, Quinn, Mary, Research Lead)
- [ ] Update Kelly AGENTS.md with Research Lead spawn protocol
- [ ] Document spawn template in spawning-protocol skill

### Phase 4: Testing (1 hour)
- [ ] Single Research Lead spawn test
- [ ] Registry coordination test (check/register/unregister)
- [ ] Parallel Research Lead test (2-3 simultaneous)
- [ ] Duplicate detection test (within-batch + historical)
- [ ] End-to-end validation (idea → brief → projects-queue)

**Total: 5-5.5 hours to completion**

## Active Sub-Agents

None (planning phase complete)

## Next Action

**AWAITING OPERATOR:**
- Go/no-go decision on Research Lead implementation
- If go: Begin Phase 1 (Create CIS agent configs, starting with Carson)

## Blockers

None

## Files Created

### Planning Documents
- `/docs/research-lead-plan.md` (16KB) - high-level overview
- `/skills/factory/kelly-improver/plans/research-lead-v1.md` (39KB) - detailed implementation (original)
- `/skills/factory/kelly-improver/plans/research-lead-v1-qa.md` (15KB) - Q&A session
- `/skills/factory/kelly-improver/plans/research-lead-v1-followup.md` (21KB) - follow-up decisions
- `/skills/factory/kelly-improver/plans/research-lead-v1-revised.md` (19KB) - revised after operator feedback
- `/skills/factory/kelly-improver/docs/research-lead-v1.md` (22KB) - FINAL architecture

### Skills Referenced
- `factory/kelly-improver/openclaw-agents-architecture/SKILL.md` - agent vs workspace structure
- `factory/kelly-improver/openclaw/SKILL.md` - OpenClaw documentation
- `factory/kelly-improver/bmad/SKILL.md` - BMAD personas and workflows

## Context for Post-Compaction

**Key architectural constraints:**
1. 20 min MAX per Research Lead (not 60-90 min)
2. 5-5.5 hours implementation timeline (not 9-11 hours)
3. AUTO mode only (no manual mode for MVP)
4. All Sonnet 4.5 (balanced, cheap)
5. Output to `projects-queue/` (not `ideas-queue/`)
6. 1 Research Lead = 1 idea (parallel spawning like Project Leads)

**Critical innovation:**
- Research Registry pattern solves both within-batch AND historical deduplication
- Early abort protocol saves 10-20 min by catching duplicates in Phase 1
- Simple JSON file with atomic operations (no complex coordination)

**Real bottleneck identified:**
- Implementation (Project Lead) is the real bottleneck, not research speed
- Research Lead focuses on QUALITY ideas, not volume
- Better to generate 3-5 excellent ideas than 20 mediocre ones
