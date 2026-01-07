#!/bin/sh
set -e

# Disable Homebrew auto-update to save time and avoid hanging
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1

echo "==> Installing Node.js and Ruby via Homebrew..."
# Install Node.js and Ruby 3.x (system Ruby 2.6 is too old for latest CocoaPods)
brew install --verbose node ruby

# Use Homebrew Ruby instead of system Ruby 2.6
export PATH="/usr/local/opt/ruby/bin:$PATH"
export PATH="/usr/local/lib/ruby/gems/4.0.0/bin:$PATH"

echo "==> Installing yarn..."
npm install -g yarn

echo "==> Installing JS dependencies..."
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
yarn install

echo "==> Installing xcodeproj from git (Xcode 26 support)..."
gem install specific_install
gem specific_install https://github.com/CocoaPods/Xcodeproj.git

echo "==> Installing CocoaPods..."
gem install cocoapods

echo "==> Installing pods..."
cd ios
pod install || pod install || pod install

echo "==> Post-clone complete!"
