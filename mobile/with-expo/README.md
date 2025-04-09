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
