# Para + Reown AppKit Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-reown-appkit.vercel.app)

A minimal Next.js app that adds Para as a wagmi connector inside Reown AppKit. AppKit keeps its own modal for connecting and for the account view; the app shows the connected account, its network and balance, and the networks configured for AppKit. The Para, AppKit, and wagmi setup lives in `src/components/ParaProvider.tsx` and the AppKit and wagmi hooks live in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

This example uses wagmi 3 and `@wagmi/core` 3. The remaining install peer warning for `@wagmi/core` comes from mobile and Farcaster packages that still request the wagmi 2 core range.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, theme, login methods, and wallet visibility. The Para connector still needs an `appName` option to initialize its modal, so keep it aligned with the display name in the portal. The AppKit metadata, features, theme, network list, and WalletConnect project ID stay in code because they configure AppKit and wagmi, not Para.

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
| `src/components/ParaProvider.tsx` | Creates a `ParaWeb` client, registers it with `paraConnector`, passes it to the AppKit `WagmiAdapter`, calls `createAppKit`, and wraps the app in `WagmiProvider` and a React Query client |
| `src/hooks/useReownAppKitWallet.ts` | Opens AppKit, reads the account and connector, and disconnects with `useAppKit`, `useAppKitAccount`, `useAccount`, and `useDisconnect` |
| `src/hooks/useReownAppKitNetwork.ts` | Reads the active network with `useAppKitNetwork` |
| `src/hooks/useWagmiBalance.ts` | Reads the balance on the active network with `useBalance` |

```ts
const connector = paraConnector({
  appName: "Reown AppKit with Para",
  chains: [...NETWORKS],
  onRampTestMode: true,
  options: {},
  para,
  queryClient,
  recoverySecretStepEnabled: true,
});

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: PROJECT_ID,
  connectors: connector ? [connector as CreateConnectorFn] : [],
});
```

Connect calls `open()` from `useAppKit`. The user picks Para in the AppKit modal, which opens the Para modal to sign in. Once connected, Open account calls `open()` again to show the AppKit account view, where the user can also switch networks. `createAppKit` sets `themeVariables` so the AppKit modal uses the app accent, square corners, and the app font.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # AppKit and wagmi hooks, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para connector, AppKit, and wagmi setup
│   ├── ReownAppKitExample.tsx   # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Network list, AppKit theme, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para, AppKit, or wagmi. They receive data and callbacks from `ReownAppKitExample`, so you can swap them for your own design system without touching the hooks.
