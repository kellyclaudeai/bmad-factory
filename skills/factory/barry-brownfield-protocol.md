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

## Barry's Responsibilities

When spawned for brownfield work:

1. **Check sequence:** Determine next Story-99.x number
2. **Create story file:** Write Story-99.{N}.md with proper structure
3. **Implement:** Execute the work described in the story
4. **Update story:** Mark acceptance criteria as complete
5. **Commit:** Include story number in commit messages (e.g., "Story 99.3: Fix session detail timestamps")

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
