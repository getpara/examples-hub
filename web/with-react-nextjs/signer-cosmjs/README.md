# Para CosmJS Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-cosmjs.vercel.app)

A Next.js app that connects with the Para Modal and uses the Para Cosmos signer from `useParaCosmjsProtoSigner` with CosmJS on the Cosmos ICS Provider Testnet. Each route is one demo: message signing, ATOM transfer, IBC transfer, staking, governance voting, and CosmWasm contract queries and execution. `/` opens message signing. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` passes the API key, the environment, the Graz Cosmos connector for external wallets, and runtime modal flags.

The chain settings live in `src/lib/chain.ts`: the public ICS Provider Testnet RPC, the `uatom` denom, the gas price, and the explorer links. Transactions need testnet ATOM for fees. Request it from the Polypore faucet at `https://faucet.polypore.xyz/request?address=<your address>&chain=provider`.

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
| `src/hooks/useCosmosWalletConnection.ts` | Opens the modal and reads the connection and the Cosmos address with `useModal`, `useAccount`, and `useParaCosmjsProtoSigner` |
| `src/hooks/useParaSigner.ts` | Creates a `SigningStargateClient` from the Para proto signer |
| `src/hooks/useParaCosmWasmSigner.ts` | Creates a `SigningCosmWasmClient` from the Para proto signer |
| `src/hooks/useMessageSigning.ts` | Signs a memo-only transaction with `signingClient.sign` without broadcasting it |
| `src/hooks/useAtomTransfer.ts` | Sends ATOM with `signingClient.sendTokens` |
| `src/hooks/useIbcTransfer.ts` | Broadcasts a `MsgTransfer` with `signingClient.signAndBroadcast` |
| `src/hooks/useStaking.ts` | Lists bonded validators and your delegations, and broadcasts a `MsgDelegate` |
| `src/hooks/useGovernance.ts` | Lists proposals in the voting period and broadcasts a `MsgVote` |
| `src/hooks/useCosmWasmExecute.ts` | Executes a contract call with `signingClient.execute` |

These hooks read the chain without Para: `useCosmosQueryClient.ts` connects a CosmJS `QueryClient` with the bank, staking, and gov extensions, `useAccountBalance.ts` reads the ATOM balance through it, and `useCosmWasmQuery.ts` queries a contract with `CosmWasmClient`.

```tsx
const { address, isConnected, openModal } = useCosmosWalletConnection();
const { signingClient } = useParaSigner();
const { delegate, txHash, isLoading, error } = useStaking();
```

Every signing hook waits for the user to approve the request in the Para window. Broadcasting hooks resolve once the chain includes the transaction.

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK and CosmJS usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── CosmjsExample.tsx        # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hooks with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, demo routes, vote options, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
