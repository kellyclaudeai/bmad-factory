# Factory State

**Last Updated:** 2026-02-15 18:05 CST

## Active Projects

### meeting-time-tracker-web
- **Status:** Supabase standardization complete; awaiting Supabase project provisioning
- **Repo path:** `projects/meeting-time-tracker-web`
- **Backend:** Supabase (Postgres + Auth)
- **Blocker:** Supabase env values are placeholders until we provision a real project via CLI.

### Browser automation (infrastructure)
- **Status:** Chrome CDP automation set up
- **CDP:** `http://127.0.0.1:9222`
- **Note:** Chrome requires non-default `--user-data-dir` for remote debugging; using persistent automation profile: `~/.openclaw/chrome-cdp-profile`.

## Pending Actions

### Operator actions required (one-time)
1) **Create Supabase Personal Access Token (PAT)**
   - From: https://supabase.com/dashboard/account/tokens
   - Then run: `supabase login --no-browser` and paste token once (preferred; avoids pasting secrets into chat)

2) **Sign into the Chrome CDP automation profile once** (optional, only if we need browser automation)
   - Chrome launched with profile: `~/.openclaw/chrome-cdp-profile`
   - Sign into Supabase/Google as needed; session will persist in that profile

### After PAT is available (fully autonomous)
1) `supabase projects create` (one project per factory project)
2) `supabase projects api-keys --project-ref ...` to fetch `anon` + `service_role`
3) Update `projects/meeting-time-tracker-web/.env.local`
4) `supabase link --project-ref ...` then `supabase db push`
5) Enable Google provider in Supabase Auth and set redirect URLs

## Recent Completions

- ✅ Supabase-only cleanup + fixes merged for `meeting-time-tracker-web` (commit `1ce0e8d`)
- ✅ Chrome CDP launcher + LaunchAgent added and fixed to use dedicated user-data-dir (commits `8316ab7`, `183a0b8`)

