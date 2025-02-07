# Para Flutter Example

This repository demonstrates the integration of the Para SDK with a Flutter application for iOS and Android platforms.
The example showcases these essential features:

- **Authentication** through multiple methods with passkey-based verification:
  - Email authentication
  - Phone number verification
  - OAuth providers (Google, Apple, X/Twitter, Discord)
- **Wallet creation** and management supporting EVM, Cosmos, and Solana networks
- **Transaction signing** implemented across multiple blockchain networks

> **Important**: For iOS passkey functionality, you must possess a valid Apple Developer Team ID associated with your
> chosen bundle ID. Configure your unique Team ID in your developer portal account and register it with Para. See the
> [iOS Setup](#ios-setup) section for detailed instructions.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [.env File](#env-file)
  - [iOS Setup](#ios-setup)
  - [Android Setup](#android-setup)
- [Key Features](#key-features)
  - [Authentication Methods](#authentication-methods)
  - [Wallet Management](#wallet-management)
  - [Transaction Signing](#transaction-signing)
- [Running the Example](#running-the-example)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before beginning, ensure you have:

1. **Flutter SDK** properly installed and configured on your development environment
2. **Development environment** set up with:
   - [Xcode](https://developer.apple.com/xcode/) for iOS development (macOS required)
   - [Android Studio](https://developer.android.com/studio) for Android development
3. **Para API Key** obtained from [developer.getpara.com](https://developer.getpara.com/)
4. **.env file** configured with your environment variables (detailed below)

> **Note**: Full passkey functionality on iOS requires a valid Apple Developer Account and a registered bundle ID
> matching the Team ID provided to Para. For Android, passkey functionality requires a device with secure lock screen
> and biometric authentication enabled, plus Google Play Services with an active Google account.

---

## Project Structure

The project demonstrates comprehensive integration through these key components:

- **Authentication Flows**
  - Email-based authentication with passkey support
  - Phone number verification with passkey support
  - OAuth provider integration with passkey support
- **Wallet Management Interface**
  - Wallet creation and querying across networks
  - Support for EVM, Solana, and Cosmos chains
- **Transaction Signing Examples**
  - Network-specific transaction construction
  - Unified signing interface implementation
  - Chain-specific transaction examples

---

## Installation & Setup

1. **Clone** this repository and navigate to the project directory:

   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/mobile/with-flutter
   ```

2. **Install Flutter dependencies**:

   ```bash
   flutter pub get
   ```

3. **(iOS only)** Install CocoaPods dependencies:

   ```bash
   cd ios
   pod install
   cd ..
   ```

### .env File

Create a `.env` file (or rename `.env.example`) in your project root directory and add your Para API key:

```
PARA_BETA_API_KEY=your_api_key_here
```

### iOS Setup

For iOS passkey functionality:

1. Update the bundle identifier in your Xcode project settings
2. Submit your Team ID and bundle ID to [Para Support](https://developer.getpara.com)
3. Allow time for domain association propagation (up to 24 hours)
4. Launch the app on iOS

> **Note**: iOS passkey functionality requires a valid Apple Developer Team ID registered with Para. Allow up to 24
> hours for domain association propagation after registration.

### Android Setup

For custom package names:

1. Update the application ID in your `android/app/build.gradle` file
2. Register your SHA-256 fingerprint with Para
3. Allow time for domain association propagation

> **Note**: Android passkey functionality requires a device with secure lock screen and biometric authentication
> (fingerprint or face recognition) enabled, plus Google Play Services with an active Google account for cloud backup
> security.

---

## Key Features

### Authentication Methods

The example implements multiple authentication flows, each supporting passkey functionality:

**Email Authentication Flow**

```dart
// Check if user exists
final exists = await para.checkIfUserExists(email);

// Create new user if needed
await para.createUser(email);

// Verify email with OTP
final biometricsId = await para.verifyEmail(code);

// Set up passkey
await para.generatePasskey(email, biometricsId);

// Create wallet
final result = await para.createWallet(skipDistribute: false);

// Login with passkey
final wallet = await para.login();
```

**Phone Authentication Flow**

```dart
// Check if user exists
final exists = await para.checkIfUserExistsByPhone(phone, countryCode);

// Create new user if needed
await para.createUserByPhone(phone, countryCode);

// Verify phone number
final biometricsId = await para.verifyPhone(code);

// Proceed with passkey setup and wallet creation (same as email flow)
```

**OAuth Authentication Flow**

```dart
// For standard OAuth providers
final authUrl = await para.getOAuthURL(provider);
final oauthResult = await para.waitForOAuth();

// For Farcaster
final farcasterUrl = await para.getFarcasterConnectURL();
final farcasterResult = await para.waitForFarcasterStatus();

// Verify and setup
final biometricsId = await para.verifyOAuth();
await para.generatePasskey(identifier, biometricsId);
final result = await para.createWallet(skipDistribute: false);

// Login for existing users
final wallet = await para.login();
```

### Wallet Management

The example demonstrates comprehensive wallet management capabilities:

- Creation of wallets across multiple blockchain networks
- Wallet querying and state management
- Network-specific wallet operations
- Multi-chain wallet support

### Transaction Signing

The application includes network-specific transaction signing examples:

- **Solana Transactions**: Implementation using the `solana_web3` package:

```dart
// Create connection and get public key
final connection = web3.Connection(web3.Cluster.devnet);
final publicKey = web3.Pubkey.fromBase58(wallet.address!);

// Construct transaction
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

// Prepare for signing
final message = transaction.serializeMessage().toList();
final messageBase64 = base64Encode(message);

// Sign with Para
final result = await para.signMessage(
  walletId: wallet.id!,
  messageBase64: messageBase64,
);

// Process signature
if (result is SuccessfulSignatureResult) {
  final signature = base64.decode(result.signature);
  transaction.addSignature(publicKey, signature);
}
```

> **Note**: While this example uses the `solana_web3` package, the signing process can be adapted for other Solana
> packages. The core integration point remains Para's `signMessage` method.

---

## Running the Example

1. **Configure** your `.env` file with a valid `PARA_BETA_API_KEY`
2. **Install** Flutter dependencies via `flutter pub get`
3. **(iOS only)** Install pods in the `ios/` directory:
   ```bash
   pod install
   ```
4. **Launch** an emulator or connect a device:

   ```bash
   # List available devices
   flutter devices

   # Run on specific device
   flutter run -d <device_id>
   ```

## Documentation

For comprehensive guidance on Para SDK implementation in Flutter, consult:

- [Para Docs: Flutter Setup](https://docs.getpara.com/getting-started/initial-setup/flutter)
- [Example code in this repo](https://github.com/getpara/examples-hub)

---

## Troubleshooting

Common issues and solutions:

- **Passkey Domain Issues**: Allow up to 24 hours for domain association; iOS requires valid Team ID and bundle ID
- **API Key Recognition**: Verify your environment variable configuration and `.env` file setup
- **Android Signature Mismatch**: Confirm your SHA-256 fingerprint matches your keystore configuration
- **Creation Options Unavailable**: Verify device security requirements (screen lock, biometrics) and Google account
  status for Android
- **Invalid API Key**: Confirm `.env` configuration and API key validity with correct Para client Environment
- **Incorrect Wallet Display**: Verify wallet enablement in your developer portal
