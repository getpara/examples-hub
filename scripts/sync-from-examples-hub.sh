#!/bin/bash

# Sync script to pull changes from examples-hub back to web-sdk
# This keeps your local examples-hub/ directory in sync with the remote examples-hub repo

set -e

echo "🔄 Syncing changes from examples-hub repository..."

# Ensure examples-hub remote exists
bash "$(dirname "$0")/setup-examples-hub.sh"

# Fetch latest changes from examples-hub
echo "📥 Fetching latest changes from examples-hub..."
git fetch examples-hub

TARGET_BRANCH="2.0.0-alpha"

# Check for uncommitted changes in examples-hub/ directory
if ! git diff --quiet HEAD -- examples-hub/ 2>/dev/null || ! git diff --cached --quiet -- examples-hub/ 2>/dev/null; then
  echo "⚠️  Warning: You have uncommitted changes in examples-hub/ directory"
  echo "   Please commit or stash your changes first"
  git status -- examples-hub/
  exit 1
fi

# Store current HEAD to detect if a new commit is created
BEFORE_HEAD=$(git rev-parse HEAD)

# Perform the subtree pull
echo "🔽 Pulling changes from examples-hub/$TARGET_BRANCH into examples-hub/..."
if git subtree pull --prefix=examples-hub examples-hub $TARGET_BRANCH --squash -m "sync: Pull latest changes from examples-hub"; then
  AFTER_HEAD=$(git rev-parse HEAD)

  echo "✅ Sync completed successfully!"
  echo ""

  # Check if a new commit was created
  if [ "$BEFORE_HEAD" = "$AFTER_HEAD" ]; then
    echo "ℹ️  No new changes to sync (already up to date)"
  else
    echo "📝 Changes synced from examples-hub/$TARGET_BRANCH to examples-hub/"
    echo ""
    echo "📊 Changes synced:"
    git diff --stat HEAD~1 HEAD -- examples-hub/
  fi
else
  echo "❌ Sync failed. This might be due to conflicts."
  echo "   Please resolve conflicts manually and commit the result."
  exit 1
fi
