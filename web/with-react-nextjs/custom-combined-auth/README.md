# Custom Combined Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-combined-auth.vercel.app)

A Next.js app that signs in with its own email, phone, and social login UI instead of the Para Modal, then shows the connected account and its Sepolia balance and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, OAuth providers, email and phone login options, and 2FA policy.

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
| `src/hooks/useEmailAuth.ts` | Signs in with an email address through `useAuthenticateWithEmailOrPhone` |
| `src/hooks/usePhoneAuth.ts` | Signs in with a phone number through `useAuthenticateWithEmailOrPhone` |
| `src/hooks/useOAuthAuth.ts` | Signs in with Google, Apple, Discord, or X through `useAuthenticateWithOAuth` and its pop-up |
| `src/hooks/useCombinedAuth.ts` | Combines the three sign in hooks behind one active tab |
| `src/hooks/useParaSession.ts` | Reads the connected wallet with `useAccount` and `useWallet`, and logs out with `useLogout` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with a Para Viem client and `useParaViemSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useE2ECleanup.ts` | Test-only cleanup for the E2E suite, active in development only |

```tsx
const auth = useCombinedAuth();
const { address, isConnected, disconnect } = useParaSession();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();
```

Email and phone sign in watch the Para client state and show the verification URL in an iframe, or open the passkey URL in a pop-up, until the session and wallet are ready. Social sign in opens the provider in a pop-up and keeps it on the current Para URL. Each hook can cancel its attempt.

## Project layout

```text
src/
├── app/                                  # Next.js layout and page
├── hooks/                                # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx                  # Para setup
│   ├── CustomCombinedAuthExample.tsx     # Joins the session and signing hooks with the UI
│   ├── sign-in/CombinedSignInContainer.tsx  # Joins the sign in hooks with the sign in panel
│   ├── layout/                           # App shell, header, footer, workbench
│   └── ui/                               # Presentational components, props only
├── lib/                                  # Chain config, sign in options, copy, and UI helpers
└── styles/globals.css                    # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the hooks.
