#!/bin/sh
set -e

# Add Homebrew node to PATH (installed in ci_post_clone.sh)
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "==> Bundling JavaScript for Xcode Cloud..."

# Use CI_PRIMARY_REPOSITORY_PATH if set, otherwise calculate from script location
if [ -n "$CI_PRIMARY_REPOSITORY_PATH" ]; then
  cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
else
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  cd "$SCRIPT_DIR/../.."
fi

npx expo export:embed \
  --platform ios \
  --entry-file node_modules/expo-router/entry.js \
  --bundle-output ios/ParaOneClickLogin/main.jsbundle \
  --assets-dest ios/ParaOneClickLogin

echo "==> JS Bundle created successfully"
