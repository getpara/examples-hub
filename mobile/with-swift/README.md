# Para Swift SDK Example App

This directory contains an example iOS application demonstrating the integration and usage of the [Para Swift SDK](https://github.com/getpara/swift-sdk). For detailed setup instructions, see the [official Para documentation](https://docs.getpara.com/).

## Features Demonstrated

- **Initialization:** Setting up `ParaManager`, `ParaEvmSigner`, `ParaSolanaSigner`, and `MetaMaskConnector`.
- **Configuration:** Loading API keys and environment settings securely (using environment variables).
- **Authentication:**
  - Email + Passkey flow (`handleEmailAuth`) including verification.
  - Phone + Passkey flow (`handlePhoneAuth`) including verification and country code selection.
  - OAuth + Passkey flow (`handleOAuth` for Google, Discord, Apple).
  - Direct Passkey Login (`loginWithPasskey`).
  - External Wallet Login via MetaMask (`MetaMaskConnector.connect`).
- **Session Management:** Basic app flow based on `ParaManager.sessionState`, logout.
- **Wallet Management:** Creating EVM/Solana/Cosmos wallets (`createWallet`), fetching and displaying wallets (`fetchWallets`).
- **EVM Operations (`ParaEvmSigner`):**
  - Selecting a wallet (`selectWallet`).
  - Signing messages (`signMessage`).
  - Signing transactions (`signTransaction` - demonstrated via `sendTransaction`).
  - Sending transactions (`sendTransaction` using `EVMTransaction`).
- **Solana Operations (`ParaSolanaSigner`):**
  - Fetching SOL balance (`getBalance`).
  - Signing arbitrary messages (`signArbitraryMessage`).
  - Signing transactions (`signTransaction`).
  - Sending transactions (`sendTransaction`).
- **MetaMask Integration (`MetaMaskConnector`):**
  - Connecting to MetaMask (`connect`).
  - Handling deep links (`handleURL`).
  - Signing messages (`signMessage`).
  - Sending transactions (`sendTransaction` using `EVMTransaction`).
- **UI:** Basic SwiftUI views for authentication and wallet interaction.

## Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/getpara/examples-hub.git
    cd examples-hub/mobile/with-swift
    ```

2.  **Configure Environment Variables:**
    This project uses environment variables for configuration. You need to set these in your Xcode scheme:

    - Go to **Product** -> **Scheme** -> **Edit Scheme...**
    - Select the **Run** phase in the left sidebar.
    - Go to the **Arguments** tab.
    - Under **Environment Variables**, add the following:

    **Required variables:**
    ```
    PARA_API_KEY=your_api_key_here    # Your Para API key from Developer Portal
    PARA_ENVIRONMENT=beta             # Options: "dev", "sandbox", "beta", "prod"
    ```

    **Optional variables:**
    ```
    PARA_RPC_URL                     # Custom RPC URL for EVM operations (defaults to Sepolia testnet)
    ```

    **Development-only variables (when PARA_ENVIRONMENT=dev):**
    ```
    PARA_DEV_RELYING_PARTY_ID        # Custom relying party ID for dev environment
    PARA_DEV_JS_BRIDGE_URL           # Custom JS bridge URL for dev environment
    ```

3.  **Configure Xcode Project:**

    - Open `example/example.xcodeproj` in Xcode.
    - Select the `example` target.
    - Go to the **Signing & Capabilities** tab.
    - Select your **Team**.
    - Update the **Bundle Identifier** to a unique value associated with your Apple Developer account (e.g., `com.yourcompany.paraexample`).
    - **Important:** Ensure this Bundle Identifier matches the one configured in the Para Developer Portal for Native Passkeys.

4.  **Configure Associated Domains:**

    - In the **Signing & Capabilities** tab, ensure the **Associated Domains** capability is added.
    - Add the necessary `webcredentials` domains corresponding to the `PARA_ENVIRONMENT` you are using (e.g., `webcredentials:app.beta.usecapsule.com` for `beta`). Refer to the [SDK README Setup](https://github.com/getpara/swift-sdk#associated-domains-required-for-passkeys) for details.

5.  **Configure URL Scheme:**

    - Go to the **Info** tab.
    - Expand **URL Types**.
    - Ensure there is a URL type entry.
    - Set the **Identifier** and **URL Schemes** to match the **Bundle Identifier** you configured in step 3. Refer to the [SDK README Setup](https://github.com/getpara/swift-sdk#deep-link-url-scheme-required-for-oauth--metamask) for details.

6.  **Configure Para Developer Portal:**

    - Go to the [Para Developer Portal](https://developer.getpara.com/).
    - Ensure your API Key is created.
    - Under **Native Passkey Configuration**, enter your **Team ID** and the **Bundle Identifier** you configured in step 3.

7.  **Install Dependencies:**
    - Xcode should automatically resolve the Swift Package Manager dependencies (`ParaSwift`, `BigInt`). If not, go to **File** -> **Packages** -> **Resolve Package Versions**.

## Running the App

- Build and run the `example` scheme on a physical iOS device (recommended for passkey testing) or a simulator (iOS 16.4+ required for passkey features).
- Ensure MetaMask mobile is installed if you intend to test the MetaMask connection.

## Code Structure

- **`App/`**: Contains the main `ExampleApp.swift` entry point, handling initialization and routing.
- **`Core/`**:
  - `Configuration/`: `ParaConfig.swift` loads settings from environment variables.
  - `Managers/`: `AppRootManager.swift` manages the basic app navigation state.
  - `Utils/`: Helper extensions.
- **`Features/`**: Contains the main UI views separated by feature:
  - `Auth/`: Authentication flows (Email, Phone, OAuth, External Wallet).
  - `Wallet/`: Wallet list and detail views (EVM, Solana, Cosmos placeholders).
- **`UI/`**: Shared UI components like the `LaunchView`.
- **`Resources/`**: Assets like country code data.
- **`Assets.xcassets/`**: App icons and images.
- **`example.entitlements`**: Configures Associated Domains.
- **`Info.plist`**: Configures URL Schemes and MetaMask query schemes.

## Key Integration Points

- **Initialization:** See `ExampleApp.swift` for how `ParaManager`, `ParaEvmSigner`, and `MetaMaskConnector` are initialized and provided as environment objects.
- **Configuration:** `Core/Configuration/ParaConfig.swift` demonstrates loading sensitive data.
- **Authentication Flows:** Views within `Features/Auth/` show how to use `handleEmailAuth`, `handlePhoneAuth`, `handleOAuth`, and `MetaMaskConnector.connect`. Note the use of `@Environment(\.authorizationController)` and `@Environment(\.webAuthenticationSession)`.
- **Deep Link Handling:** `.onOpenURL` in `ExampleApp.swift` directs URLs to `MetaMaskConnector`.
- **EVM Operations:** `Features/Wallet/EVMWalletView.swift` uses `ParaEvmSigner` for signing/sending and `web3swift` for balance fetching.
- **MetaMask Operations:** `Features/Auth/MetaMaskDemoView.swift` uses `MetaMaskConnector` for signing and sending transactions.

## Beta Testing Credentials

When using the `beta` environment:

- Email: any address ending in `@test.getpara.com` (e.g. dev@test.getpara.com)
- Phone: US numbers (+1) in format `(area code)-555-xxxx` (e.g. (425)-555-1234)
- Any OTP code will work for verification
