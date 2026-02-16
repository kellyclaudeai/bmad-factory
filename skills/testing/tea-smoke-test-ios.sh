#!/bin/bash
# TEA Fast Mode - iOS Smoke Test
# Usage: tea-smoke-test-ios.sh <project-dir> <bundle-id> [simulator-name]
#
# Purpose: Quick smoke test for iOS apps
# - Builds app (Release configuration)
# - Boots iOS Simulator
# - Installs app
# - Launches app
# - Waits 10 seconds to check for immediate crashes
# - Shuts down simulator
#
# Exit codes:
#   0 = PASS (app installs, launches, no immediate crash)
#   1 = FAIL (build fails, install fails, app crashes on launch)

set -e

PROJECT_DIR="${1:?Usage: $0 <project-dir> <bundle-id> [simulator-name]}"
BUNDLE_ID="${2:?Usage: $0 <project-dir> <bundle-id> [simulator-name]}"
SIMULATOR="${3:-iPhone 17}"

echo "🧪 TEA Fast Mode - iOS Smoke Test"
echo "Project: $PROJECT_DIR"
echo "Bundle ID: $BUNDLE_ID"
echo "Simulator: $SIMULATOR"
echo ""

# Change to project directory
cd "$PROJECT_DIR" || {
  echo "❌ FAIL: Project directory not found: $PROJECT_DIR"
  exit 1
}

# Detect Xcode project/workspace
if [ -f *.xcworkspace ]; then
  WORKSPACE=$(ls *.xcworkspace | head -1)
  BUILD_TARGET="-workspace $WORKSPACE"
  SCHEME_NAME=$(basename "$WORKSPACE" .xcworkspace)
elif [ -f *.xcodeproj ]; then
  PROJECT=$(ls *.xcodeproj | head -1)
  BUILD_TARGET="-project $PROJECT"
  SCHEME_NAME=$(basename "$PROJECT" .xcodeproj)
else
  echo "❌ FAIL: No .xcworkspace or .xcodeproj found in $PROJECT_DIR"
  exit 1
fi

echo "📱 Building app for simulator..."
echo "   Scheme: $SCHEME_NAME"
echo "   Target: $BUILD_TARGET"

# Build for simulator (Release config for faster build)
xcodebuild \
  $BUILD_TARGET \
  -scheme "$SCHEME_NAME" \
  -destination "platform=iOS Simulator,name=$SIMULATOR" \
  -configuration Release \
  build \
  > /tmp/tea-smoke-ios-build.log 2>&1

if [ $? -ne 0 ]; then
  echo "❌ FAIL: Build failed"
  echo "Build logs:"
  tail -50 /tmp/tea-smoke-ios-build.log
  exit 1
fi

echo "✅ Build succeeded"

# Find built app
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData -name "*.app" -path "*$SCHEME_NAME*" -type d | head -1)

if [ -z "$APP_PATH" ]; then
  echo "❌ FAIL: Could not find built .app in DerivedData"
  exit 1
fi

echo "📦 App path: $APP_PATH"

# Boot simulator
echo "🚀 Booting simulator: $SIMULATOR"
xcrun simctl boot "$SIMULATOR" 2>/dev/null || {
  # Simulator might already be booted
  echo "   (Simulator already booted)"
}

# Wait for simulator to be ready
sleep 3

# Install app
echo "📲 Installing app..."
xcrun simctl install "$SIMULATOR" "$APP_PATH"

if [ $? -ne 0 ]; then
  echo "❌ FAIL: App installation failed"
  xcrun simctl shutdown "$SIMULATOR" 2>/dev/null
  exit 1
fi

echo "✅ App installed"

# Launch app
echo "🎬 Launching app..."
xcrun simctl launch "$SIMULATOR" "$BUNDLE_ID" > /tmp/tea-smoke-ios-launch.log 2>&1

if [ $? -ne 0 ]; then
  echo "❌ FAIL: App launch failed"
  cat /tmp/tea-smoke-ios-launch.log
  xcrun simctl shutdown "$SIMULATOR" 2>/dev/null
  exit 1
fi

echo "✅ App launched"

# Wait 10 seconds and check if app is still running
echo "⏳ Waiting 10 seconds to check for crashes..."
sleep 10

# Check if app is still running
APP_RUNNING=$(xcrun simctl spawn "$SIMULATOR" launchctl list | grep "$BUNDLE_ID" || true)

if [ -z "$APP_RUNNING" ]; then
  echo "❌ FAIL: App crashed within 10 seconds"
  # Try to get crash logs
  echo "Crash logs:"
  xcrun simctl spawn "$SIMULATOR" log show --predicate 'processImagePath contains "$BUNDLE_ID"' --last 30s || true
  xcrun simctl shutdown "$SIMULATOR" 2>/dev/null
  exit 1
fi

echo "✅ App still running after 10 seconds (no immediate crash)"

# Terminate app and shutdown simulator
echo "🧹 Cleaning up..."
xcrun simctl terminate "$SIMULATOR" "$BUNDLE_ID" 2>/dev/null || true
xcrun simctl shutdown "$SIMULATOR" 2>/dev/null || true

echo ""
echo "✅ PASS: iOS smoke test complete"
echo "   - Build succeeded"
echo "   - App installed"
echo "   - App launched"
echo "   - No immediate crash (10s)"
exit 0
