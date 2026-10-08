# Vue + Vite Example

A Vue and Vite app that signs in with its own email, phone, and social login UI built on the framework-agnostic `@getpara/web-sdk`, then shows the connected account and its Sepolia balance and signs `Hello World!`. All Para SDK usage lives in `src/lib/para.ts` and the composables in `src/hooks`. Everything else is plain Vue and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

`VITE_PARA_ENVIRONMENT` defaults to `BETA` when omitted. Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, email and phone login, and the OAuth providers this example shows: Google, Apple, Discord, and X.

Install and run the production build:

```bash
yarn install
yarn build
yarn preview
```

`vite.config.ts` adds `vite-plugin-node-polyfills` for the Node.js built-ins that wallet libraries expect, and maps `@/` to `src/`.

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/lib/para.ts` | Creates the `ParaWeb` client once for the whole app. It is the only Para import in `src/lib` |
| `src/hooks/useEmailOrPhoneAuth.ts` | Runs `para.authenticateWithEmailOrPhone`, follows `para.onStatePhaseChange` for the verification, password, PIN, and passkey URLs, and cancels with `para.cancelAuthFlow` |
| `src/hooks/useEmailAuth.ts` | Signs in with an email address through `useEmailOrPhoneAuth` |
| `src/hooks/usePhoneAuth.ts` | Signs in with a phone number and country code through `useEmailOrPhoneAuth` |
| `src/hooks/useOAuthAuth.ts` | Signs in with Google, Apple, Discord, or X through `para.authenticateWithOAuth`, and sends its pop-up to the URLs from `para.onStatePhaseChange` |
| `src/hooks/useCombinedAuth.ts` | Combines the three sign in composables behind one active tab |
| `src/hooks/usePortalCancel.ts` | Cancels the email or phone attempt when the Para verification frame, matched against the origin from `getPortalBaseURL`, posts `CLOSE_WINDOW` without success |
| `src/hooks/useParaSession.ts` | Restores the session on mount with `para.isFullyLoggedIn` and `para.getWallets`, and logs out with `para.logout` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with a Para Viem client from `createParaViemClient` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `para.getWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```ts
const session = useParaSession();
const { signMessage, message, isPending, errorMessage, signature } = useSignHelloWorld();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance(() => session.walletId.value);
```

Email and phone sign in show the Para verification, password, or PIN URL in an iframe, and offer a passkey button when Para returns a passkey URL. `para.authenticateWithEmailOrPhone` resolves once the session and wallet are ready, then the session refreshes. Cancel, or closing the verification inside the frame, stops the attempt. Social sign in opens the provider in a pop-up, moves that pop-up through any passkey, password, or PIN step, and stops when you press Cancel or close the pop-up.

## Project layout

```text
src/
├── main.ts                                 # Entry: styles and the app
├── app/App.vue                             # Renders the example
├── hooks/                                  # Para SDK usage, one concern per composable
├── components/
│   ├── CustomAuthExample.vue               # Joins the session, balance, and signing composables with the UI
│   ├── sign-in/CombinedSignInContainer.vue # Joins the sign in composables with the sign in panel
│   ├── layout/                             # App shell, header, footer, workbench
│   └── ui/                                 # Presentational components, props only
├── lib/                                    # Para client, chain config, sign in options and copy, and UI helpers
└── styles/globals.css                      # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the composables.
