# Smart Wallet Porto (EIP-7702)

This example demonstrates how to integrate Para SDK with Porto to upgrade Para EOA wallets to smart accounts using
EIP-7702. It showcases account upgrading, session keys, and transaction batching while preserving the original wallet
address.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
```

### Installation

Install dependencies using your preferred package manager:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Key Dependencies

- `@getpara/react-sdk` (v2.0.0-alpha.72) - Para React SDK for wallet integration
- `porto` (latest) - Porto smart account SDK
- `viem` (v2.33.0) - TypeScript interface for Ethereum
- `@tanstack/react-query` (v5.83.0) - Data fetching and state management
- `next` (v15.1.5) - React framework

## Key Files

- `src/context/Providers.tsx` - Para provider setup with Base Sepolia chain
- `src/hooks/usePortoAccount.ts` - Porto account upgrade and management hook
- `src/components/PortoDemo.tsx` - Demo UI showing EOA vs Smart Account comparison

## Important Notes

- Porto requires raw signing (no EIP-191 prefix) - uses `para.signMessage()` directly
- Must use Porto relay endpoint: `https://rpc.porto.sh`
- Currently supports Base Sepolia testnet

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Porto Documentation](https://porto.sh/sdk)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
