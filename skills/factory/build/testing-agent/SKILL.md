# Testing Agent Skill - Murat (TEA)

**Agent:** Murat - Master Test Architect and Quality Advisor  
**Module:** TEA (Test Architecture Enterprise)  
**Model:** `gpt-5.3-codex` (NOT Spark - edge case thinking critical)

---

## BMAD Installation

Install TEA module with both Codex and Claude Code support:

```bash
npx bmad-method install --tools codex,claude-code --modules bmm,tea --yes
```

TEA provides 8 test engineering workflows. All use the same pattern: `@bmad-agent-tea-tea` (agent persona) + `@bmad-tea-testarch-{workflow}` (workflow prompt).

---

## Murat's Workflows

### Core Workflow (Most Common)

**`automate` - Test Code Generation**
- Run AFTER story implementation to expand test coverage
- Generates prioritized API/E2E tests, fixtures, DoD summary
- Use case: Story complete, need comprehensive test suite

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-automate 'Generate comprehensive test suite' --dangerously-skip-permissions"
})
```

---

### Strategic Workflows (Before Implementation)

**`test-design` - Risk Assessment + Coverage Strategy**
- Run BEFORE implementation starts
- Risk-based test planning, coverage strategy
- Use case: Planning phase, determine test approach

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-test-design' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-test-design 'Risk assessment and coverage strategy' --dangerously-skip-permissions"
})
```

---

**`atdd` - Acceptance Test Driven Development**
- Run BEFORE development (at story start)
- Generates failing acceptance tests + implementation checklist
- Use case: TDD workflow, write tests first

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-atdd' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-atdd 'Generate acceptance tests' --dangerously-skip-permissions"
})
```

---

### Quality Workflows (After Tests Written)

**`test-review` - Test Quality Check**
- Run AFTER tests are written
- Quality check against comprehensive knowledge base
- Use case: Review existing tests for quality/coverage

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-test-review' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-test-review 'Review existing tests' --dangerously-skip-permissions"
})
```

---

**`trace` - Requirements Traceability**
- Map requirements to tests (traceability matrix)
- Phase 1: Create mappings
- Phase 2: Quality gate decision
- Use case: Compliance, audit, coverage verification

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-trace' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-trace 'Map requirements to tests' --dangerously-skip-permissions"
})
```

---

### Infrastructure Workflows (One-Time Setup)

**`framework` - Initialize Test Framework**
- One-time project setup
- Production-ready test framework architecture
- Use case: New project, set up testing infrastructure

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-framework' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-framework 'Initialize test framework' --dangerously-skip-permissions"
})
```

---

**`ci` - CI/CD Quality Pipeline**
- One-time project setup
- Recommend and scaffold CI/CD quality pipeline
- Use case: Set up automated testing in CI/CD

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-ci' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-ci 'Set up CI/CD pipeline' --dangerously-skip-permissions"
})
```

---

**`nfr` - Non-Functional Requirements**
- Assess NFRs (performance, security, scalability)
- Recommend actions and testing approach
- Use case: Enterprise projects, compliance requirements

**Codex:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-nfr' --full-auto"
})
```

**Claude Code:**
```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  command: "claude /bmad-agent-tea-tea /bmad-tea-testarch-nfr 'Assess non-functional requirements' --dangerously-skip-permissions"
})
```

---

## Common Usage Patterns

### Pattern 1: Story Completion → Test Expansion
```typescript
// Story implementation complete, add comprehensive tests
exec({
  pty: true,
  workdir: "/path/to/project",
  background: true,
  command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"
})
```

### Pattern 2: New Project Setup
```typescript
// 1. Initialize test framework (once)
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-framework' --full-auto"})

// 2. Set up CI/CD pipeline (once)
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-ci' --full-auto"})

// 3. Then run automate after each story
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"})
```

### Pattern 3: TDD Workflow
```typescript
// 1. Generate acceptance tests first
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-atdd' --full-auto"})

// 2. Implement story (Amelia)
// 3. Expand test coverage
exec({...command: "codex exec '@bmad-agent-tea-tea @bmad-tea-testarch-automate' --full-auto"})
```

---

## Key Principles

**Always use Codex 5.3 (NOT Spark):**
- Testing requires edge case thinking
- Architectural awareness critical for proper mocking/DI patterns
- Spark trades thoroughness for speed (wrong tradeoff for tests)

**PTY required:**
- Use `pty: true` for all TEA workflows
- Background mode optional (most workflows complete quickly)

**Workflow selection:**
- 90% of use cases: `automate` (after implementation)
- 5% of use cases: `framework` + `ci` (project setup)
- 5% of use cases: Other workflows (advanced scenarios)

---

## Fallback: Generic Test Generation (No BMAD)

If BMAD not installed or unavailable:

```typescript
exec({
  pty: true,
  workdir: "{projectRoot}",
  background: true,
  command: "codex exec --full-auto 'Generate comprehensive test suite for {component}. Include: unit tests, integration tests, edge cases, error scenarios. Create fixtures and test helpers as needed.'"
})
```

**Note:** Generic approach lacks project context (architecture, story acceptance criteria, existing patterns). BMAD workflows provide this automatically.
