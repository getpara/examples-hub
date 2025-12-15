#!/bin/sh
set -e

# Install Node.js
brew install node

# Install yarn
npm install -g yarn

# Install JS dependencies
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
yarn install

# Install pods
cd ios
pod install
