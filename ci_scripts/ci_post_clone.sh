#!/bin/sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."
PROJECT_DIR="$REPO_ROOT/mobile/with-expo"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "with-expo project not found; skipping mobile setup."
  exit 0
fi

echo "📁 Preparing $PROJECT_DIR"

if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "Installing Yarn globally via npm"
  npm install --global yarn
fi

cd "$PROJECT_DIR"
YARN_VERSION="$(yarn --version 2>/dev/null || echo "0")"
YARN_MAJOR="${YARN_VERSION%%.*}"

echo "📦 Installing JavaScript dependencies with Yarn $YARN_VERSION"
if [ "${YARN_MAJOR:-0}" -ge 2 ] 2>/dev/null; then
  yarn install --immutable
else
  yarn install --frozen-lockfile
fi

echo "📚 Installing CocoaPods dependencies"
cd ios
pod install --repo-update
