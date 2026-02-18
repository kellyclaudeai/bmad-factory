# Kelly Factory Documentation

**Source of truth for factory architecture, workflows, and agent behavior.**

---

## Structure

```
/docs/
├── CHANGELOG.md              # Log of changes to Kelly (what/why/when)
├── factory-overview.md       # High-level architecture overview
├── gateway-session-recovery-proposal.md  # Proposal/reference doc
│
├── core/                     # Core orchestrator workflows (source of truth)
│   ├── README.md
│   ├── project-lead-flow.md  # Project Lead: 4 modes × 4 phases
│   └── research-lead-flow.md # Research Lead: 5-phase idea generation
│
└── archive/                  # Deprecated/superseded docs
    ├── bmad-skills-documentation-audit.md
    ├── research-*.md         # Old research design docs
    └── userqa-workflow.md    # Merged into project-lead-flow.md
```

---

## What Goes Where

### /core/
**Core orchestrator workflows** - source of truth for Project Lead and Research Lead behavior.

**Characteristics:**
- Comprehensive (all modes, all phases, all edge cases)
- Stable (changes propagate to AGENTS.md files)
- NOT loaded into agent context by default (too large)
- Reference docs for humans and agents implementing changes

**Files:**
- `project-lead-flow.md` - Project pipeline (Plan → Implement → Test → User QA)
- `research-lead-flow.md` - Idea generation pipeline (Discovery → Ideas → Analysis → Brief)

### /archive/
**Deprecated or superseded documentation.**

**When to archive:**
- Content merged into another doc (add deprecation notice)
- Approach superseded by new architecture
- Historical reference only (no longer accurate)

### Top Level
**Reference and overview docs.**

**Current files:**
- `factory-overview.md` - High-level architecture (agent hierarchy, modes, phases)
- `gateway-session-recovery-proposal.md` - Technical proposal/reference
- `CHANGELOG.md` - Log of changes to Kelly architecture

---

## Workflow

### Making Changes

1. **Update source doc** (usually /core/ or top-level)
2. **Update downstream files** (AGENTS.md in workspaces)
3. **Log in CHANGELOG.md** (what changed, why, timestamp)
4. **Test with affected agents**
5. **Commit with descriptive message**

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
- "What changed recently?" → Check CHANGELOG.md
- "Why was Y deprecated?" → Check /archive/ deprecation notices
