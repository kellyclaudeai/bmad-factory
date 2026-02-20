---
name: context7
description: >
  Look up live, current documentation for libraries and frameworks via Context7 API.
  Use when verifying API syntax that may have changed, debugging integration issues
  where docs might be outdated, or when you need authoritative current docs for
  any npm package or framework (Next.js, React, Firebase, Supabase, etc.).
---

# context7 - Live Documentation Lookup

Query up-to-date documentation for libraries and frameworks from Context7. Eliminates hallucinations by providing current API docs.

## When to Use

**Use context7 when:**
- You need to verify current API syntax/behavior (e.g., Firebase Auth, Next.js, React)
- Documentation might have changed since your training cutoff
- You're debugging integration issues and suspect API changes
- User explicitly asks you to check docs

**Don't use context7 when:**
- You're confident about basic, stable APIs
- The question is about general programming concepts (not library-specific)
- You're already in a library's codebase (read the code directly)

## Status: CLI Has Issues ⚠️

The Context7 CLI (`npx context7`) currently returns 404 errors for project lookups. The REST API works but requires different patterns.

**Recommendation:** Use `web_search` + `web_fetch` to get official docs directly instead of relying on Context7 CLI.

Example:
```bash
# Instead of: ./bin/query "firebase/firebase-js-sdk" "redirect auth timing"
# Use:
web_search "firebase javascript signInWithRedirect getRedirectResult official docs"
web_fetch "https://firebase.google.com/docs/auth/web/redirect-best-practices"
```

## Commands (When CLI Works)

### Search for a Library
```bash
./bin/search "firebase"
```
Returns list of available Firebase-related projects.

**Note:** Currently returns 404 errors. Use REST API or web_search instead.

### Query Documentation
```bash
./bin/query "firebase/firebase-js-sdk" "how to handle redirect result in firebase auth"
```

**Note:** Currently returns 404 errors. Use REST API or web_search instead.

### Get Project Info
```bash
./bin/info "firebase/firebase-js-sdk"
```

**Note:** Currently returns 404 errors. Use REST API or web_search instead.

## Direct REST API (Working Alternative)

### Search Libraries
```bash
curl -s -X GET "https://context7.com/api/v2/libs/search?libraryName=firebase&query=authentication" \
  -H "Authorization: Bearer $(cat ~/.context7_api_key)" | jq '.'
```

### Get Context (Query Documentation)
```bash
curl -s -X POST "https://context7.com/api/v2/libs/context" \
  -H "Authorization: Bearer $(cat ~/.context7_api_key)" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "/websites/firebase_google",
    "query": "signInWithRedirect getRedirectResult timing"
  }' | jq -r '.context'
```

**Note:** Context endpoint also returning 404 errors as of 2026-02-18. Need to investigate further or use web_search instead.

## Examples

### Firebase Auth Redirect Issue
```bash
# Search for Firebase projects
./bin/search "firebase auth"

# Query the Firebase JS SDK about redirect handling
./bin/query "firebase/firebase-js-sdk" "getRedirectResult signInWithRedirect proper usage timing"
```

### Next.js API Changes
```bash
./bin/query "next.js" "app router metadata api"
```

### React Hooks Best Practices
```bash
./bin/query "react" "useEffect cleanup function"
```

## Configuration

API Key stored in: `~/.context7_api_key`

To update the key:
```bash
echo "ctx7sk-YOUR-KEY-HERE" > ~/.context7_api_key
chmod 600 ~/.context7_api_key
```

## Output

- Plain text by default (readable)
- Use `--json` flag for structured output (scripting)
- Max tokens: 5000 by default (adjust with `--tokens N`)

## Tips

1. **Be specific in queries** - "firebase auth redirect result timing" beats "firebase auth"
2. **Check version info** - Use `./bin/info` to see what version Context7 indexed
3. **Compare with code** - Context7 docs + actual code = complete picture
4. **Don't over-use** - Only query when you need current/authoritative info

## Lessons Learned (NoteLite Firebase Auth Case Study)

**Problem:** Firebase `signInWithRedirect()` wasn't capturing auth state after OAuth redirect.

**Attempted:** Context7 CLI to query Firebase docs → returned 404 errors.

**Solution:** Used `web_search` + `web_fetch` to find official Firebase docs:
- https://firebase.google.com/docs/auth/web/redirect-best-practices
- Discovered: `signInWithRedirect` uses cross-origin iframe, blocked by modern browsers
- Fix: Switch to `signInWithPopup` (2-line change)

**Takeaway:** When Context7 CLI fails, fall back to `web_search` for official docs. Often faster and more reliable than debugging Context7 API issues.
