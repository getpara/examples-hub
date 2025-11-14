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
# Ensure Flutter SDK is available (download from official bundle)
###############################################################################
ensure_flutter() {
  if command -v flutter >/dev/null 2>&1; then
    log "Flutter already installed: $(flutter --version | head -n1)"
    return
  fi

  FLUTTER_VERSION_VALUE="${FLUTTER_VERSION:-3.35.6}"
  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    SDK_ZIP="flutter_macos_arm64_${FLUTTER_VERSION_VALUE}-stable.zip"
  else
    SDK_ZIP="flutter_macos_${FLUTTER_VERSION_VALUE}-stable.zip"
  fi

  FLUTTER_ROOT="$HOME/flutter_ci"
  FLUTTER_HOME="$FLUTTER_ROOT/flutter"
  SDK_ZIP_PATH="$FLUTTER_ROOT/flutter_sdk.zip"

  mkdir -p "$FLUTTER_ROOT"

  if [ -x "$FLUTTER_HOME/bin/flutter" ] && [ -f "$FLUTTER_HOME/version" ]; then
    INSTALLED_VERSION="$(tr -d '\r' < "$FLUTTER_HOME/version")"
    if [ "$INSTALLED_VERSION" = "$FLUTTER_VERSION_VALUE" ]; then
      export PATH="$FLUTTER_HOME/bin:$PATH"
      log "Flutter already installed at $FLUTTER_HOME ($INSTALLED_VERSION)"
      return
    fi
    log "Flutter $INSTALLED_VERSION found but $FLUTTER_VERSION_VALUE requested; reinstalling."
  fi

  DOWNLOAD_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/$SDK_ZIP"
  log "Downloading Flutter SDK $FLUTTER_VERSION_VALUE from $DOWNLOAD_URL"
  curl -L --fail "$DOWNLOAD_URL" -o "$SDK_ZIP_PATH"
  log "Unzipping Flutter SDK..."
  rm -rf "$FLUTTER_HOME"
  unzip -q "$SDK_ZIP_PATH" -d "$FLUTTER_ROOT"
  rm -f "$SDK_ZIP_PATH"

  export PATH="$FLUTTER_HOME/bin:$PATH"
  log "Flutter installed at $FLUTTER_HOME: $(flutter --version | head -n1)"
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
