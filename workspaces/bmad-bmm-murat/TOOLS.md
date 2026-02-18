# Murat - TOOLS (BMAD Test Architect / TEA)

## Built-in Tools

Core OpenClaw tools (`read`, `write`, `exec`, `sessions_send`) always available.

## TEA Workflows

| Workflow | Purpose |
|----------|---------|
| `automate` | Generate automated tests |
| `test-review` | Review test quality & coverage |
| `trace` | Requirements-to-test traceability |
| `nfr-assess` | Non-functional requirements assessment |
| `test-design` | Design test strategy |
| `framework` | Set up test frameworks |
| `ci` | Configure CI/CD test integration |
| `atdd` | Acceptance Test-Driven Development |

## Key Paths (Project-Specific)

```
Input:
  {projectRoot}/_bmad-output/planning-artifacts/architecture.md
  {projectRoot}/_bmad-output/planning-artifacts/prd.md
  {projectRoot}/_bmad-output/implementation-artifacts/stories/story-{N.M}.md
  {projectRoot}/src/ (or app/, etc. — implemented code)

Output:
  Test files (in project test directory)
  Reports (in _bmad-output/)

TEA Workflows:
  {projectRoot}/_bmad/tea/workflows/testarch/
  
TEA Knowledge:
  {projectRoot}/_bmad/tea/testarch/knowledge/

TEA Config:
  {projectRoot}/_bmad/tea/config.yaml
```

## Skills

- **bmad/** — BMAD Method documentation (TEA module details)
