#!/bin/bash

set -e

# Define paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REACT_NATIVE_SDK_DIR="$(dirname "$SCRIPT_DIR")"
GO_SDK_DIR="$(dirname "$(dirname "$(dirname "$REACT_NATIVE_SDK_DIR")")")/go-sdk"
SIGNER_DIR="$GO_SDK_DIR/signer"

# Check if go-sdk exists
if [ ! -d "$GO_SDK_DIR" ]; then
    echo "Error: go-sdk directory not found at $GO_SDK_DIR"
    exit 1
fi

# Navigate to signer directory
cd "$SIGNER_DIR" || { echo "Error: Failed to navigate to $SIGNER_DIR"; exit 1; }

# Compile for iOS
echo "Compiling for iOS..."
gomobile bind -o signer.xcframework -target=ios || { echo "Error: iOS compilation failed"; exit 1; }

# Compile for Android
echo "Compiling for Android..."
gomobile bind -o signer.aar -target=android || { echo "Error: Android compilation failed"; exit 1; }

# Navigate back to react-native-sdk root
cd "$REACT_NATIVE_SDK_DIR" || { echo "Error: Failed to navigate to $REACT_NATIVE_SDK_DIR"; exit 1; }

# Remove old files if they exist
rm -rf signer.xcframework signer.aar

# Copy new files
echo "Copying compiled files..."
cp -R "$SIGNER_DIR/signer.xcframework" .
cp "$SIGNER_DIR/signer.aar" .

# Print framework structure for debugging
echo "Framework structure:"
find signer.xcframework -type d

echo "Compilation and setup completed successfully!"