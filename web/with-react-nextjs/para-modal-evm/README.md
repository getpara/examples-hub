# Para Modal EVM Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-evm.vercel.app)

A minimal Next.js app that connects with the Para Modal, including EVM external wallets, shows the connected account and its Sepolia balance, and signs `Hello World!` with Wagmi. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, the allowed EVM external wallets, and a WalletConnect project ID if those wallets need one. The local `ParaProvider` passes the API key, the environment, the EVM chains, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

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
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client, and sets the EVM connector chains |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with Wagmi's `useSignMessage`, and reports whether the selected wallet is external with `useWallet` and `useAccount` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { sign, message, isExternal, isPending, errorMessage, signature } = useSignHelloWorld();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance();
```

`ParaProvider` passes the Wagmi chain list to the EVM connector:

```tsx
externalWalletConfig={{
  evmConnector: {
    config: {
      chains: [sepolia],
    },
  },
}}
```

Para then works as a Wagmi connector, so `useSignHelloWorld` calls Wagmi's `signMessage({ message })` for both Para wallets and external EVM wallets and returns the signature once the user approves the request. The hook also returns `isExternal`, read from the selected wallet, so the page can tell the user to approve the request in their wallet instead of the Para window.

## Project layout

```text
src/
├── app/                          # Next.js layout and page
├── hooks/                        # Para SDK and Wagmi usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx          # Para setup
│   ├── ParaModalEvmExample.tsx   # Joins the hooks with the UI
│   ├── layout/                   # App shell, header, footer, workbench
│   └── ui/                       # Presentational components, props only
├── lib/                          # Chain config, formatting, and UI helpers
└── styles/globals.css            # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ParaModalEvmExample`, so you can swap them for your own design system without touching the hooks.
