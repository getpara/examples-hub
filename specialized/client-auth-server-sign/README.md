# Client Auth Server Sign

This example demonstrates how to implement server-side transaction signing with Para SDK in a Next.js application. It showcases secure transaction signing by keeping sensitive operations on the server while maintaining a responsive client-side user experience.

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

- `@getpara/ethers-v6-integration` (v2.0.0-alpha.26) - Para integration for ethers.js v6
- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@getpara/server-sdk` (v2.0.0-alpha.26) - Para Server SDK for server-side operations
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `ethers` (v6.14.4) - Ethereum library
- `next` (v15.1.5) - React framework

## Key Files

- `src/app/api/signing/route.ts` - Server-side API route for transaction signing
- `src/lib/para/client.ts` - Para client configuration
- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/hooks/useServerTransaction.ts` - Custom hook for server-side transactions
- `src/components/ui/TransferForm.tsx` - Example transfer form component

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Next.js Documentation](https://nextjs.org/docs)
