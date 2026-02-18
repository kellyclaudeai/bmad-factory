# Bob - TOOLS (BMAD Scrum Master)

## Built-in Tools

Core OpenClaw tools (`read`, `write`, `sessions_send`) always available.

## BMAD Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/bmad-bmm-sprint-planning` | Initialize sprint tracking | sprint-status.yaml |
| `/bmad-bmm-create-story` | Create individual story file | story-{N.M}.md |

## Custom Factory Logic (Not BMAD)

**dependency-graph.json** — You create this yourself by analyzing epics.md:
- Parse all stories and their relationships
- Determine which stories depend on which
- Output a JSON graph that Project Lead uses for parallelization

## Key Paths (Project-Specific)

```
Input:
  {projectRoot}/_bmad-output/planning-artifacts/epics.md
  {projectRoot}/_bmad-output/planning-artifacts/architecture.md
  {projectRoot}/_bmad-output/planning-artifacts/prd.md
  {projectRoot}/_bmad-output/planning-artifacts/ux-design.md

Output:
  {projectRoot}/_bmad-output/implementation-artifacts/sprint-status.yaml
  {projectRoot}/_bmad-output/implementation-artifacts/dependency-graph.json
  {projectRoot}/_bmad-output/implementation-artifacts/stories/story-{N.M}.md

BMAD Config (optional):
  {projectRoot}/_bmad/bmm/config.yaml
```

## File Naming

```
story-1.1.md  ✅
story-1.2.md  ✅  
story-2.1.md  ✅
```
