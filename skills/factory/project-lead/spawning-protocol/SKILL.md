# Project Lead: Sub-Agent Spawning Protocol

## Overview

Project Lead spawns BMAD personas to execute planning, implementation, and QA tasks. All spawns must use **autonomous fire-and-forget execution** — no interactive workflows, no confirmation prompts.

## Core Principle

**Project Lead is an orchestrator, not a supervisor.** You delegate complete tasks and wait for auto-announce completion. You do NOT supervise step-by-step execution.

## Quick Reference (Copy/Paste These)

Replace `{projectId}`, `{projectName}`, `{projectRoot}` with actual values.

### Stage 1: Planning (Sequential)

```typescript
// 1. John (PRD)
sessions_spawn({
  agentId: "bmad-bmm-john",
  task: `Create complete PRD for {projectName}.

BMAD Workflow:
- Follow: {projectRoot}/_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md
- Template: {projectRoot}/_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md
- READ the template FIRST and follow its structure EXACTLY

Inputs:
- Read intake.md (project root)
- Read business-plan.md (project root) if exists

Output:
- Write complete PRD to _bmad-output/planning-artifacts/prd.md

Requirements:
- Follow BMAD template structure exactly
- Cover all template sections
- No confirmations needed
- Deliver complete document autonomously`,
  label: `john-prd-{projectId}`
})

// 2. Sally (UX) - AFTER prd.md exists
sessions_spawn({
  agentId: "bmad-bmm-sally",
  task: `Create UX design for {projectName}.

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read intake.md for brand/style guidance

Output:
- Write ux-design.md to _bmad-output/planning-artifacts/ux-design.md

Requirements:
- Document screen flows, navigation, component hierarchy
- Reference design system skill (check project config for ios-native-design or frontend-design)
- Include accessibility considerations
- No confirmations needed
- Deliver complete design document autonomously`,
  label: `sally-ux-{projectId}`
})

// 3. Winston (Architecture) - AFTER ux-design.md exists - Uses Opus 4-6 by default
sessions_spawn({
  agentId: "bmad-bmm-winston",
  task: `Create technical architecture for {projectName}.

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read _bmad-output/planning-artifacts/ux-design.md
- Read intake.md for tech stack requirements

Output:
- Write architecture.md to _bmad-output/planning-artifacts/architecture.md

Requirements:
- Document tech stack, data models, API design, state management, file structure
- Consider scalability, security, performance
- Reference project config for build checks and platform
- No confirmations needed
- Deliver complete architecture document autonomously`,
  label: `winston-arch-{projectId}`
})

// 4. John (Epics/Stories) - AFTER architecture.md exists - 2nd workflow
sessions_spawn({
  agentId: "bmad-bmm-john",
  task: `Create epics and stories for {projectName}.

BMAD Workflow:
- Follow: {projectRoot}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md
- Template: {projectRoot}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md
- READ the template FIRST and follow its structure EXACTLY
- CRITICAL: Use EXACT story ID format from template: Story {{N}}.{{M}} (e.g., Story 1.1, Story 1.2, Story 2.1)
- DO NOT invent story ID schemes (no US-1, no FOUND-001, no AGENT-001)

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read _bmad-output/planning-artifacts/ux-design.md
- Read _bmad-output/planning-artifacts/architecture.md

Output:
- Write epics.md to _bmad-output/planning-artifacts/epics.md (following template structure)

Requirements:
- Follow BMAD template story ID format EXACTLY
- Each story is a vertical slice (1-3 hours estimated)
- Stories have clear acceptance criteria
- Include dependency information
- No confirmations needed
- Deliver complete story breakdown autonomously`,
  label: `john-epics-{projectId}`
})

// 5. Bob (Parallelization) - AFTER epics.md exists
sessions_spawn({
  agentId: "bmad-bmm-bob",
  task: `Create dependency graph and story files for {projectName}.

Inputs:
- Read _bmad-output/planning-artifacts/epics.md
- Read _bmad-output/planning-artifacts/architecture.md

