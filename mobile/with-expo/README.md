# Para SDK Expo Example

This example demonstrates how to integrate the Para SDK with Expo for authentication and wallet management.

## Prerequisites

- Node.js 18+
- iOS Simulator/Device (for iOS development)
- Android Emulator/Device (for Android development)

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env.local` file in the root directory:
```bash
EXPO_PUBLIC_PARA_API_KEY=your_api_key_here
```

Get your API key from [developer.getpara.com](https://developer.getpara.com).

3. Prebuild the native projects (required for native modules):
```bash
npx expo prebuild --clean
```

**Important:** This example uses native modules (passkeys, crypto) that require prebuild. **Expo Go is not supported**.

## Running the App

### iOS
**Note:** The iOS version is configured with Para's team ID and will not run locally without modification.

To run on iOS with your own credentials:
1. Update `app.json` with your own:
   - `bundleIdentifier`
   - `appleTeamId`
2. Register your bundle identifier in the Para developer portal under your API key settings
3. Wait up to 24 hours for Apple to recognize the new associated domains

### Android
```bash
npx expo run:android
```

Android works out of the box as it uses the default `debug.keystore` which is pre-registered for development use.

## Development

If you encounter build issues or modify native dependencies, run:
```bash
npx expo prebuild --clean
```

This regenerates the native iOS and Android projects with the latest configuration.

## Documentation

For more information about the Para SDK, visit [docs.getpara.com](https://docs.getpara.com).