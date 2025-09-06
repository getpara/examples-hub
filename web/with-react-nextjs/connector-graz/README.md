# Connector Graz

This example demonstrates how to integrate Para SDK as a Graz connector in a Next.js application. It shows how Para can work alongside traditional wallet options like Keplr and Leap in a custom wallet connection interface for Cosmos ecosystem.

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

- `@getpara/react-sdk-lite` (v2.0.0-alpha.51) - Para React SDK Lite for wallet integration
- `@getpara/graz-integration` (v2.0.0-alpha.51) - Para Graz connector
- `@tanstack/react-query` (v5.85.3) - Data fetching and state management
- `graz` (v0.3.4-alpha.0) - React hooks for Cosmos ecosystem
- `@cosmjs/stargate` (v0.36.0) - TypeScript interface for Cosmos
- `next` (v15.1.5) - React framework

## Key Files

- `src/config/graz.ts` - Graz configuration with Para connector
- `src/lib/para/client.ts` - Para client initialization
- `src/context/Providers.tsx` - Graz and QueryClient providers
- `src/components/ConnectWalletModal.tsx` - Custom wallet connection modal
- `src/components/ui/TransferForm.tsx` - Token transfer form component

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Graz Documentation](https://graz.sh)
- [Cosmos SDK Documentation](https://docs.cosmos.network)
- [Next.js Documentation](https://nextjs.org/docs)
