---
name: amelia-coding
description: Amelia (Developer) story implementation workflows - dev-story and code-review via BMAD + Codex/Claude Code with automatic fallback.
---

# Amelia - Developer Story Implementation

**Agent:** Amelia (Developer)  
**Model:** Sonnet 4.5  
**CLI:** 4-tier fallback (Codex → Claude Code)

---

## Workflows

### 1. dev-story - Story Implementation

**When:** After story file created by Bob, implement the story

**BMAD workflow:** `@bmad-bmm-dev-story`

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story {storyId}' --full-auto"
})
```

**What it does:**
1. Loads agent persona from `_bmad/bmm/agents/dev.md`
2. Loads workflow from `_bmad/bmm/workflows/4-implementation/dev-story/`
3. Reads story file from `_bmad-output/implementation-artifacts/stories/Story-{id}.md`
4. Implements all tasks, updates code, runs tests
5. Updates story file with completion status
6. Commits changes to git

**Duration:** 15-40 min per story (varies by complexity)

---

### 2. code-review - Code Review

**When:** After dev-story completes, review the implementation

**BMAD workflow:** `@bmad-bmm-code-review`

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-bmm-dev @bmad-bmm-code-review Review story {storyId}' --full-auto"
})
```

**What it does:**
1. Loads dev persona + code-review workflow
2. Reads implemented code from git diff
3. Reviews against: architecture, patterns, security, tests, edge cases
4. Appends review findings to story file (section: "Senior Developer Review (AI)")
5. Marks action items with `[AI-Review]` priority flag

**Duration:** 5-10 min per story

---

### 3. Remediation Flow (After Code Review)

**No separate command needed.** Re-run dev-story with same story ID:

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story {storyId}' --full-auto"
})
```

**How remediation works:**
- Step 3 of dev-story workflow auto-detects "Senior Developer Review (AI)" section in story file
- Enters review continuation mode
- Prioritizes `[AI-Review]` action items before regular tasks
- Marks items complete as resolved
- Updates story file

**Pattern:** build → review → build (with review context) → ship

---

## Automatic Fallback

Amelia uses the shared **4-tier fallback wrapper** from `coding-cli` skill.

**Cascade:**
1. Codex with GPT plan (default)
2. Codex with API key (on billing error)
3. Claude Code with Anthropic plan (on billing error)
4. Claude Code with API key (last resort)

**No manual intervention needed.** If Codex hits rate limit or billing error, wrapper automatically retries with Claude Code.

---

## Monitoring Progress

**Start session:**
```typescript
const result = exec({ pty: true, workdir: "...", background: true, command: "..." })
// Returns: { sessionId: "abc-123" }
```

**Check logs:**
```typescript
process({ action: "log", sessionId: "abc-123", limit: 50 })
```

**Check if done:**
```typescript
process({ action: "poll", sessionId: "abc-123" })
// Returns: { running: false, exitCode: 0 }
```

**Kill if stuck:**
```typescript
process({ action: "kill", sessionId: "abc-123" })
```

---

## Progress Updates (Critical)

When spawning Amelia in background:
1. Send 1 message when starting (what's running + where)
2. Update only when something changes:
   - Milestone completes (build finished, tests passed)
   - Agent asks a question / needs input
   - Error or user action needed
   - Agent finishes (include what changed + where)
3. If you kill session, immediately say why

**Prevents "Agent failed before reply" with no context.**

---

## Key Constraints

1. **PTY required** - Codex/Claude Code are interactive terminal apps
2. **workdir matters** - Agent wakes up in focused directory, doesn't wander
3. **BMAD workflow order** - Always load agent persona first (`@bmad-agent-bmm-dev`), then workflow
4. **Story ID required** - Always pass explicit story ID in prompt
5. **Git repo required** - Codex refuses to run outside trusted git directory
6. **Never run in ~/clawd/** - Agent will read workspace context files and get confused

---

## BMAD Installation

Install BMAD with both Codex and Claude Code support:

```bash
cd {projectRoot}
npx bmad-method install --tools codex,claude-code --modules bmm --yes
```

Creates:
- `_bmad/` - agents, workflows, tasks, configuration
- `_bmad-output/` - planning artifacts, stories, sprint-status.yaml

---

## Fallback: Non-BMAD Implementation (Not Recommended)

If BMAD not installed:

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback 'Implement story {storyId} based on requirements in {story-file}. Create all necessary files, tests, and documentation. Commit changes when done.' --full-auto"
})
```

**Limitations:** No project context, no workflow structure, no review workflow, manual context injection required.

**Use BMAD workflows whenever possible.**
