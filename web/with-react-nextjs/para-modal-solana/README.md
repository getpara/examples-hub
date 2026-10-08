# Para Modal Solana Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-solana.vercel.app)

A minimal Next.js app that connects with the Para Modal, including Solana external wallets, shows the connected account on Solana devnet, and signs `Hello World!`. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, the allowed Solana external wallets and whether they verify with a signature, and a WalletConnect project ID if your Solana wallets need one. The local `ParaProvider` passes the API key, the environment, the Solana devnet connection, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

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
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client, and points the Solana connector at the devnet endpoint |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with `useParaSolanaSigner` for Para and external wallets, and reports whether the selected wallet is external with `useWallet` and `useAccount` |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { sign, message, isExternal, isPending, errorMessage, signature } = useSignHelloWorld();
```

`ParaProvider` points the Solana connector at devnet:

```tsx
externalWalletConfig={{
  solanaConnector: {
    config: {
      endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
      chain: WalletAdapterNetwork.Devnet,
    },
  },
}}
```

`useSignHelloWorld` calls `solanaSigner.signMessages([{ content, signatures }])` on the signer from `useParaSolanaSigner`, which takes a devnet RPC client from `@solana/rpc`. `useParaSolanaSigner` returns the Para signer for a Para wallet and the wallet adapter signer for an external wallet, so one call covers both. The hook shows the signature bytes as base64. The hook also returns `isExternal`, read from the selected wallet, so the page can tell the user to approve the request in their wallet instead of the Para window.

## Project layout

```text
src/
├── app/                             # Next.js layout and page
├── hooks/                           # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx             # Para setup
│   ├── ParaModalSolanaExample.tsx   # Joins the hooks with the UI
│   ├── layout/                      # App shell, header, footer, workbench
│   └── ui/                          # Presentational components, props only
├── lib/                             # Chain config, formatting, and UI helpers
└── styles/globals.css               # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ParaModalSolanaExample`, so you can swap them for your own design system without touching the hooks.
