# Svelte + Vite Example

A Svelte and Vite app that signs in with its own email, phone, and social login UI built on `@getpara/web-sdk`, then shows the connected account and its Sepolia balance and signs `Hello World!`. All Para SDK usage lives in `src/hooks` and `src/lib/para.ts`. Everything else is plain Svelte and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, OAuth providers, email and phone login options, and wallet creation settings. The app reads only `VITE_PARA_API_KEY` and `VITE_PARA_ENVIRONMENT`.

Install and run the production build:

```bash
yarn install
yarn build
yarn preview
```

`vite.config.ts` adds `vite-plugin-node-polyfills` for the Node.js built-ins that wallet libraries expect, and maps `@/` to `src/`.

## Para usage

There is no provider. `src/lib/para.ts` creates one `ParaWeb` client for the whole app, and the hooks call it directly. The hooks are Svelte 5 rune modules (`.svelte.ts`), so their state is reactive wherever the container reads it.

| File | What it does |
| --- | --- |
| `src/lib/para.ts` | Creates the `ParaWeb` client from the API key and environment |
| `src/hooks/useEmailOrPhoneAuth.svelte.ts` | Runs `para.authenticateWithEmailOrPhone`, follows `para.onStatePhaseChange` for the verification, password, PIN, and passkey URLs, and cancels with `para.cancelAuthFlow` |
| `src/hooks/useEmailAuth.svelte.ts` | Signs in with an email address through `useEmailOrPhoneAuth` |
| `src/hooks/usePhoneAuth.svelte.ts` | Signs in with a phone number through `useEmailOrPhoneAuth` |
| `src/hooks/useOAuthAuth.svelte.ts` | Signs in with Google, Apple, Discord, or X through `para.authenticateWithOAuth`, and sends its pop-up to the URLs from `para.onStatePhaseChange` |
| `src/hooks/useCombinedAuth.svelte.ts` | Combines the three sign in hooks behind one active tab |
| `src/hooks/usePortalCancel.svelte.ts` | Cancels the attempt when the Para verification frame, matched against the origin from `getPortalBaseURL`, reports that it closed without success |
| `src/hooks/useParaSession.svelte.ts` | Checks the session with `para.isFullyLoggedIn`, reads the wallet with `para.getWallets`, and logs out with `para.logout` |
| `src/hooks/useAccountBalance.svelte.ts` | Reads the wallet balance with `para.getWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useSignHelloWorld.svelte.ts` | Signs `Hello World!` with `createParaViemClient` from `@getpara/viem-v2-integration` |

```ts
const session = useParaSession();
const auth = useCombinedAuth(session.refresh);
const balance = useAccountBalance(() => session.walletId);
const signing = useSignHelloWorld();
```

Email and phone sign in show the Para verification, password, or PIN URL in an iframe, and offer a passkey button when Para returns a passkey URL. `para.authenticateWithEmailOrPhone` resolves once the session and wallet are ready, and the attempt can be canceled. Social sign in opens the provider in a pop-up, moves that pop-up through any passkey, password, or PIN step, and stops when you press Cancel or close the pop-up.

## Project layout

```text
src/
├── main.ts                                    # Entry: styles and the app
├── app/App.svelte                             # Renders the example
├── hooks/                                     # Para SDK usage, one concern per hook
├── components/
│   ├── CustomAuthExample.svelte               # Joins the session, balance, and signing hooks with the UI
│   ├── sign-in/CombinedSignInContainer.svelte # Joins the sign in hooks with the sign in panel
│   ├── layout/                                # App shell, header, footer, workbench
│   └── ui/                                    # Presentational components, props only
├── lib/                                       # Para client, chain config, sign in options, copy, and UI helpers
└── styles/globals.css                         # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the hooks.
