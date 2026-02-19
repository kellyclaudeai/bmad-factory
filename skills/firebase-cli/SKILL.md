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

**CRITICAL:** Add your deployment domains to Firebase Auth → Settings → Authorized domains **immediately after deploying to Vercel**.

**What happens if you skip this:**
```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
Info: The current domain is not authorized for OAuth operations.
```
Google Sign-In will fail on production until the domain is authorized.

**Required domains:**
- `localhost` (for local development) — usually added by default
- `your-app.vercel.app` (production) — **must be added manually after first deploy**
- `your-app.firebaseapp.com` (default)
- `your-app.web.app` (default)
- Any custom domains

**Via Firebase Console (manual):**
1. Go to https://console.firebase.google.com/project/YOUR_PROJECT/authentication/settings
2. Click "Authorized domains" tab
3. Click "Add domain"
4. Enter `your-app.vercel.app`
5. Click "Add"

**Via web-browser skill (automated):**
Use the browser tool to automate domain addition via CDP (zero clicks required).

### Deployment Checklist

1. ✅ Configure CSP headers in `next.config.ts`
2. ✅ Add Firebase env vars to Vercel (using `echo -n`)
3. ✅ **Add deployment domains to Firebase Authorized domains** ⚠️ **DO THIS IMMEDIATELY AFTER FIRST DEPLOY** — auth will fail on production until this is done
4. ✅ Test on `localhost` before deploying to production
5. ✅ Verify Google Sign-In works on production URL (may need hard refresh to clear cached CSP)

## signInWithRedirect vs signInWithPopup (CRITICAL)

### The Problem: Cross-Origin Storage Access

**TL;DR:** `signInWithRedirect()` is broken in production on modern browsers. Use `signInWithPopup()` instead, or implement a reverse proxy.

Firebase's `signInWithRedirect()` uses a **cross-origin iframe** to handle authentication. This iframe connects to your Firebase authDomain (e.g., `your-app.firebaseapp.com`) to perform the OAuth flow. Modern browsers (Safari, Chrome in Incognito, Firefox with tracking protection) **block third-party storage access**, which prevents the redirect result from being captured.

**Symptoms:**
- OAuth flow completes successfully (user → Google → consent → redirect back to your app)
- `getRedirectResult()` returns `null` even though redirect happened
- User stays on landing page instead of being signed in
- Console shows COOP policy errors: `"Cross-Origin-Opener-Policy policy would block the window.closed call"`
- Firebase `init.json` 404 errors

**Official Firebase documentation:** https://firebase.google.com/docs/auth/web/redirect-best-practices

### Solutions (in order of preference)

#### 1. Use signInWithPopup (Easiest - Works Immediately)

**Change:**
```typescript
// ❌ BROKEN in production (third-party storage blocked)
await signInWithRedirect(auth, provider);
// Later: const result = await getRedirectResult(auth); // returns null

// ✅ WORKS everywhere (no cross-origin issues)
const result = await signInWithPopup(auth, provider);
// UserCredential returned immediately, no second call needed
```

**Pros:**
- 2-line fix
- Works on all browsers immediately
- No server-side changes needed

**Cons:**
- Popups can be blocked by browser/extensions
- Less smooth UX on mobile (context switch)

**When to use:** Default choice for all projects unless mobile UX is critical.

#### 2. Reverse Proxy (Better UX, More Setup)

Proxy auth requests to Firebase's domain to eliminate cross-origin access:

**Next.js `next.config.ts`:**
```typescript
async rewrites() {
  return [
    {
      source: '/__/auth/:path*',
      destination: 'https://YOUR-PROJECT.firebaseapp.com/__/auth/:path*',
    },
    {
      source: '/__/firebase/:path*',
      destination: 'https://YOUR-PROJECT.firebaseapp.com/__/firebase/:path*',
    }
  ];
}
```

Then update Firebase config to use your custom domain as `authDomain`:
```typescript
const firebaseConfig = {
  authDomain: "your-custom-domain.com",  // Not .firebaseapp.com
  // ... rest of config
};
```

**Important:** Also add `your-custom-domain.com` to:
- Firebase Auth → Authorized domains
- OAuth provider redirect URIs (e.g., Google Cloud Console)

**When to use:** When mobile UX matters and you can handle server-side rewrites.

#### 3. Use Google Sign-In SDK Directly (Most Reliable)

Skip Firebase's auth helpers entirely:

```typescript
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Use Google's JavaScript client library
// https://developers.google.com/identity/gsi/web/guides/overview
const googleUser = await gapi.auth2.getAuthInstance().currentUser.get();
const credential = GoogleAuthProvider.credential(
  googleUser.getAuthResponse().id_token
);
const result = await signInWithCredential(auth, credential);
```

**When to use:** Enterprise apps requiring maximum reliability across all platforms.

### Factory Standard

**Always use reverse proxy approach (Option 3) for Firebase Auth in production web apps.**

This is the ONLY solution that works reliably on Vercel/Netlify production with modern browsers.

**Implementation checklist:**
1. ✅ Add Next.js rewrites to proxy `/__/auth/*` and `/__/firebase/*`
2. ✅ Set dynamic `authDomain` based on hostname (custom domain in prod, localhost in dev)
3. ✅ Update CSP to include `'self'` in `frame-src`
4. ✅ Add custom domain to Google OAuth redirect URIs
5. ✅ Add custom domain to Authorized JavaScript origins
6. ✅ Test auth flow end-to-end on production URL

**Document this approach in project README and commit messages.**

### Verified Working Setup (NoteLite Reference)

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/__/auth/:path*',
      destination: 'https://YOUR-PROJECT.firebaseapp.com/__/auth/:path*',
    },
    {
      source: '/__/firebase/:path*',
      destination: 'https://YOUR-PROJECT.firebaseapp.com/__/firebase/:path*',
    }
  ];
}

// CSP headers
"frame-src 'self' https://accounts.google.com https://YOUR-PROJECT.firebaseapp.com"

// lib/firebase/config.ts
const getAuthDomain = (): string => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!;
  const hostname = window.location.hostname;
  
  // Production: use custom domain (leverages reverse proxy)
  if (hostname.includes('vercel.app') || hostname.includes('yourdomain.')) {
    return hostname;
  }
  
  // Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  // Fallback
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!;
};
```

This approach eliminates ALL cross-origin issues by making auth requests same-origin.
