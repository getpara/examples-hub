# Para Modal Solana

This example demonstrates how to integrate Para Modal with Solana wallets in a Next.js application. It showcases wallet connection and message signing capabilities for popular Solana wallets like Phantom and Solflare through Para's React SDK.

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

- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@getpara/solana-wallet-connectors` (v2.0.0-alpha.26) - Solana wallet connectors for Para
- `@solana/wallet-adapter-react` (v0.15.39) - React adapter for Solana wallets
- `@solana/wallet-adapter-base` (v0.9.27) - Base adapter for Solana wallets
- `@solana/web3.js` (v1.98.2) - Solana Web3 JavaScript API
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
- [Solana Documentation](https://docs.solana.com/)
- [Solana Wallet Adapter Documentation](https://github.com/solana-labs/wallet-adapter)
- [Next.js Documentation](https://nextjs.org/docs)
