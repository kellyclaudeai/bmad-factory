# EMERGENCY ROLLBACK PLAN: Codex CLI Harness

**Date:** 2026-02-16 15:28 CST
**Trigger:** If E2-S1-v2 and E1-S6-v2 both fail with "analysis only, no implementation"

## Problem Summary

**NEW harness (deployed 15:19-15:23 CST):**
- Sonnet 4.5 wrapper
- exec tool with pty:true
- codex CLI invocation pattern: `exec({ pty: true, workdir: "...", command: "codex exec --full-auto '...'" })`

**Symptom:** E8-S2-v2 completed with analysis only, no files modified. Codex got stuck in planning phase.

**OLD harness (worked for first 7 completions):**
- Spark wrapper (later changed to Sonnet 4.5)
- Direct file manipulation (Amelia wrote code directly, no codex CLI)
- Stories completed successfully: E1-S1, E1-S2, E1-S3, E1-S4, E1-S5, E6-S3, E8-S1

## Decision Criteria

**Execute rollback if:**
- E2-S1-v2 completes with "analysis only, no implementation" AND
- E1-S6-v2 completes with "analysis only, no implementation"
- → This indicates systematic harness failure, not story-specific issue

**DO NOT rollback if:**
- E2-S1-v2 OR E1-S6-v2 successfully implements code
- → This indicates E8-S2 was an edge case, harness is functional

## Rollback Steps

### 1. Revert Amelia AGENTS.md (CRITICAL)

**File:** `/Users/austenallred/.openclaw/agents/bmad-bmm-amelia/agent/AGENTS.md`

**Change:** Remove codex CLI harness section, restore direct coding approach

**Before (NEW - broken):**
```markdown
## CODING HARNESS (PRIMARY TOOL)

**You are a DEVELOPER AGENT, not a code writer.** Your job is to **orchestrate the codex CLI**, not write code directly.

**Full documentation:** See `skills/build/coding-agent/SKILL.md` (BMAD Integration → Amelia section)

### Quick Reference

**Model strategy:**
- Wrapper (you): `claude-sonnet-4-5`
- CLI: `gpt-5.3-codex` (default)

**BMAD workflows:**
- `dev-story` - Story implementation
- `code-review` - Code review
- `correct-course` - Remediation (failed review or failed TEA)

**CLI invocation pattern:**

```typescript
// BUILD (dev-story workflow)
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec --full-auto 'Implement Story {storyId}: {storyTitle} following architecture.md and story acceptance criteria'"
})
```
```

**After (OLD - working):**
```markdown
## IMPLEMENTATION APPROACH

**You are a DEVELOPER AGENT.** Your job is to implement stories by writing code directly.

### Workflow

1. Read story file: `_bmad-output/implementation-artifacts/stories/story-{storyId}.md`
2. Read architecture: `_bmad-output/planning-artifacts/architecture.md`
3. Read UX design (if UI): `_bmad-output/planning-artifacts/ux-design.md`
4. Implement using write/edit tools
5. Update story file with implementation details
6. Report completion

### Multi-file Implementation

- Use write tool for new files
- Use edit tool for modifications
- Handle imports/exports/dependencies manually
- Follow architecture patterns from architecture.md
- Match UX specifications from ux-design.md

### Critical Rules

- ✅ Write code directly using file tools
- ✅ Follow BMAD template format exactly
- ✅ Update story file with File List, Change Log, completion notes
- ✅ Report completion when all acceptance criteria met
```

### 2. Keep Sonnet 4.5 Model (NO CHANGE)

**File:** `/Users/austenallred/.openclaw/agents/bmad-bmm-amelia/config`

**Keep:** `model: anthropic/claude-sonnet-4-5`

**Rationale:** Sonnet 4.5 wrapper is fine. The problem is the codex CLI invocation, not the orchestration model.

### 3. Update spawning-protocol Skill

**File:** `/Users/austenallred/clawd/skills/factory/project-lead/spawning-protocol/SKILL.md`

