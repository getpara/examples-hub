# Para Flutter E2E Tests

End-to-end tests for the Para Flutter example app using Appium.

## Prerequisites

1. **Install Appium**:
   ```bash
   npm install -g appium
   appium driver install xcuitest
   ```

2. **Environment Setup**:
   - API key is automatically loaded from `.env` file
   - iOS Simulator must be available

## Quick Start

**One-time setup:**
```bash
dart pub get
dart run tool/setup.dart
```

**Run tests:**
```bash
# All tests
dart run tool/run_tests.dart

# Email test only  
dart run tool/run_tests.dart email

# Phone test only
dart run tool/run_tests.dart phone
```

## Manual Testing

If you prefer manual control:

```bash
# Start Appium manually
appium --port 4723

# Run tests (in separate terminal)
dart test                                    # All tests
dart test -t "Email Authentication Flow"     # Email only
dart test -t "Phone Authentication Flow"     # Phone only
```

## Test Structure

- `para_flutter_e2e_test.dart` - Main test file with helper methods
- `tool/setup.dart` - Build script for the Flutter app
- `tool/run_tests.dart` - Test runner with Appium management
- `.env` - Environment variables (API key)

The tests automatically handle:
- ✅ App building and installation
- ✅ Biometric enrollment
- ✅ Authentication flows (email/phone + passkey)
- ✅ Wallet creation verification