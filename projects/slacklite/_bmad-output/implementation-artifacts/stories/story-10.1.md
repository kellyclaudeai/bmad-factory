# Story 10.1: Set Up Testing Infrastructure (Vitest, Playwright)

**Epic:** Epic 10 - Testing & Quality Assurance

**Description:**
Initialize testing infrastructure with Vitest for unit/integration tests and Playwright for E2E tests. Configure test runners, coverage reporting, and CI integration.

**Acceptance Criteria:**
- [ ] Install Vitest: `pnpm add -D vitest @vitest/ui`
- [ ] Install Playwright: `pnpm add -D @playwright/test`
- [ ] Configure Vitest: `vitest.config.ts` with React Testing Library
- [ ] Configure Playwright: `playwright.config.ts` with browsers (Chromium, Firefox, WebKit)
- [ ] npm scripts:
  - [ ] `"test": "vitest"`
  - [ ] `"test:ui": "vitest --ui"`
  - [ ] `"test:coverage": "vitest --coverage"`
  - [ ] `"test:e2e": "playwright test"`
- [ ] Test directories: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- [ ] CI integration: GitHub Actions workflow runs tests on PR
- [ ] Coverage reporting: 80% minimum target

**Dependencies:**
dependsOn: ["1.1"]

**Technical Notes:**
- Vitest configuration (vitest.config.ts):
  ```typescript
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        threshold: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  });
  ```
- Playwright configuration (playwright.config.ts):
  ```typescript
  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
    },
    projects: [
      { name: 'chromium', use: { browserName: 'chromium' } },
      { name: 'firefox', use: { browserName: 'firefox' } },
      { name: 'webkit', use: { browserName: 'webkit' } },
    ],
    webServer: {
      command: 'pnpm dev',
      port: 3000,
      reuseExistingServer: true,
    },
  });
  ```
- GitHub Actions workflow (.github/workflows/test.yml):
  ```yaml
  name: Tests
  on: [pull_request]
  jobs:
    unit:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: pnpm install
        - run: pnpm test:coverage
    e2e:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: pnpm install
        - run: npx playwright install --with-deps
        - run: pnpm test:e2e
  ```

**Estimated Effort:** 2 hours
