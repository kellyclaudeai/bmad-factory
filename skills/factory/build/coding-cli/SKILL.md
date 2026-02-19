---
name: coding-cli
description: Shared coding CLI wrapper with 4-tier automatic fallback (Codex → Claude Code). Used by Amelia, Barry, and Murat for reliable code execution.
---

# Coding CLI - Shared Fallback Wrapper

**Used by:** Amelia (dev), Barry (fast-track), Murat (testing)

This skill provides the **4-tier automatic fallback cascade** for coding CLIs. When one tier fails (billing, rate limit, quota), it automatically tries the next tier until success.

---

## 4-Tier Fallback Cascade

```
1. Claude Code with Anthropic plan (PRIMARY - Anthropic subscription)
   ↓ (on billing/rate error)
2. Claude Code with API key (Anthropic API key credits)
   ↓ (on billing/rate error)
3. Codex (gpt-5.3-codex) with GPT plan (OpenAI subscription credits)
   ↓ (on billing/rate error)
4. Codex (gpt-5.3-codex) with API key (OpenAI API key credits - last resort)
```

**Detection:** Automatically detects errors containing:
- "billing"
- "insufficient credit"
- "quota exceeded"
- "rate limit"
- "usage limit"

**Automatic conversion:** `@bmad-xxx` → `/bmad-xxx` when falling back to Claude Code

---

## Usage

**Always use PTY mode** for interactive coding agents:

```typescript
exec({
  pty: true,
  workdir: "/path/to/project",
  background: true,  // optional
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-bmm-dev @bmad-bmm-dev-story Implement story 3.6' --full-auto"
})
```

**With model override (Barry fast-track):**

```typescript
exec({
  pty: true,
  workdir: "/path/to/project",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback --model gpt-5.3-spark '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' --yolo"
})
```

**Model override note:**

Claude Code uses default Claude model (currently Sonnet 4-5).  
Codex uses gpt-5.3-codex (from `~/.codex/config.toml`) - NOT Spark.

---

## How It Works

1. **Tier 1 attempt:** Runs `codex [args] exec "prompt"`
2. **Check exit code + output:** If success and no error patterns → done
3. **On failure:** Automatically tries next tier
4. **Tier 3+ conversion:** Converts `@bmad-xxx` to `/bmad-xxx` for Claude Code
5. **Exhaustion:** If all 4 tiers fail, returns last error and exits 1

**No manual intervention required.** Agent spawns once, wrapper handles all retries automatically.

---

## Environment Variables

**Codex (Tiers 1-2):**
- Uses `OPENAI_API_KEY` if set
- Falls back to Codex config (`~/.codex/config.toml`)

**Claude Code (Tiers 3-4):**
- Uses `ANTHROPIC_API_KEY` if set
- Falls back to Claude auth (`~/.config/claude/auth.json`)

---

## Monitoring

Wrapper outputs tier attempts to stderr:

```
🔵 Tier 1: Trying Codex with GPT plan...
⚠️ Tier 1 failed, trying Tier 2...
🔵 Tier 2: Trying Codex with API key...
⚠️ Tier 2 failed, trying Tier 3...
🟣 Tier 3: Trying Claude Code with Anthropic plan...
```

**Agent sees this in process logs** via `process({ action: "log", sessionId: "..." })`

---

## Agent-Specific Skills

This wrapper is shared infrastructure. Agent-specific workflows documented in:

- **Amelia:** `/skills/factory/build/amelia-coding/SKILL.md` (dev-story, code-review)
- **Barry:** `/skills/factory/build/barry-coding/SKILL.md` (quick-dev with Spark)
- **Murat:** `/skills/factory/test/murat-testing/SKILL.md` (8 TEA workflows)

---

## Key Principle

**Agents focus on workflows, wrapper handles reliability.**

Agents don't need to know about fallback logic. They just call the wrapper with their workflow prompt. The wrapper ensures execution succeeds on one of the 4 tiers.
