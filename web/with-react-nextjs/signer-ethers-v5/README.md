# Para Ethers v5 Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-ethers-v5.vercel.app)

A Next.js app that connects with the Para Modal and uses a Para `ParaEthersV5Signer` with Ethers v5 on Holesky. Each route is one demo: message signing, ETH transfer, contract deployment, token transfer, contract interaction, batch transactions, typed data signing, and permit signing. `/` opens message signing. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_HOLESKY_RPC_URL` is the Ethers JSON-RPC provider used for reads and transactions; it defaults to the public Holesky RPC above. Configure app identity, login methods, branding, and wallet visibility in the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` passes the API key, the environment, the Holesky EVM connector, and runtime modal flags.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

`yarn compile` recompiles the sample ERC20 contract in `src/contracts/ParaTestToken.sol` with Hardhat.

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useEvmWalletConnection.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useParaSigner.ts` | Creates a `ParaEthersV5Signer` from the Para client and the Ethers provider |
| `src/hooks/useEthersProvider.ts` | Creates the Ethers `providers.JsonRpcProvider` for Holesky |
| `src/hooks/useAccountBalance.ts` | Reads the ETH balance through the Ethers provider |
| `src/hooks/useMessageSigning.ts` | Signs a message with `signer.signMessage`, then recovers the signer address and checks it matches the wallet |
| `src/hooks/useEthTransfer.ts` | Checks the balance, builds the transaction, and sends it with `signer.sendTransaction` |
| `src/hooks/useContractDeployment.ts` | Deploys `ParaTestToken` with a `ContractFactory` |
| `src/hooks/useTokenTransfer.ts` | Reads ERC20 balances and calls `transfer` |
| `src/hooks/useContractInteraction.ts` | Reads the mint limit and calls `mint` |
| `src/hooks/useBatchTransactions.ts` | Encodes mint and transfer calls and sends them through `multicall` |
| `src/hooks/useTypedDataSigning.ts` | Signs an EIP-712 token attestation with `signer._signTypedData` |
| `src/hooks/usePermitSigning.ts` | Signs an EIP-2612 permit with `signer._signTypedData` |

```tsx
const { address, isConnected, openModal } = useEvmWalletConnection();
const { signer, provider } = useParaSigner();
const { sendTransaction, txHash, isLoading, error } = useEthTransfer();
```

Every signing hook waits for the user to approve the request in the Para window. Transaction hooks also wait for one confirmation before they resolve.

## Project layout

```text
src/
├── app/                         # Next.js layout, one page per demo route
├── hooks/                       # Para SDK and Ethers usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── EthersV5Example.tsx      # Header, sign in, and account strip shared by every route
│   ├── demos/                   # One container per route, joins its hook with the UI
│   ├── layout/                  # App shell, header, footer, route workbench
│   └── ui/                      # Presentational components, props only
├── contracts/                   # ParaTestToken source and Hardhat artifacts
├── lib/                         # Chain and contract config, demo routes, formatting, UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
