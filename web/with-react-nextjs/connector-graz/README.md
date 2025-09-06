# Connector Wagmi

This example demonstrates how to integrate Para SDK as a Wagmi connector in a Next.js application. It shows how Para can work alongside traditional wallet options like MetaMask and WalletConnect in a custom wallet connection interface.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
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
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `wagmi` (v2.15.6) - React hooks for Ethereum
- `viem` (v2.31.4) - TypeScript interface for Ethereum
- `next` (v15.1.5) - React framework

## Key Files

- `src/config/wagmi.ts` - Wagmi configuration with Para connector
- `src/lib/para/client.ts` - Para client initialization
- `src/context/WagmiProvider.tsx` - Wagmi context provider
- `src/components/ConnectWalletModal.tsx` - Custom wallet connection modal
- `src/components/ui/TransferForm.tsx` - ETH transfer form component

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [Next.js Documentation](https://nextjs.org/docs)