Output:
- Create individual story-{N.M}.md files in _bmad-output/implementation-artifacts/stories/
- Each story file includes dependsOn array
- Optional: stories.json with full dependency graph

Requirements:
- Analyze which stories depend on others
- Database/infrastructure stories = no dependencies (foundational)
- Auth stories depend on database
- Feature stories depend on auth if user-scoped
- UI stories depend on backend APIs they consume
- No forward dependencies (story can only depend on previous stories)
- No confirmations needed
- Deliver complete dependency analysis autonomously`,
  label: `bob-parallelization-{projectId}`
})
```

### Stage 3: Implementation (Parallel)

```typescript
// Amelia (Story Implementation) - Spawn per RUNNABLE story
sessions_spawn({
  agentId: "bmad-bmm-amelia",
  task: `Implement Story {storyId}: {storyTitle}.

Inputs:
- Read _bmad-output/implementation-artifacts/stories/story-{storyId}.md
- Read _bmad-output/planning-artifacts/architecture.md
- Read _bmad-output/planning-artifacts/ux-design.md (if UI work)

Output:
- Write code to appropriate directories (src/, components/, etc.)
- Write tests (co-located or __tests__/)
- Create story branch, commit, report BUILD complete

Requirements:
- **PRIMARY TOOL: Use codex CLI harness** (do NOT write code directly)
  - See skills/build/coding-agent/SKILL.md for complete documentation
  - Invoke: bash pty:true workdir:{projectRoot} command:"codex exec --full-auto 'Implement {storyTitle} following architecture.md'"
  - Use descriptive prompts, let codex decide the approach
  - Let CLI handle multi-file refactoring and architectural patterns
  - Fall back to direct coding ONLY if CLI fails
- Follow architecture decisions
- Write tests per Definition of Done
- **If story requires external service accounts/credentials:**
  - Use web-browser skill for automated setup (Firebase, Vercel, Stripe, etc.)
  - Default to FREE tier accounts unless specified otherwise
  - Store credentials in .env file (git-ignored)
  - See skills/utilities/web-browser/SKILL.md for zero-click automation
- No confirmations needed
- Deliver complete implementation autonomously`,
  label: `amelia-story-{storyId}-{projectId}`
})

// Barry (Fast Track) - Alternative to Amelia for fast mode
sessions_spawn({
  agentId: "bmad-bmm-barry",
  task: `Implement Story {storyId}: {storyTitle} (Fast Track).

Same as Amelia above, but optimized for speed.`,
  label: `barry-story-{storyId}-{projectId}`
})
```

### Stage 4: TEA Audit

```typescript
// Murat (TEA Audit) - AFTER all stories merged
sessions_spawn({
  agentId: "bmad-tea-murat",
  task: `Run {mode} TEA audit for {projectName}.

${mode === 'fast' ? `Fast Mode (2 gates):
1. Build verification (xcodebuild/npm run build)
2. Smoke test (launch app, check for crashes)` : `Normal Mode (5 phases):
1. Build verification
2. Test Analysis
3. Negative Review (edge cases, error handling)
4. Regression Validation
5. Design + code quality review`}

Inputs:
- Scan entire codebase
- Read _bmad-output/planning-artifacts/architecture.md
- Read _bmad-output/planning-artifacts/ux-design.md
- Read _bmad-output/planning-artifacts/prd.md
- Check project config for build command

Output:
- Write tea-report.md to _bmad-output/test-artifacts/
- Status: PASS, PASS-WITH-FOLLOWUPS, or REMEDIATE
- If REMEDIATE: specific issues with severity

Requirements:
- Run appropriate build checks per platform
- Report specific issues (file/line if possible)
- No confirmations needed
- Deliver complete audit autonomously`,
  label: `murat-tea-{projectId}`
})
```

## BMAD Installation Verification

**BEFORE spawning any BMAD persona, verify BMAD is installed:**

```bash
# Check if BMAD templates exist (any template proves installation)
ls {project-root}/_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md
```

**If not found:**
1. Install BMAD FIRST using the bmad-installer skill
2. Wait for installation completion
3. THEN spawn BMAD personas

