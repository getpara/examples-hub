```markdown
![ADB](https://img.shields.io/badge/ADB-1.0.41-blue) ![Java](https://img.shields.io/badge/Java-21.0.5-orange)
![Gradle](https://img.shields.io/badge/Gradle-8.13-brightgreen)![Xcode](https://img.shields.io/badge/Xcode-16.3-lightgrey)![CocoaPods](https://img.shields.io/badge/CocoaPods-1.16.2-red)![Watchman](https://img.shields.io/badge/Watchman-2025.03.03.00-yellow)
![Ruby](https://img.shields.io/badge/Ruby-3.3.4-red) ![Expo CLI](https://img.shields.io/badge/Expo%20CLI-0.22.26-black)
```

# Para Expo Example

This example demonstrates integrating the Para SDK with an Expo application for iOS and Android. It showcases core
features like passkey-based email/phone authentication, multi-chain wallet creation (EVM, Cosmos, Solana), and
transaction signing using various web3 libraries. Use this project as a starting point for building mobile applications
with Para.

## Key Files/Folders

- `app/auth/`: Authentication flows (email, phone, oauth).
- `app/sign/`: Transaction signing examples (EVM, Cosmos, Solana).
- `client/para.ts`: Para client configuration.

## Prerequisites

- Obtain a Para API Key from [developer.getpara.com](https://developer.getpara.com/).
- Create a `.env` file in the project root.
- Add your Para API key to the `.env` file:
  ```
  EXPO_PUBLIC_PARA_API_KEY=your-para-api-key
  ```

## Installation

Install dependencies using your preferred package manager:

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

EXPO_PUBLIC_PARA_API_KEY=your-para-api-key

````

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
````

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

- **Phone**: Implementation in [`app/auth/with-phone.tsx`](./app/auth/with-phone.tsx) follows largely the same flow as
  email authentication, differing only in the argument passed to `signUpOrLogInV2`.

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

Launch the development build on your target platform:

```bash
# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

**Note**: This example requires a development build and cannot be run using Expo Go due to native module requirements.
Ensure you have a configured iOS/Android development environment.

## Learn More

For more detailed information on usage and configuration, please refer to the
[Para Documentation](https://docs.getpara.com/).
