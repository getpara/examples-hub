# Para Expo Example

This repository demonstrates the integration of the [Para SDK](https://docs.usepara.com/) with an
[Expo](https://expo.dev/) application for iOS and Android platforms. The example showcases these essential features:

- **Authentication** through Email or Phone using passkey-based verification
- **Wallet creation** and management supporting EVM, Cosmos, and Solana networks
- **Transaction signing** implemented with various blockchain libraries ([Ethers](https://docs.ethers.org/),
  [Viem](https://viem.sh/), [CosmJS](https://cosmos.github.io/cosmjs/), and
  [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/))

> **Important**: This example application uses the bundle and package ID `com.usepara.example.expo`. For iOS passkey
> functionality, you must possess a valid Apple Developer Team ID associated with this bundle ID. Since Para owns this
> ID, you will need to update the bundle ID in `app.json` to your own to enable iOS passkey flows. See the
> [iOS Setup](#ios-setup) section for detailed instructions.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [.env File](#env-file)
  - [Development Builds](#development-builds)
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

1. **Expo CLI** installed either globally via `npm i -g expo-cli` or accessible through `npx expo`
2. **iOS/Android development environment** properly configured with:
   - [Xcode](https://developer.apple.com/xcode/) for iOS development
   - [Android Studio](https://developer.android.com/studio) for Android development
3. **Para API Key** obtained from [developer.usepara.com](https://developer.usepara.com/)
4. **.env file** configured with your environment variables (detailed below)

> **Note**: Full passkey functionality on iOS requires a valid Apple Developer Account and a registered bundle ID
> matching the Team ID provided to Para.

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
- **`app/home.tsx`** – Wallet management interface for querying existing wallets and creating new ones across EVM,
  Cosmos, or Solana networks
- **`components/`** – UI component library including `AuthMethodButton.tsx`, `WalletCard.tsx`, `TransactionScreen.tsx`,
  and more
- **`client/para.ts`** – Para client configuration and initialization

---

## Installation & Setup

1. **Clone** this repository and navigate to the project directory:

   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/mobile/with-expo
   ```

2. **Install dependencies** using your preferred package manager:

   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

> **Note**: We modify the entry point in package.json from `expo-router/entry` to `index.js`, then reference
> `expo-router/entry` within index.js. This approach ensures proper loading of polyfills before the expo-router/entry
> initialization.

### .env File

Create a `.env` file (or rename `.env.example`) in your project root directory and add your Para API key:

```
EXPO_PUBLIC_PARA_API_KEY=your-para-api-key
```

This environment variable is utilized in `client/para.ts` to initialize the `ParaMobile` client.

### Development Builds

Para's native module requirements mean **Expo Go** is not supported. Instead, use development builds through either of
these methods:

- **Option A**: Prebuild and run directly:

  ```bash
  npx expo prebuild
  npx expo run:ios
  # or
  npx expo run:android
  ```

  > **Note**: If you encounter issues, try `npx expo prebuild --clean` for a fresh build.

- **Option B**: Start Metro bundler in development build mode:

  ```bash
  yarn start
  ```

  Then:

  - Press **`s`** to select **Development build** mode
  - Press **`i`** for iOS or **`a`** for Android to launch on your chosen device

### Metro.config.js

Beyond the shim polyfill, Metro configuration must expose polyfill libraries under the global node module resolution
path. This ensures polyfill availability for dependencies expecting node modules in the global resolution path.
Reference `./metro.config.js` for the required configuration details.

### iOS Setup

The example currently uses the bundle ID `com.usepara.example.expo`, owned by Para. iOS passkey flows require your Apple
Developer Team ID and bundle ID to be registered with Para.

To test with your credentials:

1. Update `"bundleIdentifier"` in `app.json` to your unique ID (e.g., `"com.yourdomain.yourapp"`)
2. Submit your Team ID and new bundle ID to [Para Support](https://developer.usepara.com)
3. Allow time for domain association propagation (up to 24 hours)
4. Launch your dev build on iOS

> **Note**: iOS passkey functionality requires a valid Apple Developer Team ID registered with Para. Configure your
> unique Team ID in your developer portal account and register it with Para, allowing up to 24 hours for propagation.

### Android Setup

The package ID `com.usepara.example.expo` comes preconfigured with the debug keystore's SHA-256 fingerprint in Para for
immediate testing.

For production or custom package names:

1. Update the `"package"` field in `app.json`
2. Register your SHA-256 fingerprint with Para
3. Allow time for domain association propagation

> **Note**: Android passkey functionality requires a device with secure lock screen and biometric authentication
> (fingerprint or face recognition) enabled, plus Google Play Services with an active Google account for cloud backup
> security.

---

## Key Features

### Authentication (Email & Phone)

- **Email**: Implementation in [`app/auth/with-email.tsx`](./app/auth/with-email.tsx) demonstrates email-based passkey
  account creation and verification. The flow checks for existing users and proceeds with either new user creation or
  login. New user creation triggers automatic OTP email delivery, followed by passkey registration via
  `registerPasskey`.

- **Phone**: Implementation in [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) follows largely the same flow as email
  authentication, differing only in the argument passed to `signUpOrLogInV2`.

> **Note**: The example utilizes test credential generation functions from `./util/random.ts` to create test email
> addresses, phone numbers, and OTP values. This accelerates testing by bypassing actual email/SMS delivery, but should
> not be used in production environments.

### Wallet Creation & Querying

- **Create Individual Wallet**: Demonstrated in `HomeScreen` (`app/home.tsx`):

  ```ts
  await para.createWallet(type, false);
  ```

  This creates a single wallet of the specified type. Ensure the type matches your developer portal enabled wallet
  types.

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

Each blockchain network utilizes its own web3 library for blockchain interactions. The Para SDK wraps these libraries'
signing processes, maintaining their familiar interfaces while handling signing operations internally. Once configured,
the signer object functions identically to native library implementations.

- **with-evm**: Shows EVM transaction execution using [Ethers](https://docs.ethers.io/) or [Viem](https://viem.sh/)
- **with-cosmos**: Demonstrates Cosmos transaction signing using [CosmJS](https://cosmos.github.io/cosmjs/)
- **with-solana**: Implements Solana transactions using [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

> **Note**: These libraries maintain consistent behavior between Expo and Web environments. Refer to our Integration
> Guides documentation for detailed library usage instructions.

---

## Running the Example

1. **Configure** your `.env` file with a valid `EXPO_PUBLIC_PARA_API_KEY`
2. **Install** all dependencies via `npm install` or `yarn install`
3. **Launch** the development build:
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```
4. **Test** the authentication flows (Email & Phone) and signing capabilities (EVM, Cosmos, Solana)

## Documentation

For comprehensive guidance on Para SDK implementation in Expo, consult:

- [Para Docs: Expo Setup](https://docs.usepara.com/getting-started/initial-setup/react-native)
- [Example code in this repo](https://github.com/getpara/new-examples-hub)

---

## Troubleshooting

Common issues and solutions:

- **Native Module Not Found**: Ensure you've run `expo prebuild` and are using a Development Build or bare workflow
- **Passkey Domain Issues**: Allow up to 24 hours for domain association; iOS requires valid Team ID and bundle ID
- **API Key Recognition**: Verify your environment variable configuration and `.env` file setup
- **Android Signature Mismatch**: Confirm your SHA-256 fingerprint matches your keystore configuration
- **Dependency Conflicts**: Run `expo doctor` to identify version incompatibilities
- **Creation Options Unavailable**: Verify device security requirements (screen lock, biometrics) and Google account
  status for Android
- **Invalid API Key**: Confirm `.env` configuration and API key validity with correct Para client Environment
- **Incorrect Wallet Display**: Verify wallet enablement in your developer portal
- **Missing Method Errors**: Ensure `@getpara/react-native-wallet/dist/shim` polyfill import appears first in your entry
  file
