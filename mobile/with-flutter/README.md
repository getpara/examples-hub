# Para Flutter Example

This example demonstrates integrating the Para SDK with a Flutter application for both iOS and Android platforms. It
showcases essential Para features, including multi-method authentication (email, phone, OAuth) with passkeys,
cross-chain wallet management (EVM, Cosmos, Solana), and transaction signing. Use this project as a starting point for
building your Flutter application with Para.

## Key Files/Folders

- `lib/examples`: Contains the core Flutter application logic demonstrating Para SDK usage.
- `.env.example`: Template for environment variables.

## Prerequisites

- **Flutter SDK**: Ensure Flutter is installed and configured correctly.
- **Platform IDEs**: Xcode for iOS development and/or Android Studio for Android development.
- **Para API Key**: Obtain your API key from [developer.getpara.com](https://developer.getpara.com). Create a `.env`
  file in the project root and add your key:
  ```
  PARA_BETA_API_KEY=your_api_key_here
  ```

## Installation

<<<<<<< HEAD
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
// Sign up or log in
var authState = await para.signUpOrLogIn(auth: {'email': email});

// First-time user setup
if (authState.stage == AuthStage.verify) {

  // Verify email with OTP
  authState = await para.verifyNewAccount(verificationCode: code);

  // Set up passkey
  await para.generatePasskey(identifier: email, biometricsId: signupState.passkeyId);

  // Create wallet
  final result = await para.createWallet(skipDistribute: false);
}

// Login with passkey
final wallet = await para.loginWithPasskey();
```

**Phone Authentication Flow**

```dart
// Sign up or log in - phone is an international format like `+13105551234`
var authState = await para.signUpOrLogIn(auth: {'phone': phone});

// First-time user setup
if (authState.stage == AuthStage.verify) {

  // Verify email with OTP
  authState = await para.verifyNewAccount(verificationCode: code);

  // Set up passkey
  await para.generatePasskey(identifier: phone, biometricsId: signupState.passkeyId);

  // Create wallet
  final result = await para.createWallet(skipDistribute: false);
}

// Login with passkey
final wallet = await para.loginWithPasskey();
```

**Third-Party Authentication Flows**
With third-party flows, verification via a one-time code is bypassed:
***OAuth***
```dart
// Verify via an OAuth service
final authState = await para.verifyOAuth(
  provider: OAuthMethod.google,
  deeplinkUrl: 'your-app-scheme'
);

// First-time user setup
if (authState.stage == AuthStage.signup) {
  await para.generatePasskey(
    identifier: authState.userId,
    biometricsId: authState.passkeyId!
  );

  await para.createWallet(skipDistribute: false);
}

// Log in user
final wallet = await para.loginWithPasskey();
```

***Farcaster***
```dart
final authState = await para.verifyFarcaster(
  isCanceled: () {
    // cancel if some change occurs in your UI
    return false;
  }
);

// First-time user setup
if (authState.stage == AuthStage.signup) {
  await para.generatePasskey(
    identifier: authState.userId,
    biometricsId: authState.passkeyId!
  );

  await para.createWallet(skipDistribute: false);
}

// Log in user
final wallet = await para.loginWithPasskey();
```

***Telegram***
```dart
final authState = await para.verifyTelegram(
  // Refer to the Telegram docs for information on bot authentication
  telegramAuthObject: telegramAuthObject,
);

// First-time user setup
if (authState.stage == AuthStage.signup) {
  await para.generatePasskey(
    identifier: authState.userId,
    biometricsId: authState.passkeyId!
  );

  await para.createWallet(skipDistribute: false);
}

// Log in user
final wallet = await para.loginWithPasskey();
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
=======
1.  Install Flutter dependencies:
    ```bash
    flutter pub get
    ```
>>>>>>> main

## Running the Example

1.  Ensure an emulator is running or a device is connected (`flutter devices`).
2.  Run the application:
    ```bash
    flutter run -d <your_device_id>
    ```

## Learn More

For more detailed documentation and API references, visit the official
[Para SDK documentation](https://docs.usepara.com/welcome).
