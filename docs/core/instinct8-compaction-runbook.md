# Instinct8 -> OpenClaw Compaction Runbook

**Date:** 2026-02-19  
**Goal:** Go from "fresh clone" to "instinct8 compaction is enabled, called at X% context usage, and monitored."

## Current state (already done)

1. `instinct8-compaction` plugin is installed and loaded from:
   - `~/.openclaw/extensions/instinct8-compaction`
2. Plugin is enabled in config:
   - `~/.openclaw/openclaw.json` (`plugins.entries.instinct8-compaction.enabled: true`)
3. Current plugin config:
   - `sidecarUrl: http://localhost:8765`
   - `threshold: 150000`
   - `strategy: selective-salience`
   - `fallbackStrategy: protected-core`
   - `timeout: 18000`
   - `retries: 2`
   - `fallbackToStandard: true`
   - `verbose: true`
4. Sidecar is running and healthy on `127.0.0.1:8765` (container `instinct8-sidecar`).
5. Hook wiring is in place:
   - Plugin registers `before_agent_start` in `~/.openclaw/extensions/instinct8-compaction/src/index.ts`.
6. Threshold monitor logic is in place:
   - Token count check + trigger in `~/.openclaw/extensions/instinct8-compaction/src/compression-detector.ts`.

## What "X%" means right now

1. Plugin uses an absolute token threshold (`threshold`), not a native percentage field.
2. With a 200k context window, `150000` tokens is `75%`.
3. Formula:
   - `threshold_tokens = floor(context_window_tokens * (X / 100))`
4. Default OpenClaw reserve setting is `reserveTokensFloor: 35000`, which implies default compaction pressure around `165000` tokens (about `82.5%` of 200k), so `150000` is earlier.

## From scratch: end-to-end setup

## 1) Clone required repos

```bash
mkdir -p ~/projects
cd ~/projects

# Core strategy repo
git clone https://github.com/jjjorgenson/instinct8.git

# Plugin + sidecar integration repo
git clone https://github.com/austenallred/instinct8-integration.git
```

## 2) Start the sidecar

```bash
cd ~/projects/instinct8-integration/sidecar
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY

# If `docker` is not in PATH on macOS, use:
# /Applications/Docker.app/Contents/Resources/bin/docker
docker compose up -d --build

curl -sS http://localhost:8765/health
```

Expected: JSON with `"status":"healthy"`.

## 3) Build and install the plugin

```bash
cd ~/projects/instinct8-integration/plugin
npm ci
npm run build
openclaw plugins install "$(pwd)"
```

## 4) Enable plugin + set compaction threshold

Use `config.patch` (safe merge patch) through gateway.

```bash
HASH="$(openclaw gateway call config.get --json | jq -r '.result.hash')"

PATCH="$(jq -nc '{
  plugins: {
    entries: {
      "instinct8-compaction": {
        enabled: true,
        config: {
          sidecarUrl: "http://localhost:8765",
          threshold: 150000,
          strategy: "selective-salience",
          fallbackStrategy: "protected-core",
          timeout: 18000,
          retries: 2,
          fallbackToStandard: true,
          verbose: true
        }
      }
    }
  }
}')"

openclaw gateway call config.patch --json --params "$(jq -nc \
  --arg raw "$PATCH" \
  --arg baseHash "$HASH" \
  --arg note "Enable instinct8-compaction at 150k" \
  '{raw:$raw, baseHash:$baseHash, note:$note}')"
```

This writes config and triggers gateway restart (SIGUSR1).

## 5) Verify hook + monitor are active

```bash
openclaw plugins info instinct8-compaction
openclaw plugins list --enabled
curl -sS http://localhost:8765/health
```

Log verification:

```bash
rg -n "\[instinct8\] (Initializing compression plugin|Threshold exceeded|Compression successful|Falling back to standard OpenClaw compaction)" ~/.openclaw/logs/gateway.log | tail -n 40
```

You want to see:
1. Initialization + health check OK
2. Threshold exceeded at the expected token level
3. Compression successful entries after threshold crossings

## 6) Set your target X%

For a 200k context window:

```bash
X=75
THRESHOLD=$((200000 * X / 100))
echo "$THRESHOLD"  # 150000
```

Patch `threshold` to that value via step 4.

## What still needs to be done

1. Recreate canonical source path for maintainability.
   - Historical install metadata points to `/Users/austenallred/clawd/projects/instinct8-integration/plugin`, which no longer exists.
   - Keep one authoritative checkout and reinstall from it so updates are reproducible.
2. Implement real standard-compaction fallback.
   - Current fallback method in plugin is a no-op that returns original context.
3. Fix sidecar/plugin response schema mismatch.
   - Sidecar responds with `strategy`; plugin expects `strategy_used`.
   - This is why logs show `strategy: undefined` during successful compression events.
4. Add/restore explicit metrics endpoint if required.
   - Current running sidecar returns `404` on `/metrics`; monitoring is log-based + health checks.
5. Verify salience persistence contract end-to-end.
   - Plugin expects salience metadata; currently no salience files are being written under `~/.openclaw/workspace/salience/`.

## Practical acceptance test

1. Start a long-running session and generate context > threshold.
2. Confirm gateway log sequence:
   - `Threshold exceeded (...)`
   - `Compression successful: ...`
3. Confirm session keeps running without context overflow failures.
4. Confirm sidecar stays healthy throughout (`/health` and container health).

