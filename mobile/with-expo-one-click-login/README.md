# Para One-Click Login with Expo

An Expo React Native example demonstrating Para's one-click authentication flow with Email, Phone, and Google OAuth, wallet management, and blockchain transactions via viem on Sepolia testnet. Built with modern patterns including Expo Router for navigation, NativeWind for styling, and custom hooks for business logic separation.

> Scaffolded with [rn.new](https://rn.new/) - a quick way to bootstrap React Native projects.

## Important: Developer Build Required

**Expo Go will not work with this project.** Para's React Native SDK includes native modules that must be linked during the build process. You must use a development build via `expo prebuild` and run with `expo run:ios` or `expo run:android`.

## Setup

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Configure your API key**

   Get an API key from [developer.getpara.com](https://developer.getpara.com), then:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   EXPO_PUBLIC_PARA_API_KEY=your_api_key_here
   ```

3. **Generate native projects**

   ```bash
   yarn prebuild
   ```

4. **Run the app**

   ```bash
   yarn ios     # iOS Simulator
   yarn android # Android Emulator
   ```

## Project Structure

```
with-expo-one-click-login/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout with ParaProvider
│   ├── index.tsx               # Auth redirect handler
│   ├── (auth)/                 # Unauthenticated routes
│   │   └── index.tsx           # Login screen
│   └── (tabs)/                 # Authenticated routes
│       ├── _layout.tsx         # Stack navigator
│       ├── index.tsx           # Home/Wallet screen
│       └── send.tsx            # Send transaction screen
├── components/
│   ├── ui/                     # Presentational components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── WalletCard.tsx
│   │   └── Divider.tsx
│   └── features/               # Feature components
│       ├── AuthForm.tsx
│       └── OAuthButtons.tsx
├── hooks/
│   ├── useOneClickLogin.ts     # Authentication flow hook
│   ├── useWallets.ts           # Wallet management hook
│   └── useViemClient.ts        # Viem blockchain operations hook
├── providers/
│   └── ParaProvider.tsx        # Para auth state management
├── lib/
│   ├── para.ts                 # Para SDK singleton
│   ├── auth.ts                 # Auth utilities
│   └── constants.ts            # App constants
└── types/
    └── index.ts                # TypeScript types
```

## Para Integration

### Dependencies

The key Para-related packages:

```json
{
  "@getpara/react-native-wallet": "2.0.0-alpha.72",
  "@getpara/viem-v2-integration": "2.0.0-alpha.72"
}
```

Supporting native modules required by Para:

```json
{
  "@craftzdog/react-native-buffer": "^6.1.0",
  "react-native-quick-crypto": "^0.7.14",
  "react-native-quick-base64": "^2.2.0",
  "react-native-keychain": "^10.0.0",
  "react-native-modpow": "^1.1.0",
  "react-native-passkey": "^3.3.1"
}
```

> `react-native-passkey` is a required peer dependency of `@getpara/react-native-wallet` even when not using passkey authentication.

### Shim Configuration

Para provides a shim that handles all necessary polyfills for React Native (buffer, process, crypto, atob/btoa, etc.). Import it **before any other code** in your entry point:

```javascript
// index.js
import '@getpara/react-native-wallet/shim';
import 'expo-router/entry';
```

If you have existing polyfills in your project, the Para shim can replace them—it provides comprehensive coverage for crypto operations and buffer handling.

### Metro Configuration

Configure Metro to resolve crypto and buffer modules to their React Native equivalents:

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  crypto: require.resolve('react-native-quick-crypto'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
};

module.exports = config;
```

> NativeWind is optional but follows the modern styling standard for React Native. If using NativeWind, wrap the config with `withNativeWind()`.

### App Configuration

Configure deep linking in `app.json`:

```json
{
  "expo": {
    "scheme": "para-one-click",
    "ios": {
      "bundleIdentifier": "com.yourcompany.app"
    },
    "android": {
      "package": "com.yourcompany.app"
    }
  }
}
```

### Para Client Initialization

```typescript
// lib/para.ts
import { ParaMobile, Environment } from '@getpara/react-native-wallet';

export const para = new ParaMobile(
  Environment.BETA,
  process.env.EXPO_PUBLIC_PARA_API_KEY,
  undefined,
  { disableWorkers: true } // Required for React Native
);
```

## Hooks Pattern

This example uses a hooks-based architecture to separate business logic from UI components. These patterns are not yet standardized in the Para SDK but represent recommended approaches that may be incorporated into future SDK releases.

### useOneClickLogin

Handles the authentication flow for email, phone, and OAuth:

```typescript
const { status, error, loginWithEmail, loginWithPhone, loginWithGoogle } =
  useOneClickLogin(onSuccess);

// Triggers magic link flow
await loginWithEmail('user@example.com');
```

### useWallets

Manages wallet retrieval and auto-creation. After authentication, if no wallets exist, one is automatically created:

```typescript
const { wallets, loadWallets, clearWallets } = useWallets();

// Called automatically by ParaProvider after auth
// Auto-creates EVM wallet if none exist
```

### useViemClient

Wraps viem client creation when the user is authenticated with wallets available. Provides ready-to-use clients for blockchain operations:

```typescript
const { account, walletClient, publicClient, isReady, getBalance, sendTransaction } =
  useViemClient();

// Query balance
const balance = await getBalance();

// Send transaction
const hash = await sendTransaction('0x...', '0.01');
```

## Viem Integration

The `@getpara/viem-v2-integration` package provides a Para account adapter for viem, enabling signing and transaction capabilities with Para-managed wallets. This approach is compatible with Account Abstraction providers and other viem-based tooling.

```typescript
import { createParaAccount } from '@getpara/viem-v2-integration';
import { createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';

// Create Para account from wallet address
const account = createParaAccount(para, walletAddress);

// Create viem wallet client
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

// Sign and send transactions
await walletClient.sendTransaction({ to, value });
```

## Authentication Flow

1. User enters email/phone or selects Google OAuth
2. App calls `para.signUpOrLogIn()` or `para.getOAuthUrl()`
3. Opens secure browser session for OTP verification
4. User completes authentication in browser
5. Browser redirects back via deep link (`para-one-click://`)
6. App calls `para.waitForLogin()` or `para.waitForSignup()` to finalize session
7. Wallet is auto-created if this is a new signup
8. User is authenticated and redirected to wallet

## Development

```bash
yarn start      # Start Metro bundler
yarn typecheck  # Run TypeScript checks
yarn lint       # Run ESLint + Prettier checks
yarn format     # Auto-fix formatting
```

## Notes

- This example uses Para's **BETA** environment. For production, change `Environment.BETA` to `Environment.PRODUCTION` in `lib/para.ts`
- The `disableWorkers: true` option is required for React Native as Web Workers are not supported
- Session persistence is handled automatically by Para via secure storage
- Transactions are configured for Sepolia testnet—update the chain configuration for other networks

## License

MIT
