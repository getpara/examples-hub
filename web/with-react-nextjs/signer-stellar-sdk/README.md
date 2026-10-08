# Para Stellar SDK Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-stellar-sdk.vercel.app)

A Next.js app that connects with the Para Modal and uses the Para Stellar signer with the Stellar SDK v14 on Stellar Testnet. Each route is one demo: XLM transfer, message signing, and Soroban auth entry signing. `/` opens XLM transfer. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. Configure app identity, login methods, branding, and wallet visibility (enable Stellar wallets) in the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` passes the API key, the environment, and runtime modal flags. The Horizon, Friendbot, and Stellar Expert testnet URLs are fixed in `src/lib/chain.ts`.

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
| `src/hooks/useStellarWalletConnection.ts` | Opens the modal, reads the account with `useModal`, `useAccount`, and `useWallet`, and selects the Stellar wallet with `useWalletState` |
| `src/hooks/useParaSigner.ts` | Creates the Stellar signer for testnet with `useParaStellarSigner` |
| `src/hooks/useXlmTransfer.ts` | Builds a payment, signs it with `signer.signTransaction`, and submits it to Horizon |
| `src/hooks/useMessageSigning.ts` | Signs bytes with `signer.signBytes` and verifies the Ed25519 signature with the account public key |
| `src/hooks/useSignAuthEntry.ts` | Signs a Soroban authorization entry with `signer.signAuthEntry` |
| `src/hooks/useAccountBalance.ts` | Reads the XLM balance from Horizon. An account that does not exist yet shows `0 XLM` |
| `src/hooks/useFriendbot.ts` | Funds the account with 10,000 test XLM from Friendbot |

```tsx
const { address, isConnected, openModal } = useStellarWalletConnection();
const { signer, isReady } = useParaSigner();
const { transfer, txHash, isLoading, error } = useXlmTransfer();
```

`useParaStellarSigner` comes from `@getpara/react-sdk-lite/chains/stellar` and needs `@getpara/stellar-sdk-v14-integration` installed. That package peers on `@stellar/stellar-sdk` 14.x, so this example pins it to `14.6.1` rather than the v15 line.

A Stellar account exists on the network only after it receives XLM, so XLM transfer shows Fund with Friendbot until the account is funded and keeps Send disabled until the balance loads. `src/lib/horizon.ts` holds the Horizon client that the transfer and balance hooks share.

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK and Stellar SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── StellarSdkExample.tsx    # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hooks with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Testnet config, Horizon client, demo routes, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
