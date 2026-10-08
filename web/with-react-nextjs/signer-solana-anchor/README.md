# Para Solana Anchor Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-anchor.vercel.app)

A Next.js app that connects with the Para Modal and uses a Para `ParaSolanaWeb3Signer` as the wallet of an Anchor provider on Solana Devnet. Each route is one demo: message signing, SOL transfer, Token-2022 mint creation, and minting through a sample Anchor program. `/` opens message signing. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_DEVNET_RPC_URL` is the Solana connection used for reads, the balance, and transactions; it defaults to the public Devnet RPC above. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` passes the API key, the environment, the Devnet Solana connector, and runtime modal flags.

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
| `src/hooks/useSolanaWalletConnection.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useParaSigner.ts` | Creates a `ParaSolanaWeb3Signer` from the Para client and wraps it in an Anchor provider |
| `src/hooks/useSolanaConnection.ts` | Creates the Solana `Connection` for Devnet |
| `src/hooks/useAccountBalance.ts` | Reads the SOL balance of the signer address through the Solana connection |
| `src/hooks/useMessageSigning.ts` | Signs a message with `signer.signBytes` and verifies it against the wallet public key |
| `src/hooks/useSolTransfer.ts` | Checks the balance, builds a transfer, and sends it with `provider.sendAndConfirm` |
| `src/hooks/useCreateToken.ts` | Creates a Token-2022 mint with the program's `createToken` instruction |
| `src/hooks/useMintToken.ts` | Reads the token balance and mints with the program's `mintToken` instruction |

```ts
const signer = new ParaSolanaWeb3Signer(client, connection);
const provider = new anchor.AnchorProvider(connection, createWalletAdapter(signer), {
  commitment: connection.commitment || "confirmed",
});
```

The signer uses the account's Solana wallet, so enable Solana wallets for your API key in the Developer Portal. The account strip shows that Solana address. Every signing hook waits for the user to approve the request in the Para window. Transaction hooks also wait for Devnet to confirm the transaction before they resolve.

## Anchor program

`programs/transfer_tokens/src/lib.rs` is the sample program source, and `src/idl/` holds its IDL. The program address comes from the IDL. `src/lib/program.ts` creates the typed `anchor.Program` from it.

```bash
yarn anchor:build
yarn anchor:deploy
yarn anchor:verify
```

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK, Solana, and Anchor usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── SolanaAnchorExample.tsx  # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hook with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── idl/                         # Anchor IDL for the sample program
├── lib/                         # Chain config, demo routes, Anchor program, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
