# Default Tech Stack

**Last Updated:** 2026-02-20  
**Purpose:** Canonical default technology choices for all factory projects. Winston reads this during architecture phase. Overrides must be explicit in `intake.md` or operator instructions.

---

## ⚠️ Override Policy

**This stack is the default.** Deviations must be explicitly stated in the project `intake.md` or by the operator before architecture begins. If no override is specified, use this stack — no exceptions, no "I thought Prisma made more sense here."

Winston must document any override in the project's `architecture.md` under an **ADR (Architecture Decision Record)** explaining why the default was not used.

---

## The Stack

### Core

| Layer | Default | Notes |
|---|---|---|
| **Framework** | Next.js 15 App Router | SSR, RSC, Server Actions, Route Handlers. Use `nextjs-expert` skill. |
| **Language** | TypeScript | Always. No plain JS. |
| **Styling** | Tailwind CSS + shadcn/ui | Use `shadcn-ui` skill. |
| **Package Manager** | pnpm | Faster installs, disk-efficient. Use `pnpm` in all CLI commands. |

### Backend

| Layer | Default | Notes |
|---|---|---|
| **Database** | Supabase (Postgres) | Full Supabase suite — DB, Auth, Storage, Realtime. Paid account. Use `supabase` skill. |
| **ORM** | Drizzle | Type-safe, lightweight, edge-native. Use `Drizzle` skill. Connects directly to Supabase Postgres. |
| **Auth** | Supabase Auth | Email, Google OAuth, magic links. Paid account — no limits concern. |
| **Cache / Rate-limit** | Upstash Redis | Add when needed (rate limiting, sessions, queues). Not required by default. Use `redis` skill. |

### Services

| Layer | Default | Notes |
|---|---|---|
| **Payments** | Stripe | Add when project requires billing/subscriptions. Use `stripe` skill. |
| **Deployment** | Vercel | CI/CD from `main` branch. Use `vercel` skill. |
| **Animation** | Motion.dev | Add when UI needs transitions/animations. Use `motion` skill. |

### Testing

| Layer | Default | Notes |
|---|---|---|
| **E2E** | Playwright | Murat runs E2E against deployed URL. Real auth, real credentials, no mocking. |
| **Unit** | Vitest | For utility functions, hooks, pure logic. |

---

## Project Structure (Next.js App Router)

```
/
├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/           # Auth group (login, signup, etc.)
│   ├── api/              # Route Handlers
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── db/               # Drizzle schema + client
│   │   ├── schema.ts     # Table definitions
│   │   └── index.ts      # Drizzle client (Supabase Postgres connection)
│   ├── supabase/         # Supabase client (auth, storage, realtime)
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server client (cookies)
│   └── utils.ts          # Shared utilities
├── drizzle/              # Drizzle migrations
├── public/               # Static assets
├── .env.local            # Local env vars (gitignored)
└── next.config.ts
```

---

## Environment Variables (Required)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-side only

# Database (Drizzle direct connection)
DATABASE_URL=                     # Supabase Postgres pooled URL (pgBouncer)
DATABASE_URL_UNPOOLED=            # Direct URL for migrations

# Vercel (set in project dashboard, not .env)
# VERCEL_URL, etc. auto-injected
```

---

## Key Conventions

1. **Drizzle for data, Supabase client for auth/storage/realtime.** Don't use Supabase PostgREST for data queries — Drizzle owns the DB layer.
2. **Server Components by default.** Only add `"use client"` when needed (interactivity, browser APIs).
3. **Server Actions for mutations.** Avoid API routes for simple form submissions.
4. **Supabase RLS is optional.** Since Drizzle bypasses PostgREST, RLS won't apply to Drizzle queries. Use Drizzle-level authorization checks instead (middleware, server actions).
5. **pnpm everywhere.** All install commands use `pnpm add`, all scripts use `pnpm run`.

---

## Common Overrides

When a project specifies an override, Winston documents it as an ADR. Common valid overrides:

| Override | When Appropriate |
|---|---|
| Neon instead of Supabase | Project only needs Postgres, no auth/storage/realtime |
| Firebase instead of Supabase | Project needs heavy mobile support or Firestore document model |
| Prisma instead of Drizzle | Explicit operator request (not preferred — Drizzle is default) |
| Vite/React instead of Next.js | Fully auth-gated internal tool with no SEO needs. Use `vite-react` skill. |
| NextAuth instead of Supabase Auth | Complex multi-tenant auth or provider not supported by Supabase |
| No payments | Most projects — Stripe only added when intake specifies billing |

---

## Agent Notes

**Winston (Architect):** Read this before writing `architecture.md`. Your architecture must list the exact packages being used (with versions where relevant). If a layer above is not needed for the project, say so explicitly (e.g., "No payments — Stripe not included").

**Amelia (Dev):** When a story says "set up database" or "add auth," use this stack. Don't improvise a different ORM or auth library unless the architecture.md explicitly overrides it.

**Bob (SM):** When writing story files, reference the stack implicitly — stories should say "use Drizzle schema" not "create a database table however you see fit."
