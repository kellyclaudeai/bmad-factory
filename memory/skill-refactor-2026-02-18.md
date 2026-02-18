# Skill Refactor - Agent-Specific Skills + 4-Tier Fallback

**Date:** 2026-02-18 09:30-10:05 CST  
**Commit:** `f1cf231`

## Motivation

**Problem:** coding-agent skill had context bleed — Amelia saw Barry's patterns, Barry saw Amelia's workflows, both saw Murat references. Auto-fallback logic needed single source of truth for DRY principle.

**Operator request:** "Should the fallback exist in Amelia or coding skill? Does Murat also have a fallback?"

**Decision:** Fallback goes in shared coding-cli skill (not Amelia AGENTS.md), agent-specific workflows split into separate skills.

---

## New Skill Structure

```
/skills/factory/
├── build/
│   ├── coding-cli/          ← Shared: 4-tier fallback wrapper (all agents use)
│   ├── amelia-coding/       ← Amelia: dev-story, code-review workflows
│   └── barry-coding/        ← Barry: quick-dev workflow (Spark model)
└── test/
    └── murat-testing/       ← Murat: 8 TEA workflows (moved from build/testing-agent/)
```

**Separation rationale:**
- Build phase vs Test phase (build/ vs test/ folders)
- Each agent sees only their workflows (no context bleed)
- Shared infrastructure in coding-cli/ (all agents inherit)

---

## 4-Tier Fallback Cascade

**Location:** `/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback`

**Cascade:**
1. **Codex with GPT plan** (OpenAI subscription credits) — default
2. **Codex with API key** (OpenAI API key credits) — on billing/rate error
3. **Claude Code with Anthropic plan** (Anthropic subscription) — on billing/rate error
4. **Claude Code with API key** (Anthropic API key) — last resort

**Error detection:** Auto-detects patterns:
- "billing"
- "insufficient credit"
- "quota exceeded"
- "rate limit"
- "usage limit"

**Automatic conversion:** `@bmad-xxx` → `/bmad-xxx` when falling back to Claude Code (tier 3+)

**Benefits:**
- No manual intervention required
- Agents spawn once, wrapper handles all retries
- Single source of truth for fallback logic
- All agents (Amelia, Barry, Murat) inherit automatically

---

## Agent-Specific Skills

### amelia-coding
**Workflows:**
- `dev-story` - Story implementation (15-40 min per story)
- `code-review` - Code review (5-10 min per story)
- Remediation flow (re-run dev-story with same story ID)

**CLI invocation:**
```bash
/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback \
  '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story 3.6' \
  --full-auto
```

### barry-coding
**Workflow:**
- `quick-dev` - Fast track implementation (15-45 min total)

**Key differences from Amelia:**
- Combined spec + implementation (no separate stories)
- Spark model (`gpt-5.3-spark`) for speed over thoroughness
- YOLO mode (`--yolo` flag, no approval prompts)
- No code review (assumes quality awareness upfront)

**CLI invocation:**
```bash
/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback \
  --model gpt-5.3-spark \
  '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' \
  --yolo
```

### murat-testing
**Workflows (8 total):**
1. `automate` - Test code generation (most common, 90% of use cases)
2. `test-design` - Risk assessment + coverage strategy
3. `atdd` - Acceptance test driven development
4. `test-review` - Test quality check
5. `trace` - Requirements traceability
6. `framework` - Initialize test framework (one-time setup)
7. `ci` - CI/CD quality pipeline (one-time setup)
8. `nfr` - Non-functional requirements assessment

**CLI model:** `gpt-5.3-codex` (NOT Spark — edge case thinking critical)

**CLI invocation:**
```bash
/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback \
  '@bmad-agent-tea-tea @bmad-tea-testarch-automate' \
  --full-auto
```

---

## Model Standardization

**Sonnet 4.5 (wrapper orchestration):**
- Amelia (Developer)
- Barry (Fast Track)
- Sally (UX Designer)
- Bob (Scrum Master)
- Murat (TEA Auditor)
- Mary (Research Analyst)

**Opus 4.6 (strategic/creative only):**
- John (Product Manager) - PRD writing, epics, strategic thinking
- Winston (Architect) - Architecture design, ADRs, system design

**CLI models (execution tier):**
- Codex: `gpt-5.3-codex` (default for Amelia/Murat) / `gpt-5.3-spark` (Barry fast track)
- Claude Code fallback: Sonnet 4.5 (automatic, no model override needed)

