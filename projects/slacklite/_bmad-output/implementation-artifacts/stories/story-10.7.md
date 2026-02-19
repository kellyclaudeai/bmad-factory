# Story 10.7: Performance Testing & Benchmarking

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Implement performance benchmarks and threshold tests for core utility functions and operations.
Measure rendering, validation, sanitization, and formatting performance against defined targets.
Integrate a `test:bench` script and ensure operations meet the performance SLAs defined in the PRD.

**Acceptance Criteria:**
- [ ] Create `tests/performance/benchmarks.bench.ts` with Vitest bench tests for:
  - [ ] `formatRelativeTime` - Message timestamp formatting
  - [ ] `validateMessageText` - Message validation (normal + XSS inputs)
  - [ ] `sanitizeMessageText` - Input sanitization
  - [ ] `validateChannelName` - Channel name validation
  - [ ] `validateEmail` - Email validation
  - [ ] `validateWorkspaceName` - Workspace name validation
- [ ] Create `tests/performance/performance-thresholds.test.ts` with threshold assertions:
  - [ ] Message validation completes in <5ms for typical inputs
  - [ ] Channel name validation completes in <1ms
  - [ ] formatRelativeTime completes in <1ms per call
  - [ ] Batch of 1000 validations completes in <100ms
  - [ ] `normalizeDurationMs`-equivalent arithmetic finishes in <1ms
- [ ] Add `test:bench` script to `package.json`
- [ ] Update `vitest.config.ts` to include performance bench files
- [ ] All benchmark and threshold tests pass

**Dependencies:**
dependsOn: ["10.6"]

**Technical Notes:**
- Use Vitest `bench` API for micro-benchmarks (vitest 4+ supports bench)
- Use `performance.now()` for threshold measurements in regular tests
- Benchmarks measure ops/sec; thresholds assert actual timing

**Estimated Effort:** 3 hours

**Status:** IN PROGRESS
