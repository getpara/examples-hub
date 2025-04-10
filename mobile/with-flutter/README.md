# Para Flutter Example

This example demonstrates integrating the Para SDK with a Flutter application for both iOS and Android platforms. It
showcases essential Para features, including multi-method authentication (email, phone, OAuth) with passkeys,
cross-chain wallet management (EVM, Cosmos, Solana), and transaction signing. Use this project as a starting point for
building your Flutter application with Para.

## Key Files/Folders

- `lib/examples`: Contains the core Flutter application logic demonstrating Para SDK usage.
- `.env.example`: Template for environment variables.

## Prerequisites

- **Flutter SDK**: Ensure Flutter is installed and configured correctly.
- **Platform IDEs**: Xcode for iOS development and/or Android Studio for Android development.
- **Para API Key**: Obtain your API key from [developer.getpara.com](https://developer.getpara.com). Create a `.env`
  file in the project root and add your key:
  ```
  PARA_BETA_API_KEY=your_api_key_here
  ```

## Installation

1.  Install Flutter dependencies:
    ```bash
    flutter pub get
    ```

## Running the Example

1.  Ensure an emulator is running or a device is connected (`flutter devices`).
2.  Run the application:
    ```bash
    flutter run -d <your_device_id>
    ```

## Learn More

For more detailed documentation and API references, visit the official
[Para SDK documentation](https://docs.usepara.com/welcome).
