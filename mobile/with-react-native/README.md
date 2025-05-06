# Para React Native Example

This example showcases integrating the Para SDK into a vanilla React Native application for iOS and Android. It
demonstrates key features like email and phone passkey authentication, multi-chain wallet management (EVM, Cosmos,
Solana), and transaction signing using common libraries (Ethers, Viem, CosmJS, Solana Web3.js). Use this as a foundation
for building your React Native app with Para.

## Key Files/Folders

- `app/auth/`: Contains email and phone authentication flows.
- `app/sign/`: Examples for signing transactions on EVM, Cosmos, and Solana.
- `client/para.ts`: Para SDK client initialization.
- `.env.example`: Template for environment variables.
- `metro.config.js`: Required bundler configuration for polyfills.

## Prerequisites

<<<<<<< HEAD
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

- **Phone**: Implementation in [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) follows the same flow as email authentication, differing only in the argument passed to `signUpOrLogInV2`.

> **Note**: For testing purposes, random email addresses, phone numbers, and OTP values can be generated using functions from `./util/random.ts`. This accelerates testing by bypassing actual email/SMS delivery, but should not be used in production environments.

### Wallet Creation & Querying

- **Create Individual Wallet**: Demonstrated in `HomeScreen` (`app/home.tsx`):

  ```ts
  await para.createWallet(type, false);
=======
- **React Native CLI Environment**: Ensure your development setup for React Native (including Xcode for iOS and/or
  Android Studio for Android) is complete.
- **Para API Key**: Obtain your API key from [developer.getpara.com](https://developer.getpara.com). Create a `.env`
  file in the project root and add your key:
  ```
  PARA_API_KEY=your_api_key_here
>>>>>>> main
  ```

## Installation

1.  Install Node.js dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
2.  Install iOS dependencies (if developing for iOS):
    ```bash
    cd ios
    bundle install
    bundle exec pod install
    cd ..
    ```

## Running the Example

1.  Start the Metro bundler in a separate terminal:
    ```bash
    npx react-native start
    ```
2.  Run the application on your target platform:

    ```bash
    # For Android
    npx react-native run-android

    # For iOS
    npx react-native run-ios
    ```

## Learn More

For more detailed information on usage and configuration, please refer to the
[Para Documentation](https://docs.getpara.com/).
