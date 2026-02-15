---
name: chrome-relay-driver
description: Drive the user’s real Chrome via OpenClaw Browser Relay (profile="chrome"). Use when the user says to use the browser/web and wants their logged-in session, cross-domain navigation, and minimal hand-holding. Includes tab selection, cross-domain navigation, popup/new-tab handling, and how to surface only true blockers (no attached tab, MFA/OS prompts).
---

# Chrome Relay Driver (Logged-in Chrome)

Use the `functions.browser` tool with `profile="chrome"`.

## Goal

Operate **autonomously** using the user’s already-authenticated Chrome session. Only interrupt the user when blocked by:
- No attached Relay tab
- MFA / “verify it’s you” / OS-level dialogs
- A new popup/tab is opened and is not attached

## Default operating mode (always)

1) **Find an attached tab**
- Call `browser.tabs` with `profile:"chrome"`.
- If there is **no connected/attachable tab**, tell the user to click the Browser Relay toolbar icon on the tab they want controlled (badge ON), then retry.

2) **Pick a driver tab (autonomously)**
- If exactly one candidate tab: use it.
- If multiple: prefer the tab that best matches the task:
  - If task is Google/GCP/Supabase/Firebase: prefer a tab already on those domains.
  - Otherwise prefer the most recently active tab (best-effort).
- Keep using the same `targetId` for the whole workflow.

3) **Snapshot discipline**
- Use `browser.snapshot` with `refs:"aria"` before acting.
- Prefer `browser.act` using stable aria refs (click/type/press/select).

4) **Cross-domain navigation**
- It is OK to navigate across domains in the same attached tab.
- Use `browser.navigate` (preferred) or `browser.act` → `evaluate` to set `location.href`.
- After every navigation: `browser.snapshot(refs:"aria")` and continue.

## Popup / new tab handling

After any action likely to spawn a popup (e.g., “Sign in with Google”):
- Call `browser.tabs` again.
- If a **new tab** appears (especially auth domains) and actions stop affecting the expected UI:
  - Instruct the user to attach the new tab (Relay icon) if needed.
  - Then `browser.focus` to that new `targetId` and continue.

## Authentication / MFA handling

If you land on a sign-in/MFA screen:
- Stop automation and ask the user to complete the prompt.
- Be specific about what you see (e.g., “Google sign-in asking for email/2FA”).
- When the user says “done”, continue with snapshots and actions.

## Reliability heuristics

- Prefer role-based actions over exact text when possible.
- Avoid hard-coded time sleeps; use UI-driven waits (`snapshot` → check for elements).
- If stuck, take a screenshot via `browser.screenshot` and report what’s missing.

## Minimal template (pseudo-workflow)

- `browser.tabs(profile:"chrome")`
- Choose `targetId`
- `browser.snapshot(profile:"chrome", targetId, refs:"aria")`
- `browser.act(...click/type/press...)`
- On navigation: `browser.navigate(..., targetId, targetUrl)` → `snapshot`
- On popup suspicion: `browser.tabs` → attach/focus new tab → `snapshot`

## User instructions (only when needed)

- “Please attach the tab: click the OpenClaw Browser Relay icon in Chrome on the tab you want me to control (badge ON).”
- “A new login popup/tab opened. Please attach that tab as well, then tell me ‘attached’.”
