# Signer Solana Signers V2

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-signers-v2.vercel.app)

This example demonstrates how to integrate Para SDK with Solana's new v2 signers specification in a Next.js application. It showcases core Solana operations like message signing and SOL transfers using Para's v2 signer integration with the modern Solana JavaScript SDK.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
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

## Developer Portal Configuration

This example expects app identity, authentication methods, theme, wallet visibility, and external wallet availability to be configured in the Para Developer Portal for the API key. The `ParaProvider` keeps only API key/environment setup, Solana connector wiring required by the provider library, and runtime modal behavior.

`NEXT_PUBLIC_DEVNET_RPC_URL` is used by the example's Solana RPC clients for balance, transaction, and signer operations. It is not a Para provider config override.

## Key Dependencies

- `@getpara/react-sdk` (3.0.0-alpha.1) - Para React SDK for wallet integration
- `@getpara/react-sdk` (3.0.0-alpha.1) - Para React provider, hooks, and modal styles
- `@getpara/solana-signers-v2-integration` (3.0.0-alpha.1) - Para Solana v2 signer integration
- `@solana/kit` (^2.2.1) - Modern Solana JavaScript SDK
- `@solana/addresses` (^2.2.1) - Solana address utilities
- `@solana/keys` (^2.2.1) - Solana key utilities
- `@solana/signers` (^2.2.1) - Solana v2 signers specification
- `@solana/transactions` (^2.2.1) - Solana transaction utilities
- `@solana/rpc-api` (^2.2.1) - Solana RPC API types
- `@solana/rpc-spec` (^2.2.1) - Solana RPC specification
- `@solana/rpc-transport-http` (^2.2.1) - HTTP transport for Solana RPC
- `@tanstack/react-query` (5.90.12) - Data fetching and state management
- `tweetnacl` (1.0.3) - Cryptographic library for signatures
- `bs58` (^6.0.0) - Base58 encoding/decoding
- `next` (15.1.12) - React framework

## Key Files

- `src/hooks/useParaSigner.ts` - Para Solana signer hook
- `src/hooks/useSolana.ts` - Solana RPC connection hook
- `src/hooks/useMessageSigning.ts` - Message signing state and verification hook
- `src/hooks/useSolTransfer.ts` - SOL transfer state and transaction hook
- `src/hooks/useBalance.ts` - SOL balance query hook
- `src/app/message-signing/page.tsx` - Message signing example
- `src/app/sol-transfer/page.tsx` - SOL transfer example
- `src/components/ParaProvider.tsx` - Para SDK React context provider
- `src/config/constants.ts` - Configuration constants

## Architecture Notes

This example uses a dual RPC setup:

- **@solana/kit RPC**: Used for general transaction utilities and balance fetching
- **@solana/rpc-spec RPC**: Used specifically for the Para signer integration

The Para signer v2 integration now requires an RPC client created with `@solana/rpc-spec` instead of accepting an RPC URL. This provides better type safety and compatibility with the Solana v2 SDK ecosystem.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Solana JavaScript SDK](https://github.com/solana-labs/solana-web3.js)
- [Next.js Documentation](https://nextjs.org/docs)
