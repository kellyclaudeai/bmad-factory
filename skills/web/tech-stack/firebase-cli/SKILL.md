---
name: firebase-cli
description: Automate Firebase + Google Cloud backend provisioning via CLI (create GCP/Firebase projects, enable APIs, configure Authentication/Firestore/Hosting, create web apps, fetch SDK config, and deploy). Use when spinning up new Firebase projects for the software factory, setting up backends programmatically, or troubleshooting Firebase CLI/GCP setup. Includes guidance for the remaining non-API Google OAuth client steps and when to use browser automation.
---

# Firebase CLI Automation (Software Factory)

## Assumptions

- You have `gcloud` and `firebase` installed.
- You are authenticated in `gcloud` and `firebase` on the host.

## Core idea

- **Project creation and Firebase enablement are fully automatable via CLI.**
- **Google OAuth client creation (generic OAuth clients) is not** (Google has no public API). If you need a custom OAuth client with redirect URIs, use browser automation (Chrome Relay / CDP) as the fallback.

## Provision a new Firebase backend (CLI-first)

### 1) Create a GCP project

Pick a unique `PROJECT_ID` (lowercase, digits, hyphens).

```bash
gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME"
```

Optionally link billing (often required for some APIs/quotas):

```bash
# List billing accounts
gcloud beta billing accounts list

# Link billing
gcloud beta billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
```

### 2) Enable Firebase on the project

```bash
firebase projects:addfirebase "$PROJECT_ID"
```

### 3) Enable required APIs

Common set for auth + firestore + hosting + identity:

```bash
gcloud services enable \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com \
  firestore.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project "$PROJECT_ID"
```

### 4) Create a Firebase Web App and fetch config

```bash
APP_ID=$(firebase apps:create web "$APP_NAME" --project "$PROJECT_ID" --json | jq -r '.result.appId')
firebase apps:sdkconfig web "$APP_ID" --project "$PROJECT_ID" --json
```

Use the returned values to populate Next.js env vars:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 5) Initialize Firestore (if needed)

Firestore requires location selection; the CLI path can be interactive. Preferred approach:
- Use the Firebase console once per project for Firestore location **or** ensure you have an established pattern/location.

Then:
```bash
firebase init firestore --project "$PROJECT_ID"
```

### 6) Enable Firebase Authentication providers

Some auth provider toggles still lean on console/UI. For **Google provider (Sign-in with Google)** in Firebase Auth, the provider is usually available without creating a separate OAuth client, but consent screen / branding may still require UI.

**If CLI cannot set it**: use browser automation (see below).

### 7) Hosting (optional)

```bash
firebase init hosting --project "$PROJECT_ID"
firebase deploy --only hosting --project "$PROJECT_ID"
```

## Unavoidable UI steps (use browser automation)

### Google OAuth client creation

Google does not provide a public API for creating **generic** OAuth clients with redirect URIs.

If the app needs a dedicated OAuth client per project:
- Use Chrome Relay driver (preferred when you want to reuse your existing Chrome session)
- Or use Playwright CDP automation profile (when Relay isn’t available)

**Policy:** keep everything in one attached tab; if a popup/new tab appears, navigate the current tab to the popup URL when possible.

## Factory conventions

- Prefer deterministic CLI output (`--json`) and capture:
  - `project_id`, `app_id`, Firebase web config
- Store generated env fragments in:
  - `projects/<repo>/.env.firebase` (append into `.env.local`)
- Keep billing optional (fastest) but detect failures and surface:
  - "billing required" / "quota" errors

## Troubleshooting

- `firebase` auth issues: run `firebase login` and `firebase projects:list`
- `gcloud` auth issues: `gcloud auth list` + `gcloud config set account ...`
- API enablement errors: re-run `gcloud services enable ...`
