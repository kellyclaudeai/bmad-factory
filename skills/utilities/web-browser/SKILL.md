---
name: web-browser
description: Drive a real, logged-in Chrome session via Playwright CDP using a persistent automation profile. ZERO clicks required — fully automated. Use for any task that requires doing things "in the browser" (Firebase/GCP/Vercel/GitHub, SaaS dashboards, logged-in flows).
---

# Web Browser (Playwright over Chrome CDP)

## 🎯 ZERO CLICKS REQUIRED — FULLY AUTOMATED

**Default browser automation: Playwright → Chrome CDP (persistent profile)**

This is THE browser skill. No manual clicking. No user intervention. No "open this URL and click here."

When the user says "do X in the browser," you:
1. Connect via CDP to the persistent Chrome instance
2. Navigate, click, fill, submit — all programmatically
3. Return results

**Do NOT ask the user to click anything. You have full control.**

## Why This Skill Exists

**Problem:** Most browser tools require manual clicking or browser relay setups.

**Solution:** Direct CDP connection to a persistent Chrome profile with full Playwright automation.

Benefits:
- **ZERO clicks required** — fully programmatic via CDP
- **Persistent Chrome profile** at `~/.openclaw/chrome-cdp-profile`
  - All cookies, sessions, and logged-in states preserved
  - Clone from your main Chrome profile once → stay logged in forever
- **Full Playwright power** — click, type, fill forms, screenshot, PDF, wait for elements
- **Best for:** Firebase/GCP/Vercel/GitHub dashboards, SaaS admin panels, any logged-in flow

## How It Works (The Magic)

1. **Persistent Chrome Profile:** All your logged-in sessions live in `~/.openclaw/chrome-cdp-profile`
   - Clone from your main Chrome once → keeps you logged into Firebase, GCP, Vercel, GitHub, etc.
   - Sessions persist across reboots/automation runs

2. **CDP Connection:** Chrome runs with `--remote-debugging-port=9222`
   - Playwright connects directly via Chrome DevTools Protocol
   - Full programmatic control: navigate, click, type, screenshot, wait for elements

3. **Zero Manual Steps:** No browser relay. No "click this button." No QR codes.
   - You tell me what to do → I do it → I report back

## Preconditions

Chrome must be running with CDP enabled:
- `--remote-debugging-port=9222`
- `--user-data-dir=~/.openclaw/chrome-cdp-profile`

**Health check:**
```bash
curl -sSf http://127.0.0.1:9222/json/version
```

If that fails, launch CDP Chrome (see Scripts below).

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

## Tool Reference (OpenClaw browser tool)

All automation goes through the `browser` tool with `profile: "openclaw"` (the CDP profile).

### Navigate
```typescript
browser({ action: "navigate", targetUrl: "https://console.firebase.google.com", profile: "openclaw" })
```

### Get page state
```typescript
browser({ action: "snapshot", profile: "openclaw", refs: "aria" })
```

### Click, type, fill
```typescript
browser({ 
  action: "act", 
  profile: "openclaw",
  request: { kind: "click", ref: "e12" }  // ref from snapshot
})

browser({ 
  action: "act", 
  profile: "openclaw",
  request: { kind: "type", ref: "e23", text: "my-project-id" }
})
```

### Screenshot
```typescript
browser({ action: "screenshot", profile: "openclaw", fullPage: true })
```

## Example: Zero-Click Workflow

**User says:** "Create a new Firebase project called 'my-app'"

**You do (no clicks required):**
```typescript
// 1. Navigate
browser({ action: "navigate", targetUrl: "https://console.firebase.google.com", profile: "openclaw" })

// 2. Check what's on screen
browser({ action: "snapshot", profile: "openclaw", refs: "aria" })

// 3. Click "Add Project"
browser({ action: "act", profile: "openclaw", request: { kind: "click", ref: "e7" } })

// 4. Fill in project name
browser({ action: "act", profile: "openclaw", request: { kind: "type", ref: "e12", text: "my-app" } })

// 5. Click Continue
browser({ action: "act", profile: "openclaw", request: { kind: "click", ref: "e15" } })

// ... continue until done
```

**Result:** Project created. User clicked nothing.

## Decision Tree: Which Tool?

**Use web-browser (this skill) when:**
- User says "in the browser" or "open Firebase console"
- You need to interact with logged-in sites (GCP, Vercel, GitHub, etc.)
- You need to click buttons, fill forms, or navigate multi-step flows
- You need to screenshot or generate PDFs of rendered pages

**Use web-search skill when:**
- User asks "search for X" or "find information about Y"
- You need quick search results (titles + URLs + snippets)
- No interaction required, just finding content

**Use web_fetch (built-in) when:**
- You have a direct URL and just need to extract text/markdown
- No JavaScript interaction required
- Lightweight content extraction only

**Priority:** For any "do X in the browser" request → **use this skill** (web-browser).
