# Kelly Factory Documentation

**Source of truth for factory architecture, workflows, and agent behavior.**

---

## Structure

```
/docs/
├── factory-overview.md       # High-level architecture overview
│
├── core/                     # Core orchestrator workflows (source of truth)
│   ├── README.md
│   ├── project-lead-flow.md  # Project Lead: 4 modes × 4 phases
│   ├── research-lead-flow.md # Research Lead: 5-phase idea generation
│   ├── kelly-router-flow.md  # Kelly Router: communication & monitoring
│   └── kelly-improver-flow.md # Kelly-Improver: self-improvement
│
├── changelog/                # Kelly improvement history
│   ├── CHANGELOG.md          # Timeline of changes (what/why/when)
│   └── gateway-session-recovery-proposal.md  # Detailed proposal docs
│
└── archive/                  # Deprecated/superseded docs
    ├── bmad-skills-documentation-audit.md
    ├── research-*.md         # Old research design docs
    └── userqa-workflow.md    # Merged into project-lead-flow.md
```

---

## Quick Links

### Orchestrator Workflows
- [Project Lead Flow](core/project-lead-flow.md) — Complete project lifecycle (planning → implementation → testing → QA → shipped)
- [Research Lead Flow](core/research-lead-flow.md) — Autonomous product idea generation workflow

### Factory Coordination
- [Kelly Router Flow](core/kelly-router-flow.md) — Communication, routing, and monitoring
- [Kelly-Improver Flow](core/kelly-improver-flow.md) — Architecture and workflow improvements

### Reference
- [Factory Overview](factory-overview.md) — Agent roster, responsibilities, and orchestration patterns
- [Changelog](changelog/CHANGELOG.md) — Timeline of Kelly improvements and factory changes

---

## What Goes Where

### /core/
**Core orchestrator workflows** - source of truth for Project Lead, Research Lead, Kelly Router, and Kelly-Improver.

**Characteristics:**
- Comprehensive (all modes, all phases, all edge cases)
- Stable (changes propagate to AGENTS.md files)
- NOT loaded into agent context by default (too large)
- Reference docs for humans and agents implementing changes

**Files:**
- `project-lead-flow.md` - Project pipeline (Plan → Implement → Test → User QA)
- `research-lead-flow.md` - Idea generation pipeline (Discovery → Ideas → Analysis → Brief)
- `kelly-router-flow.md` - Routing and monitoring (request routing, heartbeats, QA surfacing)
- `kelly-improver-flow.md` - Self-improvement (architecture, workflows, documentation, skills)

### /archive/
**Deprecated or superseded documentation.**

**When to archive:**
- Content merged into another doc (add deprecation notice)
- Approach superseded by new architecture
- Historical reference only (no longer accurate)

### /changelog/
**Kelly improvement history and detailed proposal docs.**

**CHANGELOG.md format:** `HH:MM CST | Component | What Changed | Why`

**When to log:**
- New skills added
- Workflows changed (PL, RL, Kelly)
- Architecture improvements (fallback systems, session recovery)
- Bug fixes that change behavior
- Performance optimizations

**Detail docs:** For architectural decisions, proposals, or deep-dive specs, create a separate file in `/changelog/` and reference it from CHANGELOG.md.

### Top Level
**Reference and overview docs.**

**Current files:**
- `factory-overview.md` - High-level architecture (agent hierarchy, modes, phases)

---

## Workflow

### Making Changes

1. **Update source doc** (usually /core/ or top-level)
2. **Update downstream files** (AGENTS.md in workspaces)
3. **Log in changelog/CHANGELOG.md** (what changed, why, timestamp)
4. **Test with affected agents**
5. **Commit with descriptive message**

### Kelly and Kelly-Improver Responsibility

**When you (Kelly) or Kelly-Improver make architectural changes:**
1. Update the relevant docs (flows, AGENTS.md, skills)
2. **Document in changelog/CHANGELOG.md** immediately after the change
3. Format: `HH:MM CST | Component | What | Why`
4. For complex changes, create a detail doc in `changelog/` and link it

**This is not optional.** Future-you needs this context. Operator needs this audit trail.

### Adding New Docs

**Core workflow?** → `/core/` + add to core/README.md  
**Reference/overview?** → Top level  
**Superseded/deprecated?** → `/archive/` + add deprecation notice

---

## Philosophy

**These docs are source of truth, not runtime context.**

❌ **Don't:** Load entire flow docs into agent context prematurely  
✅ **Do:** Use skills for runtime guidance, reference flow docs when implementing changes  

❌ **Don't:** Update AGENTS.md without updating source doc  
✅ **Do:** Maintain consistency: source doc → AGENTS.md → test  

❌ **Don't:** Make undocumented changes  
✅ **Do:** Log all changes in CHANGELOG.md  

---

## Questions?

- "Where does X workflow live?" → Check /core/README.md
- "What changed recently?" → Check changelog/CHANGELOG.md
- "Why was Y deprecated?" → Check /archive/ deprecation notices
