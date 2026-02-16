---
name: web-search
description: Search the web using local SearXNG Docker container. Returns titles, URLs, and snippets for web queries. No API key required; bypasses Brave Search limitations.
---

# Web Search (SearXNG Docker)

Local web search via SearXNG Docker container — replaces Brave Search API.

## Endpoint

```
http://localhost:8888/search?q={query}&format=json
```

## Prerequisites

Docker container running:
```bash
docker ps | grep searxng
```

Expected output: `searxng/searxng:latest` on port `8888:8080`

If not running, start it (see skill-creator docs or docker-compose).

## Usage

### CLI
```bash
skills/utilities/web-search/bin/search "your query here"
```

### Output Format

```json
{
  "query": "openclaw",
  "number_of_results": 121000,
  "results": [
    {
      "url": "https://openclaw.ai/",
      "title": "OpenClaw — Personal AI Assistant",
      "content": "OpenClaw The AI that actually does things...",
      "engine": "bing",
      "score": 9.0
    }
  ],
  "suggestions": ["openclaw github", "openclaw install"]
}
```

## Parameters

| Param | Description |
|-------|-------------|
| `q` | Search query (required) |
| `format` | Set to `json` for structured output |
| `engines` | Comma-separated: `google,bing,duckduckgo` |
| `language` | ISO code: `en`, `de`, etc. |
| `safesearch` | `0` (off), `1` (moderate), `2` (strict) |

## SOP: When to Use Which Search Tool

| Tool | Use For |
|------|---------|
| **web-search** (this skill) | General web search, quick lookups, news |
| **web-browser** | Logged-in sites, dashboards, interactive flows |
| **web_fetch** | Direct content extraction from known URLs |

## Notes

- SearXNG aggregates results from multiple engines (Google, Bing, DuckDuckGo)
- No rate limits (local container)
- No API key required
- Privacy-respecting (queries not logged externally)
