---
name: bmad
description: Complete BMAD Method documentation for AI consumption. Use when working on BMAD agents, Project Lead workflows, or factory orchestration that involves BMAD personas. Always reference this instead of assumptions.
---

# BMAD Method Documentation

**Primary source:** https://docs.bmad-method.org/llms-full.txt

**When to use this skill:**
- Working on Project Lead workflows (spawning BMAD personas, orchestration)
- Modifying BMAD agent configurations
- Understanding BMAD architecture, phases, or workflows
- Debugging BMAD persona behavior
- Factory improvements involving BMAD integration

**Critical:** Do NOT assume how BMAD works. Always check this documentation first.

---

# BMAD Method Documentation (Full)

> Complete documentation for AI consumption
> Generated: 2026-02-15
> Repository: https://github.com/bmad-code-org/BMAD-METHOD

## Overview

The BMad Method (**B**reakthrough **M**ethod of **A**gile AI **D**riven Development) is an AI-driven development framework that helps you build software through the whole process from ideation and planning all the way through agentic implementation. It provides specialized AI agents, guided workflows, and intelligent planning that adapts to your project's complexity.

## Documentation Structure

| Section           | Purpose                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| **Tutorials**     | Learning-oriented. Step-by-step guides that walk you through building something. Start here if you're new. |
| **How-To Guides** | Task-oriented. Practical guides for solving specific problems. \"How do I customize an agent?\" lives here.  |
| **Explanation**   | Understanding-oriented. Deep dives into concepts and architecture. Read when you want to know *why*.       |
| **Reference**     | Information-oriented. Technical specifications for agents, workflows, and configuration.                   |

## Four Phases

| Phase | Name           | What Happens                                        |
| ----- | -------------- | --------------------------------------------------- |
| 1     | Analysis       | Brainstorming, research, product brief *(optional)* |
| 2     | Planning       | Create requirements (PRD or tech-spec)              |
| 3     | Solutioning    | Design architecture *(BMad Method/Enterprise only)* |
| 4     | Implementation | Build epic by epic, story by story                  |

## Three Planning Tracks

| Track           | Best For                                               | Documents Created                      |
| --------------- | ------------------------------------------------------ | -------------------------------------- |
| **Quick Flow**  | Bug fixes, simple features, clear scope (1-15 stories) | Tech-spec only                         |
| **BMad Method** | Products, platforms, complex features (10-50+ stories) | PRD + Architecture + UX                |
| **Enterprise**  | Compliance, multi-tenant systems (30+ stories)         | PRD + Architecture + Security + DevOps |

## Installation

```bash
npx bmad-method install
```

Creates two folders:
- `_bmad/` — agents, workflows, tasks, and configuration
- `_bmad-output/` — artifacts (PRD, architecture, stories, etc.)

## Key Agents

### Planning Agents
- **PM (Product Manager)** — Creates PRD, epics, stories
- **Architect** — Creates architecture, validates implementation readiness
- **UX Designer** — Creates UX design documents
- **Analyst** — Brainstorming, research, analysis

### Implementation Agents
- **SM (Scrum Master)** — Sprint planning, story creation, tracking
- **DEV** — Implements stories, runs tests, self-reviews
- **Quick Flow Solo Dev** — Creates tech-spec + implements (Quick Flow track)

## Workflow Commands

Each workflow has a **slash command** (e.g., `/bmad-bmm-create-prd`). Running a workflow automatically loads the appropriate agent.

### Common Workflows

| Workflow                         | Command                                    | Agent     | Purpose                              |
| -------------------------------- | ------------------------------------------ | --------- | ------------------------------------ |
| `help`                           | `/bmad-help`                               | Any       | Get guidance on what to do next      |
| `prd`                            | `/bmad-bmm-create-prd`                     | PM        | Create Product Requirements Document |
| `create-architecture`            | `/bmad-bmm-create-architecture`            | Architect | Create architecture document         |
| `create-epics-and-stories`       | `/bmad-bmm-create-epics-and-stories`       | PM        | Break down PRD into epics            |
| `check-implementation-readiness` | `/bmad-bmm-check-implementation-readiness` | Architect | Validate planning cohesion           |
| `sprint-planning`                | `/bmad-bmm-sprint-planning`                | SM        | Initialize sprint tracking           |
| `create-story`                   | `/bmad-bmm-create-story`                   | SM        | Create a story file                  |
| `dev-story`                      | `/bmad-bmm-dev-story`                      | DEV       | Implement a story                    |
| `code-review`                    | `/bmad-bmm-code-review`                    | DEV       | Review implemented code              |

## Critical Principles

### Fresh Chats
**Always start a fresh chat for each workflow.** This prevents context limitations from causing issues.

