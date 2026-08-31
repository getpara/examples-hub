# Para Swift SDK Example

A sample iOS wallet app demonstrating authentication, wallet management, and the complete Para Bridge signing
contract through the [Para Swift SDK](https://github.com/getpara/swift-sdk).

## Prerequisites

- Xcode 15.0+
- iOS 16.4+
- [Para Developer Account](https://developer.getpara.com/)

## Quick Start

1. **Clone and open the project:**

   ```bash
   git clone https://github.com/capsule-org/js-monorepo.git
   cd js-monorepo/examples-hub/mobile/with-swift
   open example.xcodeproj
   ```

2. **Configure Para SDK:**

   **For local development:**

   - Copy `example/Config.xcconfig` to `example/Secrets.xcconfig`
   - Add your API key from [Para Developer Portal](https://developer.getpara.com/)
   - Set `PARA_ENVIRONMENT` to sandbox, beta, or prod
   - In Xcode: Select your project → Info tab → Configurations → Set both Debug and Release to use "Secrets"

   **Note**: `Secrets.xcconfig` is gitignored. Use `Config.xcconfig` as the template.

   For a fully local Para environment, set the following build values in your selected xcconfig:

   ```text
   PARA_API_KEY=your_local_api_key
   PARA_ENVIRONMENT=dev
   PARA_BRIDGE_URL=http://localhost:5173
   PARA_RELYING_PARTY_ID=localhost
   ```

   The app rejects a `dev` configuration without an explicit local Bridge URL and relying-party ID. Hosted
   environments use the Swift SDK's standard URLs.

3. **Configure Xcode project:**

   - Go to **Signing & Capabilities** → Select your development team
   - Change Bundle ID to something unique (e.g., `com.yourcompany.paraexample`)
   - Register your Team ID + Bundle ID in [Para Developer Portal](https://developer.getpara.com/)

4. **Build and run** (⌘R)

## Key Features Demonstrated

- **Authentication**: Basic Login with email, phone, or social providers, plus MetaMask
- **Wallet Management**: Create and manage EVM, Solana, Cosmos, Stellar, and Sui wallets
- **Transaction Signing**: Sign the supported message and transaction forms across all five wallet types
- **Session Management**: Secure session handling with biometric authentication
- **External Wallets**: MetaMask integration via deep linking

## Code Highlights

To explore the SDK integration, check out these key files:

- **Authentication**: `example/Auth/AuthView.swift`
- **Wallet Operations**: `example/Wallet/EVMWalletView.swift`, `SolanaWalletView.swift`
- **SDK Configuration**: `example/Configuration/ParaConfig.swift`, `example/App/ExampleApp.swift`
- **Signing Catalog**: `example/Signing/SigningExampleCatalog.swift` and the chain-specific files beside it
- **MetaMask Integration**: `example/Auth/MetaMaskDemoView.swift`

## Signing Examples

Open a wallet and select **Signing examples**. The catalog is separated by chain and by message or transaction:

- **EVM**: plain EIP-191 messages, EIP-712 typed data, EIP-7702 authorizations, and transaction types 0 through 2.
- **Solana**: plain and raw messages, structured transfers, serialized legacy transactions, and serialized v0 transactions.
- **Cosmos**: ADR-036 messages, structured Direct and Amino transactions, and serialized Direct and Amino sign documents.
- **Stellar**: plain and raw messages, Soroban authorization entries, structured payments, standard XDR, fee-bump XDR, and Soroban XDR.
- **Sui**: plain personal messages, personal-message bytes, and serialized BCS transactions.

The examples sign but do not broadcast. Structured examples build safe test-shaped payloads in the app. Serialized
examples require a canonical payload containing your real account, signer, sequence, and recent chain data.

## Basic Login

The standard mobile path starts email, phone, or social authentication through `ParaManager`, presents Para's hosted
verification session, and waits for login or signup to finish before showing wallets. See `example/Auth/AuthView.swift`
for the implementation and `maestro/login-and-sign-test.yaml` for the automated hosted verification, native callback,
wallet, and signing flow.

```bash
maestro test maestro/login-and-sign-test.yaml
```

## Beta Testing

Use these test credentials in `beta` environment:

- **Email**: Any address ending in `@test.getpara.com`
- **Phone**: US numbers like `(425)-555-1234`
- **OTP**: Any 6-digit code

## Xcode Cloud Configuration

For TestFlight and App Store builds:

1. **Set Environment Variables in Xcode Cloud workflow:**

   - `PARA_API_KEY`: Your Para API key
   - `PARA_ENVIRONMENT`: sandbox, beta, or prod

2. **How it works**: Xcode Cloud automatically exposes environment variables as build settings, which are then injected into Info.plist during the build. No custom scripts needed!

3. **Security**: The `Secrets.xcconfig` file is gitignored to prevent accidental API key commits.

## Documentation

For detailed integration guides, API references, and advanced features:

- [Para Swift SDK Documentation](https://docs.getpara.com/alpha/swift/overview)
- [Swift SDK Setup Guide](https://docs.getpara.com/alpha/swift/setup)
- [Swift SDK Repository](https://github.com/getpara/swift-sdk)
