# Para React Native Example

This is a React Native CLI example app demonstrating the integration of the Para SDK using `@getpara/react-native-wallet`.

## Prerequisites

- Node.js 18+
- Yarn
- React Native development environment set up ([React Native Environment Setup](https://reactnative.dev/docs/environment-setup))
- Para API key from [developer.getpara.com](https://developer.getpara.com/)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```
Then edit `.env` and add your Para API key.

3. Install iOS dependencies:
```bash
cd ios && pod install
```

## Running the App

### iOS
```bash
yarn ios
```

### Android
```bash
yarn android
```

## Features

This example demonstrates:

- Email authentication with OTP verification
- Phone authentication with SMS verification
- OAuth authentication (Google, Discord)
- Native Passkeys for secure wallet management
- EVM wallet creation and management
- Message signing

## Configuration

### iOS Configuration
- **Bundle Identifier**: `com.getpara.example`
- **URL Scheme**: `para-sdk-demo`
- **Associated Domains**: Configured for Para's webcredentials

### Android Configuration
- **Package Name**: `com.getpara.example`
- **Deep Link Scheme**: `para-sdk-demo`

## Important Notes

- Your app must be registered with Para for passkeys to work correctly
- On Android, ensure the device has a Google account signed in
- Biometric or device unlock must be enabled on the device

## Troubleshooting

If you encounter issues:

1. Ensure all dependencies are properly installed
2. Check that your API key is correctly set in `.env`
3. For iOS, make sure you've run `pod install`
4. For Android, try cleaning the build: `cd android && ./gradlew clean`

For more information, visit the [Para documentation](https://docs.getpara.com/).