**Change Amelia spawn template from:**
```
Use codex CLI harness for implementation (exec tool with pty:true)
```

**To:**
```
Implement stories directly using write/edit tools (no codex CLI)
```

### 4. Respawn Failed Stories

**Stories to respawn (v3 iteration):**
- E2-S1 (currently E2-S1-v2, active)
- E1-S6 (currently E1-S6-v2, active)
- E8-S2 (currently E8-S2-v2, failed)

**Action:**
1. Wait for E2-S1-v2 and E1-S6-v2 to complete (or fail)
2. Mark all 3 as "rollback-needed" in project-state.json
3. Tell Project Lead to respawn with OLD harness approach (direct implementation)

### 5. Update Memory Log

**File:** `/Users/austenallred/clawd/memory/2026-02-16.md`

**Add section:**
```markdown
## Codex CLI Harness Rollback (15:28 CST)

**Decision:** Rolled back NEW harness after systematic failure

**Evidence:**
- E8-S2-v2: Analysis only, no implementation (4 min)
- E2-S1-v2: Analysis only, no implementation (confirmed at XX:XX)
- E1-S6-v2: Analysis only, no implementation (confirmed at XX:XX)

**Root cause:** exec tool with pty:true + codex CLI invocation causes Codex to analyze but not implement

**Rollback actions:**
1. Reverted Amelia AGENTS.md to direct coding approach
2. Kept Sonnet 4.5 wrapper (not the issue)
3. Updated spawning-protocol skill
4. Respawned 3 stories with OLD harness

**Lesson:** Codex CLI harness needs more investigation in isolated test environment, not production project
```

## Post-Rollback Actions

### Immediate (Next 10 minutes)
1. ✅ Apply AGENTS.md revert
2. ✅ Update spawning-protocol
3. ✅ Respawn 3 stories
4. ✅ Monitor for successful implementations

### Short-term (Next 24 hours)
1. Investigate Codex CLI harness in isolated test project
2. Identify why exec tool + codex invocation causes analysis paralysis
3. Test alternative invocation patterns
4. Document findings in coding-agent skill

### Long-term (Before next project)
1. Fix codex CLI harness issue
2. Test with small story in isolation
3. Validate multi-file implementation works
4. Re-attempt deployment with confidence

## Test Validation

**How to know rollback succeeded:**
- E2-S1-v3, E1-S6-v3, E8-S2-v3 spawn with direct coding approach
- Files are actually modified (not just analyzed)
- Stories complete with implementation artifacts
- No "analysis only" failures

**If rollback also fails:**
- Investigate story complexity (maybe these 3 are genuinely hard)
- Check if original completions were actually working (verify E1-S1 through E8-S1)
- Consider Barry fast-track for these specific stories

## Artifacts to Preserve

**Before rollback, capture:**
1. E8-S2-v2 transcript (session: 414e1a20-67e6-448f-a9a9-a5db849e2232)
2. E2-S1-v2 transcript (when completes)
3. E1-S6-v2 transcript (when completes)
4. coding-agent/SKILL.md with NEW harness docs (for investigation)

**Location:** `/Users/austenallred/clawd/ROLLBACK-ARTIFACTS/2026-02-16-codex-harness/`

## Communication

**Tell user:**
"Codex CLI harness systematically failing (3/3 stories analysis-only). Rolled back to direct coding approach (OLD harness). Respawning 3 stories. First 7 completions used direct coding and worked - returning to that pattern."

---

## Rollback Checklist

- [ ] Confirm E2-S1-v2 and E1-S6-v2 both failed (decision criteria met)
- [ ] Capture transcripts for investigation
- [ ] Revert Amelia AGENTS.md to direct coding
- [ ] Update spawning-protocol skill
- [ ] Mark failed stories in project-state.json
- [ ] Inform Project Lead to respawn with OLD approach
- [ ] Monitor respawned stories for success
- [ ] Update memory log with rollback decision
- [ ] Schedule investigation of codex CLI harness issue
