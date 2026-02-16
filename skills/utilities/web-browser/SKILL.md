---
name: web-browser
description: Drive a real, logged-in Chrome session via Playwright CDP using a persistent automation profile (no Relay attach clicks). Use for any task that requires doing things “in the browser” (Firebase/GCP/Vercel/GitHub, SaaS dashboards, logged-in flows). Distinct from web_search/web_fetch.
---

# Web Browser (Playwright over Chrome CDP)

Default browser automation path: **Playwright → Chrome CDP** (not Relay).

## Why

- No per-tab “attach” clicks.
- Uses a **persistent** Chrome profile at `~/.openclaw/chrome-cdp-profile`.
- Best for logged-in admin consoles (Firebase/GCP/Vercel/GitHub).

## Preconditions

- Chrome running with:
  - `--remote-debugging-port=9222`
  - `--user-data-dir=~/.openclaw/chrome-cdp-profile`

Health check:

```bash
curl -sSf http://127.0.0.1:9222/json/version
```

If that fails, (re)launch via the script below.

## Scripts

### 1) Clone current Chrome profile into the persistent CDP profile (one-time)

Run:

```bash
skills/utilities/web-browser/scripts/clone-chrome-profile-to-cdp.sh
```

This fully copies `~/Library/Application Support/Google/Chrome` into `~/.openclaw/chrome-cdp-profile` (including cookies/sessions/cache) and launches CDP Chrome.

### 2) Launch CDP Chrome (no cloning)

```bash
skills/utilities/web-browser/scripts/launch-cdp-chrome.sh
```

## Operating SOP (mandatory)

1) **Single driver tab**
   - Keep work in a single tab.
   - Prefer navigation in-place (`page.goto`) over opening new tabs/windows.

2) **Snapshot discipline**
   - After every navigation/action, re-check state before continuing.

3) **Escalate only for true blockers**
   - MFA / OS prompts / CAPTCHA.

## Notes

- Chrome Relay (`functions.browser profile="chrome"`) is a fallback if CDP is unavailable or explicitly requested.
