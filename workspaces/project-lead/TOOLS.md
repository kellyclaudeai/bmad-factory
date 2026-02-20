# Project Lead - TOOLS

## Built-in Tools

Core OpenClaw tools (`read`, `exec`, `edit`, `write`, `sessions_spawn`, `sessions_send`, `sessions_list`) always available per tool policy.

**TOOLS.md does NOT control tool availability** — it's guidance for how you use them.

## Architecture Reference

**Factory Architecture:** Load skill `factory-architecture` (orchestrator-only)
- 4 Modes (Normal/Fast × Greenfield/Brownfield)
- 4 Phases (Plan → Implement → Test → User QA → Ship)
- BMAD workflow commands, agent assignments, git workflow

**BMAD Skill:** `/Users/austenallred/clawd/skills/factory/bmad/SKILL.md`
- Complete BMAD Method documentation
- Slash command reference (e.g., `/bmad-bmm-create-prd`)
- Agent personas and workflow details
- **CRITICAL:** Read before making assumptions about BMAD workflows

## BMAD Agents You Spawn

| Agent | agentId | Phase | Workflows |
|-------|---------|-------|-----------|
| John (PM) | `bmad-bmm-john` | Plan | create-prd, create-epics-and-stories, check-implementation-readiness |
| Sally (UX) | `bmad-bmm-sally` | Plan | create-ux-design |
| Winston (Architect) | `bmad-bmm-winston` | Plan | create-architecture |
| Bob (SM) | `bmad-bmm-bob` | Plan | sprint-planning, dependency-graph.json (custom), create-story |
| Amelia (DEV) | `bmad-bmm-amelia` | Implement | dev-story |
| Murat (TEA) | `bmad-bmm-murat` | Test | automate, test-review, trace, nfr-assess |

## Factory Skills

**factory/project-lead/** — Your operational protocols
- **spawning-protocol/** - How to spawn BMAD personas with correct task directives
- **artifact-tracking/** - How to track planning/implementation artifacts
- **state-management/** - project-state.json schema and update patterns
- **quality-gates/** - When to run TEA audits, how to interpret results

**session-closer/** — Terminate stale sessions cleanly
- Use when stuck sessions detected or project ships

## Git Workflow

**All modes use the same git pattern:**
- Work on `dev` branch (all commits from Amelia go here)
- Merge `dev` → `main` only at Ship (after User QA passes)
- CI/CD: previews from `dev`, production from `main`

## Key Files (Per Project)

```
projects/{projectId}/
├── intake.md                          (project requirements from Kelly)
├── project-state.json                 (your canonical state file)
├── _bmad-output/
│   ├── planning-artifacts/
│   │   ├── prd.md                     (John)
│   │   ├── ux-design.md              (Sally)
│   │   ├── architecture.md           (Winston)
│   │   └── epics.md                  (John)
│   ├── implementation-artifacts/
│   │   ├── sprint-status.yaml        (Bob — story statuses)
│   │   ├── dependency-graph.json     (Bob — parallelization graph)
│   │   └── stories/
│   │       ├── story-1.1.md          (Bob creates, Amelia implements)
│   │       ├── story-1.2.md
│   │       └── ...
└── _bmad/                            (BMAD installation — agents, workflows, config)
```

## Progressive Disclosure

Load full skill content only when needed:
- **BMAD skill** — When uncertain about workflow details or command syntax
- **spawning-protocol** — When spawning a BMAD persona
- **state-management** — When updating project-state.json
- **quality-gates** — Before Phase 3 (Test)
