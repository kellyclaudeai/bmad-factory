# Barry Brownfield Protocol

**Purpose:** Standard artifact format for brownfield adjustments (bug fixes, enhancements, post-launch modifications).

## Artifact Location & Naming

**Location:**
```
{projectRoot}/_bmad-output/implementation-artifacts/stories/
```

**Naming Convention:**
```
Story-99.{sequential}.md
```

**Examples:**
- `Story-99.1.md` - First brownfield adjustment
- `Story-99.2.md` - Second brownfield adjustment
- `Story-99.3.md` - Third brownfield adjustment
- etc.

## Epic 99: Maintenance & Brownfield Adjustments

All post-launch work goes into **Epic 99** using the standard BMAD story format.

**Sequence counter:**
- Start at 99.1 for the first adjustment
- Increment for each subsequent adjustment (99.2, 99.3, etc.)
- Check existing Story-99.* files to determine next number

## Story Document Structure

Use standard BMAD story format:

```markdown
# Story 99.{N}: {Short Description}

## Context
Brief description of what's being changed and why.

## Goal
What this adjustment accomplishes.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Files Affected
- `path/to/file1.tsx`
- `path/to/file2.ts`

## Implementation Notes
Key technical details, dependencies, or constraints.

## Success Validation
How to verify the change works correctly.
```

## When to Use

Use Story-99.x for:
- **Bug fixes** (post-launch defects)
- **Enhancements** (new features on existing projects)
- **Refactoring** (code improvements without behavior changes)
- **UI/UX improvements** (styling, accessibility, interactions)
- **Performance optimizations**
- **Documentation updates** (user-facing docs)

## Finding Next Story Number

Before creating a new Story-99.x file:

```bash
# List existing Story-99.* files to find highest number
ls -1 {projectRoot}/_bmad-output/implementation-artifacts/stories/Story-99.*.md 2>/dev/null | sort -V | tail -1
```

Then increment to get the next number (e.g., if Story-99.5.md exists, create Story-99.6.md).

## Unified Brownfield Flow

**One flow, Barry decides the breakdown:**

1. **Barry spawned** for brownfield request
2. **Barry analyzes:** How many stories does this need? (could be 1, could be 5)
3. **Barry creates Story-99.x files directly:**
   - 1 story if it's a simple fix
   - Multiple stories if it needs parallelization
   - Each file includes `dependsOn` arrays if needed
4. **Barry reports to Project Lead:** "Created stories 99.5-99.7"
5. **Project Lead orchestrates:**
   - Reads Story-99.x files
   - Spawns Amelia/Barry executors for each story
   - Parallel execution based on dependencies

**Examples:**
- "Fix timestamp bug" → Barry creates Story-99.5.md (1 story)
- "Add persona badges + timestamps + logs" → Barry creates Story-99.5.md, 99.6.md, 99.7.md (3 stories)

**Barry's judgment:** He creates as many stories as needed to get it done efficiently. Project Lead always spawns implementers for whatever Barry creates.

## Barry's Responsibilities

**When spawned for brownfield work (planning):**
1. **Check sequence:** Determine next available Story-99.x numbers
2. **Analyze request:** How many stories does this need for efficient parallelization?
3. **Create story files directly:** Write Story-99.{N}.md files (1 or many) with:
   - Standard BMAD story format
   - Clear acceptance criteria
   - Files affected
   - `dependsOn` arrays if stories have ordering requirements
4. **Report to Project Lead:** List created stories for orchestration

**When spawned as implementer (for a specific Story-99.x):**
1. **Read story file:** Story-99.{N}.md
2. **Implement:** Execute the work using codex CLI
3. **Update story:** Mark acceptance criteria as complete
4. **Commit:** Include story number in commit messages (e.g., "Story 99.3: Fix session detail timestamps")

## Integration with Project State

**DO NOT update `project-state.json` epic/story tracking** for Story-99.x files. These are maintenance items, not part of the original project plan/roadmap.

Story-99.x exists purely for:
- Historical record of post-launch changes
- Artifact consistency with BMAD conventions
- Clear documentation of what changed and why

---

**Note for Project Lead:** When spawning Barry for brownfield work, include this protocol in the task directive:

```
Read /Users/austenallred/clawd/skills/factory/barry-brownfield-protocol.md
Follow the Story-99.x naming convention for your artifact.
Determine next story number before creating the file.
```
