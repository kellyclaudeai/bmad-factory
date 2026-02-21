# Factory Accounts Registry

> Inventory of accounts created for the Kelly Software Factory.
> **Credentials are NOT stored here** — passwords are in macOS Keychain (`kelly-factory` service).
> This file is committed to git. Never add passwords, tokens, or API keys here.

---

## Account Lookup

To retrieve the factory password:
```bash
security find-generic-password -a "kelly-factory" -s "kelly-factory-credentials" -w
```

---

## Registered Accounts

| Service | Username | Email | Notes |
|---------|----------|-------|-------|
| The Movie Database (TMDB) | kellyfactory | kelly@bloomtech.com | Free Developer plan. API key in Vercel as `TMDB_API_KEY`. |
| Watchmode API | kelly@bloomtech.com | kelly@bloomtech.com | Free plan. 1,000 calls/month. API key in Vercel as `WATCHMODE_API_KEY`. |
| ReelRolla (test user) | kellyclaude.mps@gmail.com | kellyclaude.mps@gmail.com | Factory E2E test account. Confirmed via Supabase admin API. Password = factory standard (Keychain). |

---

## API Keys in Use (by project)

| Project | Key Name | Service | Set Via |
|---------|----------|---------|---------|
| reelrolla | `TMDB_API_KEY` | TMDB | `vercel env add` |
| reelrolla | `WATCHMODE_API_KEY` | Watchmode | `vercel env add` ✅ |

---

_Update this file whenever a new account is created or an API key is added to a project._
