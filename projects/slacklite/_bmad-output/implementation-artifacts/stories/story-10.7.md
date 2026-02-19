# Story 10.7: Performance Testing & Benchmarking

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Implement performance benchmarks and threshold tests for core utility functions and operations.
Measure rendering, validation, sanitization, and formatting performance against defined targets.
Integrate a `test:bench` script and ensure operations meet the performance SLAs defined in the PRD.

**Acceptance Criteria:**
- [x] Create `tests/performance/benchmarks.bench.ts` with Vitest bench tests for:
  - [x] `formatRelativeTime` - Message timestamp formatting
  - [x] `validateMessageText` - Message validation (normal + XSS inputs)
  - [x] `sanitizeMessageText` - Input sanitization
  - [x] `validateChannelName` - Channel name validation
  - [x] `validateEmail` - Email validation
  - [x] `validateWorkspaceName` - Workspace name validation
- [x] Create `tests/performance/performance-thresholds.test.ts` with threshold assertions:
  - [x] Message validation completes in <5ms for typical inputs
  - [x] Channel name validation completes in <1ms
  - [x] formatRelativeTime completes in <1ms per call
  - [x] Batch of 1000 validations completes in <100ms
  - [x] trackMessageLatency/trackChannelSwitch/trackAuthTime arithmetic finishes in <1ms
- [x] Add `test:bench` script to `package.json`
- [x] Add `test:perf` script to `package.json` for running threshold tests
- [x] Update `vitest.config.ts` to include performance bench files
- [x] All 29 benchmark and threshold tests pass

**Dependencies:**
dependsOn: ["10.6"]

**Technical Notes:**
- Vitest `bench` API used for micro-benchmarks (`vitest bench --run`)
- `performance.now()` used for threshold measurements in regular vitest tests
- Benchmarks measure ops/sec; thresholds assert actual timing
- DOMPurify HTML sanitization threshold set to 15ms (jsdom lazy-init overhead)
- `test:bench` runs `vitest bench`; `test:perf` runs `vitest run tests/performance`

**Files Created/Modified:**
- `tests/performance/benchmarks.bench.ts` — Vitest bench suite
- `tests/performance/performance-thresholds.test.ts` — 29 threshold tests
- `vitest.config.ts` — Added `tests/performance/**/*.test.ts` to include pattern
- `package.json` — Added `test:bench` and `test:perf` scripts

**Estimated Effort:** 3 hours

**Status:** DONE