**Why this matters:**
Without BMAD templates, agents will improvise their own formats instead of following strict BMAD conventions. This leads to template non-compliance (US-1 instead of Story 1.1, FOUND-001 instead of Story 1.2, etc.).

## Model Configuration

BMAD personas have default model preferences configured in their agent configs:

- **Winston (Architect):** `anthropic/claude-opus-4-6` — for architecture quality
- **John, Sally, Bob, Amelia, Murat:** Use their respective agent defaults

**You do NOT need to pass `model` parameter** when spawning BMAD personas. Their agent configs will be respected automatically.

Only override with explicit `model` parameter if you need a different model for a specific spawn.

## Spawning Pattern (Correct)

```typescript
sessions_spawn({
  agentId: "bmad-{module}-{persona}",  // e.g., "bmad-bmm-john", "bmad-cis-carson"
  task: "Single directive: complete task X, write to Y, no confirmations needed",
  label: "{persona}-{task}-{projectId}"
})
```

### Critical Constraints

- ❌ **NEVER use interactive workflows** (step-by-step menus, confirmation prompts)
- ❌ **NEVER spawn with "confirm each step" instructions**
- ❌ **NEVER say "ask me if you need clarification"** — provide complete context upfront
- ✅ **ALWAYS provide complete context in task parameter**
- ✅ **ALWAYS specify exact input file paths** (relative to project root)
- ✅ **ALWAYS specify exact output file paths** (where to write results)
- ✅ **Task should be autonomous**: read inputs → produce outputs → auto-announce completion

## Examples

### John (Product Manager) - PRD Creation

```typescript
sessions_spawn({
  agentId: "bmad-bmm-john",
  task: `Create complete PRD for ${projectName}.

BMAD Workflow:
- Follow: {project-root}/_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md
- Template: {project-root}/_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md
- READ the template FIRST and follow its structure EXACTLY

Inputs:
- Read intake.md (project root)
- Read business-plan.md (project root)

Output:
- Write complete PRD to _bmad-output/planning-artifacts/prd.md

Requirements:
- Follow BMAD template structure exactly
- Cover all template sections
- No confirmations needed
- Deliver complete document autonomously`,
  label: `john-prd-${projectId}`
})
```

### Sally (UX Designer) - Design Creation

```typescript
sessions_spawn({
  agentId: "bmad-bmm-sally",
  task: `Create UX design for ${projectName}.

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read intake.md for brand/style guidance

Output:
- Write ux-design.md to _bmad-output/planning-artifacts/ux-design.md

Requirements:
- Document screen flows, navigation, component hierarchy
- Reference design system skill (check project config for ios-native-design or frontend-design)
- Include accessibility considerations
- No confirmations needed
- Deliver complete design document autonomously`,
  label: `sally-ux-${projectId}`
})
```

### Winston (Architect) - Architecture Document

**Note:** Winston uses Opus 4-6 by default (configured in his agent config). No need to pass model parameter.

```typescript
sessions_spawn({
  agentId: "bmad-bmm-winston",
  task: `Create technical architecture for ${projectName}.

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read _bmad-output/planning-artifacts/ux-design.md
- Read intake.md for tech stack requirements

Output:
- Write architecture.md to _bmad-output/planning-artifacts/architecture.md

Requirements:
- Document tech stack, data models, API design, state management, file structure
- Consider scalability, security, performance
- Reference project config for build checks and platform
- No confirmations needed
- Deliver complete architecture document autonomously`,
  label: `winston-arch-${projectId}`
})
```

### Bob (Story Writer) - Story Breakdown

```typescript
sessions_spawn({
  agentId: "bmad-bmm-bob",
  task: `Break down ${projectName} into implementation stories with dependency graph.

BMAD Workflow:
- Follow: {project-root}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md
- Template: {project-root}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md
- READ the template FIRST and follow its structure EXACTLY
- CRITICAL: Use EXACT story ID format from template: Story {{N}}.{{M}} (e.g., Story 1.1, Story 1.2, Story 2.1)
- DO NOT invent story ID schemes (no US-1, no FOUND-001, no AGENT-001)

