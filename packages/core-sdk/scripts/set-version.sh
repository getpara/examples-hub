#!/bin/sh
export LC_ALL=C

echo "Detected OS: $(uname)"

NODE_VERSION=$(node -p -e "require('./package.json').version")

if [ "$(uname)" = "Darwin" ]; then
  echo "Running sed command for macOS"
  find ./dist -type f -exec sed -i '' -e "s/process\.env\.PARA_CORE_VERSION/'${NODE_VERSION}'/g" {} \;
else
  echo "Running sed command for Linux"
  find ./dist -type f -exec sed -i -e "s/process\.env\.PARA_CORE_VERSION/'${NODE_VERSION}'/g" {} \;
fi
