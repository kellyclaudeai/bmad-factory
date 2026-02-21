---
name: supabase
description: Set up and use Supabase for factory projects. Covers CLI project creation, Authentication (email, Google OAuth, magic links), PostgreSQL database with Row Level Security, Edge Functions (free tier — no Blaze equivalent needed), Storage, Realtime subscriptions, local development, and Vercel deployment. Use when a new project needs a backend with auth + Postgres + serverless functions, or when choosing between Supabase and Firebase.
---

# Supabase (Factory Reference)

## CLI-First Rule

**Always prefer CLI + Management API over the Supabase dashboard.** Every setup step should be automatable. If no CLI exists for a step, use the **web-browser skill** (Playwright CDP) as fallback — never ask a human to click through a dashboard manually.

- CLI: `supabase` CLI + Supabase Management API (`api.supabase.com/v1/...`)
- Fallback: `web-browser` skill → automated browser via CDP
- Last resort: document the manual step clearly so a human can do it once

## When to choose Supabase over Firebase

- Project needs **SQL / relational data** (joins, complex queries, full-text search)
- Backend logic needed but **no pay-as-you-go upgrade** wanted — Edge Functions are free-tier
- Row Level Security (RLS) preferred over Firestore rules
- Want Postgres tooling (Drizzle, Prisma, psql, pgAdmin)
- **Firebase Gen 2 Cloud Functions require Blaze plan** — Supabase Edge Functions do not

## CLI Setup

```bash
npm install -g supabase
supabase login
supabase init          # in project root — creates supabase/ config dir
supabase start         # starts full local stack (Postgres + Auth + Storage + Edge)
supabase stop
```

## Create a new Supabase project (CLI)

```bash
# Create project via Supabase Management API (CLI-first)
curl -X POST https://api.supabase.com/v1/projects \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-project","organization_id":"<org-id>","plan":"free","region":"us-east-1","db_pass":"<strong-password>"}'

# Then link locally:
supabase link --project-ref <project-ref>
supabase db pull        # pull remote schema to local
```

**Fallback:** If Management API unavailable or org-id unknown → use **web-browser skill** to create via https://supabase.com/dashboard/new/_

## Environment Variables (Next.js)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, never expose to client
```

## Client Setup

```ts
// lib/supabase/client.ts — browser client
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/supabase/server.ts — server component / route handler client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies().getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookies().set(name, value, options)) } }
  )
```

## Auth

**Default for all factory projects: Google OAuth + Email/Password. Both must be implemented. No exceptions unless intake.md explicitly specifies otherwise.**

Enable both via Management API (CLI-first):
```bash
# Enable email provider
curl -X PUT "https://api.supabase.com/v1/projects/<ref>/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"external_email_enabled":true,"mailer_autoconfirm":false}'

# Enable Google OAuth (requires Client ID + Secret from Google Cloud Console)
curl -X PUT "https://api.supabase.com/v1/projects/<ref>/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"external_google_enabled":true,"external_google_client_id":"<id>","external_google_secret":"<secret>"}'
```
- Google OAuth credentials: Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs
- Authorized redirect URI to add: `https://<ref>.supabase.co/auth/v1/callback`
- **Fallback:** If API fails → use **web-browser skill** → Supabase dashboard → Auth → Providers

```ts
// Email + password
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })

// Google OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
})

// Sign out
await supabase.auth.signOut()

// Get session (server)
const { data: { session } } = await supabase.auth.getSession()
```

**Login page must include both:** email/password form + "Continue with Google" button. Google button uses `signInWithOAuth`, form uses `signInWithPassword`. Sign up page same pattern.

**Auth callback route** (`app/auth/callback/route.ts`):
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

## Database + RLS

```sql
-- Enable RLS on every table (always)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own rows
CREATE POLICY "Users read own" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insert for authenticated users
CREATE POLICY "Users insert own" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

```ts
// Query (use Drizzle for complex queries — see drizzle skill)
const { data, error } = await supabase.from('posts').select('*').eq('user_id', userId)
const { error } = await supabase.from('posts').insert({ title, user_id: userId })
const { error } = await supabase.from('posts').update({ title }).eq('id', id)
const { error } = await supabase.from('posts').delete().eq('id', id)
```

## Migrations

```bash
supabase migration new <name>       # creates supabase/migrations/<timestamp>_<name>.sql
supabase db push                    # apply to remote
supabase db reset                   # reset local + re-apply all migrations
supabase gen types typescript --local > types/supabase.ts   # generate TS types
```

## Edge Functions

```bash
supabase functions new my-function
supabase functions serve            # local dev
supabase functions deploy my-function
```

```ts
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  // ... logic
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Edge Functions are included on free tier** — no upgrade needed.

