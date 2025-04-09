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

- **React Native CLI Environment**: Ensure your development setup for React Native (including Xcode for iOS and/or
  Android Studio for Android) is complete.
- **Para API Key**: Obtain your API key from [developer.getpara.com](https://developer.getpara.com). Create a `.env`
  file in the project root and add your key:
  ```
  PARA_API_KEY=your_api_key_here
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
