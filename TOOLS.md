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
