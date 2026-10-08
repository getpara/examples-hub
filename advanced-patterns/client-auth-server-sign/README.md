# Para Client Auth Server Sign

A Next.js app where the user signs in on the client with the Para Modal, and a Next.js API route signs and broadcasts a Sepolia ETH transfer for that user with the Para Server SDK and Ethers v6. The browser builds the transaction and exports the session; the server imports the session into a fresh server client and signs with the Para ethers signer. Client-side Para SDK usage lives in `src/components/ParaProvider.tsx` and `src/hooks`; server-side Para usage lives in `src/app/api` and `src/lib/server`.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_SEPOLIA_RPC_URL` is the Ethers JSON-RPC provider used by the browser and the server for balances, transaction building, and broadcasting; it defaults to the public Sepolia RPC above. The API route uses the same API key and environment as the client, because the imported session belongs to that API key.

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, login methods, and EVM wallets. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility. Sign in with an embedded Para wallet: the server can only sign for wallets whose session it imports.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Flow

1. Sign in with the Para Modal. The account strip shows the wallet address and its Sepolia balance.
2. Enter a recipient and an amount, then click `Send transaction`. The browser checks the address and amount, checks that the balance covers the amount plus the maximum gas fee, and builds an EIP-1559 transfer with the nonce, fee data, a 21000 gas limit, and the Sepolia chain ID.
3. The browser calls `waitAndExportSession()` and posts the session and the serialized transaction to `POST /api/signing`.
4. The route creates a new `@getpara/server-sdk` client, calls `importSession(session)`, creates a signer with `createParaEthersSigner({ para, provider })`, signs with `signTransaction`, and broadcasts with `provider.broadcastTransaction`. It returns the signed transaction and the transaction hash.
5. The browser waits for one confirmation, shows the hash with an Etherscan link, and refreshes the balance.

## Para usage

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSessionExport.ts` | Exports the signed-in session with `useClient` and `waitAndExportSession()` |
| `src/hooks/useServerSignedTransfer.ts` | Builds the transfer, exports the session, posts both to `/api/signing`, and waits for one confirmation |
| `src/hooks/useEthersProvider.ts` | Creates the Ethers `JsonRpcProvider` for Sepolia |
| `src/hooks/useAccountBalance.ts` | Reads the ETH balance through the Ethers provider |
| `src/lib/server/serverSigning.ts` | Imports the session, signs with `createParaEthersSigner`, and broadcasts the transaction |
| `src/lib/server/paraServerClient.ts` | Builds a new `@getpara/server-sdk` client for each request, so one request never holds another user's session |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { exportSession } = useSessionExport();
const { send, phase, result, errorMessage } = useServerSignedTransfer(address);
```

The exported session includes the wallet signer data the server needs to sign. Do not export it with `{ excludeSigners: true }` for this flow, send it only over HTTPS, and never log it.

## Project layout

```text
src/
├── app/                                # Next.js layout, page, and the signing API route
├── hooks/                              # Para SDK and Ethers usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx                # Para setup
│   ├── ClientAuthServerSignExample.tsx # Joins the hooks with the UI
│   ├── layout/                         # App shell, header, footer, workbench
│   └── ui/                             # Presentational components, props only
├── lib/                                # Chain config, environment, signing API client, transaction building, formatting
│   └── server/                         # Server-only Para client and transaction signing
└── styles/globals.css                  # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ClientAuthServerSignExample`, so you can swap them for your own design system without touching the hooks.
