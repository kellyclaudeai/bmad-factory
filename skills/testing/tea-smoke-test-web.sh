#!/bin/bash
# TEA Fast Mode - Web Smoke Test
# Usage: tea-smoke-test-web.sh <project-dir> [port]
#
# Purpose: Quick smoke test for web apps (Next.js, React, etc.)
# - Starts dev server
# - Checks homepage loads (200 status)
# - Checks for no console errors
# - Kills dev server
#
# Exit codes:
#   0 = PASS (app loads, no crashes)
#   1 = FAIL (dev server won't start, homepage errors, console errors)

set -e

PROJECT_DIR="${1:?Usage: $0 <project-dir> [port]}"
PORT="${2:-3000}"
TIMEOUT=30

echo "🧪 TEA Fast Mode - Web Smoke Test"
echo "Project: $PROJECT_DIR"
echo "Port: $PORT"
echo ""

# Change to project directory
cd "$PROJECT_DIR" || {
  echo "❌ FAIL: Project directory not found: $PROJECT_DIR"
  exit 1
}

# Detect package manager and dev command
if [ -f "package.json" ]; then
  if grep -q '"next"' package.json; then
    DEV_CMD="npm run dev"
  elif grep -q '"vite"' package.json; then
    DEV_CMD="npm run dev"
  else
    DEV_CMD="npm start"
  fi
else
  echo "❌ FAIL: No package.json found in $PROJECT_DIR"
  exit 1
fi

echo "📦 Starting dev server: $DEV_CMD"

# Start dev server in background
$DEV_CMD > /tmp/tea-smoke-web.log 2>&1 &
DEV_PID=$!

# Cleanup function
cleanup() {
  echo "🧹 Cleaning up (killing dev server PID $DEV_PID)..."
  kill $DEV_PID 2>/dev/null || true
  wait $DEV_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "⏳ Waiting for dev server to start (timeout: ${TIMEOUT}s)..."

# Wait for server to be ready
START_TIME=$(date +%s)
while ! curl -s "http://localhost:$PORT" > /dev/null 2>&1; do
  ELAPSED=$(($(date +%s) - START_TIME))
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "❌ FAIL: Dev server did not start within ${TIMEOUT}s"
    echo "Server logs:"
    cat /tmp/tea-smoke-web.log
    exit 1
  fi
  sleep 1
done

echo "✅ Dev server running on http://localhost:$PORT"

# Check homepage loads
echo "🔍 Checking homepage..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT")

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAIL: Homepage returned HTTP $HTTP_CODE (expected 200)"
  exit 1
fi

echo "✅ Homepage loads (HTTP 200)"

# Check for console errors (requires Playwright)
if command -v npx > /dev/null 2>&1 && [ -d "node_modules/playwright" ]; then
  echo "🔍 Checking for console errors with Playwright..."
  
  # Create temporary Playwright test
  cat > /tmp/tea-smoke-console-check.js <<'EOF'
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  await page.goto('http://localhost:' + process.env.PORT);
  await page.waitForTimeout(2000); // Wait 2s for errors to surface
  
  await browser.close();
  
  if (errors.length > 0) {
    console.log('Console errors found:');
    errors.forEach(err => console.log('  - ' + err));
    process.exit(1);
  } else {
    console.log('No console errors found');
    process.exit(0);
  }
})();
EOF

  PORT=$PORT node /tmp/tea-smoke-console-check.js
  CONSOLE_CHECK=$?
  
  if [ $CONSOLE_CHECK -ne 0 ]; then
    echo "❌ FAIL: Console errors detected"
    exit 1
  fi
  
  echo "✅ No console errors"
else
  echo "⚠️  Skipping console error check (Playwright not installed)"
fi

echo ""
echo "✅ PASS: Web smoke test complete"
echo "   - Dev server started"
echo "   - Homepage loads (HTTP 200)"
echo "   - No console errors (or check skipped)"
exit 0
