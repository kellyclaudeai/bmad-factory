---
name: vite-react
description: Build React SPAs using Vite. Use when a project is fully auth-gated (no SEO needed), an internal tool or admin dashboard, or a standalone frontend where Next.js SSR overhead isn't justified. Covers setup, React Router v7, TypeScript, Tailwind, shadcn/ui, Vercel deployment, and when to choose Vite over Next.js.
---

# Vite + React (Factory Reference)

## When to use Vite over Next.js

| Use Vite when | Use Next.js when |
|---|---|
| App is fully auth-gated (login wall on every route) | Marketing pages need SEO |
| Internal tool / admin dashboard | Public-facing content |
| No SSR needed | Server components add real value |
| Fastest dev iteration, simplest mental model | API routes needed alongside UI |

**sentinel-hire is a Vite app** — employer dashboard is fully auth-gated, no SEO needed.

## Setup

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

## Add Tailwind + shadcn/ui

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init    # follow prompts — sets up components.json, globals.css
npx shadcn@latest add button card input   # add components as needed
```

`tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

## Routing (React Router v7)

```bash
npm install react-router-dom
```

```tsx
// src/main.tsx
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}
```

**Protected layout pattern:**
```tsx
// src/layouts/ProtectedLayout.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
```

## State Management

```bash
npm install zustand        # global state (auth, UI state)
npm install @tanstack/react-query   # server state (API data, caching)
```

```ts
// Simple store
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## Environment Variables

```env
# .env.local
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

**Must be prefixed `VITE_`** to be exposed to the client:
```ts
const url = import.meta.env.VITE_API_URL
```

## Build + Deploy to Vercel

```bash
npm run build    # outputs to dist/
```

`vercel.json` (required for client-side routing):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without the rewrite, direct navigation to `/dashboard` returns 404.

```bash
vercel --prod
```

## Project Structure

```
src/
├── app/              # page components (route-level)
│   ├── dashboard/
│   └── settings/
├── components/       # shared UI components
│   ├── ui/           # shadcn components
│   └── layout/
├── hooks/            # custom hooks
├── lib/              # utilities, API clients, stores
├── types/            # TypeScript types
└── main.tsx
```

## Common Mistakes

- Forgetting `vercel.json` rewrite → 404 on page refresh or direct URL navigation
- Using `process.env.REACT_APP_*` (CRA syntax) instead of `import.meta.env.VITE_*`
- Not code-splitting large routes → large initial bundle. Use `React.lazy` + `Suspense` for route-level splitting
- Fetching data in useEffect instead of React Query → loading states are manual, no caching, refetch on every mount
