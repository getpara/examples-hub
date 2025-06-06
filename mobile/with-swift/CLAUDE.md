# examples-hub/mobile/with-swift/CLAUDE.md

This file provides guidance to Claude Code when working in the **examples-hub/mobile/with-swift/** directory.
This directory contains an example Swift app that showcases how to use Para's Swift SDK (swift-sdk)

---

## 1. Build Commands

> **Note:** The main Xcode workspace lives one level above this folder at `~/para/Para.xcworkspace`. That workspace includes both `swift-sdk` and the example app.

### Build the iOS app for iOS 16.5

```bash
cd ~/para
xcodebuild \
  -workspace ParaSwift.xcworkspace \
  -scheme Example \
  -sdk iphonesimulator \
  -configuration Release \
  build
```

### Format and Lint

```bash
cd ~/para/examples-hub/mobile/with-swift/
swiftformat --swiftversion 6.1 .
```
> Run `swiftformat` before committing.

---

## 2. End-to-End (E2E) Tests
> Note: There are no unit tests for the sample app. E2E tests are preferred (see below).

> **Location:**  
> All E2E/XCTest UI tests for the iOS example app live under
> `~/para/examples-hub/mobile/with-swift/exampleUITests`.

To run them from the root workspace:

1. **Run every E2E test**  
   ```bash
   cd ~/para
   xcodebuild \
     -workspace ParaSwift.xcworkspace \
     -scheme Example \
     -sdk iphonesimulator \
     -destination "platform=iOS Simulator,name=iPhone 16 Pro" \
     test
   ```

2. **Run a single E2E test method**  
   ```bash
   cd ~/para
   xcodebuild \
     -workspace ParaSwift.xcworkspace \
     -scheme Example \
     -sdk iphonesimulator \
     -destination "platform=iOS Simulator,name=iPhone 16 Pro" \
     test \
     -only-testing:exampleUITests/ExampleUITests/<testMethodName>
   ```

---