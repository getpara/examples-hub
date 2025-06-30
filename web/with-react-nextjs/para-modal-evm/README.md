# Para Modal EVM

This example demonstrates how to integrate Para Modal with EVM-compatible wallets in a Next.js application. It showcases wallet connection and message signing capabilities for popular EVM wallets like MetaMask and Rainbow through Para's React SDK.

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

- `@getpara/evm-wallet-connectors` (v2.0.0-alpha.26) - EVM wallet connectors for Para
- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `viem` (v2.31.4) - TypeScript interface for Ethereum
- `wagmi` (v2.15.6) - React hooks for Ethereum
- `next` (v15.1.5) - React framework
- `react` (v19.0.0) - React library

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/components/ui/ConnectWalletCard.tsx` - Wallet connection interface
- `src/components/ui/SignMessageForm.tsx` - Message signing form component
- `src/config/constants.ts` - Configuration constants

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Next.js Documentation](https://nextjs.org/docs)
