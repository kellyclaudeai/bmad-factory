# HEARTBEAT.md

PL heartbeat dispatch is handled by cron (every 3 min, Haiku).

## Kelly Heartbeat Checks (2-4x per day only)

- **Emails** — any urgent unread?
- **Calendar** — events in next 24h?
- **Project alerts** — any PL that notified Kelly with a blocker?

## 📊 Project Status (on-demand only)

Do NOT include status in every heartbeat. Only surface when:
- A PL notifies Kelly of a blocker or completion
- Operator explicitly asks ("quick update", "full update", "status", "what's going on with X")

See `AGENTS.md` for Quick Update and Full Update templates.

Active PL session keys:
- agent:project-lead:project-reelrolla
- agent:project-lead:project-distill
- agent:project-lead:sentinel-hire
- agent:project-lead:masterpiece-remix

If a PL doesn't respond in 30s, note as "⚠️ unresponsive".
