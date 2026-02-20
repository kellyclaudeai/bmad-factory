---
name: coding-agent
description: Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent via background process for programmatic control.
metadata:
  {
    "openclaw": { "emoji": "🧩", "requires": { "anyBins": ["claude", "codex", "opencode", "pi"] } },
  }
---

# Coding Agent Harness

**For BMAD agents (Amelia, Barry, Murat):** This skill provides the coding CLI harness. Use codex CLI for all code work (implementation, review, testing).

## ⚠️ PTY Mode Required!

Coding agents (Codex, Claude Code, Pi) are **interactive terminal applications** that need a pseudo-terminal (PTY) to work correctly. Without PTY, you'll get broken output, missing colors, or the agent may hang.

**Always use `pty:true`** when running coding agents:

```typescript
// ✅ Correct - with PTY using exec tool
exec({
  pty: true,
  workdir: "/path/to/project",
  command: "codex exec --full-auto 'Your task description'"
})

// ❌ Wrong - no PTY, agent may break
exec({
  command: "codex exec 'Your task'"
})
```

### Exec Tool Parameters

| Parameter    | Type    | Description                                                                 |
| ------------ | ------- | --------------------------------------------------------------------------- |
| `command`    | string  | The shell command to run                                                    |
| `pty`        | boolean | **Use for coding agents!** Allocates a pseudo-terminal for interactive CLIs |
| `workdir`    | string  | Working directory (agent sees only this folder's context)                   |
| `background` | boolean | Run in background, returns sessionId for monitoring                         |
| `timeout`    | number  | Timeout in seconds (kills process on expiry)                                |
| `elevated`   | boolean | Run on host instead of sandbox (if allowed)                                 |

### Process Tool Actions (for background sessions)

| Action      | Description                                          |
| ----------- | ---------------------------------------------------- |
| `list`      | List all running/recent sessions                     |
| `poll`      | Check if session is still running                    |
| `log`       | Get session output (with optional offset/limit)      |
| `write`     | Send raw data to stdin                               |
| `submit`    | Send data + newline (like typing and pressing Enter) |
| `send-keys` | Send key tokens or hex bytes                         |
| `paste`     | Paste text (with optional bracketed mode)            |
| `kill`      | Terminate the session                                |

---

## Quick Start: One-Shot Tasks

For quick prompts/chats, create a temp git repo and run:

```typescript
// Quick chat (Codex needs a git repo!)
exec({
  pty: true,
  workdir: "/tmp/scratch-" + Date.now(),
  command: "git init && codex exec 'Your prompt here'"
})

// Or in a real project - with PTY!
exec({
  pty: true,
  workdir: "~/Projects/myproject",
  command: "codex exec --full-auto 'Add error handling to the API calls'"
})
```

**Why git init?** Codex refuses to run outside a trusted git directory. Creating a temp repo solves this for scratch work.

---

## The Pattern: workdir + background + pty

For longer tasks, use background mode with PTY:

```typescript
// Start agent in target directory (with PTY!)
exec({
  pty: true,
  workdir: "~/project",
  background: true,
  command: "codex exec --full-auto 'Build a snake game'"
})
// Returns sessionId for tracking

// Monitor progress
process({ action: "log", sessionId: "XXX" })

// Check if done
process({ action: "poll", sessionId: "XXX" })

// Send input (if agent asks a question)
process({ action: "write", sessionId: "XXX", data: "y" })

// Submit with Enter (like typing "yes" and pressing Enter)
process({ action: "submit", sessionId: "XXX", data: "yes" })

// Kill if needed
process({ action: "kill", sessionId: "XXX" })
```

**Why workdir matters:** Agent wakes up in a focused directory, doesn't wander off reading unrelated files (like your soul.md 😅).

---

## Codex CLI

**Models:**
- **gpt-5.3-codex** - Default for thorough work (set in ~/.codex/config.toml)
- **gpt-5.3-spark** (codex-spark) - Barry fast track mode (faster, less thorough)
- **gpt-5.3** - General use

**Model strategy:**
- **Normal mode:** Use default (gpt-5.3-codex) for quality
- **Barry fast track:** Use spark (`codex --model gpt-5.3-spark`) for speed
- Model can be overridden per-command: `codex --model gpt-5.3-spark exec "..."`

### Flags

| Flag            | Effect                                             |
| --------------- | -------------------------------------------------- |
| `exec "prompt"` | One-shot execution, exits when done                |
| `--full-auto`   | Sandboxed but auto-approves in workspace           |
| `--yolo`        | NO sandbox, NO approvals (fastest, most dangerous) |

### Building/Creating

```typescript
// Quick one-shot (auto-approves) - remember PTY!
exec({
  pty: true,
  workdir: "~/project",
  command: "codex exec --full-auto 'Build a dark mode toggle'"
})

// Background for longer work
exec({
  pty: true,
  workdir: "~/project",
  background: true,
  command: "codex --yolo 'Refactor the auth module'"
})
```

---

## BMAD Integration (Amelia, Barry, Murat)

**Installation:** Install BMAD with both Codex and Claude Code support:

```bash
npx bmad-method install --tools codex,claude-code --modules bmm
```

Use CSV separator (comma) to install for multiple tools simultaneously.

---

### Amelia (Developer) - Story Implementation

**Model strategy:**
- Wrapper: `claude-sonnet-4-5` (orchestration, file updates)
- CLI: `gpt-5.3-codex` (default) (multi-file implementation)

**BMAD workflows:**
- `dev-story` - Story implementation (workflow: `@bmad-bmm-dev-story`)
- `code-review` - Code review (workflow: `@bmad-bmm-code-review`)

**Remediation Flow:**
After code review finds issues, there's **NO separate remediation command**. Simply re-run `dev-story` with the same story ID:
- The workflow detects the "Senior Developer Review (AI)" section in the story file
- Step 3: Automatically enters review continuation mode
- Prioritizes review follow-up tasks (marked `[AI-Review]`) before regular tasks
- Marks action items complete as they're resolved

**Pattern:** `build → review → build (again with review context) → ship`

**CLI Invocation Pattern (Codex with BMAD):**

BMAD workflows are installed in Codex at `~/.codex/prompts/bmad-*.md`. Use the `@` notation to invoke them. **Always pass the story ID explicitly:**

```typescript
// BUILD (dev-story) - BMAD workflow with story ID
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: `codex exec '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story ${storyId}' --full-auto`
})

// REVIEW (code-review) - BMAD workflow with story ID
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: `codex exec '@bmad-agent-bmm-dev @bmad-bmm-code-review Review story ${storyId}' --full-auto`
})
```

**How BMAD Workflows Work:**
1. The `@bmad-agent-bmm-dev` prompt loads the agent persona from `_bmad/bmm/agents/dev.md` (character, menu, instructions)
2. The `@bmad-bmm-dev-story` prompt loads the workflow engine at `_bmad/core/tasks/workflow.xml`
3. The engine loads the specific workflow config at `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`
4. The workflow reads `config.yaml`, discovers story from `sprint-status.yaml` (or uses explicit story path)
5. The workflow executes instructions in `dev-story/instructions.xml` with full project context

**Key pattern:** Always load agent persona FIRST, then workflow prompt. The agent provides character/role, the workflow provides structure/steps.

**Alternative: Claude Code (when Codex unavailable):**

Claude Code uses **`/command-name`** syntax (not `@command-name` like Codex). BMAD commands are installed in `.claude/commands/` at the project root during `npx bmad-method install`.

```typescript
// BUILD (dev-story) - Claude Code with BMAD commands
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: `claude /bmad-agent-bmm-dev /bmad-bmm-dev-story 'Implement story ${storyId}' --dangerously-skip-permissions`
})

// REVIEW (code-review) - Claude Code with BMAD commands
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: `claude /bmad-agent-bmm-dev /bmad-bmm-code-review 'Review story ${storyId}' --dangerously-skip-permissions`
})
```

**What it loads:**
1. Agent command from `.claude/commands/bmad-agent-bmm-dev.md` → loads `_bmad/bmm/agents/dev.md` (character, role, menu)
2. Workflow command from `.claude/commands/bmad-bmm-{workflow}.md` → loads `_bmad/core/tasks/workflow.xml` → specific workflow config

**Pros:** Uses Sonnet 4.5 (may be better for complex stories), native `/command` support  
**Cons:** Requires BMAD install with `--tools claude-code` flag during setup

**Both tools are production-ready.** Choose based on availability and model preference.

**Note on Course Correction (`correct-course`):**
- `correct-course` is a **PM/SM workflow**, not a dev workflow
- Used for sprint-level remediation when major changes are discovered mid-implementation
- Run by Project Manager or Scrum Master agents, not Amelia
- Analyzes impact, proposes solutions, routes for re-implementation

**Key principle:** BMAD workflows provide full project context automatically. Fallback approach requires manual context injection. Let Codex handle multi-file refactoring, imports, dependencies. Don't write code directly unless CLI fails.

---

### Barry (Fast Track) - Rapid Implementation

**Model strategy:**
- Wrapper: `claude-sonnet-4-5` (orchestration)
- CLI: `gpt-5.3-spark` (speed over thoroughness)

**BMAD workflows:**
- `quick-dev` - Quick Flow Solo Dev (combined spec + implementation: `@bmad-bmm-quick-dev`)

**CLI invocation pattern:**

```typescript
// Fast track mode - use Spark for speed with BMAD workflow
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "codex --model gpt-5.3-spark exec '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' --yolo"
})

// OR: Generic fast track (no BMAD)
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "codex --model gpt-5.3-spark --yolo 'Implement {feature-description} based on intake requirements. Create all necessary files, tests, and documentation.'"
})
```

**Key difference:** Barry uses `--model gpt-5.3-spark` for faster execution, trades some thoroughness for velocity.

**Alternative: Claude Code (when Codex unavailable):**

```typescript
// Claude Code with BMAD commands (quick-dev workflow)
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: `claude /bmad-agent-bmm-quick-flow-solo-dev /bmad-bmm-quick-dev 'Implement feature' --dangerously-skip-permissions`
})
```

---

## Test Automation (Murat - TEA)

**For test generation and quality engineering, see the separate `testing-agent` skill.**

Murat (TEA Auditor) has 8 specialized test workflows documented in a dedicated skill:
- **Core:** Test generation after implementation (`automate`)
- **Strategic:** Risk assessment, ATDD, test design
- **Quality:** Test review, traceability
- **Infrastructure:** Framework setup, CI/CD pipeline, NFR assessment

**Skill location:** `/Users/austenallred/clawd/skills/build/testing-agent/SKILL.md`

**Quick reference (most common):**
```typescript
// Generate tests after story implementation
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"
})
```

See testing-agent skill for all 8 workflows (Codex + Claude Code commands).

---

### Reviewing PRs

**⚠️ CRITICAL: Never review PRs in OpenClaw's own project folder!**
Clone to temp folder or use git worktree.

```bash
# Clone to temp for safe review
REVIEW_DIR=$(mktemp -d)
git clone https://github.com/user/repo.git $REVIEW_DIR
cd $REVIEW_DIR && gh pr checkout 130
bash pty:true workdir:$REVIEW_DIR command:"codex review --base origin/main"
# Clean up after: trash $REVIEW_DIR

# Or use git worktree (keeps main intact)
git worktree add /tmp/pr-130-review pr-130-branch
bash pty:true workdir:/tmp/pr-130-review command:"codex review --base main"
```

### Batch PR Reviews (parallel army!)

```bash
# Fetch all PR refs first
git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'

# Deploy the army - one Codex per PR (all with PTY!)
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #86. git diff origin/main...origin/pr/86'"
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #87. git diff origin/main...origin/pr/87'"

# Monitor all
process action:list

# Post results to GitHub
gh pr comment <PR#> --body "<review content>"
```

---

## Claude Code

**Model:** Sonnet 4.5 (uses Anthropic Account, not API key)

```bash
# With PTY for proper terminal output
bash pty:true workdir:~/project command:"claude 'Your task'"

# Background
bash pty:true workdir:~/project background:true command:"claude 'Your task'"

# Note: Claude Code uses your Anthropic account authentication, not API keys
```

---

## OpenCode

```bash
bash pty:true workdir:~/project command:"opencode run 'Your task'"
```

---

## Pi Coding Agent

```bash
# Install: npm install -g @mariozechner/pi-coding-agent
bash pty:true workdir:~/project command:"pi 'Your task'"

# Non-interactive mode (PTY still recommended)
bash pty:true command:"pi -p 'Summarize src/'"

# Different provider/model
bash pty:true command:"pi --provider openai --model gpt-4o-mini -p 'Your task'"
```

**Note:** Pi now has Anthropic prompt caching enabled (PR #584, merged Jan 2026)!

---

## Parallel Issue Fixing with git worktrees

For fixing multiple issues in parallel, use git worktrees:

```bash
# 1. Create worktrees for each issue
git worktree add -b fix/issue-78 /tmp/issue-78 main
git worktree add -b fix/issue-99 /tmp/issue-99 main

# 2. Launch Codex in each (background + PTY!)
bash pty:true workdir:/tmp/issue-78 background:true command:"pnpm install && codex --yolo 'Fix issue #78: <description>. Commit and push.'"
bash pty:true workdir:/tmp/issue-99 background:true command:"pnpm install && codex --yolo 'Fix issue #99: <description>. Commit and push.'"

# 3. Monitor progress
process action:list
process action:log sessionId:XXX

# 4. Create PRs after fixes
cd /tmp/issue-78 && git push -u origin fix/issue-78
gh pr create --repo user/repo --head fix/issue-78 --title "fix: ..." --body "..."

# 5. Cleanup
git worktree remove /tmp/issue-78
git worktree remove /tmp/issue-99
```

---

## ⚠️ Rules

1. **Always use pty:true** - coding agents need a terminal!
2. **Respect tool choice** - if user asks for Codex, use Codex.
   - Orchestrator mode: do NOT hand-code patches yourself.
   - If an agent fails/hangs, respawn it or ask the user for direction, but don't silently take over.
3. **Be patient** - don't kill sessions because they're "slow"
4. **Monitor with process:log** - check progress without interfering
5. **--full-auto for building** - auto-approves changes
6. **vanilla for reviewing** - no special flags needed
7. **Parallel is OK** - run many Codex processes at once for batch work
8. **NEVER start Codex in ~/clawd/** - it'll read your soul docs and get weird ideas about the org chart!
9. **NEVER checkout branches in ~/Projects/openclaw/** - that's the LIVE OpenClaw instance!

---

## Progress Updates (Critical)

When you spawn coding agents in the background, keep the user in the loop.

- Send 1 short message when you start (what's running + where).
- Then only update again when something changes:
  - a milestone completes (build finished, tests passed)
  - the agent asks a question / needs input
  - you hit an error or need user action
  - the agent finishes (include what changed + where)
- If you kill a session, immediately say you killed it and why.

This prevents the user from seeing only "Agent failed before reply" and having no idea what happened.

---

## Auto-Notify on Completion

For long-running background tasks, append a wake trigger to your prompt so OpenClaw gets notified immediately when the agent finishes (instead of waiting for the next heartbeat):

```
... your task here.

When completely finished, run this command to notify me:
openclaw system event --text "Done: [brief summary of what was built]" --mode now
```

**Example:**

```bash
bash pty:true workdir:~/project background:true command:"codex --yolo exec 'Build a REST API for todos.

When completely finished, run: openclaw system event --text \"Done: Built todos REST API with CRUD endpoints\" --mode now'"
```

This triggers an immediate wake event — Skippy gets pinged in seconds, not 10 minutes.

---

## Learnings (Jan 2026)

- **PTY is essential:** Coding agents are interactive terminal apps. Without `pty:true`, output breaks or agent hangs.
- **Git repo required:** Codex won't run outside a git directory. Use `mktemp -d && git init` for scratch work.
- **exec is your friend:** `codex exec "prompt"` runs and exits cleanly - perfect for one-shots.
- **submit vs write:** Use `submit` to send input + Enter, `write` for raw data without newline.
- **Sass works:** Codex responds well to playful prompts. Asked it to write a haiku about being second fiddle to a space lobster, got: _"Second chair, I code / Space lobster sets the tempo / Keys glow, I follow"_ 🦞
