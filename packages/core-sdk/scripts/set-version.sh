#!/bin/bash
export LC_ALL=C

NODE_VERSION=$(node -p -e "require('./package.json').version")

find ./dist -type f -exec sed -i '' -e "s/process\.env\.PARA_CORE_VERSION/'${NODE_VERSION}'/g" {} \;