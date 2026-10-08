# Para Sui SDK Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-sui-sdk.vercel.app)

A Next.js app that connects with the Para Modal and signs on Sui Testnet with the [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript) (`@mysten/sui`). Each route is one demo: SUI transfer with faucet funding, personal message signing and verification, and a native 2-of-2 multisig. `/` opens SUI transfer. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` passes the API key, the environment, and runtime modal flags. The Sui Testnet fullnode, faucet network, and explorer are fixed in `src/lib/chain.ts`.

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
| `src/hooks/useSuiWalletConnection.ts` | Opens the modal, selects the account's `SUI` wallet, and reads its address from `useParaSuiSigner` |
| `src/hooks/useParaSigner.ts` | Returns the `ParaSuiSigner` from `useParaSuiSigner` and the shared `SuiGrpcClient` |
| `src/hooks/useMessageSigning.ts` | Signs a personal message with `useParaSuiSignPersonalMessage` and verifies it with the signer's public key |
| `src/hooks/useSuiTransfer.ts` | Builds a SUI transfer, signs it with `useParaSuiSignTransaction`, and executes it over gRPC |
| `src/hooks/useSuiMultiSig.ts` | Derives a 2-of-2 multisig with `useParaSuiMultiSigSigner`, collects both partial signatures, and combines and verifies them |
| `src/hooks/useSuiFaucet.ts` | Requests test SUI from the Sui Testnet faucet for the Para wallet |
| `src/hooks/useAccountBalance.ts` | Reads the SUI balance through the `SuiGrpcClient` |

```tsx
const { signer, client, isReady, address } = useParaSigner();
const { signTransactionAsync } = useParaSuiSignTransaction(signer);
const { multiSigSigner } = useParaSuiMultiSigSigner({ otherMembers, threshold: 2 });
```

`ParaSuiSigner` is a `@mysten/sui` `Signer` backed by the wallet's Ed25519 key: Para signs, and `@mysten/sui` handles intent wrapping, hashing, and signature serialization. The wallet's address in the header is the `0x` Sui address from the signer. Sui reuses the key of a Para Solana wallet, so `SUI`, `SOLANA`, and `STELLAR` wallet ids resolve to the same key.

The multisig demo pairs the Para wallet with a key generated in the browser. Both members sign the same message, and `multiSigSigner.combine` joins the partial signatures into one multisig signature.

A transfer resolves gas coins while it builds, so the wallet needs Testnet SUI first. Send stays disabled until the balance loads, and an account with a zero balance shows the faucet button.

`@mysten/sui` has deprecated its JSON-RPC client, so this example uses `SuiGrpcClient` against the Testnet fullnode in `src/lib/suiClient.ts`.

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK and Sui SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── SuiSdkExample.tsx        # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hooks with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, Sui client, demo routes, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
