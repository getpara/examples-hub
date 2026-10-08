# React + Vite Example

A minimal React and Vite app that connects with the Para Modal, shows the connected account and its Sepolia balance, and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, external wallets, and wallet visibility. The local `ParaProvider` passes the API key, the environment, the external wallet connectors, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

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
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client, and sets up the EVM, Cosmos, and Solana external wallet connectors |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet`, and passes `useClient` to the test-only cleanup |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with `useSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useE2ECleanup.ts` | Test-only cleanup for the end-to-end suite, active in development only |

```tsx
const { address, isConnected, isRestoring, openModal } = useParaModalWallet();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance();
```

`isRestoring` is true while the SDK checks for a saved session. The app keeps the account strip and the sign button on hold until it settles, then shows either the signed-in view or the sign-in panel.

`useSignHelloWorld` calls `signMessage({ walletId, messageBase64 })` with the base64 encoded message and returns the signature once the user approves the request in the Para window.

## Project layout

```text
src/
├── main.tsx                     # Entry: styles, ParaProvider, and the app
├── app/App.tsx                  # Renders the example
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── ParaModalExample.tsx     # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

`main.tsx` imports `globals.css` before `@getpara/react-sdk/styles.css` so the app styles never leak into the modal. Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ParaModalExample`, so you can swap them for your own design system without touching the hooks.
