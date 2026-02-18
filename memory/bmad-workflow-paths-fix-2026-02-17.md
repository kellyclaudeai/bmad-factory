# BMAD Workflow Paths Fix - 2026-02-17

## Problem
All BMAD agent AGENTS.md files had incorrect workflow paths, causing Sally's "workflow exploration only" failure on TakeoutTrap project.

**Incorrect path pattern:**
```
{project}/_bmad/workflows/bmm/{workflow-name}.md
```

**Actual BMAD structure:**
```
{project}/_bmad/{module}/workflows/{phase}/{workflow-name}/{file}
```

## Root Cause
- BMAD workflows are organized by phase (1-analysis, 2-plan-workflows, 3-solutioning, 4-implementation, bmad-quick-flow)
- Different workflows use different file types (workflow.md, instructions.xml, instructions.md, workflow.yaml)
- Agent AGENTS.md files had generic incorrect paths from agent audit refactor

## Fix Applied (2026-02-17 20:10-20:20 CST)

Updated all 8 BMAD agent AGENTS.md files with correct workflow paths:

### John (PM) - Opus 4.6
- **create-prd:** `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md`
- **edit-prd:** `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md`
- **create-epics-and-stories:** `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md`
- **check-implementation-readiness:** `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md`

### Sally (UX) - Sonnet 4.5
- **create-ux-design:** `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md`
- **edit-ux-design:** Same workflow, different context (brownfield)

### Winston (Architect) - Opus 4.6
- **create-architecture:** `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`
- **edit-architecture:** Same workflow, different context (brownfield)
- **document-project:** `_bmad/bmm/workflows/document-project/instructions.md` + `workflow.yaml`
- **generate-project-context:** `_bmad/bmm/workflows/generate-project-context/workflow.md`

### Bob (SM) - Sonnet 4.5
- **sprint-planning:** `_bmad/bmm/workflows/4-implementation/sprint-planning/instructions.md` + `workflow.yaml`
- **create-story:** `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml` + `workflow.yaml`
- **create-dependency-graph:** Custom factory logic (NOT a BMAD workflow)

### Amelia (Dev) - Sonnet 4.5 (orchestration)
- **dev-story:** `_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml` + `workflow.yaml`
- **code-review:** `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml` + `workflow.yaml`

### Barry (QF) - Sonnet 4.5
- **quick-spec:** `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md`
- **quick-dev:** `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md`

### Murat (TEA) - Sonnet 4.5
- **automate:** `_bmad/tea/workflows/testarch/automate/instructions.md` + `workflow.yaml`
- **test-review:** `_bmad/tea/workflows/testarch/test-review/instructions.md` + `workflow.yaml`
- **trace:** `_bmad/tea/workflows/testarch/trace/instructions.md` + `workflow.yaml`
- **nfr-assess:** `_bmad/tea/workflows/testarch/nfr-assess/instructions.md` + `workflow.yaml`

### Mary (Analyst) - Sonnet 4.5
- **create-product-brief:** `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`
- **research:** `_bmad/bmm/workflows/1-analysis/research/workflow-{domain,market,technical}-research.md`

## BMAD Workflow Structure

### Phase Directories
1. **`1-analysis/`** - Product discovery (Mary workflows, not used in factory)
2. **`2-plan-workflows/`** - PRD & UX design (John, Sally)
3. **`3-solutioning/`** - Architecture & epics (Winston, John)
4. **`4-implementation/`** - Dev workflows (Bob, Amelia)
5. **`bmad-quick-flow/`** - Barry's fast mode
6. **`document-project/`** - Winston's brownfield analysis
7. **`generate-project-context/`** - Winston's project context generation
8. **`qa/` (in bmm)** or **`testarch/` (in tea)** - Murat's TEA workflows

### File Types
- **Planning workflows (1-3):** `workflow.md` or `workflow-{variant}.md`
- **Implementation workflows (4):** `instructions.xml` + `workflow.yaml`
- **Special workflows:** `instructions.md` + `workflow.yaml`

### Module Structure
- **BMM (BMAD Method Module):** `_bmad/bmm/workflows/`
- **TEA (Test Architect Enterprise):** `_bmad/tea/workflows/`

## Impact
- **Immediate:** Sally's retry on TakeoutTrap (started 19:54 CST) should now succeed
- **Future:** All BMAD agents will read correct workflow paths on first try
- **No code changes required:** Agents already handle workflow reading, paths were just wrong

## Files Changed
```
/Users/austenallred/.openclaw/workspace-bmad-bmm-john/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-sally/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-winston/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-bob/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-amelia/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-barry/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-tea-murat/AGENTS.md
/Users/austenallred/.openclaw/workspace-bmad-bmm-mary/AGENTS.md
```

**Note:** Agent workspace files are in `~/.openclaw/workspace-*/`, NOT in the clawd repo, so cannot be committed to git. Changes are in place and effective immediately.

## Docs Check
- ❌ No references to BMAD workflow paths found in `/Users/austenallred/clawd/docs/` (verified via grep)
- ✅ No documentation updates required

## Next Steps
- Monitor TakeoutTrap Sally UX retry (19:54 CST start) for success
- Verify fleai-market-v5 implementation continues smoothly with correct paths
- Future agent audits: verify workflow paths match actual BMAD installation structure
