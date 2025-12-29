# Para Modal + Multichain + TanStack Start Example

A minimal TanStack Start example demonstrating Para Modal integration with multichain wallets (EVM, Cosmos, Solana) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with TanStack Start SSR
- Configuring external wallets for EVM (MetaMask, Coinbase, Rainbow), Cosmos (Keplr, Leap), and Solana (Phantom, Glow, Backpack, Solflare)
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Signing messages with `useSignMessage`
- Custom hooks pattern with `useSignHelloWorld`
- TanStack Router file-based routing

## Setup

1. Create a `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx                # Root layout with ParaProvider
│   └── index.tsx                 # Main route with auth flow
├── components/
│   ├── ParaProvider.tsx          # Para SDK provider with multichain config
│   ├── DefaultCatchBoundary.tsx  # TanStack error boundary
│   ├── NotFound.tsx              # 404 component
│   ├── layout/Header.tsx         # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx       # Connect wallet card
│       ├── WalletInfo.tsx        # Connected wallet display
│       └── SignMessage.tsx       # Sign message UI
├── hooks/
│   └── useSignHelloWorld.ts      # Custom hook for signing
├── lib/
│   └── e2e-helpers.ts            # E2E testing utilities
├── styles/
│   └── app.css                   # Tailwind CSS styles
└── router.tsx                    # TanStack Router configuration
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

## SSR Considerations

This example uses TanStack Start's SSR shell component pattern. The Para SDK provider is SSR-safe because:
- Provider configuration is static (API key, theme)
- Para SDK hooks are only used in client-side components
- Header component uses `"use client"` directive for hook usage

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Start Documentation](https://tanstack.com/start)
