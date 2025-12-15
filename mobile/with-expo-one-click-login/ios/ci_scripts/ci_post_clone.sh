#!/bin/sh
set -e

cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/with-expo-one-click-login/ios"
pod install
