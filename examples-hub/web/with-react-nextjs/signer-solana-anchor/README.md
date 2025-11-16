# Signer Solana Anchor

This example demonstrates how to integrate Para SDK with the Anchor framework for Solana development in a Next.js application. It showcases message signing, SOL transfers, and token program interactions using Para's Solana signer integration with Anchor.

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

- `@coral-xyz/anchor` (v0.31.0) - Anchor framework for Solana programs
- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@getpara/solana-web3.js-v1-integration` (v2.0.0-alpha.26) - Para Solana signer integration
- `@solana/web3.js` (v1.69.0) - Solana Web3 JavaScript API
- `@solana/spl-token` (v0.4.13) - Solana SPL Token library
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `next` (v15.1.5) - React framework

## Key Files

- `src/hooks/useParaSigner.ts` - Para Solana signer hook
- `src/hooks/useSolana.ts` - Solana connection and program hooks
- `src/lib/anchor/program.ts` - Anchor program setup
- `src/idl/transfer_tokens.ts` - Anchor IDL for token program
- `src/app/message-signing/page.tsx` - Message signing example
- `src/app/sol-transfer/page.tsx` - SOL transfer example
- `src/app/program-create-token/page.tsx` - Token creation example
- `src/app/program-mint-token/page.tsx` - Token minting example
- `programs/transfer_tokens/src/lib.rs` - Anchor program source

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Next.js Documentation](https://nextjs.org/docs)