### Progressive Discovery
Workflows auto-detect existing documents:
1. Try whole document first (e.g., `PRD.md`)
2. Check for sharded version (e.g., `prd/index.md`)
3. Whole document takes precedence if both exist

### Project Context
`_bmad-output/project-context.md` ensures AI agents follow your project's technical preferences and implementation rules. Can be:
- Created manually before starting
- Generated after architecture (`/bmad-bmm-generate-project-context`)
- Generated for existing projects (scans codebase)

### Autonomous Mode
BMAD workflows support **interactive mode** (step-by-step confirmations) and **autonomous mode** (fire-and-forget execution).

**For autonomous orchestration (e.g., OpenClaw factory):**
- NEVER use interactive workflows
- ALWAYS provide complete task directive with exact input sources and output paths
- Fire-and-forget execution (spawn → auto-announce → proceed)

## Installation Structure

```text
your-project/
├── _bmad/
│   ├── _config/         # Customizations
│   │   └── agents/      # Agent .customize.yaml files
│   ├── core/            # Universal core framework
│   ├── bmm/             # BMad Method module
│   └── ...              # Other modules
└── _bmad-output/        # Generated artifacts
    ├── planning-artifacts/
    │   ├── PRD.md
    │   ├── architecture.md
    │   └── epics/
    ├── implementation-artifacts/
    │   └── sprint-status.yaml
    └── project-context.md
```

## Customization

Use `.customize.yaml` files (not agent files directly) to preserve changes across updates:

```text
_bmad/_config/agents/
├── bmm-dev.customize.yaml
├── bmm-pm.customize.yaml
└── ... (one file per agent)
```

Customization sections:
- `agent.metadata` — Override display name (replaces)
- `persona` — Set role, identity, style, principles (replaces)
- `memories` — Add persistent context (appends)
- `menu` — Add custom menu items (appends)
- `critical_actions` — Define startup instructions (appends)
- `prompts` — Create reusable prompts (appends)

Apply changes: `npx bmad-method install` → **Recompile Agents**

## Workflow Discovery

Workflows auto-discover documents using naming conventions:

| Document Type | Whole File | Sharded (Directory) |
|---------------|------------|---------------------|
| PRD | `PRD.md` | `prd/index.md` |
| Architecture | `architecture.md` | `architecture/index.md` |
| UX Design | `ux-design.md` | `ux-design/index.md` |
| Epics | `epics.md` | `epics/epic-*.md` |

**Location:** `_bmad-output/planning-artifacts/`

## Common Pitfalls

1. **Reusing chat sessions** → Always start fresh for each workflow
2. **Editing agent files directly** → Use `.customize.yaml` files instead
3. **Assuming BMAD workflow details** → Check this documentation first
4. **Interactive mode in autonomous systems** → Always use autonomous task directives
5. **Missing project context** → Create or generate `project-context.md` for consistency

## Full Documentation

**Complete docs (50KB+):** https://docs.bmad-method.org/llms-full.txt

**GitHub repo:** https://github.com/bmad-code-org/BMAD-METHOD

**Discord:** https://discord.gg/gk8jAdXWmj

---

## For OpenClaw Factory Integration

**Project Lead spawning BMAD personas:**
- Use autonomous task directives (no interactive mode)
- Specify exact input/output paths
- Include project directory path
- Reference workflow files: `_bmad/workflows/bmm/{workflow-name}.md`
- Use sessions_spawn with cleanup="delete"
- Track subagents in project-state.json

**Example spawn pattern:**
```javascript
sessions_spawn({
  agentId: "bmad-bmm-john",
  label: "john-prd-{project-id}",
  task: `Execute create-prd workflow for {project-id}.
         Project: /Users/austenallred/clawd/projects/{project-id}
         Read workflow from _bmad/workflows/bmm/create-prd.md
         Input: planning-artifacts/product-brief.md
         Output: planning-artifacts/prd.md
         Report completion to Project Lead (label: project-{project-id}) via sessions_send.`,
  cleanup: "delete"
})
```

**BMAD personas available for spawning:**
- `bmad-bmm-john` (Product Manager)
- `bmad-bmm-sally` (UX Designer)
- `bmad-bmm-winston` (Architect)
- `bmad-bmm-bob` (Scrum Master)
- `bmad-bmm-amelia` (Developer)
- `bmad-bmm-murat` (TEA Auditor - if TEA module installed)

**Each persona has dedicated workspace:**
- Per-persona workspaces prevent identity conflicts
- Sub-agents inherit parent's AGENTS.md if nested
- Session keys: `agent:bmad-bmm-{persona}:subagent:{UUID}`

---

**When working on Project Lead or factory BMAD integration: READ THIS SKILL FIRST before making assumptions about how BMAD workflows or agents work.**