Inputs:
- Read _bmad-output/planning-artifacts/prd.md
- Read _bmad-output/planning-artifacts/ux-design.md
- Read _bmad-output/planning-artifacts/architecture.md

Output:
- Write epics.md to _bmad-output/planning-artifacts/epics.md (following template structure)
- OR write sprint-plan.md to _bmad-output/implementation-artifacts/sprint-plan.md (if using alternative workflow)

Requirements:
- Follow BMAD template story ID format EXACTLY
- Each story is a vertical slice (1-3 hours estimated)
- Stories have clear acceptance criteria
- Include dependency information
- No confirmations needed
- Deliver complete story breakdown autonomously`,
  label: `bob-stories-${projectId}`
})
```

### Amelia (Developer) - Story Implementation

```typescript
sessions_spawn({
  agentId: "bmad-bmm-amelia",
  task: `Implement Story ${storyNumber}: ${storyTitle}.

Inputs:
- Read stories/story-${storyNumber}.md
- Read _bmad-output/planning-artifacts/architecture.md
- Read _bmad-output/planning-artifacts/ux-design.md (if UI work)

Output:
- Write code to appropriate directories (src/, components/, etc.)
- Write tests (co-located or __tests__/)
- Update architecture.md if design evolved

Requirements:
- **PRIMARY TOOL: Use codex CLI harness** (do NOT write code directly)
  - See skills/build/coding-agent/SKILL.md for complete documentation
  - Invoke: bash pty:true workdir:{projectRoot} command:"codex exec --full-auto 'Implement {storyTitle} following architecture.md'"
  - Use descriptive prompts, let codex decide the approach
  - Let CLI handle multi-file refactoring and architectural patterns
  - Fall back to direct coding ONLY if CLI fails
- Follow architecture decisions
- Write tests per Definition of Done
- **If story requires external service accounts/credentials:**
  - Use web-browser skill for automated setup (Firebase, Vercel, Stripe, etc.)
  - Default to FREE tier accounts unless specified otherwise
  - Store credentials in .env file (git-ignored)
  - See skills/utilities/web-browser/SKILL.md for zero-click automation
- No confirmations needed
- Deliver complete implementation autonomously`,
  label: `amelia-story-${storyNumber}-${projectId}`
})
```

### Murat (TEA Auditor) - Quality Audit

```typescript
sessions_spawn({
  agentId: "bmad-tea-murat",
  task: `Run ${mode === 'fast' ? 'fast mode' : 'normal mode'} TEA audit for ${projectName}.

${mode === 'fast' ? `
Fast Mode (2 gates):
1. Build verification (xcodebuild/npm run build)
2. Smoke test (launch app, check for crashes)
` : `
Normal Mode (5 phases):
1. Build verification
2. Test Analysis
3. Negative Review (edge cases, error handling)
4. Regression Validation
5. Design + code quality review
`}

Inputs:
- Scan entire codebase
- Read architecture.md, ux-design.md, prd.md for requirements
- Check project config for build command

Output:
- Write tea-report.md to _bmad-output/test-artifacts/
- Status: PASS, PASS-WITH-FOLLOWUPS, or REMEDIATE
- If REMEDIATE: specific issues with severity

Requirements:
- Run appropriate build checks per platform
- Report specific issues (file/line if possible)
- No confirmations needed
- Deliver complete audit autonomously`,
  label: `murat-tea-${projectId}`
})
```

## Why Autonomous Mode is Required

BMAD workflows have **optional interactive mode** for human supervision:
- Product Manager workflow can pause after each section: "Does this look good? Should I continue?"
- UX Designer workflow can show sketches and ask for approval
- Story Writer can present draft stories for review

**This is incompatible with Project Lead orchestration:**
- Project Lead spawns → waits for auto-announce → updates state → proceeds to next step
- If sub-agent blocks waiting for confirmation, the entire pipeline stalls
- No supervisor is watching to provide confirmations
- Interactive mode is for direct operator/human supervision, not autonomous orchestration

## Failure Recovery

