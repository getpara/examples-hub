#!/bin/sh
set -e

# Install Node.js and Ruby 3.x (system Ruby 2.6 is too old for latest CocoaPods)
brew install node ruby

# Use Homebrew Ruby instead of system Ruby 2.6
export PATH="/usr/local/opt/ruby/bin:$PATH"
export PATH="/usr/local/lib/ruby/gems/4.0.0/bin:$PATH"

# Install yarn
npm install -g yarn

# Install JS dependencies
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login"
yarn install

# Install xcodeproj from git main (has Xcode 26 object version 70 support)
# Released xcodeproj 1.27.0 doesn't support Xcode 26 yet
gem install specific_install
gem specific_install https://github.com/CocoaPods/Xcodeproj.git

# Install CocoaPods (will use the git-installed xcodeproj)
gem install cocoapods

# Install pods
cd ios
pod install
