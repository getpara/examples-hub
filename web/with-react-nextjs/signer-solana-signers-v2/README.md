# Para Solana Signers v2 Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-signers-v2.vercel.app)

A Next.js app that connects with the Para Modal and signs on Solana Devnet with the Signers v2 signer from `useParaSolanaSigner` and `@solana/kit`. Each route is one demo: message signing with signature verification, and a SOL transfer. `/` opens message signing. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_DEVNET_RPC_URL` is the Solana RPC used for the balance, the signer, and transactions; it defaults to the public Devnet RPC above. It is not a Para provider setting. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The API key must have Solana wallets enabled; otherwise the app shows a notice after sign in instead of the demos. The local `ParaProvider` passes the API key, the environment, the Solana Devnet wallet connector, and runtime modal flags.

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
| `src/hooks/useSolanaWalletConnection.ts` | Opens the modal, reads the connected wallet with `useModal`, `useAccount`, and `useWallet`, and selects the Solana wallet with `useWalletState` |
| `src/hooks/useSolana.ts` | Creates the `@solana/kit` RPC and the `@solana/rpc-spec` RPC that the signer takes |
| `src/hooks/useParaSigner.ts` | Gets the Signers v2 signer with `useParaSolanaSigner({ rpc })` |
| `src/hooks/useAccountBalance.ts` | Reads the SOL balance with `rpc.getBalance` |
| `src/hooks/useMessageSigning.ts` | Signs a message with `signer.signMessages` and verifies it against the wallet public key |
| `src/hooks/useSolTransfer.ts` | Checks the balance, builds the transfer, signs it with `signTransactionMessageWithSigners`, sends it, and polls until it is confirmed, fails on chain, or its blockhash expires |

```tsx
const { address, isConnected, openModal } = useSolanaWalletConnection();
const { signer, rpc, isReady } = useParaSigner();
const { sendTransaction, txSignature, isLoading, error } = useSolTransfer();
```

`@getpara/solana-signers-v2-integration` peers on the Solana 2.x packages, so this example pins them to `2.3.0`.

## Project layout

```text
src/
├── app/                           # Next.js layout, one page per demo route
├── hooks/                         # Para SDK and Solana usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx           # Para setup
│   ├── SolanaSignersV2Example.tsx # Header, sign in, and account strip shared by every route
│   ├── demos/                     # One container per route, joins its hook with the UI
│   ├── layout/                    # App shell, header, footer, route workbench
│   └── ui/                        # Presentational components, props only
├── lib/                           # Chain config, demo routes, formatting, UI helpers
└── styles/globals.css             # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
