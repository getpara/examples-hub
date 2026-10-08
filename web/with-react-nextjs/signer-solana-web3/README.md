# Para Solana web3.js Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-web3.vercel.app)

A Next.js app that connects with the Para Modal and uses a Para `ParaSolanaWeb3Signer` with `@solana/web3.js` on Solana Devnet. Each route is one demo: message signing with signature verification, and a SOL transfer. `/` opens message signing. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_DEVNET_RPC_URL` is the Solana RPC endpoint used by the web3.js `Connection` and the Solana wallet connector; it defaults to the public Devnet RPC above. It is not a Para provider config override. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The API key must have Solana wallets enabled; otherwise the app shows a notice after sign in instead of the demos. The local `ParaProvider` passes the API key, the environment, the Devnet Solana connector, and runtime modal flags.

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
| `src/hooks/useSolanaWalletConnection.ts` | Opens the modal, reads the connected wallet, and selects the Solana wallet with `useWalletState` |
| `src/hooks/useParaSigner.ts` | Creates a `ParaSolanaWeb3Signer` from the Para client and the Solana connection |
| `src/hooks/useSolanaConnection.ts` | Creates the web3.js `Connection` for Devnet |
| `src/hooks/useAccountBalance.ts` | Reads the SOL balance through the Solana connection |
| `src/hooks/useMessageSigning.ts` | Signs a message with `signer.signBytes` and verifies the signature with the wallet's public key |
| `src/hooks/useSolTransfer.ts` | Checks the balance, builds a `SystemProgram.transfer`, sends it with `signer.sendTransaction`, and polls until it is confirmed, fails on chain, or its blockhash expires |

```tsx
const { address, isConnected, openModal } = useSolanaWalletConnection();
const { signer, connection } = useParaSigner();
const { sendTransaction, txSignature, isLoading, error } = useSolTransfer();
```

```tsx
const signer = new ParaSolanaWeb3Signer(client, connection);
const signature = await signer.signBytes(Buffer.from(messageBytes));
const txSignature = await signer.sendTransaction(transaction);
```

Every signing hook waits for the user to approve the request in the Para window. `src/lib/installBrowserBuffer.ts` adds `Buffer` to the browser global before the signer is created.

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK and web3.js usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── SolanaWeb3Example.tsx    # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hook with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, demo routes, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
