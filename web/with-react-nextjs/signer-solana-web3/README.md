# Signer Solana Web3

This example demonstrates how to integrate Para SDK with Solana's web3.js library in a Next.js application. It showcases core Solana operations like message signing and SOL transfers using Para's signer integration without the Anchor framework.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com/
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
- `@getpara/solana-web3.js-v1-integration` (v2.0.0-alpha.26) - Para Solana signer integration
- `@solana/web3.js` (v1.98.2) - Solana Web3 JavaScript API
- `@solana/spl-token` (v0.4.13) - Solana SPL Token library
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `tweetnacl` (v1.0.3) - Cryptographic library for signatures
- `next` (v15.1.5) - React framework

## Key Files

- `src/hooks/useParaSigner.ts` - Para Solana signer hook
- `src/hooks/useSolana.ts` - Solana connection hook
- `src/app/message-signing/page.tsx` - Message signing example
- `src/app/sol-transfer/page.tsx` - SOL transfer example
- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/config/constants.ts` - Configuration constants

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Next.js Documentation](https://nextjs.org/docs)
