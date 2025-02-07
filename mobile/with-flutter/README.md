# Para SDK Demo App

This Flutter application demonstrates the integration and usage of the Para SDK, showcasing various authentication
methods and wallet management features.

## Features

### Authentication Methods

- **Email**: Implementation of email-based authentication with passkey support
- **Phone**: Phone number authentication with passkey support
- **OAuth**: Integration with popular OAuth providers with passkey support:
  - Google
  - Apple
  - X (Twitter)
  - Discord

### Wallet Management

- Create and manage wallets for different blockchain networks:
  - EVM
  - Solana
  - Cosmos

### Transaction Signing Examples

- **Signing Flow UI**: Unified transaction signing interface via `demo_transactions.dart`
- **Chain-specific Examples**:
  - EVM transactions and messages
  - Solana transfers with `solana_web3` package
  - Cosmos transactions

Note: The Solana signing example uses the `solana_web3` package for demonstration purposes. You can modify the example
to use other Dart packages for Solana interaction based on your needs.

## Getting Started

1. Ensure you have Flutter installed and set up on your development machine
2. Clone this repository
3. Create a `.env` file in the root directory with your Para API key:
   ```
   PARA_BETA_API_KEY=your_api_key_here
   ```
4. Run `flutter pub get` to install dependencies

### Running on Android or iOS

1. List and launch available emulators/simulators:

   ```bash
   # List all available emulators
   flutter emulators

   # Launch a specific emulator
   flutter emulators --launch <emulator_id>
   ```

2. For iOS only, install pod dependencies:

   ```bash
   cd ios
   pod install
   cd ..
   ```

3. Run the app on specific platform:

   ```bash
   # Run on Android
   flutter run -d android

   # Run on iOS
   flutter run -d ios
   ```

Note: For iOS development, you need a Mac with Xcode installed.

## Authentication Flow Examples

### Email + Passkey

1. Check if user exists

   ```dart
   final exists = await para.checkIfUserExists(email);
   ```

2. Create new user

   ```dart
   await para.createUser(email);
   ```

3. Verify email with OTP

   ```dart
   final biometricsId = await para.verifyEmail(code);
   ```

4. Set up passkey

   ```dart
   await para.generatePasskey(email, biometricsId);
   ```

5. Create wallet

   ```dart
   final result = await para.createWallet(skipDistribute: false);
   ```

6. Login with passkey
   ```dart
   final wallet = await para.login();
   ```

### Phone + Passkey

1. Check if user exists

   ```dart
   final exists = await para.checkIfUserExistsByPhone(
     phone,
     countryCode
   );
   ```

2. Create new user

   ```dart
   await para.createUserByPhone(phone, countryCode);
   ```

3. Verify phone number

   ```dart
   final biometricsId = await para.verifyPhone(code);
   ```

4. Set up passkey and create wallet (same as email flow)

### OAuth

1. Get OAuth URL and initiate flow

   ```dart
   final oauthUrl = await para.getOAuthURL(provider);
   final oauthResult = await para.waitForOAuth();
   ```

2. For new users:

   ```dart
   final biometricsId = await para.verifyOAuth();
   await para.generatePasskey(oauthResult.email!, biometricsId);
   final result = await para.createWallet(skipDistribute: false);
   ```

3. For existing users:
   ```dart
   final wallet = await para.login();
   ```

## Transaction Signing Examples

The demo app includes examples of transaction signing for different blockchain networks. These examples show how to
integrate Para's signing capabilities with chain-specific transaction construction.

### Solana Transaction Signing

```dart
// Example using solana_web3 package
final connection = web3.Connection(web3.Cluster.devnet);
final publicKey = web3.Pubkey.fromBase58(wallet.address!);

// Create transaction
final transaction = web3.Transaction.v0(
  payer: publicKey,
  recentBlockhash: blockhash.blockhash,
  instructions: [
    programs.SystemProgram.transfer(
      fromPubkey: publicKey,
      toPubkey: web3.Pubkey.fromBase58(recipientAddress),
      lamports: lamports,
    ),
  ],
);

// Serialize for signing
final message = transaction.serializeMessage().toList();
final messageBase64 = base64Encode(message);

// Sign using Para
final result = await para.signMessage(
  walletId: wallet.id!,
  messageBase64: messageBase64,
);

// Handle signature
if (result is SuccessfulSignatureResult) {
  final signature = base64.decode(result.signature);
  // Add signature to transaction
  transaction.addSignature(publicKey, signature);
}
```

Note: While this example uses the `solana_web3` package, you can adapt the signing flow to work with other Solana
packages. The key integration point is Para's `signMessage` method which handles the actual signing of the serialized
transaction.
