---
name: murat-testing
description: Murat (TEA Auditor) quality engineering workflows - 8 TEA workflows for test generation, review, and quality gates with automatic fallback.
---

# Murat - TEA (Test Architecture Enterprise)

**Agent:** Murat (Master Test Architect and Quality Advisor)  
**Model:** Sonnet 4.5 (gateway default)  
**CLI:** Claude Code / Codex gpt-5.3-codex (NOT Spark - edge case thinking critical) with 4-tier fallback

---

## BMAD Installation

Install TEA module with both Codex and Claude Code support:

```bash
cd {projectRoot}
npx bmad-method install --tools codex,claude-code --modules bmm,tea --yes
```

TEA provides 8 test engineering workflows. All use the same pattern: `@bmad-agent-tea-tea` (agent persona) + `@bmad-tea-testarch-{workflow}` (workflow prompt).

---

## Murat's 8 Workflows

### Core Workflow (Most Common)

**`automate` - Test Code Generation**

**When:** After story implementation to expand test coverage  
**Duration:** 15-30 min  
**Output:** Prioritized API/E2E tests, fixtures, DoD summary

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"
})
```

**What it does:**
1. Loads TEA auditor persona from `_bmad/tea/agents/tea.md`
2. Loads automate workflow from `_bmad/tea/workflows/testarch/automate/`
3. Reads implemented code + story acceptance criteria
4. Generates comprehensive test suite (unit, integration, E2E)
5. Creates test fixtures and helpers
6. Writes DoD (Definition of Done) summary

**Use case:** Story complete, need comprehensive test suite

---

### Strategic Workflows (Before Implementation)

**`test-design` - Risk Assessment + Coverage Strategy**

**When:** Before implementation starts (planning phase)  
**Duration:** 10-20 min  
**Output:** Risk-based test plan, coverage strategy document

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-test-design' --full-auto"
})
```

**Use case:** Planning phase, determine test approach

---

**`atdd` - Acceptance Test Driven Development**

**When:** Before development (at story start)  
**Duration:** 10-15 min  
**Output:** Failing acceptance tests + implementation checklist

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-atdd' --full-auto"
})
```

**Use case:** TDD workflow, write tests first

---

### Quality Workflows (After Tests Written)

**`test-review` - Test Quality Check**

**When:** After tests are written  
**Duration:** 10-15 min  
**Output:** Test quality report with improvement recommendations

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-test-review' --full-auto"
})
```

**Use case:** Review existing tests for quality/coverage

---

**`trace` - Requirements Traceability**

**When:** Compliance/audit phase  
**Duration:** 15-25 min  
**Output:** Traceability matrix (requirements → tests mapping)

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-trace' --full-auto"
})
```

**Use case:** Compliance, audit, coverage verification

---

### Infrastructure Workflows (One-Time Setup)

**`framework` - Initialize Test Framework**

**When:** New project setup (one-time)  
**Duration:** 20-30 min  
**Output:** Production-ready test framework architecture

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-framework' --full-auto"
})
```

**Use case:** New project, set up testing infrastructure

---

**`ci` - CI/CD Quality Pipeline**

**When:** New project setup (one-time)  
**Duration:** 20-30 min  
**Output:** CI/CD pipeline config with quality gates

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-ci' --full-auto"
})
```

**Use case:** Set up automated testing in CI/CD

---

**`nfr` - Non-Functional Requirements Assessment**

**When:** Enterprise projects, compliance requirements  
**Duration:** 25-35 min  
**Output:** NFR assessment (performance, security, scalability) + recommendations

**CLI invocation:**

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-nfr' --full-auto"
})
```

**Use case:** Enterprise projects, compliance requirements

---

## Common Usage Patterns

### Pattern 1: Story Completion → Test Expansion
```typescript
// Story implementation complete, add comprehensive tests
exec({
  pty: true,
  workdir: "/path/to/project",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"
})
```

**90% of Murat's work is this workflow.**

### Pattern 2: New Project Setup
```typescript
// 1. Initialize test framework (once)
exec({...command: ".../code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-framework' --full-auto"})

// 2. Set up CI/CD pipeline (once)
exec({...command: ".../code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-ci' --full-auto"})

// 3. Then run automate after each story
exec({...command: ".../code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"})
```

### Pattern 3: TDD Workflow
```typescript
// 1. Generate acceptance tests first
exec({...command: ".../code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-atdd' --full-auto"})

// 2. Implement story (Amelia)
// 3. Expand test coverage
exec({...command: ".../code-with-fallback '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"})
```

---

## Automatic Fallback

Murat uses the shared **4-tier fallback wrapper** from `coding-cli` skill.

**Cascade:**
1. Claude Code + Anthropic plan (PRIMARY - default)
2. Claude Code + API key (on billing error)
3. Codex with gpt-5.3-codex + GPT plan (on billing error, NOT Spark)
4. Codex with gpt-5.3-codex + API key (last resort)

**Why NOT Spark for Murat:**
- Testing requires edge case thinking
- Architectural awareness critical for proper mocking/DI patterns
- Spark trades thoroughness for speed (wrong tradeoff for tests)

---

## Monitoring Progress

Same pattern as Amelia/Barry:

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

## Key Constraints

1. **PTY required** - Codex/Claude Code are interactive terminal apps
2. **workdir matters** - Murat wakes up in project directory
3. **BMAD order** - Load TEA persona first, then workflow
4. **Git repo required** - Codex refuses to run outside git directory
5. **Codex NOT Spark** - Use default gpt-5.3-codex for quality (no `--model` flag)
6. **Full-auto mode** - `--full-auto` for autonomous execution

---

## Fallback: Non-BMAD Test Generation (Not Recommended)

If BMAD not installed:

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "/Users/austenallred/clawd/skills/factory/build/coding-cli/bin/code-with-fallback 'Generate comprehensive test suite for {component}. Include: unit tests, integration tests, edge cases, error scenarios. Create fixtures and test helpers as needed.' --full-auto"
})
```

**Limitations:** No project context (architecture, story acceptance criteria, existing patterns). BMAD workflows provide this automatically.

**Use BMAD workflows for better results.**

---

## Summary

**Most common:** `automate` workflow after story completion (90% of use cases)  
**Project setup:** `framework` + `ci` (one-time per project)  
**Advanced:** Other 5 workflows for specific scenarios

Murat ensures quality without blocking velocity. Tests expand after implementation, not before (unless TDD workflow explicitly chosen).