## Storage

```ts
// Upload
const { error } = await supabase.storage.from('avatars').upload(`${userId}/avatar.png`, file)

// Public URL
const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.png`)

// Storage RLS (bucket policies set in dashboard or SQL)
```

## Realtime

```ts
const channel = supabase
  .channel('room-1')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
    (payload) => console.log(payload))
  .subscribe()

// Cleanup
supabase.removeChannel(channel)
```

## Vercel Deployment

```bash
# Add env vars to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Set **Auth redirect URL** in Supabase dashboard → Auth → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

## Auth Email Configuration (DO THIS BEFORE TESTING — common source of prod bugs)

Supabase sends auth emails (confirm signup, password reset, magic link) using its own templates. By default these emails contain `localhost` links, which break in production. **Must configure before any auth testing.**

### 1. Set Site URL (critical — fixes localhost links in emails)

**CLI-first via Management API:**
```bash
curl -X PUT "https://api.supabase.com/v1/projects/<ref>/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://your-app.vercel.app",
    "uri_allow_list": "https://your-app.vercel.app/**,https://*-yourteam.vercel.app/**,http://localhost:3000/**"
  }'
```
**Fallback:** Supabase dashboard → Auth → URL Configuration → set Site URL + Redirect URLs manually (or use web-browser skill to automate).

If Site URL is left as `localhost`, every confirmation/reset email will have broken links in production.

### 2. Forgot Password flow (must implement `/auth/reset-password` route)

Supabase password reset sends an email with a link → user clicks → lands on your app with a token in the URL. You must handle this:

```ts
// app/auth/reset-password/page.tsx
// 1. On load: exchange token for session (Supabase does this automatically via the URL hash)
// 2. Show new password form
// 3. On submit: call supabase.auth.updateUser({ password: newPassword })
// 4. Redirect to /dashboard or /login

'use client'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const handleReset = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) router.push('/dashboard')
  }
  // ... form UI
}
```

Forgot password link in your UI must call:
```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`
})
```

**Common mistake:** Calling `resetPasswordForEmail` without `redirectTo` → Supabase uses the Site URL as fallback, which may not route to your reset page.

### 3. Email confirmation redirect

After signup, Supabase sends a confirmation email. The link redirects to `/auth/callback` (or your configured redirect). Make sure your callback route handles the `type=signup` case:

```ts
// app/auth/callback/route.ts
const { type } = Object.fromEntries(searchParams)
if (type === 'recovery') {
  return NextResponse.redirect(`${origin}/auth/reset-password`)
}
// default: redirect to dashboard
return NextResponse.redirect(`${origin}/dashboard`)
```

## Common Mistakes

- **Never** use `service_role` key on the client — only in server/Edge Functions
- Always enable RLS before inserting data — adding it later is a footgun
- `supabase.auth.getSession()` on server can return stale data — use `getUser()` for security-sensitive checks
- Drizzle needs direct connection string (not pooled) for migrations; pooled for queries — see `neon` skill for pattern (same applies to Supabase Postgres)
- **`DATABASE_URL` pooler host is NOT predictable** — do NOT hardcode `aws-0-us-east-1.pooler.supabase.com`. The actual host varies by project (e.g. `aws-1-us-east-1`). Always retrieve from the Supabase dashboard or API:
  ```bash
  SUPABASE_TOKEN=$(security find-generic-password -a "supabase" -s "Supabase CLI" -w | sed 's/go-keyring-base64://g' | base64 -d)
  curl -s "https://api.supabase.com/v1/projects/{ref}/config/database" \
    -H "Authorization: Bearer $SUPABASE_TOKEN"
  # Or use: npx supabase db remote get-connection-string --project-ref {ref}
  ```
  Use transaction mode (port 6543) + `?pgbouncer=true` for serverless/Vercel. Use session mode (port 5432) or direct connection for migrations.
- **Forgot password does nothing** → missing `/auth/reset-password` route or missing `redirectTo` in `resetPasswordForEmail` call
- **Confirmation emails have localhost links** → Site URL not set to production URL in Supabase Auth settings
