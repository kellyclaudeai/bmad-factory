# Core Workflows

**Source of truth documentation for OpenClaw factory orchestrators and coordinators.**

---

## Orchestrator Workflows

### Project Pipeline
**[project-lead-flow.md](project-lead-flow.md)** — Complete project lifecycle  
- 4 modes: Normal Greenfield, Fast Track, Resume, Brownfield
- 4 phases: Planning, Implementation, Testing, User QA
- Sub-agents: John, Sally, Winston, Bob, Amelia, Murat

### Product Discovery
**[research-lead-flow.md](research-lead-flow.md)** — Autonomous product idea generation  
- 5 phases: Discovery, Ideas, Analysis, Brief, Handoff
- Sub-agents: Mary, Carson, Victor, Maya, Quinn

### Factory Coordination
**[kelly-router-flow.md](kelly-router-flow.md)** — Communication and routing layer  
- Request routing (PL, RL, direct work)
- Factory monitoring (heartbeats, QA surfacing, stall detection)
- Session management (orchestrator creation, state tracking)
- Documentation maintenance (changelog logging)

### Self-Improvement
**[kelly-improver-flow.md](kelly-improver-flow.md)** — Architecture and workflow improvements  
- Architecture improvements (session recovery, fallback systems)
- Workflow optimization (routing, orchestration, monitoring)
- Documentation maintenance (core docs, changelog, skills)
- Skill development (creation, updates, refactoring)

---

## Philosophy

These docs are **source of truth**, not loaded into agent context by default. They are:
- **Comprehensive:** Full details, all edge cases, all scenarios
- **Stable:** Changes here propagate to downstream AGENTS.md files
- **Reference:** Humans and agents reference when implementing changes

**When these change:**
1. Update the core doc (here)
2. Update corresponding workspace AGENTS.md file
3. Log change in `docs/changelog/CHANGELOG.md`
4. Test with affected agent

**Do not:**
- Load these into agent context prematurely (use skills for runtime guidance)
- Update these without updating downstream AGENTS.md
- Make changes without logging in CHANGELOG.md
