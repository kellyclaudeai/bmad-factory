#!/usr/bin/env bash
set -euo pipefail

SRC="$HOME/Library/Application Support/Google/Chrome"
DST="${BROWSER_PROFILE:-$HOME/.openclaw/browser/openclaw/user-data}"
PORT="${CDP_PORT:-18800}"

# Quit Chrome to avoid profile corruption.
osascript -e 'tell application "Google Chrome" to quit' >/dev/null 2>&1 || true
sleep 2

# Backup existing DST if present.
if [ -d "$DST" ]; then
  BK="$DST.bak.$(date -u +%Y%m%dT%H%M%SZ)"
  mv "$DST" "$BK"
  echo "Backed up existing $DST -> $BK"
fi

mkdir -p "$DST"

# Copy Local State + Default + Profile * dirs (full clone: cookies/sessions/cache/login dbs).
cp -a "$SRC/Local State" "$DST/Local State"

if [ -d "$SRC/Default" ]; then
  cp -a "$SRC/Default" "$DST/Default"
fi

for d in "$SRC"/Profile\ *; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  cp -a "$d" "$DST/$name"
done

# Launch automation Chrome (CDP) with this user-data-dir.
open -na "/Applications/Google Chrome.app" --args \
  --user-data-dir="$DST" \
  --remote-debugging-port="$PORT" \
  --no-first-run \
  --no-default-browser-check \
  about:blank

echo "Launched CDP Chrome with user-data-dir: $DST (port $PORT)"
