# Story 11.2: Set Up CI/CD Pipeline with GitHub Actions

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Configure GitHub Actions for automated testing, security checks, and deployments to Vercel staging/production with proper branch protection and approval gates.

**Acceptance Criteria:**

- [x] GitHub Actions workflow: `.github/workflows/ci.yml`
- [x] On pull request:
  - [x] Run unit tests (Vitest)
  - [x] Run security rule tests (Firebase Emulator)
  - [x] Run linting (ESLint)
  - [x] Build Next.js app
  - [x] Deploy to Vercel preview URL
- [x] On merge to main:
  - [x] Run all tests
  - [x] Deploy to Vercel production
- [x] Branch protection rules:
  - [x] Require PR reviews (1 reviewer minimum)
  - [x] Require CI checks to pass before merge
  - [x] No direct pushes to main
- [x] Deployment status visible in GitHub PR comments
- [x] Rollback strategy: Revert commit or redeploy previous version

**Dependencies:**
dependsOn: ["1.5"]

**Technical Notes:**

- GitHub Actions CI workflow (.github/workflows/ci.yml):

  ```yaml
  name: CI/CD Pipeline

  on:
    pull_request:
      branches: [main]
    push:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: "22"
            cache: "pnpm"

        - name: Install dependencies
          run: pnpm install

        - name: Run linting
          run: pnpm lint

        - name: Run unit tests
          run: pnpm test:coverage

        - name: Run Firebase Emulator tests
          run: |
            npm install -g firebase-tools
            firebase emulators:exec --only firestore,database "pnpm test tests/integration"

        - name: Build Next.js app
          run: pnpm build

    deploy-preview:
      needs: test
      if: github.event_name == 'pull_request'
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Deploy to Vercel Preview
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            scope: ${{ secrets.VERCEL_ORG_ID }}

    deploy-production:
      needs: test
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Deploy to Vercel Production
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            vercel-args: "--prod"
            scope: ${{ secrets.VERCEL_ORG_ID }}
  ```

- Branch protection rules (GitHub Settings → Branches):
  - Require pull request reviews: 1 approval
  - Require status checks: `test`, `deploy-preview`
  - No force pushes
  - No deletions
- Secrets to add to GitHub:
  - `VERCEL_TOKEN`: Vercel API token
  - `VERCEL_ORG_ID`: Vercel organization ID
  - `VERCEL_PROJECT_ID`: Vercel project ID

**Estimated Effort:** 2 hours
