#!/usr/bin/env bash
set -euo pipefail

DST="$HOME/.openclaw/chrome-cdp-profile"
PORT="${CDP_PORT:-9222}"

mkdir -p "$DST"

open -na "/Applications/Google Chrome.app" --args \
  --user-data-dir="$DST" \
  --remote-debugging-port="$PORT" \
  --no-first-run \
  --no-default-browser-check \
  about:blank

echo "Launched CDP Chrome with user-data-dir: $DST (port $PORT)"
