# Research Lead - TOOLS.md

## Web Search

**ALWAYS use the web-search skill instead of web_search tool:**

```bash
/Users/austenallred/clawd/skills/web-search/bin/search "your query"
```

**Why:** SearXNG local Docker (localhost:8888) — no rate limits, no API costs.

**Do NOT use:** `web_search` tool (Brave API) — limited rate, billing errors.

## Sub-Agent Spawning

Use `sessions_spawn` to spawn Mary, Carson, Victor, Maya, Quinn.

Agent IDs available (check your spawn allowlist):
- bmad-bmm-mary (if configured)
- bmad-cis-carson
- bmad-cis-victor  
- bmad-cis-maya
- bmad-cis-quinn

If a spawn fails due to allowlist, execute that phase directly (fallback).
