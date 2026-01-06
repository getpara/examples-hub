#!/bin/sh
set -e

# Install Node.js
brew install node

# Install yarn
npm install -g yarn

# Install JS dependencies
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
yarn install

# Install CocoaPods via gem (Homebrew version doesn't support Xcode 26)
sudo gem install cocoapods

# Install pods
cd ios
pod install
