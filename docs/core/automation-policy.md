# Automation Policy — CLI-First

**All agents follow this hierarchy. No exceptions.**

## The Rule

```
1. CLI tool          → prefer always (supabase CLI, vercel CLI, gh CLI, firebase CLI, etc.)
2. Management API    → when CLI doesn't cover the task (REST/curl against provider APIs)
3. MCP tool          → when available and appropriate (Supabase MCP, etc.)
4. web-browser skill → last resort only (Playwright CDP via persistent Chrome profile)
5. Document it       → if truly unavoidable manual step, document it clearly for the human
```

**Never ask a human to click through a dashboard if automation is possible.**

---

## Who This Applies To

### Winston (Architecture)
- Every setup step in architecture.md must be a CLI command or API call
- Never write "go to the Firebase console and click X" — write the CLI equivalent
- If no CLI exists for a step, call it out explicitly: `# Fallback: web-browser skill`
- Ref: `docs/core/tech-stack.md` for default CLI tools per service

### Amelia (Implementation)
- When provisioning services, running migrations, setting env vars — always CLI first
- If a story requires dashboard setup, escalate to PL: "This needs automation — story is missing CLI setup steps"
- `vercel env add`, `supabase db push`, `gh secret set` — these are the right tools
- If truly stuck → use the **web-browser skill** (`~/clawd/skills/web-browser/SKILL.md`)

### Project Lead
- When writing agent task prompts for setup stories, include explicit CLI commands
- Don't leave setup steps ambiguous — Amelia should never have to guess how to provision something

---

## Service-Specific CLI References

| Service | Primary CLI | Management API | Notes |
|---------|------------|----------------|-------|
| Supabase | `supabase` CLI | `api.supabase.com/v1/...` | See `skills/supabase/SKILL.md` |
| Vercel | `vercel` CLI | Vercel REST API | See `skills/vercel/SKILL.md` |
| Firebase | `firebase` CLI | Google Cloud APIs | See `skills/firebase-cli/SKILL.md` |
| GitHub | `gh` CLI | GitHub REST API | See `skills/github/SKILL.md` |
| Stripe | Stripe CLI | Stripe API | See `skills/stripe/SKILL.md` |
| Neon | `neonctl` CLI | Neon API | See `skills/neon/SKILL.md` |

## web-browser skill (last resort)

Location: `~/clawd/skills/web-browser/SKILL.md`

Use when:
- No CLI or API exists for the task (e.g. Google OAuth client creation in Cloud Console)
- CLI/API call is failing and browser is the fastest unblock path
- One-time manual setup that can't be scripted

The web-browser skill uses Playwright CDP with a persistent Chrome profile — all existing sessions (Firebase, GCP, Vercel, GitHub) are already logged in. Zero manual clicks required.
