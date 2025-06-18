# Para Flutter E2E Tests

End-to-end tests for the Para Flutter example app using Appium.

## Prerequisites

1. **Install Appium**:
   ```bash
   npm install -g appium
   appium driver install xcuitest
   ```

2. **Environment Setup**:
   - Set `PARA_API_KEY` in `.env` file or environment variable
   - iOS Simulator must be available

## Quick Start

```bash
# Run all tests
dart test para_flutter_e2e_test.dart --timeout 300s

# Run single test
dart run tool/run_single_test.dart 01
```

## Test Coverage (12 Tests)

1. **Email Authentication** - Signup and login with passkey
2. **Phone Authentication** - Signup and login with passkey
3. **Email Password Authentication** - Signup and login with password
4. **Wallet Verification** - Verify existing wallets and addresses
5. **Copy Wallet Address** - Test address copying functionality
6. **EVM Transaction Signing** - EVM transaction with gas fees
7. **Session Validation** - Verify session validity
8. **Logout** - Test logout functionality
9. **Solana Signing** - Solana transaction signing
10. **Cosmos Wallet Creation and Message Signing** - Create Cosmos wallet and sign messages
11. **Cosmos Transaction Signing** - Cosmos bank send transactions
12. **Cosmos Signing Method Validation** - Test Amino vs Proto signing methods

## Architecture

- All tests can run independently (isolated)
- Each test performs authentication if needed
- Tests validate real wallet and signing functionality
- Simplified codebase following "less is more" philosophy

## Troubleshooting

- **Tests timing out**: Use `--timeout 300s` flag
- **Simulator issues**: Ensure iOS Simulator is running
- **Appium errors**: Check `appium driver list --installed`