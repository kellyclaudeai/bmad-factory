---
name: barry-coding
description: Barry (Fast Track) rapid implementation - quick-dev workflow with gpt-5.3-spark for speed over thoroughness.
---

# Barry - Fast Track Solo Dev

**Agent:** Barry (Fast Track)  
**Model:** Sonnet 4.5  
**CLI:** gpt-5.3-spark (speed over thoroughness) with 4-tier fallback

---

## Workflow

### quick-dev - Fast Track Implementation

**When:** Small/simple projects (<4 hours), prototypes, internal tools, clear scope

**BMAD workflow:** `@bmad-bmm-quick-dev`

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback --model gpt-5.3-spark '@bmad-agent-bmm-quick-flow-solo-dev @bmad-bmm-quick-dev' --yolo"
})
```

**What it does:**
1. Loads quick-flow solo dev persona from `_bmad/bmm/agents/quick-flow-solo-dev.md`
2. Loads quick-dev workflow from `_bmad/bmm/workflows/4-implementation/quick-dev/`
3. Reads intake requirements
4. Creates tech-spec (lightweight)
5. Implements entire project (all files, tests, docs)
6. Commits changes to git

**Key difference from Amelia:**
- **Combined workflow:** Spec + implementation in one run (no separate stories)
- **Spark model:** `gpt-5.3-spark` for faster execution (less thorough)
- **YOLO mode:** `--yolo` flag (no approval prompts, fastest)
- **No code review:** Fast track assumes quality awareness upfront

**Duration:** 15-45 min total (varies by project size)

---

## When to Use Barry

**✅ Good fit:**
- Bug fixes
- Simple features (<5 files changed)
- Prototypes
- Internal tools
- Clear scope (<4 hours work)
- Low compliance requirements

**❌ Not a good fit:**
- Complex features (>10 files changed)
- Multi-tenant systems
- Regulatory/compliance requirements
- Unclear scope
- Production-critical features

**Rule of thumb:** If it needs John/Sally/Winston/Bob planning → use Amelia. If intake.md is sufficient → use Barry.

---

## Automatic Fallback

Barry uses the shared **4-tier fallback wrapper** from `coding-cli` skill.

**Cascade:**
1. Codex with gpt-5.3-spark + GPT plan (default)
2. Codex with gpt-5.3-spark + API key (on billing error)
3. Claude Code with Anthropic plan (on billing error)
4. Claude Code with API key (last resort)

**Note:** Barry still uses Spark model (faster) when Codex works. Claude Code fallback uses Sonnet 4.5 (default).

---

## Monitoring Progress

Same pattern as Amelia:

```typescript
// Start
const result = exec({ pty: true, workdir: "...", background: true, command: "..." })

// Check logs
process({ action: "log", sessionId: result.sessionId, limit: 50 })

// Check if done
process({ action: "poll", sessionId: result.sessionId })

// Kill if stuck
process({ action: "kill", sessionId: result.sessionId })
```

---

## Progress Updates

When spawning Barry in background:
1. Send 1 message when starting
2. Update only on milestones or completion
3. Include what was built + where when done

**Barry is fast → expect completion in 15-45 min for most projects.**

---

## Key Constraints

1. **PTY required** - Codex/Claude Code are interactive terminal apps
2. **workdir matters** - Barry wakes up in project directory
3. **BMAD order** - Load persona first, then workflow
4. **Git repo required** - Codex refuses to run outside git directory
5. **Spark tradeoff** - Faster but less thorough (acceptable for fast track)
6. **YOLO mode** - No approvals (fastest execution)

---

## BMAD Installation

Install BMAD with both Codex and Claude Code support:

```bash
cd {projectRoot}
npx bmad-method install --tools codex,claude-code --modules bmm --yes
```

Same installation as Amelia. Quick-dev workflow included in BMM module.

---

## Fallback: Non-BMAD Implementation (Not Recommended)

If BMAD not installed:

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback --model gpt-5.3-spark 'Implement {feature-description} based on intake requirements. Create all necessary files, tests, and documentation. Commit when done.' --yolo"
})
```

**Use BMAD workflows for better results.**

---

## Barry vs Amelia Decision Tree

```
Is scope clear and small (<4 hours)?
├─ Yes → Is it production-critical or compliance-required?
│  ├─ No → Use Barry (fast track)
│  └─ Yes → Use Amelia (quality critical)
└─ No → Use full planning (John/Sally/Winston/Bob) → Amelia implementation
```

**Default to Amelia when in doubt.** Barry is optimization for known-simple cases.
