#!/bin/bash
# Build script for CI/CD - handles building projects with different package managers
# Usage: ./build-projects.sh <project-dir> <package-manager> [build-command]

set +e  # Continue on error to report all failures

PROJECT_DIR="${1}"
PACKAGE_MANAGER="${2:-yarn}"
BUILD_COMMAND="${3:-build}"

# Validate inputs
if [ -z "$PROJECT_DIR" ]; then
    echo "Error: Project directory not specified"
    echo "Usage: $0 <project-dir> <package-manager> [build-command]"
    exit 1
fi

# Function to find projects
find_projects() {
    local dir=$1
    local PROJECTS=()
    
    # Check if the directory itself is a project
    case "$PACKAGE_MANAGER" in
        "yarn"|"npm")
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
            ;;
        "bun")
            if [ -d "$dir" ] && [ -f "$dir/package.json" ] && [ -f "$dir/bun.lockb" ]; then
                PROJECTS+=("$dir")
            else
                for DIR in "$dir"/*; do
                    if [ -d "$DIR" ] && [ -f "$DIR/package.json" ] && ([ -f "$DIR/bun.lockb" ] || grep -q '"bun"' "$DIR/package.json"); then
                        PROJECTS+=("$DIR")
                    fi
                done
            fi
            ;;
        "deno")
            if [ -d "$dir" ] && [ -f "$dir/deno.json" ]; then
                PROJECTS+=("$dir")
            else
                for DIR in "$dir"/*; do
                    if [ -d "$DIR" ] && [ -f "$DIR/deno.json" ]; then
                        PROJECTS+=("$DIR")
                    fi
                done
            fi
            ;;
    esac
    
    echo "${PROJECTS[@]}"
}

# Function to run package-specific commands
run_command() {
    local cmd=$1
    local project=$2
    
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
        "deno")
            deno task $cmd
            ;;
    esac
}

# Function to check if a script exists in package.json
has_script() {
    local script=$1
    local project=$2
    
    case "$PACKAGE_MANAGER" in
        "yarn"|"npm"|"bun")
            grep -q "\"$script\"" "$project/package.json"
            ;;
        "deno")
            [ -f "$project/deno.json" ] && grep -q "\"tasks\":" "$project/deno.json" && grep -q "\"$script\"" "$project/deno.json"
            ;;
    esac
}

# Main execution
PROJECTS=($(find_projects "$PROJECT_DIR"))

echo "Found ${#PROJECTS[@]} projects to build:"
printf "  - %s\n" "${PROJECTS[@]}"

# Track success/failure
touch success_projects.txt
touch failed_projects.txt

for PROJECT in "${PROJECTS[@]}"; do
    echo ""
    echo "========================================================"
    echo "Processing $PROJECT"
    echo "========================================================"
    
    (
        cd "$GITHUB_WORKSPACE/$PROJECT" || exit 1
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        case "$PACKAGE_MANAGER" in
            "yarn")
                yarn install ${YARN_INSTALL_FLAGS:-} || exit 1
                ;;
            "npm")
                npm install || exit 1
                ;;
            "bun")
                bun install || exit 1
                ;;
            "deno")
                # Create dist directory if needed
                mkdir -p dist
                chmod 755 dist
                touch .env
                # Cache dependencies
                if [ -f "deno.json" ] && grep -q '"imports":' deno.json; then
                    for ATTEMPT in {1..3}; do
                        echo "Dependency cache attempt $ATTEMPT..."
                        deno cache --reload server.ts && break || sleep 5
                    done
                fi
                ;;
        esac
        
        # Run lint if available
        if has_script "lint" "$PROJECT"; then
            echo "🔍 Running lint..."
            run_command "lint" "$PROJECT" || exit 1
        fi
        
        # Run typecheck if available
        if has_script "typecheck" "$PROJECT"; then
            echo "📝 Running typecheck..."
            run_command "typecheck" "$PROJECT" || exit 1
        fi
        
        # Run build
        echo "🔨 Running build..."
        if [ "$PACKAGE_MANAGER" = "deno" ]; then
            if has_script "$BUILD_COMMAND" "$PROJECT"; then
                run_command "$BUILD_COMMAND" "$PROJECT"
            else
                echo "No build task found, checking main entry point..."
                MAIN_FILE=$(find . -maxdepth 1 -name "*.ts" -o -name "main.ts" -o -name "index.ts" -o -name "server.ts" | head -n 1)
                if [ -n "$MAIN_FILE" ]; then
                    echo "Checking $MAIN_FILE"
                    deno check "$MAIN_FILE"
                else
                    echo "No main file found to check, treating as success"
                fi
            fi
        else
            if [ -n "$BUILD_COMMAND" ]; then
                run_command "$BUILD_COMMAND" "$PROJECT"
            else
                yarn build
            fi
        fi
        
        BUILD_EXIT_CODE=$?
        
        # Clean up after build
        echo "Cleaning up build artifacts..."
        case "$PACKAGE_MANAGER" in
            "yarn"|"npm"|"bun")
                rm -rf node_modules dist build .next out
                ;;
            "deno")
                if [ $BUILD_EXIT_CODE -ne 0 ] && [ -d "$HOME/.cache/deno" ]; then
                    echo "Build failed, cleaning up cache..."
                    rm -rf "$HOME/.cache/deno/npm"
                fi
                ;;
        esac
        
        exit $BUILD_EXIT_CODE
    )
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully built $PROJECT"
        echo "$PROJECT" >> $GITHUB_WORKSPACE/success_projects.txt
    else
        echo "❌ Failed to build $PROJECT"
        echo "$PROJECT" >> $GITHUB_WORKSPACE/failed_projects.txt
    fi
done

# Report summary
SUCCESSFUL=$(cat success_projects.txt | wc -l)
FAILED=$(cat failed_projects.txt | wc -l)

echo ""
echo "========================================================"
echo "Build Summary for $PROJECT_DIR"
echo "========================================================"
echo "Total projects: ${#PROJECTS[@]}"
echo "Successful: $SUCCESSFUL"
echo "Failed: $FAILED"

if [ "$FAILED" -gt 0 ]; then
    echo "Failed projects:"
    cat failed_projects.txt | sed 's/^/  - /'
    exit 1
fi

echo "✅ All projects passed!"