#!/bin/sh
set -e

echo "==> Bundling JavaScript for Xcode Cloud..."

cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"

npx expo export:embed \
  --platform ios \
  --entry-file node_modules/expo-router/entry.js \
  --bundle-output ios/ParaOneClickLogin/main.jsbundle \
  --assets-dest ios/ParaOneClickLogin

echo "==> JS Bundle created successfully"
