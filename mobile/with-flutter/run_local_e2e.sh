#!/bin/bash

# Local Flutter E2E Test Runner
# Usage: ./run_local_e2e.sh [test_type]
# test_type: all, email, phone, or specific test name

set -e

echo "🚀 Flutter E2E Local Test Runner"
echo "================================="

# Check if we're in the right directory
if [ ! -f "pubspec.yaml" ]; then
    echo "❌ Error: Run this script from the Flutter project root (examples-hub/mobile/with-flutter)"
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Flutter
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found. Please install Flutter first."
    exit 1
fi

# Check Appium
if ! command -v appium &> /dev/null; then
    echo "❌ Appium not found. Installing..."
    npm install -g appium@2.0.0
    appium driver install xcuitest
fi

# Check XCUITest driver
echo "🔧 Checking Appium XCUITest driver..."
appium driver list --installed | grep xcuitest || {
    echo "📦 Installing XCUITest driver..."
    appium driver install xcuitest
}

# Check iOS Simulator
echo "📱 Checking iOS Simulators..."
xcrun simctl list devices | grep -q "iPhone" || {
    echo "❌ No iPhone simulators found. Please install Xcode and iOS simulators."
    exit 1
}

# Start iOS Simulator if not running
SIMULATOR_RUNNING=$(xcrun simctl list devices | grep "Booted" | wc -l)
if [ "$SIMULATOR_RUNNING" -eq 0 ]; then
    echo "🔄 Starting iPhone 16 Pro simulator..."
    DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 16 Pro" | grep -v "unavailable" | head -n 1 | grep -o "[A-F0-9-]\{36\}" || true)
    
    if [ -z "$DEVICE_ID" ]; then
        echo "⚠️ iPhone 16 Pro not found, trying iPhone 15 Pro..."
        DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 15 Pro" | grep -v "unavailable" | head -n 1 | grep -o "[A-F0-9-]\{36\}" || true)
    fi
    
    if [ -z "$DEVICE_ID" ]; then
        echo "⚠️ iPhone 15 Pro not found, using any available iPhone..."
        DEVICE_ID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -n 1 | grep -o "[A-F0-9-]\{36\}")
    fi
    
    echo "📱 Using device: $DEVICE_ID"
    xcrun simctl boot "$DEVICE_ID" || true
    sleep 5
else
    echo "✅ iOS Simulator already running"
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PARA_API_KEY=test-key
PARA_ENV=sandbox
EOF
    echo "✅ Created .env with test values"
else
    echo "✅ .env file exists"
fi

# Build the Flutter app for iOS simulator
echo "🔨 Building Flutter app for iOS simulator..."
flutter clean
flutter pub get

# Check if pubspec_overrides.yaml exists and has the right content
if [ ! -f "pubspec_overrides.yaml" ]; then
    echo "📝 Creating pubspec_overrides.yaml..."
    cat > pubspec_overrides.yaml << EOF
dependency_overrides:
  para:
    git:
      url: https://github.com/capsule-org/flutter-sdk.git
      ref: main
  pinenacl: 0.6.0
EOF
    echo "✅ Created pubspec_overrides.yaml"
fi

echo "🔨 Building for iOS simulator..."
flutter build ios --simulator --debug

# Check if app was built
APP_PATH="build/ios/iphonesimulator/Runner.app"
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App build failed - $APP_PATH not found"
    exit 1
fi
echo "✅ App built successfully at $APP_PATH"

# Start Appium server in background
echo "🚀 Starting Appium server..."
appium server --port 4723 --log-level info > appium.log 2>&1 &
APPIUM_PID=$!
sleep 5

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [ ! -z "$APPIUM_PID" ]; then
        kill $APPIUM_PID 2>/dev/null || true
    fi
    # Kill any remaining appium processes
    pkill -f "appium server" 2>/dev/null || true
}
trap cleanup EXIT

# Check if Appium started successfully
curl -s http://127.0.0.1:4723/status > /dev/null || {
    echo "❌ Appium server failed to start. Check appium.log for details."
    tail -20 appium.log
    exit 1
}
echo "✅ Appium server running on port 4723"

# Setup test environment
echo "🔧 Setting up test environment..."
cd test_e2e
flutter pub get

# Create .env in test_e2e directory
cat > .env << EOF
PARA_API_KEY=test-key
PARA_ENV=sandbox
EOF

# Run the tests
TEST_TYPE=${1:-all}
echo "🧪 Running Flutter E2E tests (type: $TEST_TYPE)..."

dart run tool/run_tests.dart $TEST_TYPE

echo "✅ Test run completed!"