#!/bin/sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$(cd "$IOS_DIR/.." && pwd)"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "with-expo project not found at $PROJECT_DIR; skipping setup."
  exit 0
fi

echo "📁 Preparing $PROJECT_DIR"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare yarn@stable --activate >/dev/null 2>&1 || true
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "Yarn is required but not available."
  exit 1
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
cd "$IOS_DIR"
pod install --repo-update
