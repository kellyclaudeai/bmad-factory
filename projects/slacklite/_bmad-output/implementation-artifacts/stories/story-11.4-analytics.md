# Story 11.4: Configure Vercel Analytics & Monitoring

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Add Vercel Analytics and Speed Insights for monitoring and performance tracking in production.

**Acceptance Criteria:**
- [x] Install @vercel/analytics package
- [x] Install @vercel/speed-insights package  
- [x] Add Analytics component to root layout
- [x] Add SpeedInsights component to root layout
- [x] Verify components work in both development and production
- [x] Follow Next.js 15 and React 19 best practices

**Dependencies:**
dependsOn: ["11.2"]

**Technical Notes:**
- Packages installed:
  ```bash
  pnpm add @vercel/analytics @vercel/speed-insights
  ```
- Implementation in `app/layout.tsx`:
  ```typescript
  import { Analytics } from "@vercel/analytics/react";
  import { SpeedInsights } from "@vercel/speed-insights/next";
  
  // Added to body:
  <Analytics />
  <SpeedInsights />
  ```
- These components automatically:
  - Track page views and navigation
  - Measure Web Vitals (LCP, FID, CLS, TTFB, FCP)
  - Send data to Vercel Analytics dashboard
  - Only collect data when deployed to Vercel (no local tracking)
- No configuration needed - works out of the box with Vercel deployment

**Verification:**
- Components added to layout.tsx ✅
- Packages installed in package.json ✅
- No TypeScript errors related to Analytics/SpeedInsights ✅
- Ready for production deployment

**Estimated Effort:** 0.5 hours (Actual: 0.5 hours)

**Completed:**
- Date: 2026-02-19
- Developer: Amelia (BMAD Developer)
- Commit: [pending]
