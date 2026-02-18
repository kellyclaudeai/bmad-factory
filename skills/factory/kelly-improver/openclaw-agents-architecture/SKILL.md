---
name: openclaw-agents-architecture
description: Heuristics for when instructions belong in AGENTS.md vs skills, workspace file conventions, and agent architecture patterns.
---

# Agent Architecture Heuristics

## Where Does This Instruction Belong?

### AGENTS.md (loaded every session)

> **"How to do your job"**

- Agent-specific workflow and behavior
- Only ONE agent needs this knowledge
- Identity, responsibilities, decision logic
- The agent's brain — who they are, what they do

### Skill (loaded on demand)

> **"Shared knowledge or external tool reference"**

- **Multiple agents** need the same knowledge
- **External tool knowledge** (how to use a CLI, API, platform)
- Reference material consulted during specific tasks
- Too detailed for AGENTS.md but needed on-demand

### The Decision

```
Only one agent needs it?          → AGENTS.md
Multiple agents need it?          → Skill
"How to use an external tool"?    → Skill
"How to do your job"?             → AGENTS.md
```

## Examples

| Knowledge | Where | Why |
|-----------|-------|-----|
| Project Lead's 4-phase orchestration flow | PL AGENTS.md | Only PL does this |
| Barry's n+1 brownfield tracking | Barry AGENTS.md | Only Barry does this |
| Bob's dependency-graph.json creation | Bob AGENTS.md | Only Bob does this |
| BMAD Method documentation | Skill (bmad/) | Multiple agents reference BMAD |
| Codex CLI invocation patterns | Skill (coding-agent/) | Amelia + Barry both use Codex |
| Factory architecture (4 modes, 4 phases) | Skill (factory-architecture/) | Kelly + PL + RL all reference it |
| Spawning protocol for BMAD agents | PL AGENTS.md | Only PL spawns agents |

## Workspace File Conventions

### Every Agent Workspace Has:

| File | Purpose | Loaded |
|------|---------|--------|
| **AGENTS.md** | Identity, workflow, behavior, responsibilities | Every session |
| **SOUL.md** | Personality, tone, communication style | Every session |
| **TOOLS.md** | Available tools, key paths, skill references | Every session |

### AGENTS.md Guidelines

- **Target:** 200-400 lines for execution agents (Amelia, Bob, etc.)
- **OK to be longer** for orchestrators (Project Lead can be 500+)
- **Include:** What to do, when to do it, how to announce completion
- **Don't include:** Detailed reference material that could be a skill

### TOOLS.md Guidelines

- **Directory-level awareness** — know what skills exist, load on demand
- **Key paths** — project-specific file locations
- **Command reference** — BMAD slash commands, CLI flags
- **Short** — this is a cheat sheet, not documentation

### SOUL.md Guidelines

- **Personality and tone** — how the agent communicates
- **Short** — 10-30 lines typical
- **Consistent** — all agents should have similar structure

## Agent Types

### Orchestrators (persistent sessions)
- **Kelly** — Routes work, monitors factory
- **Project Lead** — Orchestrates 4-phase project lifecycle
- **Research Lead** — Orchestrates research/validation flows

Orchestrators have richer workspaces (HEARTBEAT.md, memory/, etc.)

### Execution Agents (spawned fresh per task)
- **John, Sally, Winston, Bob** — Planning phase
- **Amelia, Barry** — Implementation phase
- **Murat** — Test phase

Execution agents are lean: AGENTS.md + SOUL.md + TOOLS.md only. No persistent memory (spawned fresh each time).
