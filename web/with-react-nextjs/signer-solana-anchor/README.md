# Para Signing with Anchor Example

This example demonstrates how to use the Para SDK with the Anchor framework for signing messages and transactions on Solana. It provides multiple example transaction types using the Para Anchor signer including:

- Message signing with Para wallet
- SOL transfers
- Token program interactions (create token, mint tokens)
- Custom Anchor program interactions

Authentication is handled through the ParaModal. This example uses the Anchor framework which requires the Para solana-web3.js signer integration.

## Prerequisites

- **Node.js 18+** and npm/yarn
- **Para API Key**: Obtain your API key from the [Para Developer Portal](https://developer.getpara.com/)
- **Anchor CLI** (optional, for building/deploying programs): Install with `cargo install --git https://github.com/coral-xyz/anchor anchor-cli`

## Environment Variables

Create a `.env.local` file in the project root with:

```env
# Required: Your Para API key
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here

# Optional: Para environment (defaults to BETA)
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA

# Optional: Solana RPC URL (defaults to https://api.devnet.solana.com/)
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com/
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Example

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Connect your Para wallet using the "Connect Wallet" button

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run anchor:build` - Build the Anchor program
- `npm run anchor:deploy` - Deploy the Anchor program to devnet
- `npm run anchor:build-deploy` - Build and deploy in one command

## Project Structure

```
├── programs/           # Anchor program source code
│   └── transfer_tokens/
├── src/
│   ├── app/           # Next.js app pages
│   │   ├── message-signing/    # Message signing example
│   │   ├── sol-transfer/       # SOL transfer example
│   │   ├── program-create-token/  # Token creation example
│   │   └── program-mint-token/    # Token minting example
│   ├── components/    # React components
│   ├── config/        # Configuration constants
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── idl/          # Anchor IDL files
│   └── lib/          # Utility functions
└── target/           # Anchor build artifacts
```

## Features Demonstrated

### Message Signing
- Sign arbitrary messages with Para wallet
- Verify signatures on-chain

### SOL Transfers
- Transfer SOL between accounts
- View transaction details on explorer

### Token Program Integration
- Create new SPL tokens
- Mint tokens to accounts
- Uses Anchor framework for program interactions

### Custom Anchor Program
- Deployed program ID: `7aZTQdMeajFATgMKS7h7mGWVqh1UaRnWt1Pf8mnvBDkk`
- Example of custom on-chain program integration

## Dependencies

- **@getpara/react-sdk**: Para wallet integration for React
- **@getpara/solana-web3.js-v1-integration**: Para signer for Solana web3.js v1
- **@coral-xyz/anchor**: Anchor framework for Solana programs
- **@solana/web3.js**: Solana JavaScript SDK (v1.69.0)
- **Next.js 15**: React framework
- **React 19**: UI library

## Learn More

- [Para Documentation](https://docs.getpara.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
