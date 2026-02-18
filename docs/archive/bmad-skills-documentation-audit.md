# BMAD Skills Documentation Audit

**Date:** 2026-02-16  
**Status:** ✅ Complete  
**⚠️ SUPERSEDED:** 2026-02-18 - Skills refactored into agent-specific structure (see `/Users/austenallred/clawd/memory/skill-refactor-2026-02-18.md`)

This document describes the original `coding-agent` and `testing-agent` skills which have been split into:
- `build/coding-cli/` - Shared 4-tier fallback wrapper
- `build/amelia-coding/` - Amelia's dev-story + code-review workflows
- `build/barry-coding/` - Barry's quick-dev workflow
- `test/murat-testing/` - Murat's 8 TEA workflows

---

## Skills Created

### 1. **coding-agent** - Amelia & Barry (Implementation)
**Location:** `/Users/austenallred/clawd/skills/build/coding-agent/SKILL.md`

**Agents covered:**
- **Amelia (Developer)** - Story implementation + code review
- **Barry (Fast Track)** - Rapid prototypes, quick fixes

**BMAD Installation:**
```bash
npx bmad-method install --tools codex,claude-code --modules bmm,tea --yes
```

**Commands documented:**

**Amelia:**
- ✅ Build: `codex exec '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story ${storyId}' --full-auto`
- ✅ Review: `codex exec '@bmad-agent-bmm-dev @bmad-bmm-code-review Review story ${storyId}' --full-auto`
- ✅ Remediation: Re-run build command (workflow detects review context automatically)

**Barry:**
- ✅ Quick Dev: `codex --model gpt-5.3-spark exec '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' --yolo`

**Both Codex and Claude Code formats included.**

---

### 2. **testing-agent** - Murat (Test Engineering)
**Location:** `/Users/austenallred/clawd/skills/build/testing-agent/SKILL.md`

**Agent covered:**
- **Murat (TEA - Test Architect Enterprise)** - All 8 test workflows

**Commands documented (all with Codex + Claude Code):**

**Core (90% of use cases):**
1. ✅ `automate` - Test generation after implementation

**Strategic (before implementation):**
2. ✅ `test-design` - Risk assessment + coverage strategy
3. ✅ `atdd` - Acceptance tests before development

**Quality (after tests written):**
4. ✅ `test-review` - Quality check on existing tests
5. ✅ `trace` - Requirements traceability matrix

**Infrastructure (one-time setup):**
6. ✅ `framework` - Initialize test framework
7. ✅ `ci` - CI/CD quality pipeline
8. ✅ `nfr` - Non-functional requirements assessment

**Example:**
```bash
codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto
```

---

## Agent Documentation Updated

### **Project Lead**
**Location:** `/Users/austenallred/.openclaw/agents/project-lead/AGENTS.md`

**References:**
- ✅ Stage 3 (Implementation): References `coding-agent` skill
- ✅ Stage 4 (Testing): References `testing-agent` skill with Murat CLI command
- ✅ BOOTSTRAP.md: Documents TEA installation (`--modules bmm,tea`)

**Spawn template:**
```typescript
// Implementation (Amelia)
Load coding-agent skill: /Users/austenallred/clawd/skills/build/coding-agent/SKILL.md
exec({...command: "codex exec '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story {storyId}' --full-auto"})

// Testing (Murat)
Load testing-agent skill: /Users/austenallred/clawd/skills/build/testing-agent/SKILL.md
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"})
```

---

### **BMAD Agents (Amelia, Barry, Murat)**
**Locations:**
- `/Users/austenallred/.openclaw/agents/bmad-bmm-amelia/`
- `/Users/austenallred/.openclaw/agents/bmad-bmm-barry/`
- `/Users/austenallred/.openclaw/agents/bmad-tea-murat/`

**Structure:**
- No AGENTS.md files (personas loaded from `_bmad/` installation)
- Configuration via `config` and `agent/models.json`
- CLI commands documented in skills (not in agent directories)

**Pattern:** BMAD agents are thin wrappers around CLI tools. Skills contain the actual usage patterns.

---

## Key Principles Documented

### **Model Selection:**
- **Amelia**: `gpt-5.3-codex` (default) - Multi-file implementation, architecture awareness
- **Barry**: `gpt-5.3-spark` - Speed over thoroughness for simple features
- **Murat**: `gpt-5.3-codex` (NOT Spark) - Edge case thinking critical for test design

### **Remediation Flow:**
- NO separate remediation command
- Re-run `dev-story` workflow - it auto-detects review context
- Step 3 of dev-story workflow handles review continuation

### **BMAD Command Pattern:**
Always load agent persona FIRST, then workflow prompt:
```bash
codex exec '@bmad-agent-{agent} @bmad-{module}-{workflow}' --full-auto
```

### **Both CLIs Supported:**
- **Codex**: `@command-name` (global prompts in `~/.codex/prompts/`)
- **Claude Code**: `/command-name` (project commands in `.claude/commands/`)

---

## Bootstrap & Installation

### **Project Lead Bootstrap**
**Location:** `/Users/austenallred/.openclaw/agents/project-lead/BOOTSTRAP.md`

**First run:**
```bash
cd {projectRoot}
npx bmad-method install --tools codex,claude-code --modules bmm,tea --yes
```

**Installs:**
- BMM (core BMAD: John, Sally, Winston, Bob, Amelia, Barry)
- TEA (Test Architect: Murat's 8 workflows)
- Both Codex and Claude Code support

---

## Verification Checklist

✅ coding-agent skill: Amelia (2 workflows) + Barry (1 workflow)  
✅ testing-agent skill: Murat (8 workflows)  
✅ All workflows have Codex + Claude Code commands  
✅ Project Lead AGENTS.md references both skills  
✅ Project Lead BOOTSTRAP.md includes TEA installation  
✅ Remediation flow documented (re-run dev-story)  
✅ Model selection documented (Codex vs Spark)  
✅ Course correction clarified (PM/SM workflow, not dev)

---

## Next Steps (If Needed)

### **Optional Enhancements:**
1. Add examples for multi-workflow sequences (framework → automate)
2. Document Barry use cases (when to use Spark vs Codex)
3. Add troubleshooting section (BMAD not installed, prompts missing)
4. Create quick reference card (single-page cheat sheet)

### **Maintenance:**
- Update when new BMAD workflows added
- Verify commands match latest BMAD version
- Keep Codex/Claude Code patterns in sync

---

## Summary

**Before:** Scattered documentation, incorrect commands, menu-based Murat, missing remediation flow

**After:**
- 2 focused skills (implementation + testing)
- 11 total workflows documented (Amelia: 2, Barry: 1, Murat: 8)
- Both Codex and Claude Code formats for all commands
- Project Lead references correct skills
- Bootstrap includes TEA installation
- Remediation flow clarified

**Result:** Complete, accurate BMAD CLI documentation for factory automation.
