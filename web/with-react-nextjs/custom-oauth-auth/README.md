# Custom OAuth Auth

This example demonstrates how to implement custom OAuth authentication with Para SDK in a Next.js application. It shows the minimal setup needed to build your own OAuth auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- One-click OAuth login (no passkeys required)
- Support for Google, Apple, Discord, X (Twitter), Facebook, and Farcaster
- Automatic wallet creation for new users
- Message signing with "Hello World!" example

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
```

### Installation

```bash
yarn install
yarn dev
```

## Key Files

```
src/
├── app/
│   ├── layout.tsx          # Root layout with ParaProvider
│   └── page.tsx            # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx    # Para SDK provider setup
│   ├── layout/Header.tsx   # Header with wallet display
│   └── ui/
│       ├── OAuthAuth.tsx   # OAuth provider buttons with auth flow
│       ├── WalletInfo.tsx  # Connected wallet info
│       └── SignMessage.tsx # Message signing UI
├── hooks/
│   └── useSignHelloWorld.ts
└── lib/
    └── e2e-helpers.ts
```

## How It Works

1. **OAuthAuth Component** - Displays OAuth provider buttons (Google, Apple, etc.)
2. **OAuth Popup** - Uses `useVerifyOAuth` hook to open OAuth provider popup
3. **One-Click Login** - After OAuth, stage is `"done"` - no passkey needed
4. **Wallet Creation** - If `isNewUser`, calls `waitForWalletCreation`; otherwise `waitForLogin`
5. **Connected State** - Once authenticated, displays wallet info and signing functionality

## Key Hooks Used

- `useVerifyOAuth` - Initiates OAuth authentication (Google, Apple, Discord, X, Facebook)
- `useVerifyFarcaster` - Initiates Farcaster authentication
- `useWaitForWalletCreation` - Polls for wallet creation (new users)
- `useWaitForLogin` - Polls for login completion (returning users)
- `useAccount` - Gets connection state
- `useSignMessage` - Signs messages with the wallet

## OAuth Flow (One-Click)

```
User clicks "Continue with Google"
         ↓
verifyOAuth({ method: "GOOGLE", onOAuthUrl })
         ↓
Popup opens → User authenticates with Google
         ↓
authState.stage === "done"
         ↓
Check authState.isNewUser:
  - true  → waitForWalletCreation()
  - false → waitForLogin()
         ↓
User authenticated, wallet ready
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
