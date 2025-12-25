# Custom OAuth Auth

This example demonstrates how to implement custom OAuth authentication with Para SDK in a Next.js application. It shows the minimal setup needed to build your own OAuth auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- One-click OAuth login (no passkeys required)
- Support for Google, Apple, Discord, X (Twitter), Facebook, and Farcaster
- Automatic wallet creation for new users
- Message signing with "Hello World!" example
- **Clean separation of logic (hooks) and presentation (components)**

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

## Architecture

This example follows the **Smart/Dumb Component Pattern** for clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│  HOOKS (Logic Layer - Reusable)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useOAuthAuth                                        │    │
│  │ - Manages OAuth provider state                      │    │
│  │ - Handles popup flow and Para SDK interactions      │    │
│  │ - Returns state + actions                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  COMPONENTS (Presentation Layer - UI Only)                  │
│  ┌───────────────────┐ ┌─────────────────────────────┐      │
│  │ OAuthButtons      │ │ AuthCard                    │      │
│  │ (props only)      │ │ (layout wrapper)            │      │
│  └───────────────────┘ └─────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

```
src/
├── hooks/
│   ├── useOAuthAuth.ts       # OAuth auth logic (copy this for your own UI)
│   └── useSignHelloWorld.ts  # Message signing logic
├── constants/
│   └── auth.ts               # OAuth providers configuration
├── components/
│   ├── ParaProvider.tsx      # Para SDK provider setup
│   ├── layout/Header.tsx     # Header with wallet display
│   └── ui/
│       ├── OAuthAuth.tsx     # Container (connects hook to UI)
│       ├── OAuthButtons.tsx  # Presentational (provider buttons)
│       ├── AuthCard.tsx      # Presentational (layout wrapper)
│       ├── WalletInfo.tsx    # Connected wallet info
│       └── SignMessage.tsx   # Message signing UI
└── app/
    ├── layout.tsx            # Root layout with ParaProvider
    └── page.tsx              # Main page with auth flow
```

## useOAuthAuth Hook

The `useOAuthAuth` hook encapsulates all OAuth authentication logic:

```tsx
const {
  // State
  activeProvider,  // Currently authenticating provider (null when idle)
  error,           // Error message if any
  isPending,       // Loading state

  // Actions
  authenticate,    // Start OAuth flow: authenticate("GOOGLE")
  cancel,          // Cancel authentication
} = useOAuthAuth();
```

**Copy this hook** to implement OAuth auth with your own UI components.

## How It Works

1. **OAuthAuth Container** - Connects `useOAuthAuth` hook to presentational components
2. **OAuthButtons** - Renders provider buttons, calls `onAuthenticate` on click
3. **OAuth Popup** - Hook opens popup via `useVerifyOAuth`, user authenticates
4. **Wallet Creation** - Hook handles `waitForWalletCreation` or `waitForLogin` internally

## OAuth Flow (One-Click)

```
User clicks "Continue with Google"
         ↓
useOAuthAuth.authenticate("GOOGLE")
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

## Para SDK Hooks Used

| Hook | Purpose |
|------|---------|
| `useVerifyOAuth` | Initiates OAuth authentication (Google, Apple, Discord, X, Facebook) |
| `useVerifyFarcaster` | Initiates Farcaster authentication |
| `useWaitForWalletCreation` | Polls for wallet creation (new users) |
| `useWaitForLogin` | Polls for login completion (returning users) |
| `useAccount` | Gets connection state |
| `useSignMessage` | Signs messages with the wallet |

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
