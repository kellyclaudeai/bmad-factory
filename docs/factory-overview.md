# Factory Overview

**Last Updated:** 2026-02-18  
**Purpose:** High-level architecture of the software factory. Source of truth for agent hierarchy, modes, and workflow references.

---

## Agent Hierarchy

```
Operator (human)
  ↓
Kelly [persistent main session]
  ├─→ Research Lead [session per idea]
  │    └─→ Mary, Carson, Victor, Maya, Quinn (CIS agents)
  │
  └─→ Project Lead [session per project]
       └─→ BMAD agents (John, Sally, Winston, Bob, Amelia, Murat, Barry)
```

**Routing rules:**
- Kelly routes, does NOT execute
- Kelly spawns Project Leads and Research Leads only
- Kelly does NOT spawn BMAD agents directly
- Project Lead orchestrates BMAD agents for build execution
- Research Lead orchestrates CIS agents for idea generation

---

## The 4 Modes (Project Lead)

| Mode | When | Personas | Scale |
|------|------|----------|-------|
| **Normal Greenfield** | New project | John, Sally, Winston, Bob, Amelia, Murat | 10-50+ stories |
| **Normal Brownfield** | Existing codebase | Same as above (+ document-project if non-BMAD) | 10-50+ stories |
| **Fast Greenfield** | New project, small scope | Barry | 1-15 stories |
| **Fast Brownfield** | Existing codebase, small scope | Barry | 1-15 stories |

**Mode selection:** Default Normal Greenfield. User explicitly indicates Fast or Brownfield.

---

## The 4 Phases (All Modes)

```
1. Plan      → [subagents create artifacts]
2. Implement → [subagents build code]      ←──┐
3. Test      → [subagents verify]     ──FAIL──┤
4. User QA   → [human validates]  ──FAIL──────┘
     ↓ PASS
   → SHIP
```

**Fail loops:**
- **Implement:** Code review fails → retry story implementation
- **Test:** Tests fail → back to Implement with specific issues (create fix stories)
- **User QA:** User rejects → back to Implement with feedback (correct-course workflow or new stories)

---

## Git Workflow (All Modes)

Single `dev` branch for all work. Merge to `main` only at Ship.

```
PROJECT START:
  git checkout -b dev

PER-STORY:
  git pull origin dev
  [implement story]
  git add -A && git commit -m "feat(N.M): {story title}"
  git push origin dev
  (rebase on conflict)

SHIP:
  git checkout main && git merge dev && git push origin main
  → CI/CD deploys production from main
```

---

## Detailed Flow Documents

| Document | Covers |
|----------|--------|
| [project-lead-flow.md](project-lead-flow.md) | Complete PL orchestration: all modes × phases, dependency spawning, state management |
| [research-lead-flow.md](research-lead-flow.md) | Complete RL orchestration: phases, CIS agents, registry, templates |
| [userqa-workflow.md](userqa-workflow.md) | User QA surfacing, Kelly heartbeat detection, pause/resume |

---

## BMAD Workflows Reference

### Planning (Phase 1)
| Workflow | Agent | Purpose |
|----------|-------|---------|
| `create-prd` | John (PM) | Product Requirements Document |
| `create-ux-design` | Sally (UX) | UX design specification |
| `create-architecture` | Winston (Architect) | Technical architecture & ADRs |
| `create-epics-and-stories` | John (PM) | Break PRD into epics & stories |
| `check-implementation-readiness` | John (PM) | Gate check before implementation |

### Implementation (Phase 2)
| Workflow | Agent | Purpose |
|----------|-------|---------|
| `sprint-planning` | Bob (SM) | Initialize sprint tracking |
| `create-story` | Bob (SM) | Create individual story files |
| `dev-story` | Amelia (DEV) | Implement a story |
| `code-review` | Amelia (DEV) | Adversarial code review |
| `correct-course` | — | Handle user feedback / mid-sprint changes |

### Test (Phase 3 — TEA Module)
| Workflow | Agent | Purpose |
|----------|-------|---------|
| `automate` | Murat (TEA) | Generate automated tests |
| `test-review` | Murat (TEA) | Review test quality & coverage |
| `trace` | Murat (TEA) | Requirements traceability |
| `nfr-assess` | Murat (TEA) | Non-functional requirements |

### Brownfield
| Workflow | Purpose |
|----------|---------|
| `document-project` | Analyze existing non-BMAD codebase (one-time) |
| `generate-project-context` | Create concise project-context.md |

### Fast Mode (Quick Flow)
| Workflow | Agent | Purpose |
|----------|-------|---------|
| `quick-spec` | Barry (QF) | Create lean tech spec |
| `quick-dev` | Barry (QF) | Implement from spec |

### Custom Factory Logic (Not BMAD)
| Logic | Agent | Purpose |
|-------|-------|---------|
| Create `dependency-graph.json` | Bob (SM) | Parse epics for story dependencies |

---

## Invocation Patterns

### Kelly → Project Lead
```
sessions_send({
  sessionKey: "agent:project-lead:project-{projectId}",
  message: "New project: {description}. Intake at projects/{projectId}/intake.md"
})
```

### Kelly → Research Lead
```
sessions_send({
  sessionKey: "agent:research-lead:{sessionId}",
  message: "Generate a new product idea. Research registry: research-registry.json."
})
```

### Project Lead → BMAD Agent
```
sessions_spawn({ agentId: "bmad-bmm-john", task: "create-prd", ... })
sessions_spawn({ agentId: "bmad-bmm-amelia", task: "dev-story for story-1.1.md", ... })
sessions_spawn({ agentId: "bmad-qf-barry", task: "quick-spec", ... })
```

---

## Key Principles

1. **Kelly routes, Project Lead orchestrates, BMAD agents execute**
2. **4 Phases:** Plan → Implement → Test → User QA → Ship
3. **Fail loops** at every phase after Plan
4. **Normal Mode:** Full BMAD + dependency-based parallelization (unlimited parallel spawns)
5. **Fast Mode:** Barry (quick-spec + quick-dev) + sequential
6. **Brownfield:** Read existing artifacts, add new epics/stories
7. **Story complete:** dev-story AND code-review both pass
8. **Git:** All work on `dev`, merge to `main` at Ship only
9. **Bob creates dependency-graph.json** (custom factory logic, not BMAD)
10. **John runs check-implementation-readiness** (gate before Bob)
