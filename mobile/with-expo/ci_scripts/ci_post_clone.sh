#!/bin/sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📦 Installing JavaScript dependencies"
if ! command -v yarn >/dev/null 2>&1; then
  npm install --global yarn
fi
yarn install --frozen-lockfile

echo "📚 Installing CocoaPods dependencies"
cd ios
pod install --repo-update
