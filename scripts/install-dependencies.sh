#!/bin/bash

# Script to run yarn install in all subprojects of the examples-hub monorepo
# This script should be placed in the scripts/ directory of the monorepo
# and executed from the examples-hub root directory

# Log the start of the script
echo "Starting yarn install for all subprojects..."

# Initialize counters
TOTAL_PROJECTS=0
SUCCESSFUL_INSTALLS=0
FAILED_INSTALLS=0
SKIPPED_INSTALLS=0

# Find and process each framework directory
for framework_dir in web/*/; do
  # Get the framework name
  framework=$(basename "$framework_dir")
  echo "Processing framework: $framework"
  
  # For each app in the framework directory
  for app_dir in "web/$framework"/*; do
    if [ -d "$app_dir" ]; then
      app=$(basename "$app_dir")
      
      # Check if package.json exists
      if [ -f "$app_dir/package.json" ]; then
        echo "  Installing dependencies for $framework/$app..."
        
        # Increment total projects counter
        ((TOTAL_PROJECTS++))
        
        # Change to the app directory and run yarn install
        (cd "$app_dir" && yarn install)
        
        # Check if yarn install was successful
        if [ $? -eq 0 ]; then
          echo "  ✅ Successfully installed dependencies for $framework/$app"
          ((SUCCESSFUL_INSTALLS++))
        else
          echo "  ❌ Failed to install dependencies for $framework/$app"
          ((FAILED_INSTALLS++))
        fi
      else
        echo "  ⏭️  Skipping $framework/$app (no package.json found)"
        ((SKIPPED_INSTALLS++))
      fi
    fi
  done
done

# Print summary
echo "=== Installation Summary ==="
echo "Total projects processed: $TOTAL_PROJECTS"
echo "Successful installations: $SUCCESSFUL_INSTALLS"
echo "Failed installations: $FAILED_INSTALLS"
echo "Skipped directories (no package.json): $SKIPPED_INSTALLS"

if [ $FAILED_INSTALLS -eq 0 ]; then
  echo "All yarn installations completed successfully!"
  exit 0
else
  echo "Some installations failed. Please check the logs above."
  exit 1
fi