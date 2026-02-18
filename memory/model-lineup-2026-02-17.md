# Model Lineup - Factory Agents (2026-02-17)

## Updated Allocation

### Opus 4.6 (Deep Reasoning)
- **John** - PM (PRD, epics breakdown, gate check)
- **Winston** - Architect (system design, technical decisions)

### Sonnet 4.5 (All Others)
- **Sally** - UX Designer
- **Bob** - Scrum Master (sprint planning, stories, dependency-graph)
- **Barry** - Quick Flow (fast track mode)
- **Mary** - Business Analyst (research, discovery)
- **Amelia** - Developer (wrapper only - orchestrates CLI)
- **Murat** - TEA Auditor (testing)
- **Carson, Victor, Maya, Quinn** - CIS agents (Creative Ideation System)

### CLI Models (Actual Code Generation)
- **Codex:** gpt-5.3-codex (default), gpt-5.3-spark (Barry fast track)
- **Claude Code:** Sonnet 4.5 (fallback when Codex unavailable)

## Rationale
- **Opus for strategy:** John (requirements) + Winston (architecture) need deep reasoning
- **Sonnet for execution:** All implementation/planning agents benefit from speed + cost efficiency
- **CLI separation:** Amelia wrapper (Sonnet 4.5) just orchestrates; Codex/Claude Code do actual coding

## Changes from Previous
- **Bob:** Opus 4.6 → Sonnet 4.5 (dependency analysis doesn't need Opus depth)
- **Barry:** Opus 4.6 → Sonnet 4.5 (quick-spec is structured output)
- **Mary:** Opus 4.6 → Sonnet 4.5 (research synthesis works fine on Sonnet)

**Commit:** Updated AGENTS.md files for Bob, Barry, Mary (2026-02-17 19:25 CST)
