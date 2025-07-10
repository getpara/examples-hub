# Para Swift SDK Example

A sample iOS wallet app demonstrating the [Para Swift SDK](https://github.com/getpara/swift-sdk) integration.

## Prerequisites

- Xcode 15.0+
- iOS 16.4+ (for passkey support)
- [Para Developer Account](https://developer.getpara.com/)

## Quick Start

1. **Clone and open the project:**
   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/mobile/with-swift
   open example.xcodeproj
   ```

2. **Configure Para SDK:**
   
   **For local development:**
   - Copy `example/Config.xcconfig` to `example/Secrets.xcconfig`
   - Add your API key from [Para Developer Portal](https://developer.getpara.com/)
   - Set `PARA_ENVIRONMENT` to sandbox, beta, or prod
   - In Xcode: Select your project → Info tab → Configurations → Set both Debug and Release to use "Secrets"
   
   **Note**: `Secrets.xcconfig` is gitignored. Use `Config.xcconfig` as the template.

3. **Configure Xcode project:**
   - Go to **Signing & Capabilities** → Select your development team
   - Change Bundle ID to something unique (e.g., `com.yourcompany.paraexample`)
   - Register your Team ID + Bundle ID in [Para Developer Portal](https://developer.getpara.com/)

4. **Build and run** (⌘R)

## Key Features Demonstrated

- **Authentication**: Email/phone + passkey, social login (Google, Apple, Discord), MetaMask
- **Wallet Management**: Create and manage EVM, Solana, and Cosmos wallets
- **Transaction Signing**: Sign messages and send transactions across chains
- **Session Management**: Secure session handling with biometric authentication
- **External Wallets**: MetaMask integration via deep linking

## Code Highlights

To explore the SDK integration, check out these key files:
- **Authentication**: `example/Auth/AuthView.swift`
- **Wallet Operations**: `example/Wallet/EVMWalletView.swift`, `SolanaWalletView.swift`
- **SDK Configuration**: `example/App/ParaConfig.swift`, `example/App/ExampleApp.swift`
- **MetaMask Integration**: `example/Auth/MetaMaskDemoView.swift`

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
