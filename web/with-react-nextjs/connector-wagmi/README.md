# Para + Wagmi Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-wagmi.vercel.app)

A minimal Next.js app that adds Para as a wagmi connector, lets the user pick Para or a wallet detected in the browser, shows the connected account and its Sepolia balance, and sends Sepolia ETH with wagmi. The Para and wagmi setup lives in `src/components/ParaProvider.tsx` and the wagmi hooks live in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

This example uses wagmi 3 and `@wagmi/core` 3. The remaining install peer warning for `@wagmi/core` comes from mobile and Farcaster packages that still request the wagmi 2 core range.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

`NEXT_PUBLIC_SEPOLIA_RPC_URL` is optional and configures the wagmi Sepolia transport. The app falls back to `https://ethereum-sepolia-rpc.publicnode.com` when it is not set.

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, theme, login methods, and wallet visibility. The Para connector still needs an `appName` option to initialize its modal, so keep it aligned with the display name in the portal.

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
| `src/components/ParaProvider.tsx` | Creates a `ParaWeb` client, registers it with `paraConnector`, and wraps the app in `WagmiProvider` and a React Query client |
| `src/hooks/useWagmiWalletConnection.ts` | Lists connectors and connects or disconnects with `useConnect`, `useAccount`, and `useDisconnect` |
| `src/hooks/useWagmiBalance.ts` | Reads the Sepolia balance with `useBalance` |
| `src/hooks/useWagmiEthTransfer.ts` | Sends ETH on Sepolia with `useSendTransaction` (`chainId: sepolia.id`, so a wallet on another chain is rejected) and waits for the receipt with `useWaitForTransactionReceipt` |

```ts
const connector = paraConnector({
  appName: "Para Wagmi Example",
  chains: [sepolia],
  onRampTestMode: true,
  options: {},
  para,
  queryClient,
  recoverySecretStepEnabled: true,
});
```

Choosing Para in the wallet picker calls `connect({ connector })`, which opens the Para modal. Once the user signs in, the Para wallet behaves like any other wagmi account, so `useSendTransaction` sends the transfer and the user approves it in the Para window.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # wagmi hooks, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para connector and wagmi setup
│   ├── WagmiExample.tsx         # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, formatting, transfer form, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para or wagmi. They receive data and callbacks from `WagmiExample`, so you can swap them for your own design system without touching the hooks.
