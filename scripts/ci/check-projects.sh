#!/bin/bash
# Single check script for CI/CD - runs either lint or typecheck
# Usage: ./check-projects.sh <project-dir> <check-type>

set -e  # Exit on first error

PROJECT_DIR="${1}"
CHECK_TYPE="${2}"  # 'lint' or 'typecheck'

# Validate inputs
if [ -z "$PROJECT_DIR" ] || [ -z "$CHECK_TYPE" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: $0 <project-dir> <check-type>"
    echo "  check-type: lint or typecheck"
    exit 1
fi

# Function to find projects
find_projects() {
    local dir=$1
    local PROJECTS=()
    
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        PROJECTS+=("$dir")
    else
        for DIR in "$dir"/*; do
            if [ -d "$DIR" ] && [ -f "$DIR/package.json" ]; then
                PROJECTS+=("$DIR")
            fi
        done
    fi
    
    echo "${PROJECTS[@]}"
}

# Main execution
PROJECTS=($(find_projects "$PROJECT_DIR"))

if [ ${#PROJECTS[@]} -eq 0 ]; then
    echo "No projects found in $PROJECT_DIR"
    exit 1
fi

echo "🔍 Running $CHECK_TYPE for ${#PROJECTS[@]} project(s):"
printf "  - %s\n" "${PROJECTS[@]}"

for PROJECT in "${PROJECTS[@]}"; do
    echo ""
    echo "========================================================"
    echo "$CHECK_TYPE: $PROJECT"
    echo "========================================================"
    
    cd "$PROJECT" || exit 1
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        yarn install --frozen-lockfile || exit 1
    fi
    
    # Check if script exists
    if ! grep -q "\"$CHECK_TYPE\"" package.json; then
        echo "⚠️  No $CHECK_TYPE script found in package.json, skipping..."
        continue
    fi
    
    # Run the check
    echo "🚀 Running yarn $CHECK_TYPE..."
    if ! yarn $CHECK_TYPE; then
        echo "❌ $CHECK_TYPE failed for $PROJECT"
        exit 1
    fi
    
    echo "✅ $CHECK_TYPE passed for $PROJECT"
done

echo ""
echo "✅ All $CHECK_TYPE checks passed!"