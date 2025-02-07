# Para React Native Example

This repository showcases how to integrate the [Para SDK](https://docs.getpara.com/) into a **vanilla React Native** app
for iOS and Android. It demonstrates the following core features:

- **Authentication** via Email or Phone (passkey-based)
- **Wallet creation** and management for EVM, Cosmos, and Solana
- **Signing** transactions using different libraries ([Ethers](https://docs.ethers.org/), [Viem](https://viem.sh/),
  [CosmJS](https://cosmos.github.io/cosmjs/), and [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/))

> **Important**: This example uses a placeholder **bundle identifier** and **package name** (e.g.,
> `com.getpara.example.reactnative`). For iOS passkey usage, you must have a valid Apple Developer Team ID associated
> with your chosen bundle ID. See [iOS Setup](#ios-setup) below.

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
- [License](#license)

---

## Prerequisites

1. **React Native CLI** tools set up:
   - [Xcode](https://developer.apple.com/xcode/) for iOS
   - [Android Studio](https://developer.android.com/studio) for Android
2. **Para API Key** from [developer.getpara.com](https://developer.getpara.com/).
3. **.env file** containing your environment variables (see below).
4. A working **macOS** or **Windows/Linux** environment for React Native development.

> **Note**: To use full passkey features on iOS, you need a valid Apple Developer Account and a registered bundle ID
> with the same Team ID you have provided to Para.

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
- **`client/para.ts`** – Where the Para client is instantiated and configured.

---

## Installation & Setup

1. **Clone** the repository and navigate into the directory:

   ```bash
   git clone https://github.com/para-org/examples-hub.git
   cd examples-hub/mobile/with-react-native
   ```

2. **Install dependencies**:

   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **(iOS only)** Install pods:

   ```bash
   cd ios
   bundle install       # Installs the required Ruby gems (if you have a Gemfile)
   bundle exec pod install
   cd ..
   ```

   > If you don’t use `bundle install`, you can do `pod install` directly, but `bundle exec pod install` ensures
   > consistent versions.

### .env File

Create a `.env` file (or rename `.env.example`) in the project root and supply your Para API key:

```
PARA_API_KEY=your-para-api-key
```

(Or whichever variable name you use in your code.) Make sure your code references it via a library like
**react-native-config** or any approach you prefer for environment variables in React Native.

---

### iOS Setup

- The current example might be registered under something like `com.getpara.example`. If you want iOS passkeys:
  1. Change the bundle identifier in `ios/<YourAppName>/Info.plist` (and possibly in your `AppDelegate.m` or
     `project.pbxproj`) to a unique ID, e.g., `"com.yourdomain.yourapp"`.
  2. Provide your Team ID + new bundle ID to [Para Support](https://developer.getpara.com).
  3. Wait for the domain association to propagate (this can take up to 24 hours).
  4. Re-run the app on iOS.

### Android Setup

- If you use a custom package name, update it in `android/app/build.gradle` (under
  `applicationId "com.getpara.example"`).
- Provide the corresponding SHA-256 fingerprint to Para if needed for passkeys or domain associations.
- Wait for the domain association to propagate.

---

## Key Features

### Authentication (Email & Phone)

- **Email**: See [`app/auth/with-email.tsx`](./app/auth/with-email.tsx) for creating and verifying a new user account
  using email-based passkeys.
- **Phone**: See [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) for phone-based authentication flow with OTP.

### Wallet Creation & Querying

- **Create Wallet**: This is demonstrated in the `HomeScreen` (`app/home.tsx`), calling:
  ```ts
  await para.createWallet(type, false);
  ```
- **Create All Wallets**: You can create all supported wallets (enabled in your developer portal) in one go:
  ```ts
  await para.createWalletPerType();
  ```
- **Get Existing Wallets by Type**:
  ```ts
  const wallet = para.getWalletsByType(WalletType.EVM)[0];
  ```
- **Get All Wallets**:
  ```ts
  const wallets = para.getWallets();
  ```

### Transaction Signing

- **with-evm**: Demonstrates sending an EVM transaction using [Ethers](https://docs.ethers.io/) or
  [Viem](https://viem.sh/).
- **with-cosmos**: Uses [CosmJS](https://cosmos.github.io/cosmjs/) to sign Cosmos transactions.
- **with-solana**: Uses [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) for Solana transactions.

---

## Running the Example

1. **Set your `.env`** with a valid `PARA_API_KEY` (or whichever name you used).
2. **Install dependencies** via `npm install` or `yarn install`.
3. **(iOS only)** Inside the `ios/` folder, run:
   ```bash
   bundle install
   bundle exec pod install
   ```
4. **Launch the Metro bundler** (in a separate terminal):
   ```bash
   npx react-native start
   ```
5. **Run the Android or iOS app**:
   - For Android:
     ```bash
     npx react-native run-android
     ```
   - For iOS:
     ```bash
     npx react-native run-ios
     ```
6. **Explore** the authentication flows (Email & Phone) and the sign flows (EVM, Cosmos, Solana) in the app.

---

## Documentation

For complete guidance on setting up and using the Para SDK in a React Native project, see:

- [Para Docs: React Native Setup](https://docs.getpara.com/getting-started/initial-setup/react-native)
- [Example code in this repo](https://github.com/para-org/examples-hub)

---

## Troubleshooting

- **Native module not found**: Make sure you have properly installed pods on iOS, and that you’re using the correct
  versions of your native modules.
- **Passkey domain issues**: Wait up to 24 hours for domain association. iOS requires a valid Team ID + bundle ID.
- **API key not recognized**: Verify your environment variable or `.env` usage.
- **Android signature mismatch**: Double-check the SHA-256 fingerprint matches your debug or production keystore.
- **Dependency conflicts**: Run `npx react-native doctor` or check for version conflicts in your `package.json`.
