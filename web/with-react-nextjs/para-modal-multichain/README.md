# Para Modal + Multichain Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-multichain.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with multichain wallets (EVM, Cosmos, Solana) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with multichain wallet configuration
- Configuring external wallets for EVM (MetaMask, Coinbase, Rainbow), Cosmos (Keplr, Leap), and Solana (Phantom, Glow, Backpack, Solflare)
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Signing messages with `useSignMessage`

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ParaProvider
│   └── page.tsx                # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx        # Para SDK provider with multichain config
│   ├── layout/Header.tsx       # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
├── hooks/
│   └── useSignHelloWorld.ts    # Custom hook for signing
└── lib/
    └── e2e-helpers.ts          # E2E testing utilities
```

## Multichain Configuration

This example configures Para to work with wallets across multiple chains:

```typescript
externalWalletConfig={{
  wallets: [
    "METAMASK", "COINBASE", "WALLETCONNECT", "RAINBOW", "ZERION",  // EVM
    "KEPLR", "LEAP",  // Cosmos
    "GLOW", "PHANTOM", "BACKPACK", "SOLFLARE",  // Solana
  ],
  evmConnector: {
    config: { chains: [mainnet, polygon, sepolia, celo] },
  },
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
    },
  },
  solanaConnector: {
    config: {
      endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
      chain: WalletAdapterNetwork.Devnet,
    },
  },
}}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
