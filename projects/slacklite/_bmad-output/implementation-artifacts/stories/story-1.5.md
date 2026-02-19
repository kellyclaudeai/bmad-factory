# Story 1.5: Set Up Vercel Project via CLI

**Epic:** Epic 1 - Foundation

**Description:**
Link Next.js project to Vercel, configure environment variables for staging and production, enable preview deployments for pull requests. Set up CI/CD pipeline for automated deployments.

**Acceptance Criteria:**
- [x] Vercel CLI installed: `pnpm add -g vercel` (already installed at `/opt/homebrew/bin/vercel`)
- [x] Vercel project linked: `vercel link` → connect to GitHub repository (linked to kelly-1224s-projects/slacklite)
- [ ] Environment variables added to Vercel (staging + production): Firebase config, Sentry DSN (if using) **[NEEDS ATTENTION: Firebase env vars not yet configured]**
- [x] Preview deployments enabled for all pull requests (automatic in Vercel)
- [x] Production domain configured (e.g., slacklite.app) (aliased to slacklite.app, SSL provisioning in progress)
- [x] First deployment successful: `vercel --prod` → app accessible at production URL
- [x] Deployment status visible in Vercel dashboard
- [ ] GitHub Actions workflow created for automated deployments (`.github/workflows/deploy.yml`) **[TODO: Create CI/CD workflow]**

## Deployment Information
**Production URL:** https://slacklite-2rozi3fqx-kelly-1224s-projects.vercel.app  
**Custom Domain:** https://slacklite.app (SSL being provisioned asynchronously)  
**Deployment Date:** 2026-02-19  
**Build Time:** ~40s

## Notes
- Deployment completed successfully to Vercel
- App is live but returns 401 because Firebase environment variables are not yet configured
- Need to add Firebase env vars to Vercel project settings:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID
  - NEXT_PUBLIC_FIREBASE_DATABASE_URL
- Firebase config implementation is pending (Story 1.2)
- Custom domain slacklite.app is aliased but SSL certificate is still provisioning

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
