# Para Modal Cosmos

This example demonstrates how to integrate Para Modal with Cosmos wallets in a Next.js application. It showcases wallet connection and message signing capabilities for Cosmos ecosystem wallets like Keplr and Leap through Para's React SDK.

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

- `@getpara/cosmos-wallet-connectors` (v2.0.0-alpha.26) - Cosmos wallet connectors for Para
- `@getpara/graz` (v2.0.0-alpha.3) - Graz integration for Cosmos wallets
- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
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
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
- [Next.js Documentation](https://nextjs.org/docs)
