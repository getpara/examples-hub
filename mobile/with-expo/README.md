# Para Expo Example

This repository showcases how to integrate the [Para SDK](https://docs.usepara.com/) into an [Expo](https://expo.dev/)
app for iOS and Android. It demonstrates the following core features:

- **Authentication** via Email or Phone (passkey-based)
- **Wallet creation** and management for EVM, Cosmos, and Solana
- **Signing** transactions using different libraries ([Ethers](https://docs.ethers.org/), [Viem](https://viem.sh/),
  [CosmJS](https://cosmos.github.io/cosmjs/), and [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/))

> **Important**: This example uses the bundle and package ID `com.usepara.example.expo`. For iOS passkey usage, you must
> have a valid Apple Developer Team ID associated with this bundle ID. Since that ID is owned by Para, you cannot run
> iOS passkey flows without updating `app.json` with your own bundle ID. See [iOS Setup](#ios-setup) below.

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

1. **Expo CLI** (via `npm i -g expo-cli` or using `npx expo`)
2. **iOS/Android development environment** properly set up:
   - [Xcode](https://developer.apple.com/xcode/) for iOS
   - [Android Studio](https://developer.android.com/studio) for Android
3. **Para API Key** from [developer.usepara.com](https://developer.usepara.com/).
4. **.env file** containing your environment variables (see below).

> **Note**: To use the full passkey features on iOS, you need a valid Apple Developer Account and a registered bundle ID
> with the same Team ID you have given to Para.

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
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/mobile/with-expo
   ```

2. **Install dependencies**:

   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

> **Note**: We change the entry point of the package.json from `expo-router/entry` to `index.js` and then inside of
> index.js we add the entry `expo-router/entry` again. We do this so that we can import the shim for polyfills before
> the expo-router/entry is loaded. This is required to ensure polyfills are loaded well in advanced of the
> expo-router/entry being loaded.

### .env File

Create a `.env` file (or rename `.env.example`) in the project root and supply your Para API key:

```
EXPO_PUBLIC_PARA_API_KEY=your-para-api-key
```

The example reads this variable inside `client/para.ts` to instantiate the `ParaMobile` client.

### Development Builds

Since Para uses native modules, **Expo Go** is not supported. You must run development builds:

- **Option A**: Prebuild + run commands:

  ```bash
  npx expo prebuild
  npx expo run:ios
  # or
  npx expo run:android
  ```

  > **Note**: If you encounter issues, try running `npx expo prebuild --clean` to ensure a fresh build.

- **Option B**: Start the Metro bundler and switch to development build mode:

  ```bash
  yarn start
  ```

  - Press **`s`** to select **Development build** mode.
  - Then press **`i`** for iOS or **`a`** for Android to launch on an emulator or a connected device.

### Metro.config.js

In addition to the shim polyfill we need to ensure that we tell metro to make the polfyill libraries available under the
global node module resolution path. This is required to ensure that the polyfills are available for any dependency that
expects node modules to be available under the global node module resolution path. You can reference the
`./metro.config.js` file for the required configuration.

### iOS Setup

- The current example is registered under the bundle ID `com.usepara.example.expo`. This ID is owned by Para. You
  **cannot** run passkey flows on iOS unless your Apple Developer Team ID + bundle ID is set up with Para.
- **To test on iOS with your own credentials:**
  1. Change `"bundleIdentifier"` in `app.json` to a unique ID, e.g., `"com.yourdomain.yourapp"`.
  2. Provide your Team ID + new bundle ID to [Para Support](https://developer.usepara.com).
  3. Wait for domain association to propagate (can take up to 24 hours).
  4. Re-run the app on iOS with your dev build.

> **Note**: iOS passkey flows require a valid Apple Developer Team ID. The iOS app won't work without a valid Team ID
> setup with Para. You can add your unique Team ID to your developer portal account and register it with Para. This can
> take up to 24 hours to propagate.

### Android Setup

- The package ID `com.usepara.example.expo` is pre-configured with the debug keystore’s SHA-256 fingerprint in Para,
  allowing you to test out of the box.
- For production or custom package names:
  1. Update `"package"` in `app.json`.
  2. Provide the corresponding SHA-256 fingerprint to Para.
  3. Wait for the domain association to propagate.

> **Note**: Android passkeys require a device with both a secure lock screen and biometric authentication (fingerprint
> or face recognition) as well as Google Play Services with a logged-in Google account. This is for security reason and
> to back up the passkeys in the cloud.

---

## Key Features

### Authentication (Email & Phone)

- **Email**: See [`app/auth/with-email.tsx`](./app/auth/with-email.tsx) for creating and verifying a new user account
  using email-based passkeys. This flow consists of checking if a user exists and either calling the create new user or
  login method. With create new user an OTP is automatically sent to the email address of the user. Post verification we
  can create a passkey by calling the `registerPasskey` method.
- **Phone**: See [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) for phone-based authentication flow with OTP.
  This flow is exactly the same as the email flow. The only difference is phone specific methods. So for
  `checkIfUserExists` we call `checkIfUserExistsByPhone`.

> **Note**: The example uses the random email,phone, and otp functions from `./util/random.ts` to generate random email,
> phone, and otp values using our "test" credentials. This allows for faster testing as the test email and phone number
> allow for random OTP to be used rather than waiting for an email or sms to be sent. This is only for testing purposes
> only and should not be used in production.

### Wallet Creation & Querying

- **Create Wallet**: This is demonstrated in the `HomeScreen` (`app/home.tsx`), calling:

  ```ts
  await para.createWallet(type, false);
  ```

````

This function will create a single wallet of the given type. Ensure that the `type` is one of the supported wallet types
that you have enabled in the developer portal.

- **Create All Wallets**: You can create all supported wallets (enabled wallets in the developer portal) in one go
  using:
  ```ts
  await para.createWalletPerType();
  ```
- **Get Existing Wallets by Type**: You can query existing wallets by type:

  ```ts
  const wallet = para.getWalletsByType(WalletType.EVM)[0];
  ```

  This is recommended to grab the wallets for specific networks.

- **Get All Wallets**: You can get all wallets regardless of type using:
  ```ts
  const wallets = para.getWallets();
  ```

### Transaction Signing

Each network has their own web3 library utilized for interacting with the respective blockchains. The Para SDK wraps the
signing process for each of these libraries allow you to continue to use the libraries as normal and use Para under the
hood to handle the signing of the transaction. Once the signer object is created there is no functional difference in
usage of these libraries.

- **with-evm**: Demonstrates sending an EVM transaction using [Ethers](https://docs.ethers.io/) or
  [Viem](https://viem.sh/).
- **with-cosmos**: Uses [CosmJS](https://cosmos.github.io/cosmjs/) to sign Cosmos transactions.
- **with-solana**: Uses [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) for Solana transactions.

> **Note**: These libraries behave the same way in Expo as they do in Web. You can reference any of the Integration
> Guides on our docs for more information on how to use these libraries.

---

## Running the Example

1. **Set your `.env`** with a valid `EXPO_PUBLIC_PARA_API_KEY`.
2. **Install dependencies** via `npm install` or `yarn install`.
3. **Run** the development build:
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```
4. **Explore** the authentication flows (Email & Phone) and the sign flows (EVM, Cosmos, Solana) in the app.

## Documentation

For complete guidance on setting up and using the Para SDK in Expo, see the official docs:

- [Para Docs: Expo Setup](https://docs.usepara.com/getting-started/initial-setup/react-native)
- [Example code in this repo](https://github.com/getpara/new-examples-hub)

An abridged version of the official docs is included below:

---

## Troubleshooting

- **Native module not found**: Make sure you ran `expo prebuild` and are using a **Development Build** or a bare
  workflow.
- **Passkey domain issues**: Wait up to 24 hours for domain association. iOS requires a valid Team ID + bundle ID.
- **API key not recognized**: Verify your environment variable or `.env` usage.
- **Android signature mismatch**: Double-check the SHA-256 fingerprint matches your debug or production keystore.
- **Conflicting dependencies**: Run `expo doctor` to check for version conflicts.
- **No Create Options**: Ensure you have enabled a screen lock on your device and have logged in to a Google account for
  Android. iOS requires a secure lock screen and biometric authentication.
- **API key not recognized**: Ensure your `.env` file is correctly set up and the API key is valid. With the correct
  Environment set on the Para client.
- **Incorrect Wallets**: Ensure you've enabled the correct wallets in the developer portal.
- **Missing Methods**: Ensure you've imported the polyfill shim from `@getpara/react-native-wallet/dist/shim` in your
  entry file (e.g., `index.js` or `App.tsx`). This should be the first import in the file.
````
