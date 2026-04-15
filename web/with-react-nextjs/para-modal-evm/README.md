# Para Modal + EVM Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-evm.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with EVM wallets (MetaMask) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with EVM wallet configuration
- Configuring external wallets (MetaMask) via `externalWalletConfig`
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
│   ├── ParaProvider.tsx        # Para SDK provider with EVM config
│   ├── layout/Header.tsx       # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
├── hooks/
│   └── useSignHelloWorld.ts    # Custom hook for signing
```

## EVM Configuration

This example configures Para to work with EVM wallets:

```typescript
externalWalletConfig={{
  wallets: ["METAMASK"],
  evmConnector: {
    config: {
      chains: [sepolia],
    },
  },
}}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
