# Para Flutter Example

This example demonstrates integrating the Para SDK with a Flutter application for both iOS and Android platforms. It
showcases Para Basic Login, wallet management for EVM, Solana, Cosmos, Stellar, and Sui, and the complete set of
signing payloads supported by the Para Bridge. Use this project as a starting point for building your Flutter
application with Para.

## Key Files/Folders

- `lib/features/wallets/signing`: Contains the chain-specific message and transaction signing examples.
- `lib/features/wallets/screens`: Contains wallet management and chain detail screens.
- `lib/config/para_config.dart`: Maps hosted or local environment values into the Para SDK.
- `.env.example`: Template for environment variables.

## Prerequisites

- **Flutter SDK**: Ensure Flutter is installed and configured correctly.
- **Platform IDEs**: Xcode for iOS development and/or Android Studio for Android development.
- **Para API Key**: Obtain your API key from [developer.getpara.com](https://developer.getpara.com).

---

## Project Structure

The project demonstrates comprehensive integration through these key components:

- **Authentication Flows**
  - Basic Login through Para's hosted verification session
  - Email, phone, and social authentication
  - Native callback handling after authentication completes
- **Wallet Management Interface**
  - Wallet creation and querying across networks
  - Support for EVM, Solana, Cosmos, Stellar, and Sui wallets
- **Transaction Signing Examples**
  - Chain-specific message and transaction construction
  - Explicit routing for shared Ed25519 wallets
  - Structured and canonical serialized payload examples

---

## Installation & Setup

1. **Clone** this repository and navigate to the project directory:

   ```bash
   git clone https://github.com/capsule-org/js-monorepo.git
   cd js-monorepo/examples-hub/mobile/with-flutter
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

### Xcode Cloud Workflow

Xcode Cloud looks for optional automation hooks under `ci_scripts`. This project keeps the scripts inside
`mobile/with-flutter/ios/ci_scripts`. Point the workflow's Post-Clone script location to that folder so
`ci_post_clone.sh` runs before the archive step. The script:

1. Ensures the Flutter SDK (matching `.metadata`) is installed on the runner, runs `flutter pub get`,
   and precaches iOS artifacts so `ios/Flutter/Generated.xcconfig` and other ephemeral files exist.
2. Installs CocoaPods (via Homebrew on the runner if needed) and executes `pod install --repo-update`
   inside `mobile/with-flutter/ios`, generating the `Pods-Runner-frameworks-*.xcfilelist` files that
   `[CP] Embed Pods Frameworks` expects.

The script downloads Flutter `3.38.1` by default. Set `FLUTTER_VERSION` in your workflow if you need to pin CI to a
different Flutter release.

After enabling the script, rerun the workflow and Xcode Cloud will find the generated Flutter and Pods
files before invoking `xcodebuild archive`.

### .env File

Create a `.env` file (or rename `.env.example`) in the project root with the values your environment needs:

```
PARA_API_KEY=your_api_key_here
# options: sandbox, beta, or prod
PARA_ENV=sandbox
```

To run the SDK and Bridge against local Para services, set all four values:

```
PARA_API_KEY=your_local_api_key
PARA_ENV=dev
PARA_BRIDGE_URL=http://localhost:5173
PARA_RELYING_PARTY_ID=localhost
```

The app refuses to start in `dev` without an explicit local Bridge URL and relying-party ID. Hosted environments use
the SDK's standard URLs.

When running in CI (including Xcode Cloud), define `PARA_API_KEY` and `PARA_ENV` as workflow environment variables or
secrets. The `ios/ci_scripts/ci_post_clone.sh` hook generates the `.env` file automatically using those variables and
falls back to the checked-in `.env.example` so the Flutter asset bundler always finds something to package.

### iOS Setup

Keep the configured callback scheme when changing the bundle identifier so the Basic Login browser session can return
to the app after verification.

> **Export Compliance:** `ios/Runner/Info.plist` sets `ITSAppUsesNonExemptEncryption` to `false`, indicating the app
> only relies on Apple's standard encryption. When App Store Connect asks about encryption, you can answer "No"
> (standard OS encryption only) and skip the extra documentation.

> **Privacy Manifest:** `ios/Runner/PrivacyInfo.xcprivacy` declares that the app collects non-tracking device identifiers
> (via `device_info_plus`) solely for core functionality. Keep this file in sync if you add SDKs or start collecting
> additional data types.

### Android Setup

For custom package names:

1. Update the application ID in your `android/app/build.gradle` file
2. Register your SHA-256 fingerprint with Para
3. Allow time for domain association propagation

---

## Key Features

### Signing Examples

Open a wallet and select **Signing examples**. The examples are separated by chain and by message or transaction so
you can copy only the flow your integration needs:

- **EVM**: plain EIP-191 messages, EIP-712 typed data, EIP-7702 authorizations, and transaction types 0 through 2.
- **Solana**: plain and raw messages, structured transfers, serialized legacy transactions, and serialized v0 transactions.
- **Cosmos**: ADR-036 messages, structured Direct and Amino transactions, and serialized Direct and Amino sign documents.
- **Stellar**: plain and raw messages, Soroban authorization entries, structured payments, standard XDR, fee-bump XDR, and Soroban XDR.
- **Sui**: plain personal messages, personal-message bytes, and serialized BCS transactions.

These examples sign but do not broadcast. Structured examples build safe test-shaped payloads in the app. Serialized
examples ask you to paste a canonical payload because it must contain the real account, signer, sequence, and recent
chain data from your application before Para signs it.

### Basic Login

The standard mobile path is Basic Login. The app starts authentication with an email, phone number, or social
provider, opens Para's hosted verification URL in a secure system browser session, and returns to the wallet list when
Para reports that login or signup is complete:

```dart
final authState = await para.initiateAuthFlow(auth: Auth.email(email));
final loginUrl = authState.loginUrl;

if (loginUrl != null) {
  await para.presentAuthUrl(
    url: loginUrl,
    webAuthenticationSession: webAuthenticationSession,
  );

  if (authState.effectiveNextStage == AuthStage.signup) {
    await para.waitForSignup();
  } else {
    await para.waitForLogin();
  }

  await para.fetchWallets();
}
```

See `lib/screens/auth_screen.dart` for the complete implementation and `maestro/login-and-sign-test.yaml` for the
automated email, hosted verification, native callback, wallet, and signing flow.

```bash
maestro test maestro/login-and-sign-test.yaml
```

### Wallet Management

The example demonstrates comprehensive wallet management capabilities:

- Creation of wallets across multiple blockchain networks
- Wallet querying and state management
- Network-specific wallet operations
- Multi-chain wallet support

### Transaction Signing

The application includes network-specific transaction signing examples:

- **Solana Transactions**: Implementation using the `solana` package:

```dart
// Create Solana client and get public keys
final solanaClient = solana.SolanaClient(
  rpcUrl: Uri.parse('https://api.devnet.solana.com'),
  websocketUrl: Uri.parse('wss://api.devnet.solana.com'),
);
final fromPubkey = solana.Ed25519HDPublicKey.fromBase58(wallet.address!);
final toPubkey = solana.Ed25519HDPublicKey.fromBase58(recipientAddress);

// Get recent blockhash
final recentBlockhash = await solanaClient.rpcClient.getLatestBlockhash();

// Create transfer instruction
final transferInstruction = solana.SystemInstruction.transfer(
  fundingAccount: fromPubkey,
  recipientAccount: toPubkey,
  lamports: lamports,
);

// Create and compile message
final message = solana.Message(instructions: [transferInstruction]);
final compiledMessage = message.compile(
  recentBlockhash: recentBlockhash.value.blockhash,
  feePayer: fromPubkey,
);

// Sign with Para SDK's Solana signer
final signer = ParaSolanaWeb3Signer(
  para: para,
  solanaClient: solanaClient,
  walletId: wallet.id,
);

final signedTx = await signer.signTransaction(compiledMessage);
final txHash = await signer.sendTransaction(signedTx);
```

> **Note**: The Para SDK provides `ParaSolanaWeb3Signer` for seamless integration with the `solana` package,
> handling transaction signing through Para's secure infrastructure.

---

## Running the Example

1.  Ensure an emulator is running or a device is connected (`flutter devices`).
2.  Run the application:
    ```bash
    flutter run -d <your_device_id>
    ```

## Learn More

For more detailed documentation and API references, visit the official
[Para SDK documentation](https://docs.usepara.com/welcome).
