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
- **Google OAuth client creation (generic OAuth clients) is not** (Google has no public API). If you need a custom OAuth client with redirect URIs, use the **web-browser skill** (zero-click Playwright CDP automation).

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

**If CLI cannot set it**: use the **web-browser skill** (see below).

### 7) Hosting (optional)

```bash
firebase init hosting --project "$PROJECT_ID"
firebase deploy --only hosting --project "$PROJECT_ID"
```

## Unavoidable UI steps (use web-browser skill)

### Google OAuth client creation

Google does not provide a public API for creating **generic** OAuth clients with redirect URIs.

If the app needs a dedicated OAuth client per project:
- **Use the web-browser skill** (Playwright CDP with persistent Chrome profile)
- Zero clicks required — fully automated via CDP
- Navigate to https://console.cloud.google.com/apis/credentials
- Click through the OAuth client creation flow programmatically

**Policy:** keep everything in one tab; navigate in place rather than opening new tabs when possible.

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

## Deploying Firebase Auth to Vercel (Next.js)

### Critical: CSP Configuration

**Problem:** Firebase Google Auth loads external scripts that will be blocked by strict Content Security Policy headers.

**Solution:** Update `next.config.ts` CSP to allow Google Auth domains:

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebase.com",
    "frame-src https://accounts.google.com",  // Required for Google Sign-In popup
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}
```

**Key additions for Firebase Auth:**
- `https://apis.google.com` in `script-src`
- `https://accounts.google.com` in `script-src` and `frame-src`

### Adding Environment Variables to Vercel

**Problem:** Using heredoc (`<<<`) or piped input with newlines causes URL encoding issues (`%0A` in values).

**Solution:** Use `echo -n` (no trailing newline) when adding env vars via CLI:

```bash
# ❌ WRONG - adds newline character
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "AIzaSy..."

# ✅ CORRECT - no newline
echo -n "AIzaSyD-HyULu4wPHZsRPHl_mOTDkp1cpofliTU" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
echo -n "notelite-app.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
echo -n "notelite-app" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo -n "notelite-app.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo -n "656802787955" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo -n "1:656802787955:web:f0699073fc24e5514ab006" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
```

### Authorized Domains in Firebase

**Required:** Add your deployment domains to Firebase Auth → Settings → Authorized domains:

- `localhost` (for local development)
- `your-app.vercel.app` (production)
- Any custom domains

**Via Firebase Console:**
https://console.firebase.google.com/project/YOUR_PROJECT/authentication/settings

Or use **web-browser skill** to automate this via CDP.

### Deployment Checklist

1. ✅ Configure CSP headers in `next.config.ts`
2. ✅ Add Firebase env vars to Vercel (using `echo -n`)
3. ✅ Add deployment domains to Firebase Authorized domains
4. ✅ Test on `localhost` before deploying to production
5. ✅ Verify Google Sign-In works on production URL
