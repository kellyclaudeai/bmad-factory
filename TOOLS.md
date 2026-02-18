# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## 🔍 Web Search — DEFAULT TOOL

**ALWAYS use web-search skill instead of web_search tool:**

```bash
/Users/austenallred/clawd/skills/web-search/bin/search "your query"
```

**Why:** 
- ✅ SearXNG local Docker (localhost:8888) — NO rate limits
- ✅ No API costs (Brave API is super limited)
- ✅ Built specifically for high-volume research
- ✅ Aggregates Google, Bing, DuckDuckGo results

**Status:** `docker ps | grep searxng` confirms running

**Do NOT use:** `web_search` tool (Brave API) — limited rate, causes billing errors

---

## 🌐 Web Browser Automation

**For logged-in browser work, use web-browser skill:**

Skill location: `/Users/austenallred/clawd/skills/web-browser/`

**When to use:**
- ✅ Firebase/GCP/Vercel/GitHub dashboards (logged-in)
- ✅ Web app testing (QA flows, form submissions)
- ✅ SaaS admin panels requiring authentication
- ✅ Any task requiring "do X in the browser"

**Key features:**
- **ZERO clicks required** — fully automated via Playwright CDP
- **Persistent Chrome profile** at `~/.openclaw/browser/openclaw/user-data`
  - All cookies/sessions preserved across runs
  - Stay logged in to Firebase, GCP, Vercel, etc.
- **Full automation:** Navigate, click, fill forms, screenshot, PDF

**Usage pattern:**
```bash
# Browser auto-launches when needed
# Read skill for browser tool API + examples
read /Users/austenallred/clawd/skills/web-browser/SKILL.md
```

**Assumption for factory projects:** All projects are web apps unless specified otherwise → web-browser skill available for QA/testing.

---

## 🔥 Firebase/Backend Setup

**For Firebase projects, use firebase-cli skill:**

Skill location: `/Users/austenallred/clawd/skills/firebase-cli/`

**When to use:**
- ✅ Creating new Firebase projects
- ✅ Setting up Authentication, Firestore, Hosting
- ✅ Enabling Google Cloud APIs programmatically
- ✅ Deploying Firebase Functions, Hosting sites
- ✅ Fetching Firebase SDK config (firebaseConfig.json)

**Key features:**
- **CLI-first:** Automate Firebase + GCP project creation
- **Complete backend provisioning:** Auth, Firestore, Hosting, Functions via CLI
- **SDK config generation:** Get firebaseConfig automatically

**Usage pattern:**
```bash
# Read skill for Firebase CLI commands + automation patterns
read /Users/austenallred/clawd/skills/firebase-cli/SKILL.md
```

**For web projects:** Firebase is the default backend (Auth + Firestore + Hosting).

---

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
