#!/bin/sh
set -euo pipefail

log() {
  printf "%s %s\n" "[$(date +'%H:%M:%S')]" "$*"
}

log "ci_post_clone.sh starting (cwd=$(pwd))"

###############################################################################
# Resolve key paths
###############################################################################
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IOS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-}"

if [ -z "$REPO_ROOT" ]; then
  log "CI_PRIMARY_REPOSITORY_PATH not set; deriving repo root relative to script."
  REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
fi

if [ ! -d "$REPO_ROOT" ]; then
  log "❌ Repository root $REPO_ROOT not found."
  exit 1
fi

PROJECT_DIR="$REPO_ROOT/mobile/with-expo"
if [ ! -d "$PROJECT_DIR" ]; then
  log "with-expo project not found at $PROJECT_DIR; skipping setup."
  exit 0
fi

log "Repo root: $REPO_ROOT"
log "Expo project: $PROJECT_DIR"

###############################################################################
# Ensure Homebrew environment and Node availability
###############################################################################
BREW_BIN=""
if [ -x "/opt/homebrew/bin/brew" ]; then
  BREW_BIN="/opt/homebrew/bin/brew"
elif [ -x "/usr/local/bin/brew" ]; then
  BREW_BIN="/usr/local/bin/brew"
elif command -v brew >/dev/null 2>&1; then
  BREW_BIN="$(command -v brew)"
fi

if [ -z "$BREW_BIN" ]; then
  log "❌ Homebrew not found on runner; cannot install Node/Yarn."
  exit 1
fi

log "Using Homebrew at $BREW_BIN"
eval "$($BREW_BIN shellenv)"

if ! command -v node >/dev/null 2>&1; then
  log "Node not found; installing via Homebrew..."
  HOMEBREW_NO_AUTO_UPDATE=1 "$BREW_BIN" install node
else
  log "Node detected: $(node -v)"
fi

###############################################################################
# Run Yarn via the checked-in release
###############################################################################
YARN_CJS="$(printf '%s\n' "$REPO_ROOT"/.yarn/releases/yarn-*.cjs 2>/dev/null | head -n 1 || true)"
if [ -z "$YARN_CJS" ] || [ ! -f "$YARN_CJS" ]; then
  log "❌ Unable to locate Yarn release in $REPO_ROOT/.yarn/releases"
  exit 1
fi

log "Using Yarn script: $YARN_CJS"

cd "$PROJECT_DIR"
log "Installing JavaScript dependencies (immutable)..."
if ! node "$YARN_CJS" install --immutable; then
  log "Immutable install failed; retrying without --immutable"
  node "$YARN_CJS" install
fi

###############################################################################
# Ensure CocoaPods and install iOS dependencies
###############################################################################
if ! command -v pod >/dev/null 2>&1; then
  log "CocoaPods not found; installing via Homebrew..."
  HOMEBREW_NO_AUTO_UPDATE=1 "$BREW_BIN" install cocoapods
else
  log "CocoaPods detected: $(pod --version)"
fi

log "Running pod install in $IOS_DIR"
cd "$IOS_DIR"
pod install --repo-update

log "ci_post_clone.sh finished successfully"
