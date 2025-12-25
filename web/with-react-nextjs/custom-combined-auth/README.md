# Custom Combined Auth

This example demonstrates how to implement a unified authentication flow combining email, phone, and OAuth with Para SDK in a Next.js application. It shows the pattern for building your own multi-method auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- **Tabbed Auth UI** - Clean switching between Email, Phone, and Social login
- **Email OTP** - One-click email verification
- **Phone OTP** - One-click phone verification with country code selector
- **OAuth Login** - Google, Apple, Discord, and X (Twitter)
- **Automatic wallet creation** for new users
- **Message signing** with "Hello World!" example

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
│       ├── CombinedAuth.tsx # Unified auth component (Email/Phone/OAuth)
│       ├── WalletInfo.tsx   # Connected wallet info
│       └── SignMessage.tsx  # Message signing UI
├── hooks/
│   └── useSignHelloWorld.ts
└── lib/
    └── e2e-helpers.ts
```

## How It Works

### Email/Phone Flow (OTP)
```
User enters email/phone → signUpOrLogIn({ auth })
       ↓
AuthStateVerify → Show iframe with loginUrl
       ↓
User enters OTP in iframe
       ↓
Check nextStage:
  - "signup" → waitForWalletCreation()
  - "login"  → waitForLogin()
       ↓
Done - user authenticated
```

### OAuth Flow (One-Click)
```
User clicks OAuth button → verifyOAuth({ method, onOAuthUrl })
       ↓
Popup opens → User authenticates with provider
       ↓
AuthStateDone (stage: "done")
       ↓
Check isNewUser:
  - true  → waitForWalletCreation()
  - false → waitForLogin()
       ↓
Done - user authenticated
```

## Key Hooks Used

| Hook | Purpose |
|------|---------|
| `useSignUpOrLogIn` | Email/Phone OTP initiation |
| `useVerifyOAuth` | OAuth popup flow (Google, Apple, etc.) |
| `useVerifyFarcaster` | Farcaster-specific OAuth |
| `useWaitForLogin` | Poll for login completion |
| `useWaitForWalletCreation` | Poll for wallet creation (new users) |
| `useAccount` | Connection state |
| `useSignMessage` | Signs messages with the wallet |

## Key Patterns Demonstrated

1. **Tabbed Auth UI** - Clean switching between auth methods in one card
2. **Unified Verification** - Single iframe area for Email/Phone OTP
3. **OAuth Popup Flow** - One-click social login without iframe
4. **Shared Post-Auth Logic** - `handleAuthComplete` works for all auth types
5. **Centralized Error Handling** - Single error state for all methods
6. **Cancellation** - Clean cancel handler for all auth types

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
