# Shared Factory Rules — Universal Standards

> These rules apply to **every agent** in the Kelly Software Factory: Kelly, Project Lead, John, Sally, Winston, Bob, Amelia, Murat, and any future agents.
> 
> Every agent's `AGENTS.md` references this file. Rules here are not repeated in individual agent docs.

---

## 🛠️ Tool Preference Order

**Always prefer automation in this order — no exceptions:**

1. **CLI / SDK first** — shell commands, language SDKs, package managers, `curl`, `gh`, `supabase`, `firebase`, `stripe`, etc.
2. **MCP tools second** — any MCP integration available in the workspace
3. **Browser automation third** — headless Playwright when CLI/MCP unavailable (see below)
4. **Ask the operator last** — only for genuine blockers (MFA, email verification codes, payment info)

If a skill says "use the browser," exhaust CLI/MCP options first. Do not ask a human to click a dashboard when an API or CLI exists.

### 🎭 Browser Automation — Never Stop, Use Playwright

When browser interaction is needed, **never stop and ask the user to do it**. Use headless Playwright:

```javascript
// Standard pattern — available globally at /opt/homebrew/lib/node_modules/playwright
import { chromium } from '/opt/homebrew/lib/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
// ... automate the flow
await browser.close();
```

**Stop and ask the operator ONLY for:**
- Email verification links (can't access their inbox)
- MFA / 2FA codes
- Payment / credit card info
- CAPTCHA that can't be bypassed

**Everything else is automatable.** Form fills, signups, clicking through dashboards, grabbing API keys from settings pages — do it yourself.

**For testing specifically:**
- Prefer API-level tests (curl, SDK calls, jest/vitest unit tests) over E2E browser tests
- Prefer Playwright CLI over manual browser recording
- Only spin up a real browser session if the test genuinely requires rendered UI

**For story/architecture tasks:**
- Write CLI commands in stories and architecture docs — not "click the console" steps
- ✅ `firebase apps:create web "$APP_NAME"`
- ❌ "Click Add App in Firebase Console"

---

## ⚡ Token Efficiency

**Never read full files when you only need part of them.**

```bash
# Targeted reads — always prefer these:
grep -A 4 "status: todo" sprint-status.yaml   # just todo stories
grep -c "status: done" sprint-status.yaml     # count only
grep -A 10 "'10\.7':" sprint-status.yaml      # one story
rg "pattern" src/ --type ts -l               # filenames only
jq -r ".field" file.json                     # one JSON field
python3 -c "import yaml,sys; d=yaml.safe_load(open('file.yaml')); print(d['key'])"
```

**Rules:**
- ❌ Never `cat` a large file to read one field
- ❌ Never load 74 stories to find the 3 that are `todo`
- ✅ Use `grep`, `jq`, `rg`, `python3 -c` for targeted extraction
- ✅ Keep tool results small — your context is limited

---

## 🌿 Git Discipline

- **All work happens on the `dev` branch.** Never push directly to `main`.
- Pull before starting work: `git pull origin dev`
- Commit after every meaningful unit of work: `git add -A && git commit -m "..." && git push origin dev`
- If push fails (another agent pushed first): `git pull --rebase origin dev` then push again
- **All GitHub repos are private by default.** Never create a public repo without explicit operator approval.
- Commit message format: `feat({N.M}): {story title}` / `fix({N.M}): {description}` / `docs: {description}`

---

## ✅ QA Gate — All Tests Must Pass

**A project does NOT enter `pending-qa` until 100% of Murat's tests pass.**

- "Minor test infra issues" are not a skip reason — fix them before flipping phase
- If a test fails, it goes back to Amelia via the Change Flow (Phase 3 Step 5 remediation)
- No judgment calls on "blocking vs non-blocking" at the test gate — all tests are blocking
- The only exception: a test explicitly marked `@skip` in the story's acceptance criteria with documented rationale

---

## 🔑 API Keys & Third-Party Credentials

**All agents are authorized to self-serve free-tier API keys without asking the operator.**

### Factory Credentials

**Email:** `kelly@bloomtech.com`  
**Password:** Retrieved from macOS Keychain — never hardcoded in files or committed to git:
```bash
security find-generic-password -a "kelly-factory" -s "kelly-factory-credentials" -w
```

**Auth priority order (always try in this order):**
1. **Google OAuth** — use `kelly@bloomtech.com` Google account (already logged in via openclaw browser profile)
2. **Email + password** — `kelly@bloomtech.com` + keychain password above
3. **Ask operator** — only if neither works (e.g., site blocks Google OAuth + requires SMS verification)

### Email Verification — Handle Autonomously

**You have full access to `kelly@bloomtech.com` via Gmail in the openclaw browser profile.**

When a signup requires email verification:
1. Navigate to https://mail.google.com in the browser (already logged in via Google session)
2. Find the verification email
3. Click the verification link
4. Continue the signup flow — no operator input needed

This covers: TMDB, Watchmode, Supabase, Vercel, any other service that sends a verification email to `kelly@bloomtech.com`.

### Rules
- ✅ Free tier signup with no payment info required → do it autonomously (browser + factory credentials + Gmail verification)
- ✅ After creating any account or setting any API key → log it in `docs/core/factory-accounts.md` (username + service + project only — no passwords or raw keys)
- ✅ Whenever a new password is created for a service → save it to macOS Keychain immediately: `security add-generic-password -a "kelly-{service}" -s "kelly-{service}-credentials" -w "{password}"` — use the factory password from Keychain by default unless the service requires a unique password
- ✅ Once obtained, set immediately via CLI: `vercel env add KEY_NAME` or equivalent
- ✅ **Database provisioning (Neon, Supabase, etc.)** — create project, get connection string, set in Vercel, run migrations. Do NOT ask operator for credentials that don't exist yet — create them.
- ✅ **All third-party free-tier services** (Redis/Upstash, storage, email/Resend, etc.) — provision autonomously, set env vars in Vercel. No asking. Only stop if payment info is required.
- ⚠️ **Paid tier / credit card required** → STOP. Notify Kelly immediately with a single clear blocker message:
  - What service is needed and why
  - The cost (monthly/one-time)
  - Whether a free alternative exists (and if so, why it won't work)
  - What the operator needs to decide: approve spend, pick a free alternative, or descope the feature
  - Kelly then surfaces this to the operator as a single decision point — not a research dump, just: "X is blocked, costs $Y/mo, free alternative is Z (but won't work because W). Approve?" Never spend money without explicit operator approval.
- ⚠️ MFA / 2FA / SMS code → ask operator (we don't have SMS access)
- ❌ Never store raw API keys in git or in any file committed to version control

### The Core Rule (plain language)

> **If it's free: get it yourself. If it costs money: stop and tell Kelly.**

No exceptions. "I couldn't find a free tier" is not a reason to ask the operator to do it manually — it's a reason to find a free alternative or surface the cost decision clearly.

---

## 📢 Auto-Announce Protocol

Every agent **must announce completion** to the caller (Project Lead or Kelly) when done.

- Always include: what was done, counts/summary, and what comes next
- Format varies by agent (see individual AGENTS.md), but announcing is never optional
- On a blocker: announce immediately — don't silently hang

---

## 📝 No Mental Notes

If you need to remember something, **write it to a file**. Mental notes don't survive session restarts.

- Progress → story file (mark criteria complete)
- Blockers → announce to Project Lead immediately
- Architectural decisions → architecture.md (ADR section)
- Sprint progress → sprint-status.yaml

---

## 🔒 Safety

- **No destructive commands without confirmation** — `trash` > `rm`
- **No private data exfiltration** — ever
- When in doubt about an irreversible action, stop and escalate
- Sub-agents do not have permission to create new GitHub repos or deploy to production without Project Lead approval

---

## 🧠 Memory & Continuity

Sub-agents (John, Sally, Winston, Bob, Amelia, Murat) are spawned fresh per task — no persistent memory.

- Read context from your input files (story file, architecture.md, PRD, etc.)
- Write output to the designated output path for your role
- Announce to Project Lead when done — that's the handoff

Orchestrators (Project Lead, Research Lead, Kelly) have session-level memory via their workspace files.
