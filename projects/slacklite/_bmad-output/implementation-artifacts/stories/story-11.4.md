# Story 11.4: Production Deployment Checklist & Go-Live

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Complete final production deployment checklist, perform smoke tests, and execute go-live process with rollback plan and monitoring validation.

**Acceptance Criteria:**
- [ ] **Pre-deployment checklist:**
  - [ ] All tests passing (unit, integration, E2E)
  - [ ] Security audit complete (Story 9.5)
  - [ ] Performance targets met (<500ms message delivery, <2s page load)
  - [ ] Environment variables configured in Vercel
  - [ ] Firebase production project configured
  - [ ] Sentry error tracking enabled
  - [ ] Domain configured (e.g., slacklite.app)
  - [ ] SSL/HTTPS enforced
- [ ] **Smoke tests (production):**
  - [ ] Sign up new user → Success
  - [ ] Create workspace → Success
  - [ ] Create channel → Success
  - [ ] Send message → Delivered in <500ms
  - [ ] Real-time updates work → Other users see message
  - [ ] Mobile web works → Test on real device
- [ ] **Go-live:**
  - [ ] Deploy to production: `vercel --prod`
  - [ ] Verify production URL accessible
  - [ ] Test with real users (5-10 beta testers)
  - [ ] Monitor error rates in Sentry (first 24 hours)
  - [ ] Monitor Firebase usage/costs
- [ ] **Rollback plan:**
  - [ ] Document: How to revert to previous version
  - [ ] Test rollback: `vercel rollback`
  - [ ] 24-hour on-call rotation (first week)
- [ ] **Documentation:**
  - [ ] README updated with production URLs
  - [ ] User guide: "Getting Started with SlackLite"
  - [ ] Admin guide: "Operating SlackLite in Production"

**Dependencies:**
dependsOn: ["11.1", "11.2", "11.3"]

**Technical Notes:**
- Production deployment checklist (docs/deployment-checklist.md):
  ```markdown
  # SlackLite Production Deployment Checklist

  ## Pre-Deployment
  - [ ] All tests passing
  - [ ] Security audit complete
  - [ ] Performance benchmarks met
  - [ ] Environment variables configured
  - [ ] Firebase production ready
  - [ ] Sentry enabled
  - [ ] Domain + SSL configured

  ## Deployment
  1. Merge final PR to main
  2. GitHub Actions deploys to production
  3. Verify production URL: https://slacklite.app
  4. Run smoke tests

  ## Smoke Tests
  - [ ] Sign up: test+prod@example.com / password123
  - [ ] Create workspace: "Production Test"
  - [ ] Create channel: #test
  - [ ] Send message: "Production test message"
  - [ ] Verify real-time delivery (<500ms)
  - [ ] Test on mobile (iOS/Android)

  ## Post-Deployment Monitoring (24 hours)
  - [ ] Sentry error rate: <1 error/minute
  - [ ] Firebase usage: Within budget
  - [ ] Vercel analytics: Page load <2s
  - [ ] User feedback: No critical issues

  ## Rollback (if needed)
  ```bash
  vercel rollback
  # Or revert commit and redeploy
  git revert HEAD
  git push origin main
  ```
  ```
- Go-live announcement:
  - Post to Indie Hackers, r/startups, HackerNews
  - Share production URL: https://slacklite.app
  - Invite beta testers
- 24-hour monitoring:
  - Check Sentry dashboard every 2 hours
  - Monitor Firebase usage/costs
  - Respond to user feedback immediately

**Estimated Effort:** 3 hours
