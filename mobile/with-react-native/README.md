# React Native Para SDK Example

This example demonstrates how to integrate Para SDK in a React Native application with authentication and wallet management.

## Prerequisites

- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- Para API key from [developer.getpara.com](https://developer.getpara.com/)

## Setup

1. Clone the repository and install dependencies:
```bash
yarn install
# or
npm install
```

2. Create a `.env` file in the project root:
```
PARA_API_KEY=your_api_key_here
```

3. Install iOS dependencies:
```bash
cd ios && pod install
```

## Running the App

### Android
```bash
yarn android
# or
npm run android
```

Android works out of the box using the debug.keystore that all React Native apps use by default. This keystore is already registered with Para.

### iOS

**Important:** The iOS app is configured with Para's team ID and will not run locally without modification.

To run on iOS with your own team:

1. Update `app.json` with your own bundle identifier and team ID
2. Register your new bundle identifier in the Para Developer Portal under API Key Settings → Configuration
3. Wait up to 24 hours for Apple and Google to update associated domains
4. Then run:
```bash
yarn ios
# or
npm run ios
```

Without these steps, iOS will fail due to security restrictions on passkey authentication.

## Features

- **Multiple Authentication Methods:**
  - Email with OTP verification
  - Phone with SMS verification
  - OAuth (Google, Discord)
  - Passkey authentication

- **Wallet Management:**
  - Create and retrieve EVM wallets
  - Sign messages

## Key Configuration

- **Polyfills:** Configured in `metro.config.js` for crypto operations
- **App Scheme:** `para-sdk-demo://` for OAuth redirects
- **Environment:** Beta environment configured in `src/para.ts`

## Documentation

For more details on Para SDK integration, visit [docs.getpara.com](https://docs.getpara.com/)