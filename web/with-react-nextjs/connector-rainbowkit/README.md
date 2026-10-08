# Para + RainbowKit Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-rainbowkit.vercel.app)

A minimal Next.js app that adds Para as a RainbowKit wallet, opens RainbowKit from Connect, shows the connected account, and signs `Hello World!` with wagmi. The Para, RainbowKit, and wagmi setup lives in `src/components/ParaProvider.tsx` and the wallet hooks live in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

`@getpara/rainbowkit-wallet` peers on RainbowKit 2, and RainbowKit 2 peers on wagmi 2, so this example uses wagmi 2.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` is the Para environment for that API key and defaults to `BETA`. RainbowKit needs a WalletConnect project ID and an `appName` to build its wagmi connectors. Configure the Para API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, login methods, and wallet visibility.

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
| `src/components/ParaProvider.tsx` | Creates the Para wallet with `getParaWallet`, registers it with `connectorsForWallets`, and wraps the app in `WagmiProvider`, a React Query client, and `RainbowKitProvider` |
| `src/hooks/useRainbowKitWallet.ts` | Reads the account with `useAccount` and opens the RainbowKit connect, account, and network modals |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with wagmi `useSignMessage` |

```ts
const paraWallet = getParaWallet({
  para: {
    environment: ENVIRONMENT,
    apiKey: API_KEY,
  },
  queryClient,
  appName: APP_NAME,
  onRampTestMode: true,
  recoverySecretStepEnabled: true,
});

const connectors = connectorsForWallets([{ groupName: "Social Login", wallets: [paraWallet] }], {
  appName: APP_NAME,
  projectId: WALLET_CONNECT_PROJECT_ID,
});
```

Choosing Para in RainbowKit opens the Para modal. Once the user signs in, the Para wallet behaves like any other wagmi account, so `signMessage({ message })` signs the text and the user approves it in the Para window. The address chip in the header opens the RainbowKit account modal.

`src/lib/rainbowKitTheme.ts` styles the RainbowKit modal with `lightTheme` (accent color, square corners) and the app font.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # RainbowKit and wagmi hooks, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para wallet, RainbowKit, and wagmi setup
│   ├── RainbowKitExample.tsx    # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain labels, RainbowKit theme, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para, RainbowKit, or wagmi. They receive data and callbacks from `RainbowKitExample`, so you can swap them for your own design system without touching the hooks.
