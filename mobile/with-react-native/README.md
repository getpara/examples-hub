# Para React Native Example

This repository demonstrates the integration of the [Para SDK](https://docs.getpara.com/) with a **vanilla React Native** application for iOS and Android platforms. The example showcases these essential features:

- **Authentication** through Email or Phone using passkey-based verification
- **Wallet creation** and management supporting EVM, Cosmos, and Solana networks
- **Transaction signing** implemented with various blockchain libraries ([Ethers](https://docs.ethers.org/), [Viem](https://viem.sh/), [CosmJS](https://cosmos.github.io/cosmjs/), and [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/))

> **Important**: This example uses a placeholder **bundle identifier** and **package name** (e.g., `com.getpara.example.reactnative`). For iOS passkey functionality, you must possess a valid Apple Developer Team ID associated with your chosen bundle ID. See the [iOS Setup](#ios-setup) section for detailed instructions.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [.env File](#env-file)
  - [iOS Setup](#ios-setup)
  - [Android Setup](#android-setup)
- [Key Features](#key-features)
  - [Authentication (Email & Phone)](#authentication-email--phone)
  - [Wallet Creation & Querying](#wallet-creation--querying)
  - [Transaction Signing](#transaction-signing)
- [Running the Example](#running-the-example)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before beginning, ensure you have:

1. **React Native CLI** development environment properly configured with:
   - [Xcode](https://developer.apple.com/xcode/) for iOS development
   - [Android Studio](https://developer.android.com/studio) for Android development
2. **Para API Key** obtained from [developer.getpara.com](https://developer.getpara.com/)
3. **.env file** configured with your environment variables (detailed below)
4. A working **macOS** or **Windows/Linux** environment suitable for React Native development

> **Note**: Full passkey functionality on iOS requires a valid Apple Developer Account and a registered bundle ID matching the Team ID provided to Para.

---

## Project Structure

The project contains these key directories and files:

- **`app/auth/`** – Authentication implementation files:
  - **`with-email.tsx`** – Email-based user creation and login flows
  - **`with-phone.tsx`** – Phone-based registration and login flows
- **`app/sign/`** – Transaction signing implementations:
  - **`with-evm.tsx`** – EVM signing utilizing [Ethers](https://ethers.org/) or [Viem](https://viem.sh/)
  - **`with-cosmos.tsx`** – Cosmos signing utilizing [CosmJS](https://cosmos.github.io/cosmjs/)
  - **`with-solana.tsx`** – Solana signing utilizing [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)
- **`app/home.tsx`** – Wallet management interface for querying existing wallets and creating new ones across EVM, Cosmos, or Solana networks
- **`components/`** – UI component library including `AuthMethodButton.tsx`, `WalletCard.tsx`, `TransactionScreen.tsx`, and more
- **`client/para.ts`** – Para client configuration and initialization

---

## Installation & Setup

1. **Clone** this repository and navigate to the project directory:

   ```bash
   git clone https://github.com/para-org/examples-hub.git
   cd examples-hub/mobile/with-react-native
   ```

2. **Install dependencies** using your preferred package manager:

   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **(iOS only)** Install CocoaPods dependencies:

   ```bash
   cd ios
   bundle install       # Installs required Ruby gems (if using a Gemfile)
   bundle exec pod install
   cd ..
   ```

   > **Note**: While direct `pod install` is possible, using `bundle exec pod install` ensures consistent dependency versions.

### Metro.config.js

The Metro configuration must expose polyfill libraries under the global node module resolution path. This ensures polyfill availability for dependencies expecting node modules in the global resolution path. Reference `./metro.config.js` for the required configuration details.

### .env File

Create a `.env` file (or rename `.env.example`) in your project root directory and add your Para API key:

```
PARA_API_KEY=your-para-api-key
```

Ensure your code accesses this variable through a library like **react-native-config** or your preferred React Native environment variable solution.

### iOS Setup

For iOS passkey functionality:

1. Update the bundle identifier in `ios/<YourAppName>/Info.plist` (and relevant locations in `AppDelegate.m` or `project.pbxproj`) to your unique ID (e.g., `"com.yourdomain.yourapp"`)
2. Submit your Team ID and bundle ID to [Para Support](https://developer.getpara.com)
3. Allow time for domain association propagation (up to 24 hours)
4. Launch the app on iOS

> **Note**: iOS passkey functionality requires a valid Apple Developer Team ID registered with Para. Configure your unique Team ID in your developer portal account and register it with Para, allowing up to 24 hours for propagation.

### Android Setup

For custom package names:

1. Update the `applicationId` in `android/app/build.gradle`
2. Register your SHA-256 fingerprint with Para
3. Allow time for domain association propagation

> **Note**: Android passkey functionality requires a device with secure lock screen and biometric authentication (fingerprint or face recognition) enabled, plus Google Play Services with an active Google account for cloud backup security.

---

## Key Features

### Authentication (Email & Phone)

- **Email**: Implementation in [`app/auth/with-email.tsx`](./app/auth/with-email.tsx) demonstrates email-based passkey account creation and verification. The flow checks for existing users and proceeds with either new user creation or login. New user creation triggers automatic OTP email delivery, followed by passkey registration via `registerPasskey`.

- **Phone**: Implementation in [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) follows the same flow as email authentication, differing only in phone-specific method calls like `checkIfUserExistsByPhone`.

> **Note**: For testing purposes, random email addresses, phone numbers, and OTP values can be generated using functions from `./util/random.ts`. This accelerates testing by bypassing actual email/SMS delivery, but should not be used in production environments.

### Wallet Creation & Querying

- **Create Individual Wallet**: Demonstrated in `HomeScreen` (`app/home.tsx`):

  ```ts
  await para.createWallet(type, false);
  ```

  This creates a single wallet of the specified type. Ensure the type matches your developer portal enabled wallet types.

- **Create All Supported Wallets**: Generate wallets for all enabled types simultaneously:

  ```ts
  await para.createWalletPerType();
  ```

- **Query Wallets by Type**: Retrieve wallets filtered by type:

  ```ts
  const wallet = para.getWalletsByType(WalletType.EVM)[0];
  ```

  This approach is recommended for network-specific wallet queries.

- **Query All Wallets**: Retrieve all wallets regardless of type:

  ```ts
  const wallets = para.getWallets();
  ```

### Transaction Signing

Each blockchain network utilizes its own web3 library for blockchain interactions. The Para SDK wraps these libraries' signing processes, maintaining their familiar interfaces while handling signing operations internally. Once configured, the signer object functions identically to native library implementations.

- **with-evm**: Shows EVM transaction execution using [Ethers](https://docs.ethers.io/) or [Viem](https://viem.sh/)
- **with-cosmos**: Demonstrates Cosmos transaction signing using [CosmJS](https://cosmos.github.io/cosmjs/)
- **with-solana**: Implements Solana transactions using [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

> **Note**: These libraries maintain consistent behavior between React Native and Web environments. Refer to our Integration Guides documentation for detailed library usage instructions.

---

## Running the Example

1. **Configure** your `.env` file with a valid `PARA_API_KEY`
2. **Install** all dependencies via `npm install` or `yarn install`
3. **(iOS only)** Inside the `ios/` folder, run:
   ```bash
   bundle install
   bundle exec pod install
   ```
4. **Launch** the Metro bundler in a separate terminal:
   ```bash
   npx react-native start
   ```
5. **Run** the application:
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS
   npx react-native run-ios
   ```
6. **Test** the authentication flows (Email & Phone) and signing capabilities (EVM, Cosmos, Solana)

## Documentation

For comprehensive guidance on Para SDK implementation in React Native, consult:

- [Para Docs: React Native Setup](https://docs.getpara.com/getting-started/initial-setup/react-native)
- [Example code in this repo](https://github.com/para-org/examples-hub)

---

## Troubleshooting

Common issues and solutions:

- **Native Module Missing**: Verify proper iOS pod installation and native module version compatibility
- **Passkey Domain Issues**: Allow up to 24 hours for domain association; iOS requires valid Team ID and bundle ID
- **API Key Recognition**: Verify your environment variable configuration and `.env` file setup
- **Android Signature Mismatch**: Confirm your SHA-256 fingerprint matches your keystore configuration
- **Dependency Conflicts**: Run `npx react-native doctor` to identify version incompatibilities
- **Creation Options Unavailable**: Verify device security requirements (screen lock, biometrics) and Google account status for Android
- **Invalid API Key**: Confirm `.env` configuration and API key validity with correct Para client Environment
- **Incorrect Wallet Display**: Verify wallet enablement in your developer portal
- **Missing Method Errors**: Ensure `@getpara/react-native-wallet/dist/shim` polyfill import appears first in your entry file