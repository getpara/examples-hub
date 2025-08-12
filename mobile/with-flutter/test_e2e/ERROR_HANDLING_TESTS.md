# Error Handling E2E Tests

## Overview

These end-to-end tests validate the structured error handling implementation in the Flutter example app. The tests ensure that errors from the Para SDK bridge are properly categorized, displayed with appropriate context, and handled gracefully.

## Test Coverage

### 1. Network Error Handling
- Validates that network-related errors are properly displayed
- Ensures retry suggestions are shown for transient network issues
- Tests error recovery after network failures

### 2. User Rejection Handling
- Validates that user cancellations are handled gracefully
- Ensures no retry suggestions for user-initiated cancellations
- Tests that the app remains functional after user rejection

### 3. Chain-Specific Error Context
- Validates that errors include relevant chain/wallet context (EVM, Solana, Cosmos)
- Tests that error messages are specific to the operation and chain
- Ensures proper error categorization by wallet type

### 4. Invalid Method Errors
- Tests handling of unsupported operations
- Validates clear error messaging for unimplemented features
- Ensures graceful degradation

### 5. Error Recovery Flow
- Validates that the app remains functional after errors
- Tests that operations can be retried after error dismissal
- Ensures UI state is properly maintained

### 6. Structured Error Information
- Validates that errors contain structured information:
  - Error code/type
  - Descriptive message
  - Operation context
  - Chain/wallet information

### 7. Retryable vs Non-Retryable Errors
- Tests different error categories and their retry suggestions
- Network errors → "Try again"
- Invalid input → "Check your input"
- User rejection → No retry suggestion

### 8. Error Logging Context
- Validates that errors include debugging context for logging
- Tests that error information would be properly captured for analytics

## Running the Tests

### Prerequisites

1. Install Appium and dependencies:
```bash
npm install -g appium
appium driver install xcuitest
```

2. Build the Flutter app for testing:
```bash
cd /Users/tyson/para/examples-hub/mobile/with-flutter
flutter build ios --debug --simulator
```

3. Install test dependencies:
```bash
cd test_e2e
dart pub get
```

### Running Tests

1. Start Appium server:
```bash
appium --log-level info
```

2. In another terminal, run the error handling tests:
```bash
cd /Users/tyson/para/examples-hub/mobile/with-flutter/test_e2e
dart test error_handling_test.dart
```

### Running Individual Tests

To run a specific test scenario:
```bash
dart test error_handling_test.dart --name "Network Error"
```

## Test Implementation Notes

### Widget Keys
The following widget keys have been added to support testing:
- `emailPhoneInput` - Email/phone input field
- `continue_button` - Continue button in auth flow
- `walletCell_EVM` - EVM wallet cell in wallet list
- `walletCell_SOLANA` - Solana wallet cell
- `walletCell_COSMOS` - Cosmos wallet cell
- `walletDetailView` - Wallet detail screen
- `signMessageButton` - Sign message action button
- `signTransactionButton` - Sign transaction button
- `wallets_screen` - Main wallets screen
- `wallets_screen_logout_button` - Logout button

### Error Structure

The tests validate that errors follow this structure:
```dart
class ParaBridgeError {
  final String code;        // Error code (e.g., "NETWORK_ERROR")
  final String message;      // User-friendly message
  final String? details;     // Technical details
  final Map<String, dynamic>? context; // Additional context
  final bool isRetryable;   // Whether operation can be retried
}
```

### Error Categories

The tests validate these error categories:
- `NETWORK_ERROR` - Network connectivity issues
- `USER_REJECTED` - User cancelled operation
- `INVALID_INPUT` - Invalid input data
- `METHOD_NOT_IMPLEMENTED` - Unsupported operation
- `INSUFFICIENT_FUNDS` - Insufficient balance
- `SIGNATURE_FAILED` - Signing operation failed
- `TRANSACTION_FAILED` - Transaction execution failed

## Integration with Para SDK

The error handling tests work with the Para SDK's structured error system. The SDK bridge provides:

1. **Error Categorization**: Automatic categorization of errors by type
2. **Chain Context**: Inclusion of chain/wallet type in error context
3. **Retry Logic**: Determination of retryable vs non-retryable errors
4. **User Messages**: Generation of user-friendly error messages
5. **Logging Context**: Rich context for error tracking and analytics

## Future Enhancements

1. **Mock Error Injection**: Add ability to inject specific errors for testing
2. **Error Analytics**: Validate error tracking to analytics services
3. **Localization**: Test error messages in different languages
4. **Error Recovery Strategies**: Test automatic retry with exponential backoff
5. **Offline Mode**: Test error handling in offline scenarios

## Troubleshooting

### Common Issues

1. **Appium Connection Failed**
   - Ensure Appium server is running: `appium`
   - Check that iOS Simulator is available
   - Verify XCUITest driver is installed

2. **Widget Keys Not Found**
   - Rebuild the Flutter app after adding keys
   - Ensure keys are properly exported in release builds

3. **Timeout Errors**
   - Increase timeout values in test configuration
   - Check that animations are disabled in test mode

4. **Test Flakiness**
   - Add explicit waits for UI elements
   - Use more specific widget finders
   - Ensure proper test isolation

## Contributing

When adding new error scenarios:

1. Add appropriate widget keys to the Flutter app
2. Create test scenario in `error_handling_test.dart`
3. Document the error category and expected behavior
4. Ensure test is idempotent and isolated
5. Update this documentation

## Related Documentation

- [Para SDK Error Handling](https://docs.para.io/sdk/error-handling)
- [Flutter Testing Guide](https://flutter.dev/docs/testing)
- [Appium Documentation](https://appium.io/docs)