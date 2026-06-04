# Signer Solana Web3

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-web3.vercel.app)

This example demonstrates how to integrate Para SDK with Solana's web3.js library in a Next.js application. It showcases core Solana operations like message signing and SOL transfers using Para's signer integration without the Anchor framework.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

`NEXT_PUBLIC_DEVNET_RPC_URL` is used by the Solana Web3 connection and Solana wallet connector wiring for this demo. Para app identity, auth, branding, and external wallet policy are not configured through environment variables in this example.

### Installation

Install dependencies:

```bash
yarn install
```

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key used by this example. The code does not set `configOverrides`, so Developer Portal settings remain the source of truth.

The `ParaProvider` keeps only API key/environment setup, Solana connector endpoint/network wiring, and runtime modal behavior. External wallet list, connection mode, wallet verification, linked embedded wallet behavior, app description, app URL, and app icon should be configured in Developer Portal rather than in code.

## Key Dependencies

- `@getpara/react-sdk` (3.0.0-alpha.1) - Para React SDK for wallet integration
- `@getpara/solana-web3.js-v1-integration` (3.0.0-alpha.1) - Para Solana signer integration
- `@solana/web3.js` (v1.98.2) - Solana Web3 JavaScript API
- `@solana/kit` (v2.1.0) - Solana encoding helpers
- `@tanstack/react-query` (v5.90.12) - Data fetching and state management
- `tweetnacl` (v1.0.3) - Cryptographic library for signatures
- `next` (v15.1.12) - React framework

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK React context provider
- `src/hooks/useParaSigner.ts` - Para Solana signer hook
- `src/hooks/useSolana.ts` - Solana connection hook
- `src/app/message-signing/page.tsx` - Message signing example
- `src/app/sol-transfer/page.tsx` - SOL transfer example
- `src/config/constants.ts` - Configuration constants

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Next.js Documentation](https://nextjs.org/docs)
