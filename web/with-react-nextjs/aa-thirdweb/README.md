# Smart Wallet Thirdweb

This example demonstrates how to integrate Para SDK with Thirdweb's account abstraction infrastructure to create and manage ERC-4337 smart wallets in a Next.js application. It showcases gasless transactions, multi-wallet management, and seamless user onboarding through Para's authentication.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
# Or use secret key for server-side (optional)
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
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

- `@getpara/evm-wallet-connectors` (v2.0.0-alpha.39) - EVM wallet connectors for Para
- `@getpara/react-sdk` (v2.0.0-alpha.39) - Para React SDK for wallet integration
- `@getpara/viem-v2-integration` (v2.0.0-alpha.39) - Para Viem v2 integration
- `thirdweb` (v5.89.0) - Thirdweb SDK for Account Abstraction
- `@tanstack/react-query` (v5.75.4) - Data fetching and state management
- `viem` (v2.33.0) - TypeScript interface for Ethereum
- `wagmi` (v2.16.0) - React hooks for Ethereum
- `next` (v15.2.4) - React framework

## Key Files

- `src/config/thirdweb.ts` - Thirdweb configuration and constants
- `src/lib/create-thirdweb-client.ts` - Thirdweb client creation with Para integration
- `src/lib/deploy-smart-wallet.ts` - Smart wallet deployment logic
- `src/hooks/useSmartWallets.ts` - Multi-wallet management hook
- `src/components/smart-wallet-card-item.tsx` - Smart wallet UI component
- `src/app/(protected)/create-smart-wallet/page.tsx` - Smart wallet creation page
- `src/app/(protected)/accounts/[address]/page.tsx` - Individual account management

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Thirdweb Documentation](https://portal.thirdweb.com)
- [Thirdweb Account Abstraction](https://portal.thirdweb.com/wallets/smart-wallet)
- [ERC-4337 Documentation](https://eips.ethereum.org/EIPS/eip-4337)
- [Next.js Documentation](https://nextjs.org/docs)
