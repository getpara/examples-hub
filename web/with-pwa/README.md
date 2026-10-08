# Progressive Web App Example

A minimal Next.js app that you can install to the home screen. It connects with the Para Modal, shows the connected account and its Sepolia balance, and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

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
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with `useSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance();
```

`useSignHelloWorld` calls `signMessage({ walletId, messageBase64 })` with the base64 encoded message and returns the signature once the user approves the request in the Para window.

## PWA setup

- `public/manifest.json` sets the app name, icons, colors, and standalone display.
- `src/app/layout.tsx` links the manifest, sets `viewport-fit=cover` and the Apple web app options, and registers `public/sw.js`.
- `public/sw.js` activates right away and passes every request to the network. It caches nothing, so the app needs a connection to load.
- In standalone display the header and footer are padded with `env(safe-area-inset-*)` so they clear the status bar and the home indicator.

Para needs a connection to sign in and sign. `src/lib/useOnlineStatus.ts` reads `navigator.onLine`; while the device is offline, the sign-in panel shows a notice and disables Connect with Para.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── PwaExample.tsx           # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench, safe area
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, formatting, online status, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `PwaExample`, so you can swap them for your own design system without touching the hooks.
