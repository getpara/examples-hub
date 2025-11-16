#!/bin/bash

# Setup script for examples-hub git remote
# This script is idempotent and safe to run multiple times

# Check if examples-hub remote already exists
if git remote | grep -q "^examples-hub$"; then
  # Remote exists, exit silently
  exit 0
fi

# Add examples-hub remote
git remote add examples-hub https://github.com/getpara/examples-hub.git 2>/dev/null || {
  # If remote add fails, it might already exist (race condition)
  # Check again and exit silently if it exists
  if git remote | grep -q "^examples-hub$"; then
    exit 0
  fi
  # If it still doesn't exist, something went wrong
  exit 1
}

exit 0
