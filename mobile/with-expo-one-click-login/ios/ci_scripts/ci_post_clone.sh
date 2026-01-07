#!/bin/sh
set -e

# Install Node.js and Ruby 3.x (system Ruby 2.6 is too old for latest CocoaPods)
brew install node ruby

# Use Homebrew Ruby instead of system Ruby 2.6
export PATH="/usr/local/opt/ruby/bin:$PATH"

# Install yarn
npm install -g yarn

# Install JS dependencies
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
yarn install

# Install CocoaPods via Homebrew Ruby's gem (gets latest xcodeproj with Xcode 26 support)
gem install cocoapods
export PATH="$(ruby -r rubygems -e 'puts Gem.bindir'):$PATH"

# Install pods
cd ios
pod install
