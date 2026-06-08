# Para Custom Auth + Vue + Vite Example

A Vue + Vite example demonstrating custom UI authentication with Para's web-sdk. Uses direct Para client methods (equivalent to React SDK hooks) for email, phone, and OAuth authentication flows.

## What This Example Shows

- Setting up Para web-sdk client singleton
- Custom authentication UI with three methods:
  - Email with OTP verification (iframe)
  - Phone with OTP verification (iframe)
  - OAuth (Google, Apple, Discord, X)
- Using Para portal iframe for OTP verification
- Handling new vs returning users with `waitForLogin`/`waitForWalletCreation`
- Vue composables for auth state management
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

1. Create a `.env` file from `.env.example` and set your Para API key:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PARA_API_KEY` | Yes | API key from the Para Developer Portal project used by this example. |
| `VITE_PARA_ENVIRONMENT` | No | Para environment for the API key. Defaults to `BETA` when omitted. |

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Developer Portal Configuration

This custom UI example uses direct `@getpara/web-sdk` methods without provider-level configuration objects. Configure persistent project settings in the Para Developer Portal for the API key you use here:

- App name or display identity.
- Branding, logo, theme colors, fonts, border radius, and wallet visibility.
- Email and phone login availability.
- OAuth providers displayed by this example: Google, Apple, Discord, and X.

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Header.vue               # Header with logout
│   └── ui/
│       ├── CombinedAuth.vue         # Main auth orchestrator
│       ├── AuthCard.vue             # Card wrapper
│       ├── AuthTabs.vue             # Tab navigation
│       ├── EmailForm.vue            # Email input
│       ├── PhoneForm.vue            # Phone input
│       ├── OAuthButtons.vue         # OAuth provider buttons
│       ├── VerifyIframe.vue         # OTP verification iframe
│       ├── WalletInfo.vue           # Connected wallet display
│       └── SignMessage.vue          # Message signing UI
├── composables/
│   ├── auth/
│   │   ├── useEmailAuth.ts          # Email auth flow
│   │   ├── usePhoneAuth.ts          # Phone auth flow
│   │   ├── useOAuthAuth.ts          # OAuth auth flow
│   │   └── useCombinedAuth.ts       # Auth orchestrator
│   └── useAccount.ts                # Account/wallet state
├── lib/
│   ├── para.ts                      # Para client singleton
│   └── e2e-helpers.ts               # E2E testing utilities
├── constants/
│   └── auth.ts                      # Country codes, OAuth providers
├── App.vue                          # Main app component
├── style.css                        # Global styles
└── main.ts                          # Entry point
```

## Key Implementation Pattern

This example uses Vue composables to replicate the React hook patterns from `custom-combined-auth`:

- **useEmailAuth.ts** → equivalent to `useEmailAuth` hook
- **usePhoneAuth.ts** → equivalent to `usePhoneAuth` hook
- **useOAuthAuth.ts** → equivalent to `useOAuthAuth` hook
- **useCombinedAuth.ts** → equivalent to `useCombinedAuth` hook

The composables use `ref` for state and `computed` for derived values, providing the same separation of concerns as React hooks.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Vue.js Documentation](https://vuejs.org)
- [Vite Documentation](https://vite.dev)
