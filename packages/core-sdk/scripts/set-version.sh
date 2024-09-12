NODE_VERSION=$(node -p -e "require('./package.json').version")

find ./dist -type f -exec sed -i '' -e "s/process\.env\.CORE_CAPSULE_VERSION/'${NODE_VERSION}'/g" {} \;
