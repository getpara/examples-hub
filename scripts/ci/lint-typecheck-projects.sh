#!/bin/bash
# Lint and typecheck script for CI/CD - runs only lint and typecheck (no build)
# Usage: ./lint-typecheck-projects.sh <project-dir> <package-manager>

set -e  # Exit on first error for fast feedback

PROJECT_DIR="${1}"
PACKAGE_MANAGER="${2:-yarn}"

# Validate inputs
if [ -z "$PROJECT_DIR" ]; then
    echo "Error: Project directory not specified"
    echo "Usage: $0 <project-dir> <package-manager>"
    exit 1
fi

# Function to find projects
find_projects() {
    local dir=$1
    local PROJECTS=()
    
    # Check if the directory itself is a project
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        PROJECTS+=("$dir")
    else
        # Look for subdirectories with package.json
        for DIR in "$dir"/*; do
            if [ -d "$DIR" ] && [ -f "$DIR/package.json" ]; then
                PROJECTS+=("$DIR")
            fi
        done
    fi
    
    echo "${PROJECTS[@]}"
}

# Function to run package-specific commands
run_command() {
    local cmd=$1
    case "$PACKAGE_MANAGER" in
        "yarn")
            yarn $cmd
            ;;
        "npm")
            npm run $cmd
            ;;
        "bun")
            bun run $cmd
            ;;
    esac
}

# Function to check if a script exists in package.json
has_script() {
    local script=$1
    grep -q "\"$script\"" package.json
}

# Main execution
PROJECTS=($(find_projects "$PROJECT_DIR"))

echo "Found ${#PROJECTS[@]} projects to check:"
printf "  - %s\n" "${PROJECTS[@]}"

FAILED=false

for PROJECT in "${PROJECTS[@]}"; do
    echo ""
    echo "========================================================"
    echo "Checking $PROJECT"
    echo "========================================================"
    
    cd "$GITHUB_WORKSPACE/$PROJECT" || exit 1
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    case "$PACKAGE_MANAGER" in
        "yarn")
            yarn install --frozen-lockfile || exit 1
            ;;
        "npm")
            npm ci || exit 1
            ;;
        "bun")
            bun install --frozen-lockfile || exit 1
            ;;
    esac
    
    # Run lint if available
    if has_script "lint"; then
        echo "🔍 Running lint..."
        if ! run_command "lint"; then
            echo "❌ Lint failed for $PROJECT"
            FAILED=true
        fi
    else
        echo "⚠️  No lint script found"
    fi
    
    # Run typecheck if available
    if has_script "typecheck"; then
        echo "📝 Running typecheck..."
        if ! run_command "typecheck"; then
            echo "❌ Typecheck failed for $PROJECT"
            FAILED=true
        fi
    else
        echo "⚠️  No typecheck script found"
    fi
    
    echo "✅ Checks completed for $PROJECT"
done

echo ""
echo "========================================================"
echo "Summary"
echo "========================================================"

if [ "$FAILED" = true ]; then
    echo "❌ Some checks failed"
    exit 1
else
    echo "✅ All checks passed!"
fi