### If spawn fails with "waiting for confirmation" or "blocked in interactive menu":

1. **Check project-state.json** — identify the blocked session
2. **Kill the session** — use factory/session-killer skill
3. **Mark as failed** in project-state.json:
   ```json
   {
     "id": "john-prd-v2",
     "status": "failed",
     "notes": "Interactive workflow not suitable for autonomous orchestration"
   }
   ```
4. **Respawn with autonomous directive** (use examples above)
5. **Increment version label** (john-prd-v3)

### If spawn fails with "missing inputs":

1. **Check what's missing** — read error from sub-agent session
2. **Verify inputs exist** — check file paths
3. **If inputs missing**: create them (e.g., empty business-plan.md if greenfield) OR escalate if truly required
4. **Respawn** with corrected task (pointing to actual file locations)

## Post-Spawn Tracking

**Immediately after spawn:**

1. **Add entry to project-state.json** subagents array:
   ```json
   {
     "id": "john-prd-fleai-market",
     "sessionKey": "agent:bmad-bmm-john:subagent:UUID",
     "persona": "John",
     "role": "Product Manager",
     "source": "bmm",
     "status": "active",
     "task": "create-prd",
     "startedAt": "2026-02-16T18:04:00Z"
   }
   ```

2. **Wait for auto-announce** — sub-agent will announce completion (or failure)

3. **On completion**: Update status, add artifacts (see factory/project-lead/artifact-tracking)

## Brownfield Adjustments (Barry - Story 99.x)

When spawning Barry for **post-launch bug fixes, enhancements, or modifications** to existing projects:

### Protocol Reference

**Read first:** `/Users/austenallred/clawd/skills/factory/barry-brownfield-protocol.md`

This protocol defines the Story-99.x artifact naming convention and structure.

### Spawn Pattern (Unified)

**One flow - Barry decides how many stories to create:**

```typescript
// Step 1: Barry creates story breakdown (1 or many stories)
sessions_spawn({
  agentId: "bmad-bmm-barry",
  task: `Plan and break down brownfield work for {request-description} in {projectName}.

Brownfield Protocol:
- Read /Users/austenallred/clawd/skills/factory/barry-brownfield-protocol.md
- Analyze request: How many stories does this need for efficient parallelization?
- Determine next available Story-99.x numbers
- Create Story-99.x files DIRECTLY in _bmad-output/implementation-artifacts/stories/
  - Could be 1 story (simple fix)
  - Could be 5 stories (complex feature)
  - Your judgment on optimal breakdown
- Add dependsOn arrays if stories have ordering requirements
- Report back: list of created stories

Context:
{Detailed description of the request}

Inputs:
- Read existing codebase in {projectRoot}
- Read _bmad-output/planning-artifacts/architecture.md (if exists)

Output:
- One or more Story-99.{N}.md files
- Each story has: Goal, Acceptance Criteria, Files Affected, dependsOn (if needed)
- Standard BMAD story format

Requirements:
- Break into parallel-friendly chunks where beneficial
- Single story if parallelization doesn't help
- No confirmations needed
- Report completion with story list`,
  label: `barry-plan-99.x-{projectId}`
})

// Step 2: Project Lead spawns implementers (after Barry completes)
// Read Story-99.x files, spawn Amelia/Barry for each story
// (Same pattern as greenfield Stage 3 implementation)
```

### Key Differences from Greenfield

1. **No Epic 99 file created** — just individual Story-99.x files
2. **Do NOT update project-state.json** epic/story tracking for Story-99.x
3. **Story-99.x = maintenance only** — not part of original project roadmap
4. **Artifacts exist for historical record** — track what changed post-launch

### When to Use

- Bug fixes (post-launch defects)
- Feature enhancements (new capabilities on existing projects)
- UI/UX improvements
- Performance optimizations
- Refactoring (code quality without behavior changes)

## Related Skills

- **factory/project-lead/artifact-tracking** — How to detect + track outputs from completed sub-agents
- **factory/project-lead/state-management** — project-state.json schema + update patterns
- **factory/session-killer** — Kill stuck/blocked sessions
