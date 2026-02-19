# Story 11.1: Configure Production Firebase Project

**Epic:** Epic 11 - Deployment & Production Readiness

**Description:**
Create production Firebase project, configure all services (Firestore, RTDB, Auth), set up billing, and configure production environment variables with proper security.

**Acceptance Criteria:**
- [ ] Firebase CLI: Create production project: `firebase projects:create slacklite-prod`
- [ ] Enable Firestore: Production mode, us-central region
- [ ] Enable Realtime Database: Production mode, us-central1
- [ ] Enable Authentication: Email/Password provider
- [ ] Configure billing: Set up billing account, enable Blaze plan
- [ ] Set billing alerts: $50, $200, $500 thresholds (Story 11.5)
- [ ] Create production web app: `firebase apps:create web "SlackLite Production"`
- [ ] Add production environment variables to Vercel:
  - [ ] NEXT_PUBLIC_FIREBASE_* (production config)
  - [ ] FIREBASE_ADMIN_* (server-side credentials)
- [ ] Deploy security rules: `firebase deploy --only firestore:rules,database:rules`
- [ ] Test production Firebase: Create test workspace, send test message

**Dependencies:**
dependsOn: ["1.2"]

**Technical Notes:**
- Create production Firebase project:
  ```bash
  # Create project
  firebase projects:create slacklite-prod

  # Switch to production project
  firebase use slacklite-prod

  # Enable services
  firebase init firestore
  firebase init database
  firebase init auth
  ```
- Configure Firestore:
  - Location: us-central (or nearest to target users)
  - Mode: Production (not test mode)
  - Security rules: Deploy from `firestore.rules`
- Configure RTDB:
  - Location: us-central1
  - Security rules: Deploy from `database.rules.json`
- Billing setup:
  ```bash
  # Link billing account (via console or CLI)
  gcloud billing accounts list
  gcloud billing projects link slacklite-prod --billing-account=<ACCOUNT_ID>
  ```
- Add production environment variables to Vercel:
  ```bash
  vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
  vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
  vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
  vercel env add NEXT_PUBLIC_FIREBASE_DATABASE_URL
  ```
- Deploy security rules:
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only database:rules
  ```

**Estimated Effort:** 2 hours
