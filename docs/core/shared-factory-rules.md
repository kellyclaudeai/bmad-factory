# Shared Factory Rules — Universal Standards

> These rules apply to **every agent** in the Kelly Software Factory: Kelly, Project Lead, John, Sally, Winston, Bob, Amelia, Murat, and any future agents.
> 
> Every agent's `AGENTS.md` references this file. Rules here are not repeated in individual agent docs.

---

## 🛠️ Tool Preference Order

**Always prefer automation in this order — no exceptions:**

1. **CLI / SDK first** — shell commands, language SDKs, package managers, `curl`, `gh`, `supabase`, `firebase`, `stripe`, etc.
2. **MCP tools second** — any MCP integration available in the workspace
3. **Browser automation last** — only when CLI/MCP is unavailable, broken, or the task genuinely requires a real browser (e.g., OAuth flows, visual QA)

If a skill says "use the browser," exhaust CLI/MCP options first. Do not ask a human to click a dashboard when an API or CLI exists.

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
