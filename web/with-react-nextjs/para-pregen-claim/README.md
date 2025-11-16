# Para Pregen Claim

This example demonstrates how to implement pre-generated wallet creation and claiming with Para SDK in a Next.js application. It showcases server-side wallet generation using UUIDs as identifiers, which users can then claim after authentication on the client side.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
PARA_PRIVATE_KEY=your_para_private_key
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
- `@getpara/server-sdk` (v2.0.0-alpha.26) - Para Server SDK for server-side operations
- `@getpara/cosmos-wallet-connectors` (v2.0.0-alpha.12) - Cosmos wallet connectors
- `@getpara/evm-wallet-connectors` (v2.0.0-alpha.12) - EVM wallet connectors
- `@getpara/solana-wallet-connectors` (v2.0.0-alpha.12) - Solana wallet connectors
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `next` (v15.1.5) - React framework

## Key Files

- `src/app/api/wallet/generate/route.ts` - API route for server-side wallet generation
- `src/app/api/wallet/[uuid]/route.ts` - API route for retrieving wallet by UUID
- `src/lib/para/client.ts` - Para client initialization
- `src/lib/store.ts` - UUID storage management
- `src/components/ui/StepCard.tsx` - Step-by-step UI component
- `src/context/ParaProvider.tsx` - Para SDK React context provider

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)
