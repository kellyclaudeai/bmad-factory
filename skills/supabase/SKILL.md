---
name: supabase
description: Set up and use Supabase for factory projects. Covers CLI project creation, Authentication (email, Google OAuth, magic links), PostgreSQL database with Row Level Security, Edge Functions (free tier — no Blaze equivalent needed), Storage, Realtime subscriptions, local development, and Vercel deployment. Use when a new project needs a backend with auth + Postgres + serverless functions, or when choosing between Supabase and Firebase.
---

# Supabase (Factory Reference)

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
# Create project via dashboard (one-time, no CLI equivalent for project creation)
# Then link locally:
supabase link --project-ref <project-ref>
supabase db pull        # pull remote schema to local
```

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

```ts
// Email + password
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })

// Google OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
})

// Magic link
await supabase.auth.signInWithOtp({ email })

// Sign out
await supabase.auth.signOut()

// Get session (server)
const { data: { session } } = await supabase.auth.getSession()
```

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

Supabase dashboard → Auth → URL Configuration:
- **Site URL:** `https://your-app.vercel.app` ← MUST be production URL, not localhost
- **Redirect URLs (add all):**
  - `https://your-app.vercel.app/**`
  - `https://*-yourteam.vercel.app/**` (covers preview deployments)
  - `http://localhost:3000/**` (local dev)

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
- **Forgot password does nothing** → missing `/auth/reset-password` route or missing `redirectTo` in `resetPasswordForEmail` call
- **Confirmation emails have localhost links** → Site URL not set to production URL in Supabase Auth settings
