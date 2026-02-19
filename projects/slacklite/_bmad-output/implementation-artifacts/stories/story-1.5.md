# Story 1.5: Set Up Vercel Project via CLI

**Epic:** Epic 1 - Foundation

**Description:**
Link Next.js project to Vercel, configure environment variables for staging and production, enable preview deployments for pull requests. Set up CI/CD pipeline for automated deployments.

**Acceptance Criteria:**
- [ ] Vercel CLI installed: `pnpm add -g vercel`
- [ ] Vercel project linked: `vercel link` → connect to GitHub repository
- [ ] Environment variables added to Vercel (staging + production): Firebase config, Sentry DSN (if using)
- [ ] Preview deployments enabled for all pull requests
- [ ] Production domain configured (e.g., slacklite.app)
- [ ] First deployment successful: `vercel --prod` → app accessible at production URL
- [ ] Deployment status visible in Vercel dashboard
- [ ] GitHub Actions workflow created for automated deployments (`.github/workflows/deploy.yml`)

**Dependencies:**
dependsOn: ["1.1"]

**Technical Notes:**
- Vercel project configuration:
  - Framework: Next.js
  - Build command: `pnpm build`
  - Output directory: `.next`
  - Install command: `pnpm install`
- Environment variables to configure:
  - All NEXT_PUBLIC_FIREBASE_* variables
  - NODE_ENV (production)
- GitHub Actions workflow (.github/workflows/deploy.yml):
  ```yaml
  name: Deploy to Vercel
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '22'
        - run: npm install -g pnpm
        - run: pnpm install
        - run: pnpm build
        - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  ```
- Configure preview deployments for PRs (automatic in Vercel)

**Estimated Effort:** 2 hours
