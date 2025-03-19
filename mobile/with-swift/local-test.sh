#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting local Appium test setup..."

# Install Appium
echo "📦 Installing Appium..."
npm install -g appium

# Install Test Dependencies
echo "📦 Installing test dependencies..."
cd tests
npm install
cd ..

# Build & Run Tests
echo "🏗️ Building and running tests..."
# Build app
xcodebuild -scheme "Example" \
    -destination "platform=iOS Simulator,id=2EC1AA46-FA7C-4428-BC51-213156A4C087" \
    -configuration Debug \
    build

# Start Appium
echo "🚀 Starting Appium server..."
appium --log appium.log --debug &
APPIUM_PID=$!
sleep 10

# Run tests
echo "🧪 Running UI tests..."
cd tests
npm test

# Cleanup
echo "🧹 Cleaning up..."
kill $APPIUM_PID || true

echo "✅ Test run completed!" 