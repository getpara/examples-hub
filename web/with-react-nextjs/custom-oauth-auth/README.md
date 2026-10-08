# Custom OAuth Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-oauth-auth.vercel.app)

A Next.js app that signs in with its own Google, Apple, Discord, and X buttons instead of the Para Modal, then shows the connected account and its Sepolia balance and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, enabled OAuth providers, and 2FA policy.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useOAuthAuth.ts` | Signs in with Google, Apple, Discord, or X through `useAuthenticateWithOAuth` and its pop-up |
| `src/hooks/useParaSession.ts` | Reads the connected wallet with `useAccount` and `useWallet`, and logs out with `useLogout` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with a Para Viem client and `useParaViemSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useE2ECleanup.ts` | Test-only cleanup for the E2E suite, active in development only |

```tsx
const oauth = useOAuthAuth();
const { address, isConnected, disconnect } = useParaSession();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();

oauth.authenticate("GOOGLE");
```

`useOAuthAuth` opens the provider in a pop-up and keeps it on the current Para URL as the client state moves through OAuth and any verification or passkey step, until the session and wallet are ready. Closing the pop-up or calling `cancel` ends the attempt.

## Project layout

```text
src/
├── app/                                  # Next.js layout and page
├── hooks/                                # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx                  # Para setup
│   ├── CustomOAuthAuthExample.tsx        # Joins the session and signing hooks with the UI
│   ├── sign-in/OAuthSignInContainer.tsx  # Joins the OAuth hook with the sign in panel
│   ├── layout/                           # App shell, header, footer, workbench
│   └── ui/                               # Presentational components, props only
├── lib/                                  # Chain config, provider list, copy, and UI helpers
└── styles/globals.css                    # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the hooks.
