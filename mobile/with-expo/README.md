# Capsule Expo Example

This repository showcases how to integrate the [Capsule SDK](https://docs.usecapsule.com/) into an
[Expo](https://expo.dev/) app for iOS and Android. It demonstrates the following core features:

- **Authentication** via Email or Phone (passkey-based)
- **Wallet creation** and management for EVM, Cosmos, and Solana
- **Signing** transactions using different libraries ([Ethers](https://docs.ethers.org/), [Viem](https://viem.sh/),
  [CosmJS](https://cosmos.github.io/cosmjs/), and [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/))

> **Important**: This example uses the bundle and package ID `com.usecapsule.example.expo`. For iOS passkey usage, you
> must have a valid Apple Developer Team ID associated with this bundle ID. Since that ID is owned by Capsule, you
> cannot run iOS passkey flows without updating `app.json` with your own bundle ID. See [iOS Setup](#ios-setup) below.

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
- [License](#license)

---

## Prerequisites

1. **Expo CLI** (via `npm i -g expo-cli` or using `npx expo`)
2. **iOS/Android development environment** properly set up:
   - [Xcode](https://developer.apple.com/xcode/) for iOS
   - [Android Studio](https://developer.android.com/studio) for Android
3. **Capsule API Key** from [developer.usecapsule.com](https://developer.usecapsule.com/).
4. **.env file** containing your environment variables (see below).

> **Note**: To use the full passkey features on iOS, you need a valid Apple Developer Account and a registered bundle ID
> with the same Team ID you have given to Capsule.

---

## Project Structure

Key folders and files to examine:

- **`app/auth/`** – Contains authentication flows:
  - **`with-email.tsx`** – Shows how to create and log in users with an email flow.
  - **`with-phone.tsx`** – Shows the phone-based registration and login flow.
- **`app/sign/`** – Contains transaction signing examples:
  - **`with-evm.tsx`** – EVM signing using [Ethers](https://ethers.org/) or [Viem](https://viem.sh/).
  - **`with-cosmos.tsx`** – Cosmos signing using [CosmJS](https://cosmos.github.io/cosmjs/).
  - **`with-solana.tsx`** – Solana signing using [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/).
- **`app/home.tsx`** – Displays how to query existing wallets and create new wallets for EVM, Cosmos, or Solana.
- **`components/`** – Reusable UI components, including `AuthMethodButton.tsx`, `WalletCard.tsx`,
  `TransactionScreen.tsx`, etc.
- **`client/capsule.ts`** – Where the Capsule client is instantiated and configured.

---

## Installation & Setup

1. **Clone** the repository and navigate into the directory:

   ```bash
   git clone https://github.com/capsule-org/examples-hub.git
   cd examples-hub/mobile/with-expo
   ```

2. **Install dependencies**:

   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

### .env File

Create a `.env` file (or rename `.env.example`) in the project root and supply your Capsule API key:

```
EXPO_PUBLIC_CAPSULE_API_KEY=your-capsule-api-key
```

The example reads this variable inside `client/capsule.ts` to instantiate the `CapsuleMobile` client.

### Development Builds

Since Capsule uses native modules, **Expo Go** is not supported. You must run development builds:

- **Option A**: Prebuild + run commands:

  ```bash
  npx expo prebuild
  npx expo run:ios
  # or
  npx expo run:android
  ```

- **Option B**: Start the Metro bundler and switch to development build mode:

  ```bash
  yarn start
  ```

  - Press **`s`** to select **Development build** mode.
  - Then press **`i`** for iOS or **`a`** for Android to launch on an emulator or a connected device.

### iOS Setup

- The current example is registered under the bundle ID `com.usecapsule.example.expo`. This ID is owned by Capsule. You
  **cannot** run passkey flows on iOS unless your Apple Developer Team ID + bundle ID is set up with Capsule.
- **To test on iOS with your own credentials:**
  1. Change `"bundleIdentifier"` in `app.json` to a unique ID, e.g., `"com.yourdomain.yourapp"`.
  2. Provide your Team ID + new bundle ID to [Capsule Support](https://developer.usecapsule.com).
  3. Wait for domain association to propagate (can take up to 24 hours).
  4. Re-run the app on iOS with your dev build.

### Android Setup

- The package ID `com.usecapsule.example.expo` is pre-configured with the debug keystore’s SHA-256 fingerprint in
  Capsule, allowing you to test out of the box.
- For production or custom package names:
  1. Update `"package"` in `app.json`.
  2. Provide the corresponding SHA-256 fingerprint to Capsule.
  3. Wait for the domain association to propagate.

---

## Key Features

### Authentication (Email & Phone)

- **Email**: See [`app/auth/with-email.tsx`](./app/auth/with-email.tsx) for creating and verifying a new user account
  using email-based passkeys.
- **Phone**: See [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) for phone-based authentication flow with OTP.

### Wallet Creation & Querying

- **Create Wallet**: This is demonstrated in the `HomeScreen` (`app/home.tsx`), calling:
  ```ts
  await capsuleClient.createWallet(type, false);
  ```
- **Create All Wallets**: You can create all supported wallets (enabled wallets in the developer portal) in one go
  using:
  ```ts
  await capsuleClient.createWalletPerType();
  ```
- **Get Existing Wallets by Type**: You can query existing wallets by type:
  ```ts
  const wallet = capsuleClient.getWalletsByType(WalletType.EVM)[0];
  ```
- **Get All Wallets**: You can get all wallets regardless of type using:
  ```ts
  const wallets = capsuleClient.getWallets();
  ```

### Transaction Signing

- **with-evm**: Demonstrates sending an EVM transaction using [Ethers](https://docs.ethers.io/) or
  [Viem](https://viem.sh/).
- **with-cosmos**: Uses [CosmJS](https://cosmos.github.io/cosmjs/) to sign Cosmos transactions.
- **with-solana**: Uses [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) for Solana transactions.

---

## Running the Example

1. **Set your `.env`** with a valid `EXPO_PUBLIC_CAPSULE_API_KEY`.
2. **Install dependencies** via `npm install` or `yarn install`.
3. **Run** the development build:
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```
4. **Explore** the authentication flows (Email & Phone) and the sign flows (EVM, Cosmos, Solana) in the app.

---

## Documentation

For complete guidance on setting up and using the Capsule SDK in Expo, see the official docs:

- [Capsule Docs: Expo Setup](https://docs.usecapsule.com/getting-started/initial-setup/react-native)
- [Example code in this repo](https://github.com/capsule-org/examples-hub)

An abridged version of the official docs is included below:

---

## Troubleshooting

- **Native module not found**: Make sure you ran `expo prebuild` and are using a **Development Build** or a bare
  workflow.
- **Passkey domain issues**: Wait up to 24 hours for domain association. iOS requires a valid Team ID + bundle ID.
- **API key not recognized**: Verify your environment variable or `.env` usage.
- **Android signature mismatch**: Double-check the SHA-256 fingerprint matches your debug or production keystore.
- **Conflicting dependencies**: Run `expo doctor` to check for version conflicts.
