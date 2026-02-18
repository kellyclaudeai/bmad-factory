# Core Workflows

**These are the source of truth documents for Kelly's orchestrator agents.**

## Files

### project-lead-flow.md
**Purpose:** Complete Project Lead orchestration workflow  
**Covers:** 4 modes (Normal/Fast, Greenfield/Brownfield) × 4 phases (Plan, Implement, Test, User QA)  
**Used by:** Project Lead AGENTS.md derives from this  
**When to read:** When changing project pipeline, adding/removing phases, modifying BMAD integration

### research-lead-flow.md
**Purpose:** Complete Research Lead orchestration workflow  
**Covers:** 5-phase autonomous product idea generation (pain point discovery → idea generation → competitive analysis → product brief → registry)  
**Used by:** Research Lead AGENTS.md derives from this  
**When to read:** When changing research pipeline, adding/removing CIS agents, modifying idea generation logic

---

## Philosophy

These docs are **source of truth**, not loaded into agent context by default. They are:
- **Comprehensive:** Full details, all edge cases, all scenarios
- **Stable:** Changes here propagate to downstream AGENTS.md files
- **Reference:** Humans and agents reference when implementing changes

**When these change:**
1. Update the core doc (here)
2. Update corresponding workspace AGENTS.md file
3. Log change in `/docs/CHANGELOG.md`
4. Test with affected agent

**Do not:**
- Load these into agent context prematurely (use skills for runtime guidance)
- Update these without updating downstream AGENTS.md
- Make changes without logging in CHANGELOG.md
