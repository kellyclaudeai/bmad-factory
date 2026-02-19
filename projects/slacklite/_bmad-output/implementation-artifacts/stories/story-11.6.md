# Story 11.6: Create CI/CD Pipeline (GitHub Actions)

**Epic:** Epic 11 - Deployment & Production Readiness

**Status:** Done

**Description:**
Set up GitHub Actions workflows for automated testing, preview deployments, and production rollouts. The pipeline ensures code quality gates are enforced on every pull request and automates deployment to Vercel on merge to main.

**Acceptance Criteria:**
- [x] CI workflow runs on pull requests to `main` branch
- [x] CI workflow includes: lint, type-check, unit tests with coverage, E2E tests, and Next.js build
- [x] Firebase security rules integration tests run in CI (conditional on test file existence)
- [x] Preview deployments triggered on PRs via Vercel
- [x] PR comment posted with preview deployment URL
- [x] Production deployment triggered on push to `main` (after tests pass)
- [x] Security tests workflow runs Firestore security rules tests
- [x] All workflows use pnpm with frozen lockfile for reproducible installs
- [x] Workflows use Node.js 22 and pnpm 10

**Dependencies:**
dependsOn: ["10.1", "10.5"]

**Technical Notes:**
Three workflow files implemented in `.github/workflows/`:

### `ci.yml` — CI/CD Pipeline
- Triggers on PRs to `main`
- Jobs: `test` → `deploy-preview`
- Test suite: lint → type-check → unit tests → Firebase integration tests (conditional) → E2E tests (conditional) → build
- Deploy preview: Uses `amondnet/vercel-action@v25`, posts PR comment with preview URL

### `deploy.yml` — Deploy to Vercel
- Triggers on push to `main`
- Jobs: `test` → `deploy-production`
- Same test suite as CI plus Firebase emulator integration tests (conditional)
- Production deploy: Uses `amondnet/vercel-action@v25` with `--prod` flag

### `security-tests.yml` — Security Tests
- Triggers on all PRs
- Runs Firestore security rules tests via `pnpm test:firestore-rules`
- Uses Firebase CLI + Firebase Emulator

**Required GitHub Secrets:**
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID
- `GITHUB_TOKEN` — Auto-provided by GitHub Actions

**Estimated Effort:** 2-3 hours

**Completion Notes:**
All three workflow files were implemented as part of the initial project setup. The workflows align with the architecture specification in `architecture.md` Section 7.3. All required `package.json` scripts (`test:coverage`, `test:firestore-rules`, `test:integration:firebase-rules`, `test:e2e`, `lint`, `build`) are defined and wired correctly.
