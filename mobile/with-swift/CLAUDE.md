# examples-hub/mobile/with-swift/CLAUDE.md

This file provides guidance to Claude Code when working in the **examples-hub/mobile/with-swift/** directory.
This directory contains an example Swift app that showcases how to use Para's Swift SDK (swift-sdk)

---

## 1. Build Commands

> **Note:** The Xcode workspace (`ParaSwift.xcworkspace`) lives at the root of the para directory. It includes both `swift-sdk` and the example app.

### Build the iOS app

```bash
xcodebuild \
  -workspace ../../../ParaSwift.xcworkspace \
  -scheme Example \
  -sdk iphonesimulator \
  -configuration Release \
  build
```

### Format and Lint

```bash
swiftformat --swiftversion 6.1 .
```
> Run `swiftformat` before committing.

---

## 2. End-to-End (E2E) Tests
> Note: There are no unit tests for the sample app. E2E tests are preferred (see below).

> **Location:**
> All E2E/XCTest UI tests live under `exampleUITests/` in this directory.

To run them from the parent workspace:

1. **Run every E2E test**
   ```bash
   xcodebuild \
     -workspace ../../../ParaSwift.xcworkspace \
     -scheme Example \
     -sdk iphonesimulator \
     -destination "platform=iOS Simulator,name=iPhone 16 Pro" \
     test
   ```

2. **Run a single E2E test method**
   ```bash
   xcodebuild \
     -workspace ../../../ParaSwift.xcworkspace \
     -scheme Example \
     -sdk iphonesimulator \
     -destination "platform=iOS Simulator,name=iPhone 16 Pro" \
     test \
     -only-testing:exampleUITests/ExampleUITests/<testMethodName>
   ```

---