#!/bin/sh
set -euo pipefail

log() {
  printf "%s %s\n" "[$(date +'%H:%M:%S')]" "$*"
}

log "ci_post_clone.sh starting (cwd=$(pwd))"

###############################################################################
# Resolve key paths and repo info
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

PROJECT_DIR="$REPO_ROOT/mobile/with-flutter"
if [ ! -d "$PROJECT_DIR" ]; then
  log "with-flutter project not found at $PROJECT_DIR; skipping setup."
  exit 0
fi

log "Repo root: $REPO_ROOT"
log "Flutter project: $PROJECT_DIR"

###############################################################################
# Determine Flutter revision/channel from .metadata (if available)
###############################################################################
METADATA_FILE="$PROJECT_DIR/.metadata"
FLUTTER_REVISION=""
FLUTTER_CHANNEL="stable"
if [ -f "$METADATA_FILE" ]; then
  FLUTTER_REVISION="$(awk -F'"' '/revision:/ {print $2; exit}' "$METADATA_FILE" | tr -d '\r')"
  CHANNEL_LINE="$(awk -F'"' '/channel:/ {print $2; exit}' "$METADATA_FILE" | tr -d '\r')"
  if [ -n "$CHANNEL_LINE" ]; then
    FLUTTER_CHANNEL="$CHANNEL_LINE"
  fi
fi

log "Desired Flutter channel: $FLUTTER_CHANNEL"
if [ -n "$FLUTTER_REVISION" ]; then
  log "Desired Flutter revision: $FLUTTER_REVISION"
fi

###############################################################################
# Ensure Flutter SDK is available
###############################################################################
ensure_flutter() {
  if command -v flutter >/dev/null 2>&1; then
    FLUTTER_BIN="$(command -v flutter)"
    FLUTTER_HOME="$(cd "$(dirname "$FLUTTER_BIN")/.." && pwd)"
    log "Flutter already installed at $FLUTTER_HOME ($(flutter --version | head -n1))."
    return
  fi

  FLUTTER_HOME="$HOME/flutter_ci/flutter"
  FLUTTER_BIN="$FLUTTER_HOME/bin/flutter"

  if [ ! -x "$FLUTTER_BIN" ]; then
    log "Installing Flutter SDK into $FLUTTER_HOME"
    rm -rf "$FLUTTER_HOME"
    git clone --depth 1 --branch "$FLUTTER_CHANNEL" https://github.com/flutter/flutter.git "$FLUTTER_HOME"
    if [ -n "$FLUTTER_REVISION" ]; then
      log "Checking out Flutter revision $FLUTTER_REVISION"
      git -C "$FLUTTER_HOME" fetch --depth 1 origin "$FLUTTER_REVISION" || git -C "$FLUTTER_HOME" fetch origin "$FLUTTER_REVISION"
      git -C "$FLUTTER_HOME" checkout "$FLUTTER_REVISION"
    fi
  fi

  export PATH="$FLUTTER_HOME/bin:$PATH"
  FLUTTER_BIN="$FLUTTER_HOME/bin/flutter"
  "$FLUTTER_BIN" --version
}

ensure_flutter

if ! command -v flutter >/dev/null 2>&1; then
  log "❌ Flutter command not found after installation."
  exit 1
fi

export PATH="$(cd "$(dirname "$(command -v flutter)")/.." && pwd)/bin:$PATH"
log "Using flutter at $(command -v flutter)"
flutter config --no-analytics || true
flutter precache --ios

###############################################################################
# Install Flutter/Dart dependencies
###############################################################################
cd "$PROJECT_DIR"
log "Running flutter pub get"
flutter pub get

###############################################################################
# Ensure CocoaPods availability and install iOS pods
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
  log "⚠️  Homebrew not found; assuming CocoaPods already available."
else
  eval "$("$BREW_BIN" shellenv)"
fi

if ! command -v pod >/dev/null 2>&1; then
  if [ -n "$BREW_BIN" ]; then
    log "Installing CocoaPods via Homebrew"
    HOMEBREW_NO_AUTO_UPDATE=1 "$BREW_BIN" install cocoapods
  else
    log "❌ CocoaPods not available and Homebrew missing."
    exit 1
  fi
fi

log "CocoaPods version: $(pod --version)"
log "Running pod install in $IOS_DIR"
cd "$IOS_DIR"
pod install --repo-update

log "ci_post_clone.sh finished successfully"
