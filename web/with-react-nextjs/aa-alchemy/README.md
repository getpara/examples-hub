# Smart Wallet Alchemy

This example demonstrates how to integrate Para SDK with Alchemy's Account Kit to create and manage ERC-4337 smart wallets in a Next.js application. It showcases gasless transactions, multi-wallet management, and seamless user onboarding through Para's authentication.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID=your_gas_policy_id
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
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

- `@getpara/evm-wallet-connectors` (v2.0.0-alpha.23) - EVM wallet connectors for Para
- `@getpara/react-sdk` (v2.0.0-alpha.23) - Para React SDK for wallet integration
- `@getpara/viem-v2-integration` (v2.0.0-alpha.23) - Para Viem v2 integration
- `@aa-sdk/core` (v4.43.1) - Alchemy Account Abstraction SDK core
- `@account-kit/infra` (v4.43.1) - Account Kit infrastructure
- `@account-kit/smart-contracts` (v4.43.1) - Smart contract implementations
- `@tanstack/react-query` (v5.75.4) - Data fetching and state management
- `viem` (v2.31.3) - TypeScript interface for Ethereum
- `wagmi` (v2.15.6) - React hooks for Ethereum
- `next` (v15.2.4) - React framework

## Key Files

- `app/providers/para-providers.tsx` - Para and Wagmi provider setup
- `hooks/use-deploy-smart-wallet.ts` - Smart wallet deployment hook
- `hooks/use-smart-wallets.ts` - Multi-wallet management hook
- `lib/smart-wallet/core.ts` - Smart wallet core functionality
- `components/smart-wallet-card-item.tsx` - Smart wallet UI component
- `app/(protected)/create-smart-wallet/page.tsx` - Smart wallet creation page
- `app/(protected)/accounts/[address]/page.tsx` - Individual account management

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Alchemy Account Kit Documentation](https://docs.alchemy.com/docs/account-kit-overview)
- [ERC-4337 Documentation](https://eips.ethereum.org/EIPS/eip-4337)
- [Next.js Documentation](https://nextjs.org/docs)
