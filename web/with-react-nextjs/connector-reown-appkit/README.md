# Connector Reown AppKit

This example demonstrates how to integrate Para SDK with Reown AppKit and Wagmi in a Next.js application. It showcases how Para can be used as a custom Wagmi connector alongside Reown AppKit's comprehensive wallet connection interface.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
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

- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@getpara/wagmi-v2-integration` (v2.0.0-alpha.26) - Para Wagmi v2 connector
- `@reown/appkit` (v1.7.11) - Reown's Web3 modal solution
- `@reown/appkit-adapter-wagmi` (v1.7.11) - Wagmi adapter for Reown AppKit
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `viem` (v2.31.4) - TypeScript interface for Ethereum
- `wagmi` (v2.15.6) - React hooks for Ethereum
- `next` (v15.3.4) - React framework

## Key Files

- `src/config/appkit.ts` - AppKit configuration with Para connector
- `src/client/para.ts` - Para client initialization
- `src/components/AppKitProvider.tsx` - AppKit provider wrapper component
- `src/components/WalletDisplay.tsx` - Component for displaying wallet information
- `src/constants/chains.ts` - Supported blockchain networks configuration

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Reown AppKit Documentation](https://docs.reown.com/appkit/overview)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)