---

## AGENTS.md Updates (Outside Repo)

**Amelia** (`/Users/austenallred/.openclaw/workspace-bmad-bmm-amelia/AGENTS.md`):
- Model: Sonnet 4.5
- Updated: Dev Story Workflow step 5 to reference amelia-coding skill
- Command: `code-with-fallback '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story ${storyId}' --full-auto`

**Barry** (`/Users/austenallred/.openclaw/workspace-bmad-bmm-barry/AGENTS.md`):
- Model: Sonnet 4.5
- Updated: Quick Dev Workflow step 3 to reference barry-coding skill
- Command: `code-with-fallback --model gpt-5.3-spark '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' --yolo`

**Murat** (`/Users/austenallred/.openclaw/workspace-bmad-tea-murat/AGENTS.md`):
- Model: Sonnet 4.5
- Added: Skills section referencing murat-testing skill
- Command: Uses code-with-fallback for test generation workflows

**No changes needed:**
- Sally (already Sonnet 4.5, no coding skill dependency)
- Bob (already Sonnet 4.5, no coding skill dependency)
- John (already Opus 4.6, no coding skill dependency)
- Winston (already Opus 4.6, no coding skill dependency)
- Mary (already Sonnet 4.5, no coding skill dependency)

---

## Architecture Clarifications

**Murat is a single agent** (not an orchestrator):
- Does NOT spawn sub-agents (confirmed with operator)
- Victor, Maya, Carson are CIS module (not TEA)
- Runs quality audits himself using coding tools
- Two modes:
  - **Normal:** 7-phase audit (build, smoke, test analysis, negative review, regression, design compliance, code quality)
  - **Fast:** 2-phase gate (build + smoke only, for Barry projects)

---

## Validation Status

- [x] Skills created and committed (commit `f1cf231`)
- [x] Wrapper script executable (`chmod +x code-with-fallback`)
- [x] Agent AGENTS.md files updated (outside repo, not committed)
- [x] Model standardization complete (Sonnet 4.5 for all except John/Winston Opus 4.6)
- [ ] **Next:** Test with Story 3.6 retry (validate Claude Code fallback works)
- [ ] **After validation:** Archive old coding-agent and testing-agent skills

---

## Testing Plan

**Story 3.6 retry:**
1. Kill existing Claude Code session (faint-crustacean, died at 09:46 CST)
2. Spawn Amelia with new amelia-coding skill
3. Monitor for automatic fallback (should hit tier 3 due to OpenAI billing error)
4. Validate Claude Code tier works correctly
5. If successful, proceed to TEA testing (Murat)

**Expected behavior:**
- Wrapper detects OpenAI billing error at tier 1
- Auto-retries at tier 2 (still OpenAI, likely fails)
- Auto-falls-back to tier 3 (Claude Code with Anthropic plan)
- Story implementation completes successfully with Claude Code

---

## Key Decisions

1. **Fallback in skill, not AGENTS.md:** DRY principle, single source of truth, all agents inherit
2. **Agent-specific skills:** Separation of concerns, no context bleed
3. **build/ vs test/ folders:** Logical phase separation (build vs test)
4. **4-tier cascade:** Exhaust OpenAI options before Claude Code (respects existing subscriptions)
5. **Murat uses gpt-5.3-codex (NOT Spark):** Edge case thinking critical for quality work
6. **Barry uses gpt-5.3-spark:** Speed over thoroughness acceptable for fast track
7. **All orchestration on Sonnet 4.5:** Except John/Winston (Opus 4.6 for strategic/creative work)

---

## Files Changed

**New skills (committed):**
- `skills/factory/build/coding-cli/SKILL.md`
- `skills/factory/build/coding-cli/bin/code-with-fallback`
- `skills/factory/build/amelia-coding/SKILL.md`
- `skills/factory/build/barry-coding/SKILL.md`
- `skills/factory/test/murat-testing/SKILL.md`

**AGENTS.md updates (outside repo, not committed):**
- `/Users/austenallred/.openclaw/workspace-bmad-bmm-amelia/AGENTS.md`
- `/Users/austenallred/.openclaw/workspace-bmad-bmm-barry/AGENTS.md`
- `/Users/austenallred/.openclaw/workspace-bmad-tea-murat/AGENTS.md`

**To archive (after validation):**
- `skills/factory/build/coding-agent/` (superseded by new agent-specific skills)
- `skills/factory/build/testing-agent/` (moved to test/murat-testing/)
