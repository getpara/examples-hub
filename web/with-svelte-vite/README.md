# Para Custom Auth + Svelte + Vite Example

A Svelte + Vite example demonstrating custom UI authentication with Para's web-sdk. Uses direct Para client methods (equivalent to React SDK hooks) for email, phone, and OAuth authentication flows.

## What This Example Shows

- Setting up Para web-sdk client singleton
- Custom authentication UI with three methods:
  - Email with OTP verification (iframe)
  - Phone with OTP verification (iframe)
  - OAuth (Google, Apple, Discord, X)
- Using Para portal iframe for OTP verification
- Handling new vs returning users with `waitForLogin`/`waitForWalletCreation`
- Svelte stores for auth state management
- Message signing with connected wallet

## Para Client Methods Used

| Method | Purpose |
|--------|---------|
| `para.signUpOrLogIn()` | Initiate email/phone auth |
| `para.verifyOAuth()` | OAuth provider auth |
| `para.verifyFarcaster()` | Farcaster auth |
| `para.waitForLogin()` | Wait for returning user login |
| `para.waitForWalletCreation()` | Wait for new user wallet |
| `para.isFullyLoggedIn()` | Check auth status |
| `para.getWallets()` | Get user wallets |
| `para.signMessage()` | Sign messages |
| `para.logout()` | Logout user |

## Setup

1. Create a `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Header.svelte             # Header with logout
│   └── ui/
│       ├── CombinedAuth.svelte       # Main auth orchestrator
│       ├── AuthCard.svelte           # Card wrapper
│       ├── AuthTabs.svelte           # Tab navigation
│       ├── EmailForm.svelte          # Email input
│       ├── PhoneForm.svelte          # Phone input
│       ├── OAuthButtons.svelte       # OAuth provider buttons
│       ├── VerifyIframe.svelte       # OTP verification iframe
│       ├── WalletInfo.svelte         # Connected wallet display
│       └── SignMessage.svelte        # Message signing UI
├── stores/
│   ├── auth/
│   │   ├── emailAuth.ts              # Email auth flow
│   │   ├── phoneAuth.ts              # Phone auth flow
│   │   ├── oauthAuth.ts              # OAuth auth flow
│   │   └── combinedAuth.ts           # Auth orchestrator
│   └── account.ts                    # Account/wallet state
├── lib/
│   ├── para.ts                       # Para client singleton
│   └── e2e-helpers.ts                # E2E testing utilities
├── constants/
│   └── auth.ts                       # Country codes, OAuth providers
├── App.svelte                        # Main app component
├── app.css                           # Global styles
└── main.ts                           # Entry point
```

## Key Implementation Pattern

This example uses Svelte stores to replicate the React hook patterns from `custom-combined-auth`:

- **emailAuth.ts** → equivalent to `useEmailAuth` hook
- **phoneAuth.ts** → equivalent to `usePhoneAuth` hook
- **oauthAuth.ts** → equivalent to `useOAuthAuth` hook
- **combinedAuth.ts** → equivalent to `useCombinedAuth` hook

The stores use `writable` for state and `derived` for computed values, providing the same separation of concerns as React hooks.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Svelte Documentation](https://svelte.dev)
- [Vite Documentation](https://vite.dev)
