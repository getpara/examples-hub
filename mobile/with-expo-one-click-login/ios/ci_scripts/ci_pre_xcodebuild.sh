#!/bin/sh
set -e

# Add Homebrew paths (installed in ci_post_clone.sh)
eval "$(/usr/local/bin/brew shellenv 2>/dev/null || /opt/homebrew/bin/brew shellenv 2>/dev/null || true)"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "==> Bundling JavaScript for Xcode Cloud..."
echo "==> PATH: $PATH"
echo "==> node location: $(which node || echo 'not found')"
echo "==> npx location: $(which npx || echo 'not found')"

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
