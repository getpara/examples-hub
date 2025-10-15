# Para Flutter E2E Tests

End-to-end tests for the Para Flutter example app using Appium (iOS Simulator).

## Prerequisites

- Node 18+, Dart SDK 3.5+, Xcode (with iOS simulators installed)
- Appium + XCUITest driver:
  ```bash
  npm install -g appium
  appium driver install xcuitest
  ```

## Environment

Create `.env` in either project root or `test_e2e/` with one of:

```env
# Preferred
PARA_API_KEY=your_api_key

# Fallback supported by tests
PARA_BETA_API_KEY=your_api_key
```

Optional overrides:

```bash
# Target a specific booted simulator
export IOS_SIM_UDID=<device-udid>
# Or specify name/version
export IOS_DEVICE_NAME="iPhone 16 Pro"
export IOS_PLATFORM_VERSION="18.0"
# If you changed the app id
export BUNDLE_ID=com.usecapsule.example.flutter
```

## Usage

From `examples-hub/mobile/with-flutter/test_e2e`:

```bash
# One-time setup (builds the iOS app); run again if you change Dart/iOS code
dart run tool/setup.dart

# Run all tests (starts/stops Appium automatically)
dart run tool/run_tests.dart

# Run a subset
dart run tool/run_tests.dart authentication
dart run tool/run_tests.dart wallets

# Run a single suite
dart run tool/run_single_test.dart authentication
```

The runners will build the iOS simulator app if missing, start Appium, run tests, and shut it down.

## Suites

- Authentication: One-Click OTP (email + phone)
- EVM wallet: basic ops, session, signing
- Solana wallet: disabled (parity with Swift)
- Cosmos wallet: disabled (parity with Swift)

To re‑enable Solana/Cosmos temporarily, remove the `@Skip(...)` annotation at the top of their test files and run those suites directly.

## Troubleshooting

- Make sure a simulator is booted: `xcrun simctl list | rg Booted`
- If Appium can’t find a device, set `IOS_SIM_UDID` or `IOS_DEVICE_NAME/IOS_PLATFORM_VERSION`
- Check Appium install: `appium driver list --installed`
