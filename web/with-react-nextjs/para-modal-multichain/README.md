# Para Modal Multichain Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-multichain.vercel.app)

A minimal Next.js app that connects with the Para Modal and signs `Hello World!` on every chain the account holds a wallet on: EVM, Cosmos, Solana, and Stellar. EVM, Cosmos, and Solana cards also appear for a connected external wallet on that chain. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, auth methods, the wallet types to create (add Stellar to get the Stellar card), the EVM, Cosmos, and Solana external wallets to offer, and a WalletConnect project ID if those wallets need one.

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
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` with the EVM, Cosmos, and Solana connector config, plus a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the selected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useConnectedChains.ts` | Lists the chains to sign on from the account's wallets and connected external networks with `useAccount` |
| `src/hooks/useEvmSignMessage.ts` | Signs with the Wagmi `useSignMessage` hook |
| `src/hooks/useCosmosSignMessage.ts` | Signs an ADR-036 amino sign doc (empty chain ID) with `useParaCosmjsAminoSigner`, which returns the Graz signer for an external wallet |
| `src/hooks/useSolanaSignMessage.ts` | Signs with `useParaSolanaSigner` (`signMessages`), which returns the wallet adapter signer for an external wallet |
| `src/hooks/useStellarSignMessage.ts` | Signs bytes with `useParaStellarSigner`, bound to the account's Stellar wallet |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { chains, wallets } = useConnectedChains();
const { sign, isPending, errorMessage, signature } = useSolanaSignMessage();
```

Every sign hook returns the same shape. Solana and Stellar return a base64 signature over the raw message bytes, EVM returns a hex `personal_sign` signature, and Cosmos returns the base64 amino signature.

Ed25519 wallets can serve Solana and Stellar, so `useStellarSignMessage` passes the Stellar wallet id to `useParaStellarSigner` explicitly.

## Connector config

The EVM, Cosmos, and Solana provider libraries need chain setup in code:

```tsx
externalWalletConfig={{
  evmConnector: { config: { chains: [sepolia] } },
  cosmosConnector: {
    config: { chains: [cosmoshub, osmosis, noble], selectedChainId: cosmoshub.chainId, multiChain: false, onSwitchChain: () => {} },
  },
  solanaConnector: { config: { endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet), chain: WalletAdapterNetwork.Devnet } },
}}
```

## Project layout

```text
src/
├── app/                              # Next.js layout and page
├── hooks/                            # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx              # Para setup
│   ├── ParaModalMultichainExample.tsx # Joins the hooks with the UI
│   ├── layout/                       # App shell, header, footer, sheet
│   └── ui/                           # Presentational components, props only
├── lib/                              # Chain labels, formatting, and UI helpers
└── styles/globals.css                # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ParaModalMultichainExample`, so you can swap them for your own design system without touching the hooks.

## Dependency notes

The `graz --generate` postinstall step needs `arg` and `starknet`, so both stay direct dependencies even though the app does not import them.
