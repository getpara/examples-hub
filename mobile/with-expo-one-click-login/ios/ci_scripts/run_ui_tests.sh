#!/bin/bash
set -e

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Project root: $PROJECT_ROOT"

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "==> Installing dependencies..."
  yarn install --frozen-lockfile
fi

echo "==> Bundling JavaScript for Release..."
npx expo export:embed \
  --platform ios \
  --entry-file node_modules/expo-router/entry.js \
  --bundle-output ios/ParaOneClickLogin/main.jsbundle \
  --assets-dest ios/ParaOneClickLogin

echo "==> Running UI Tests..."

# Use provided destination or find latest iPhone simulator
if [ -z "$TEST_DESTINATION" ]; then
  SIMULATOR=$(xcrun simctl list devices available -j | python3 -c "
import json, sys
data = json.load(sys.stdin)
for runtime, devices in data['devices'].items():
    if 'iOS' in runtime:
        for d in devices:
            if 'iPhone' in d['name'] and d['isAvailable']:
                print(d['udid'])
                sys.exit(0)
" 2>/dev/null || echo "")

  if [ -n "$SIMULATOR" ]; then
    TEST_DESTINATION="platform=iOS Simulator,id=$SIMULATOR"
    echo "==> Using simulator: $TEST_DESTINATION"
  else
    TEST_DESTINATION="platform=iOS Simulator,name=iPhone 17"
  fi
fi

xcodebuild test \
  -workspace ios/ParaOneClickLogin.xcworkspace \
  -scheme ParaOneClickLogin \
  -configuration Release \
  -destination "$TEST_DESTINATION" \
  -only-testing:ParaOneClickLoginUITests \
  CODE_SIGNING_ALLOWED=NO

echo "==> Tests complete!"
