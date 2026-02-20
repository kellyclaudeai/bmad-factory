# SlackLite Revival — Brownfield Fix + Redesign

**Mode:** Brownfield (existing codebase in this directory)
**Previous state:** 74 stories done, stuck at test-blocked-vercel-limit

## What Needs Doing

1. **Fix messages not saving** — diagnose and patch. Likely a Firestore write or real-time listener issue.
2. **UI redesign** — Sally uses the frontend-design skill (`/Users/austenallred/clawd/skills/frontend-design/SKILL.md`). Full visual overhaul. Polished, professional, distinctive. No lazy/unstyled buttons or components.
3. **Test phase** — Murat test-generate → E2E execution + NFR. Deploy to **Firebase Hosting** (NOT Vercel — the 100/day limit killed the last run).

## Key Constraints

- Use Anthropic API (OpenAI quota exhausted) — `printenv ANTHROPIC_API_KEY`
- Firebase Hosting for deploy
- frontend-design skill required for all UI work
