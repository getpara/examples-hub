# Custom Phone Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-phone-auth.vercel.app)

A Next.js app that signs in with its own phone number UI instead of the Para Modal, then shows the connected account and its Sepolia balance and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, phone login, and 2FA policy.

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
| `src/hooks/usePhoneAuth.ts` | Signs in with a country code and phone number through `useAuthenticateWithEmailOrPhone` |
| `src/hooks/useParaSession.ts` | Reads the connected wallet with `useAccount` and `useWallet`, and logs out with `useLogout` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with a Para Viem client and `useParaViemSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useE2ECleanup.ts` | Test-only cleanup for the E2E suite, active in development only |

```tsx
const auth = usePhoneAuth();
const { address, isConnected, disconnect } = useParaSession();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();
```

`usePhoneAuth` watches the Para client state and shows the verification URL in an iframe, or opens the passkey URL in a pop-up, until the session and wallet are ready. It can cancel the attempt.

## Project layout

```text
src/
├── app/                                  # Next.js layout and page
├── hooks/                                # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx                  # Para setup
│   ├── CustomPhoneAuthExample.tsx        # Joins the session and signing hooks with the UI
│   ├── sign-in/PhoneSignInContainer.tsx  # Joins the phone sign in hook with the sign in panel
│   ├── layout/                           # App shell, header, footer, workbench
│   └── ui/                               # Presentational components, props only
├── lib/                                  # Chain config, country codes, copy, and UI helpers
└── styles/globals.css                    # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the hooks.
