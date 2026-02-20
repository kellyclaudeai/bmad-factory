---
name: neon
description: Set up and use Neon serverless Postgres for factory projects. Covers project creation, connection strings (pooled vs direct), branching workflow, Drizzle ORM integration, Vercel integration, and local dev. Use when a project needs Postgres without the full Supabase ecosystem, or as the default database for Next.js + Vercel + Drizzle projects.
---

# Neon Serverless Postgres (Factory Reference)

## When to choose Neon over Supabase Postgres

- Project doesn't need Supabase Auth, Storage, or Realtime
- Simple "just give me Postgres" requirement
- Want **git-branch-style database branches** (great for preview deployments)
- Vercel integration is a priority — Neon has a first-class Vercel marketplace addon
- Scales to zero (no idle compute cost)

## Create a project

```bash
# Via dashboard: https://neon.tech
# Or Vercel marketplace (auto-provisions + sets env vars):
# Vercel project → Storage → Add → Neon Postgres
```

## Connection Strings

Neon provides two strings — **use both correctly**:

```env
# Pooled (Supavisor) — use for app queries (supports serverless/edge)
DATABASE_URL=postgresql://user:pass@ep-xxx.pooler.neon.tech/dbname?sslmode=require

# Direct — use for Drizzle migrations only (pooler doesn't support DDL)
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
```

**Rule:** `DATABASE_URL` → app queries. `DATABASE_URL_UNPOOLED` → `drizzle-kit push/migrate`.

## Drizzle Setup (standard Neon pattern)

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

```ts
// lib/db.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
```

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,  // direct connection for migrations
  },
})
```

```bash
npx drizzle-kit generate    # generate migration files
npx drizzle-kit migrate     # apply to database
npx drizzle-kit push        # dev only — push schema directly (no migration files)
npx drizzle-kit studio      # visual DB browser at localhost:4983
```

## Schema Example

```ts
// lib/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

## Database Branching (dev workflow)

Neon branches = isolated Postgres instances sharing storage. Zero-copy, instant.

```bash
# Via Neon console or CLI
neon branches create --name dev/feature-xyz
neon branches delete dev/feature-xyz
```

**Vercel + Neon branching:** Neon's Vercel integration auto-creates a DB branch per preview deployment → each PR gets its own database. Enable in Vercel Storage → Neon → Settings.

## Vercel Integration (recommended)

```bash
# In Vercel dashboard → Storage → Connect → Neon
# Automatically sets:
#   DATABASE_URL (pooled)
#   DATABASE_URL_UNPOOLED (direct)
# across Production, Preview, and Development environments
```

## Local Dev

```bash
# Option 1: Use Neon's dev branch (recommended — real Postgres, no Docker)
# Create a branch named "dev" in Neon console, use its connection string in .env.local

# Option 2: Local Postgres via Docker
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
# DATABASE_URL_UNPOOLED same as above for local
```

## Free Tier Limits

- 0.5 GB storage, 1 compute unit, 1 project, unlimited branches
- Scales to zero after 5 min inactivity (cold start ~500ms)
- **No function equivalent** — pair with Vercel serverless functions or Supabase Edge Functions for backend logic

## Common Mistakes

- Using pooled URL for `drizzle-kit migrate` → connection hangs. Always use `DATABASE_URL_UNPOOLED` for migrations.
- Forgetting `?sslmode=require` in connection string → connection refused in production
- `neon()` driver is HTTP-based (stateless, great for serverless). For transactions or long-running queries, use `@neondatabase/serverless` WebSocket driver instead
- Neon pauses after inactivity — first request after pause has ~500ms cold start. Acceptable for most apps; use Vercel connection pooling to mitigate
