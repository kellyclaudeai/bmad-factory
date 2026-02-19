# Story 11.3: Configure Monitoring & Error Tracking (Sentry)

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Set up Sentry for error tracking and monitoring. Configure real-time error alerts, performance monitoring, and user feedback collection with proper data sanitization.

**Acceptance Criteria:**
- [ ] Create Sentry account and project
- [ ] Install Sentry SDK: `pnpm add @sentry/nextjs`
- [ ] Configure Sentry: `sentry.client.config.ts`, `sentry.server.config.ts`
- [ ] Enable error tracking: Unhandled exceptions, promise rejections
- [ ] Enable performance monitoring: Page load, API calls, real-time updates
- [ ] Configure source maps upload for production debugging
- [ ] Set up error alerts: Slack/email notifications for critical errors
- [ ] Sanitize sensitive data: Remove user emails, passwords from error reports
- [ ] Test: Trigger test error, verify appears in Sentry dashboard
- [ ] Configure error rate alerts: >10 errors/minute = critical alert

**Dependencies:**
dependsOn: ["1.1"]

**Technical Notes:**
- Install Sentry:
  ```bash
  pnpm add @sentry/nextjs
  npx @sentry/wizard -i nextjs
  ```
- Sentry client configuration (sentry.client.config.ts):
  ```typescript
  import * as Sentry from '@sentry/nextjs';

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', 'slacklite.app'],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event, hint) {
      // Sanitize sensitive data
      if (event.user) {
        delete event.user.email;
      }
      if (event.request?.data) {
        delete event.request.data.password;
      }
      return event;
    },
  });
  ```
- Sentry server configuration (sentry.server.config.ts):
  ```typescript
  import * as Sentry from '@sentry/nextjs';

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  ```
- Next.js configuration (next.config.mjs):
  ```javascript
  import { withSentryConfig } from '@sentry/nextjs';

  const config = {
    // ... existing config
  };

  export default withSentryConfig(config, {
    silent: true,
    org: 'slacklite',
    project: 'slacklite-web',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  });
  ```
- Error alerts (Sentry Dashboard):
  - Create alert rule: "Error rate > 10/minute"
  - Notification channels: Slack, email
  - Action: Send alert to #alerts channel
- Test error:
  ```typescript
  // Add test button in dev mode
  <button onClick={() => { throw new Error('Sentry test error'); }}>
    Test Sentry
  </button>
  ```

**Estimated Effort:** 2 hours
