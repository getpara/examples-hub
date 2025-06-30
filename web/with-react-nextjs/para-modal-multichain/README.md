# Para Modal Multichain

This example demonstrates how to integrate Para Modal with wallets across multiple blockchain ecosystems in a Next.js application. It showcases support for EVM (MetaMask, Rainbow), Solana (Phantom, Solflare), and Cosmos (Keplr, Leap) wallets through Para's unified interface.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
```

### Installation

Install dependencies using your preferred package manager:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

## Key Dependencies

- `@getpara/cosmos-wallet-connectors` (v2.0.0-alpha.26) - Cosmos wallet connectors
- `@getpara/evm-wallet-connectors` (v2.0.0-alpha.26) - EVM wallet connectors
- `@getpara/solana-wallet-connectors` (v2.0.0-alpha.26) - Solana wallet connectors
- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@getpara/graz` (v2.0.0-alpha.3) - Graz integration for Cosmos wallets
- `@solana/wallet-adapter-react` (v0.15.39) - Solana wallet adapter
- `@solana/web3.js` (v1.98.2) - Solana Web3 JavaScript API
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `wagmi` (v2.15.6) - React hooks for Ethereum
- `viem` (v2.31.4) - TypeScript interface for Ethereum
- `next` (v15.1.5) - React framework

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/components/ui/ConnectWalletCard.tsx` - Wallet connection interface
- `src/components/ui/SignMessageForm.tsx` - Message signing form component
- `src/config/constants.ts` - Configuration constants

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)
