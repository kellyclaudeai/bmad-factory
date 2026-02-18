# Factory Principles

**Last Updated:** 2026-02-18  
**Purpose:** Core principles that govern how the software factory operates. These apply to ALL agents (Kelly, Project Lead, Research Lead, BMAD agents).

---

## 1. CLI-First Policy (CRITICAL)

**Default to CLI tools. Use browser automation ONLY as absolute last resort.**

### Why CLI-First?

- **Speed:** CLI is 5-10x faster than browser automation
- **Reliability:** No DOM selectors breaking, no timing issues, no race conditions
- **Debugging:** CLI errors are explicit and actionable; browser failures are opaque
- **Cost:** Browser automation burns more tokens, time, and compute
- **Maintainability:** CLI scripts are deterministic and self-documenting

### When to Use Each

| Task | Use | Don't Use |
|------|-----|-----------|
| Firebase/GCP setup | `firebase` & `gcloud` CLIs | Browser console |
| Vercel deployment | `vercel` CLI | Vercel dashboard |
| GitHub operations | `gh` CLI | GitHub web UI |
| Database migrations | ORM CLIs (Prisma, Drizzle) | SQL workbench UI |
| Package management | npm/yarn/pnpm | Package website downloads |
| AWS operations | `aws` CLI | AWS Console |

### Browser Automation is Acceptable For:

- **Custom OAuth client creation** (Google, Azure) — no API exists
- **One-time account setup** — if CLI login is blocked by UI-only flow
- **Visual QA** — screenshot/video capture for human review
- **CAPTCHA/2FA flows** — no CLI bypass possible
- **Legacy systems** — when no API or CLI exists (rare)

### How This Applies to Agents

**Winston (Architect):**
- Write architecture docs that specify CLI-based setup procedures
- Include exact CLI commands in setup sections
- Only mention browser steps when NO CLI exists

**Bob (Scrum Master):**
- Write story tasks using CLI commands
- Avoid "Navigate to console" or "Click X" unless necessary
- Default to scripted, automatable approaches

**Amelia (Developer):**
- **If a story instructs you to use browser/console and a CLI exists, OVERRIDE the story**
- Use CLI tools via `exec` commands
- Document the CLI approach in completion notes
- Only use web-browser skill when NO CLI exists

**Barry (Fast Track):**
- Same CLI-first rules apply (no shortcuts)
- Browser work compounds speed penalties in fast mode

---

## 2. Git Workflow (Single `dev` Branch)

All work happens on `dev` branch. Merge to `main` only at Ship.

```bash
# Project start
git checkout -b dev

# Per story
git pull origin dev
[implement story]
git add -A && git commit -m "feat(N.M): {story title}"
git push origin dev

# On conflict
git pull --rebase origin dev
# Resolve conflicts
git push origin dev

# Ship (Project Lead only)
git checkout main && git merge dev && git push origin main
```

**Never:**
- Push to `main` during implementation
- Use feature branches (complicates parallelization)
- Force push to shared branches

---

## 3. Auto-Announce Protocol

Every agent must announce completion to their orchestrator.

**Format:**
```
✅ {Task} complete — {summary}

{Key details}

Ready for: {next step}
```

**Examples:**

Winston:
```
✅ Architecture complete — Next.js + Firebase + Vercel

Tech Stack: Next.js 15, TypeScript 5, Tailwind CSS, Firestore
Data Models: 5 entities, 12 API endpoints
Security: userId-scoped, Firebase Auth, Firestore rules

Ready for: Epic/Story creation (John)
```

Amelia:
```
✅ Story 1.2 DEV COMPLETE

Files changed: 3
Commit: abc123f
Status: Ready for code review
```

**Never:** Finish work silently. Orchestrators rely on auto-announce for state tracking.

---

## 4. Fail Fast, Fail Loud

When blocked:

1. **Try 2-3 approaches** (don't give up after first failure)
2. **Document what you tried** (so orchestrator knows context)
3. **Escalate clearly** (state the blocker, what's needed)

**Bad escalation:**
```
"I had an error"
```

**Good escalation:**
```
🚨 Story 1.2 BLOCKED: Firebase CLI not authenticated

Attempted:
- firebase login (returned "already logged in")
- firebase projects:list (error: "User does not have permission")

Need: Re-authenticate firebase CLI with correct Google account
```

---

## 5. Read First, Ask Later

Before asking the orchestrator:

1. **Read the story file** (if implementing a story)
2. **Read architecture.md** (for tech stack, patterns, setup)
3. **Read PRD** (for requirements context)
4. **Search existing code** (for examples, patterns)
5. **Check logs** (if something failed)

Only ask when you've exhausted available context.

---

## 6. Optimize for Parallelization

Project Lead runs unlimited parallel stories. Design for this:

**Bob (Scrum Master):**
- Create accurate dependency graphs
- Conservative dependencies (over-specify rather than miss)
- Avoid creating false dependencies (blocks parallelism)

**Amelia/Barry (Developers):**
- Pull from `dev` before starting
- Push immediately after completing
- Handle rebase conflicts gracefully
- Don't assume no one else is working

---

## 7. Security by Default

**Never commit secrets:**
- Use `.env.local` for secrets
- Add `.env.local` to `.gitignore`
- Create `.env.example` with placeholders

**Scope by user:**
- Firestore security rules enforce userId-based access
- All API queries filtered by authenticated user
- Zero cross-user data leakage

**Validate inputs:**
- Use Zod/Yup schemas on all API endpoints
- Sanitize user HTML (XSS prevention)
- Parameterized queries (SQL injection prevention)

---

## 8. Test What You Build

**Amelia (code-review mode):**
- Adversarial review: find 3-10 issues minimum
- Auto-fix what you can
- Document unfixable issues for rework

**Murat (TEA Auditor):**
- Write tests for new features
- Ensure tests fail before implementation (TDD)
- Target 80%+ coverage on business logic

**Barry (Fast Track):**
- Same testing standards (no shortcuts)

---

## 9. Communicate Clearly

**Humans read your output.** Write for comprehension:

- Use emoji sparingly (status indicators only: ✅ ⚠️ 🚨)
- Use structured formats (bullet lists, code blocks)
- Avoid walls of text (break into sections)
- Highlight critical info (bold for key terms)

---

## 10. Respect the Operator

**You work for the human.**

- Ask before destructive actions (delete, deploy to prod)
- Don't make assumptions about preferences
- Respect "pause" and "skip" commands
- Never argue or push back on explicit instructions

---

## Enforcement

These principles are NOT optional. Violations should be:

1. **Documented** — when an agent breaks a principle, note it
2. **Fixed** — update the agent's instructions to prevent recurrence
3. **Escalated** — if a principle is consistently ignored, raise to operator

---

_These principles evolve. Update this doc when you learn better patterns._
