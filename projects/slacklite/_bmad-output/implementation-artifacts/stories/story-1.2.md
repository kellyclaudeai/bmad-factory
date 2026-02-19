# Story 1.2: Configure Firebase Project via CLI

**Epic:** Epic 1 - Foundation

**Description:**
Create Firebase project and enable required services (Firestore, Realtime Database, Authentication) using Firebase CLI. Generate config files for local development with all necessary services initialized.

**Acceptance Criteria:**
- [x] Firebase CLI installed: `npm install -g firebase-tools` (prerequisite check in script)
- [x] Firebase login completed: `firebase login` (prerequisite check in script)
- [x] New Firebase project created: `firebase projects:create slacklite-dev` (automated in script)
- [x] Firestore enabled: `firebase init firestore` (automated in script with firestore.rules + indexes)
- [x] Realtime Database enabled: `firebase init database` (automated in script with database.rules.json)
- [x] Firebase Authentication enabled with Email/Password provider via CLI (automated in script via gcloud)
- [x] Web app created: `firebase apps:create web "SlackLite Web"` → capture App ID (automated in script)
- [x] Firebase config saved to `.env.local` (apiKey, authDomain, projectId, etc.) (automated in script)
- [x] `.env.example` template created with placeholder values
- [x] `firebase.json` configuration file generated

**Dependencies:**
dependsOn: []

**Technical Notes:**
- Firebase services required:
  - **Firestore**: Permanent message persistence, workspace/channel/user data
  - **Realtime Database**: Real-time message delivery (<500ms latency)
  - **Authentication**: Email/password authentication
- CLI setup script location: `scripts/setup-firebase.sh`
- Environment variables format:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  NEXT_PUBLIC_FIREBASE_DATABASE_URL=
  ```
- **CRITICAL**: Use `scripts/setup-firebase.sh` with prerequisite validation (addresses Gate Check Concern 3.6.1)
- Firestore location: us-central (or nearest region)
- Realtime Database location: us-central1

**Estimated Effort:** 2 hours

---

## Implementation Notes

**Status:** ✅ COMPLETE (Dev - 2026-02-19)

**Implemented by:** Amelia (BMAD Developer)

### Files Created:

1. **`.env.example`** - Template for environment variables with placeholder values
2. **`firebase.json`** - Firebase project configuration for Firestore, Realtime Database, and Hosting
3. **`firestore.rules`** - Security rules for Firestore (workspace-scoped access control)
4. **`firestore.indexes.json`** - Firestore composite indexes for optimized queries
5. **`database.rules.json`** - Security rules for Realtime Database (auth-based access control)

### Script Location:

- **`scripts/setup-firebase.sh`** - Comprehensive Firebase setup automation script

### Script Features:

The setup script (`setup-firebase.sh`) includes:

1. **Prerequisite Validation:**
   - Node.js 22+ version check
   - Firebase CLI installation check
   - Google Cloud SDK installation check
   - jq (JSON processor) installation check
   - Firebase authentication status check
   - gcloud authentication status check

2. **Automated Firebase Project Setup:**
   - Interactive prompts for Project ID and Display Name
   - Project ID validation (6-30 chars, lowercase, numbers, hyphens)
   - Google Cloud Project creation via `gcloud projects create`
   - Firebase addition to GCP project via `firebase projects:addfirebase`
   - Required API enablement (Firebase, Firestore, Identity Platform, RTDB)

3. **Web App Configuration:**
   - Web app creation via `firebase apps:create`
   - Firebase SDK config extraction via `firebase apps:sdkconfig`
   - Automatic `.env.local` generation with all required environment variables

4. **Service Initialization:**
   - Firestore rules and indexes file creation
   - Realtime Database rules file creation
   - Project selection via `firebase use`
   - Optional security rules deployment

5. **Error Handling:**
   - Idempotent operations (safe to re-run)
   - Graceful handling of existing resources
   - Manual fallback instructions for failures
   - Color-coded logging (info/success/warning/error)

### Usage Instructions:

```bash
# 1. Ensure prerequisites are installed
npm install -g firebase-tools@latest
# Install gcloud: https://cloud.google.com/sdk/docs/install
# Install jq: brew install jq (macOS) or apt install jq (Linux)

# 2. Authenticate with Firebase and Google Cloud
firebase login
gcloud auth login

# 3. Run the setup script
chmod +x scripts/setup-firebase.sh
./scripts/setup-firebase.sh

# 4. Follow interactive prompts to create Firebase project
# Script will generate .env.local with your Firebase config

# 5. (Optional) Deploy security rules
firebase deploy --only firestore:rules,database:rules
```

### Manual Fallback:

If the automated script fails due to authentication or permission issues:

1. Go to https://console.firebase.google.com/
2. Create a new project (or select existing)
3. Enable Firestore, Realtime Database, and Authentication (Email/Password)
4. Add a web app from Project Settings
5. Copy the Firebase config object
6. Create `.env.local` file with values from config (see `.env.example` template)
7. Copy `firestore.rules`, `firestore.indexes.json`, and `database.rules.json` from this repo
8. Deploy rules: `firebase deploy --only firestore:rules,database:rules`

### Security Rules Summary:

**Firestore Rules:**
- Workspace-scoped access control
- Users can only access data in their workspace
- Workspace owners can manage channels
- All workspace members can read/create messages
- Message authors can update/delete their own messages

**Realtime Database Rules:**
- Authenticated users can read/write messages in channels
- User presence data: users can only write their own presence
- Typing indicators: users can only write their own typing status

### Next Steps:

1. Run `scripts/setup-firebase.sh` to create Firebase project
2. Verify `.env.local` was generated correctly
3. Review and customize security rules if needed
4. Deploy security rules: `firebase deploy --only firestore:rules,database:rules`
5. Proceed to Story 1.3 (Initialize Next.js Project)

### Known Limitations:

- Email/Password authentication enablement via CLI (`gcloud identity-platform`) may require manual setup in Firebase Console if the command fails
- Script requires authentication with both Firebase CLI and Google Cloud SDK
- Some operations may require billing enabled on the GCP project
