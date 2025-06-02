#!/bin/bash

# Quick single test runner for debugging
# Usage: ./test_single.sh [test_name]
# Example: ./test_single.sh "Email Authentication"

set -e

TEST_NAME=${1:-"01 Email Authentication"}

echo "🧪 Quick Test: $TEST_NAME"
echo "=========================="

# Check if Appium is running
if ! curl -s http://127.0.0.1:4723/status > /dev/null; then
    echo "🚀 Starting Appium server..."
    appium server --port 4723 --log-level info > appium.log 2>&1 &
    APPIUM_PID=$!
    sleep 5
    
    # Cleanup function
    cleanup() {
        echo "🧹 Stopping Appium..."
        kill $APPIUM_PID 2>/dev/null || true
    }
    trap cleanup EXIT
else
    echo "✅ Appium already running"
fi

# Check if simulator is running
if ! xcrun simctl list devices | grep -q "Booted"; then
    echo "📱 Starting simulator..."
    DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 16 Pro" | grep -v "unavailable" | head -n 1 | grep -o "[A-F0-9-]\{36\}" || true)
    if [ -z "$DEVICE_ID" ]; then
        DEVICE_ID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -n 1 | grep -o "[A-F0-9-]\{36\}")
    fi
    xcrun simctl boot "$DEVICE_ID" || true
    sleep 5
else
    echo "✅ Simulator already running"
fi

# Quick check if app is built
if [ ! -d "build/ios/iphonesimulator/Runner.app" ]; then
    echo "🔨 Building app..."
    flutter build ios --simulator --debug
fi

# Run the specific test
cd test_e2e
echo "🧪 Running test: $TEST_NAME"
dart test --name "$TEST_NAME" para_flutter_e2e_test.dart