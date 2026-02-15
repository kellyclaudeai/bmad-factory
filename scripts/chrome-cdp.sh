#!/bin/zsh
set -euo pipefail

# Launch Google Chrome with the Chrome DevTools Protocol enabled.
# This must run when Chrome is NOT already running, otherwise args may be ignored.

PORT=${CHROME_CDP_PORT:-9222}

# If Chrome is running, exit non-zero so callers can decide what to do.
if pgrep -x "Google Chrome" >/dev/null 2>&1; then
  echo "Chrome is already running. Quit Chrome completely, then re-run." >&2
  exit 2
fi

# Start Chrome with CDP enabled.
open -na "Google Chrome" --args \
  --remote-debugging-port="$PORT" \
  --remote-allow-origins="http://localhost:$PORT" \
  --no-first-run \
  --no-default-browser-check

echo "Started Chrome with CDP on localhost:$PORT"