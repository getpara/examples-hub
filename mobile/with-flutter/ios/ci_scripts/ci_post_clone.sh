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

###############################################################################
# Ensure .env exists (copy template or generate from CI secrets)
###############################################################################
ensure_env_file() {
  ENV_FILE="$PROJECT_DIR/.env"
  EXAMPLE_FILE="$PROJECT_DIR/.env.example"
  if [ -f "$ENV_FILE" ]; then
    log ".env already present at $ENV_FILE"
    return
  fi

  API_KEY_VALUE="${PARA_API_KEY:-${CI_PARA_API_KEY:-}}"
  ENV_VALUE="${PARA_ENV:-${CI_PARA_ENV:-}}"

  if [ -n "$API_KEY_VALUE" ] && [ -n "$ENV_VALUE" ]; then
    log "Creating .env from provided CI environment variables"
    cat >"$ENV_FILE" <<EOF
PARA_API_KEY=$API_KEY_VALUE
PARA_ENV=$ENV_VALUE
EOF
    log "Wrote $ENV_FILE with CI values"
    return
  fi

  if [ -f "$EXAMPLE_FILE" ]; then
    log "Copying $EXAMPLE_FILE to $ENV_FILE as fallback"
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    return
  fi

  log "⚠️  No .env.example found; writing placeholder .env"
  cat >"$ENV_FILE" <<'EOF'
PARA_API_KEY=YOUR_SANDBOX_API_KEY
PARA_ENV=beta
EOF
}

ensure_env_file

log "Repo root: $REPO_ROOT"
log "Flutter project: $PROJECT_DIR"

###############################################################################
# Determine which Flutter version to install (defaults to latest stable)
###############################################################################
resolve_flutter_version() {
  if [ -n "${FLUTTER_VERSION:-}" ]; then
    printf '%s' "$FLUTTER_VERSION"
    return
  fi

  CHANNEL="${FLUTTER_CHANNEL:-stable}"
  VERSION=""

  if command -v python3 >/dev/null 2>&1; then
    if ! VERSION="$(python3 - "$CHANNEL" <<'PY'
import json
import sys
import urllib.request

channel = sys.argv[1]
url = "https://storage.googleapis.com/flutter_infra_release/releases/releases_macos.json"
try:
    with urllib.request.urlopen(url) as resp:
        data = json.load(resp)
    release_hash = data["current_release"].get(channel)
    if not release_hash:
        raise SystemExit(1)
    for release in data["releases"]:
        if release["hash"] == release_hash:
            print(release["version"], end="")
            raise SystemExit(0)
except Exception:
    raise SystemExit(1)
PY
)"; then
      VERSION=""
    fi
  fi

  if [ -z "$VERSION" ]; then
    VERSION="3.35.6"
    log "⚠️  Unable to resolve latest $CHANNEL Flutter release; falling back to pinned $VERSION"
  else
    log "Resolved latest Flutter $CHANNEL release: $VERSION"
  fi

  printf '%s' "$VERSION"
}

###############################################################################
# Ensure Flutter SDK is available (download from official bundle)
###############################################################################
ensure_flutter() {
  FLUTTER_CHANNEL_VALUE="${FLUTTER_CHANNEL:-stable}"
  FLUTTER_VERSION_VALUE="$(resolve_flutter_version)"
  if command -v flutter >/dev/null 2>&1; then
    log "Flutter already installed: $(flutter --version | head -n1)"
    return
  fi

  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    SDK_ZIP="flutter_macos_arm64_${FLUTTER_VERSION_VALUE}-${FLUTTER_CHANNEL_VALUE}.zip"
  else
    SDK_ZIP="flutter_macos_${FLUTTER_VERSION_VALUE}-${FLUTTER_CHANNEL_VALUE}.zip"
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

  DOWNLOAD_URL="https://storage.googleapis.com/flutter_infra_release/releases/${FLUTTER_CHANNEL_VALUE}/macos/$SDK_ZIP"
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
