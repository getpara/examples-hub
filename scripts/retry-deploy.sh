#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the workspace root (parent of scripts directory)
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

while ! (cd "$WORKSPACE_ROOT" && yarn build && cd examples/external-wallet-example && yarn deploy-sandbox && cd ../../sites/portal && yarn legacy-deploy-sandbox && cd ../..); do 
  echo "Command failed, retrying in 5 seconds..."
  sleep 5
done

echo "All commands completed successfully!"

