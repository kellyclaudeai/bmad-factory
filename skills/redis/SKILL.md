---
name: redis
description: Add Redis caching, rate limiting, sessions, queues, or pub-sub to factory projects. Covers Upstash Redis (serverless, pairs with Vercel/Edge) as the default, plus Dragonfly for self-hosted. Use when a project needs caching, API rate limiting, session storage, background job queues, or real-time pub-sub.
---

# Redis (Factory Reference)

## Default: Upstash Redis

**Upstash** is the factory default for Redis — serverless, HTTP-based, free tier (10k requests/day), pairs perfectly with Vercel Edge and serverless functions. No persistent connection required.

```bash
npm install @upstash/redis
```

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

```ts
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

**Vercel + Upstash:** Vercel marketplace → Storage → Upstash → auto-sets env vars.

## Core Operations

```ts
// String
await redis.set('key', 'value')
await redis.set('key', 'value', { ex: 60 })  // expires in 60s
const val = await redis.get<string>('key')
await redis.del('key')

// Hash
await redis.hset('user:123', { name: 'Alice', email: 'alice@x.com' })
const user = await redis.hgetall('user:123')

// List (queue)
await redis.lpush('queue', 'job1')
const job = await redis.rpop('queue')

// Atomic increment
const count = await redis.incr('page:views')
await redis.expire('page:views', 3600)  // reset after 1h

// Exists + TTL
const exists = await redis.exists('key')
const ttl = await redis.ttl('key')  // seconds remaining, -1 = no expiry, -2 = gone
```

## Rate Limiting (most common use case)

```ts
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10 requests per 10 seconds
  analytics: true,
})

// In API route / middleware
const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
const { success, limit, remaining, reset } = await ratelimit.limit(ip)

if (!success) {
  return new Response('Too many requests', {
    status: 429,
    headers: { 'X-RateLimit-Limit': String(limit), 'Retry-After': String(reset) }
  })
}
```

```bash
npm install @upstash/ratelimit
```

## Caching Pattern

```ts
async function getCachedUser(id: string) {
  const cached = await redis.get<User>(`user:${id}`)
  if (cached) return cached

  const user = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (user) await redis.set(`user:${id}`, user, { ex: 300 })  // 5 min TTL
  return user
}

// Invalidate on update
async function updateUser(id: string, data: Partial<User>) {
  await db.update(users).set(data).where(eq(users.id, id))
  await redis.del(`user:${id}`)
}
```

## Session Storage

```ts
// Store session on login
const sessionId = crypto.randomUUID()
await redis.set(`session:${sessionId}`, JSON.stringify(user), { ex: 60 * 60 * 24 * 7 }) // 7 days

// Retrieve
const session = await redis.get<User>(`session:${sessionId}`)

// Destroy on logout
await redis.del(`session:${sessionId}`)
```

## Simple Job Queue

```ts
// Enqueue
await redis.lpush('jobs:email', JSON.stringify({ to: email, template: 'welcome' }))

// Worker (poll or triggered)
const raw = await redis.rpop('jobs:email')
if (raw) {
  const job = JSON.parse(raw)
  await sendEmail(job)
}

// For robust queues, use @upstash/qstash (HTTP-based job queue with retries)
```

## Pub/Sub (for real-time features)

```ts
// Upstash doesn't support native pub/sub — use @upstash/qstash or Supabase Realtime instead
// For pub/sub: Supabase Realtime > Redis pub/sub in this factory stack
```

## When to use `ioredis` instead (self-hosted / Railway)

```bash
npm install ioredis
```

```ts
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL!)
// Same API as node-redis but more feature-complete (pipeline, pub/sub, Lua scripts)
```

Use `ioredis` when: deploying on Railway/Render with a persistent Redis instance, need pub/sub, or need Lua scripting.

## Common Mistakes

- Upstash is HTTP-based — don't use `ioredis` with it (wrong driver). Use `@upstash/redis`.
- Forgetting TTLs on cached data → stale data forever. Always set `ex` on cache entries.
- Caching `null` results → next call skips DB but returns null incorrectly. Check before caching.
- Not invalidating cache on writes → reads return stale data. Delete the key on every mutation.
- Using Redis as primary database → it's volatile. Always back with Postgres.
