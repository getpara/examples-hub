# Para Signing with Solana-Web3 Example

This example demonstrates how to use the Para SDK with the Solana web3.js library for signing messages and transactions on the Solana blockchain. It provides a simplified integration without the Anchor framework, focusing on core Solana operations:

- Message signing with Para wallet
- SOL transfers between accounts
- Direct interaction with Solana programs

Authentication is handled through the ParaModal using the Para solana-web3.js signer integration.

## Prerequisites

- **Node.js 18+** and npm/yarn
- **Para API Key**: Obtain your API key from the [Para Developer Portal](https://developer.getpara.com/)

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
- `npm run start` - Run the production server

## Project Structure

```
├── src/
│   ├── app/           # Next.js app pages
│   │   ├── message-signing/    # Message signing example
│   │   └── sol-transfer/       # SOL transfer example
│   ├── components/    # React components
│   ├── config/        # Configuration constants
│   ├── context/       # React context providers
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
└── styles/            # CSS styles
```

## Features Demonstrated

### Message Signing
- Sign arbitrary messages with Para wallet
- Display signed message and signature
- Verify signatures using nacl

### SOL Transfers
- Transfer SOL between accounts
- Build and sign transactions with Para wallet
- View transaction details on Solana explorer

## Key Differences from Anchor Example

This example is simpler and focuses on direct Solana web3.js usage:
- No Anchor framework dependency
- Direct transaction building with web3.js
- Fewer features but cleaner integration
- Suitable for projects that don't need Anchor

## Dependencies

- **@getpara/react-sdk**: Para wallet integration for React
- **@getpara/solana-web3.js-v1-integration**: Para signer for Solana web3.js v1
- **@solana/web3.js**: Solana JavaScript SDK (v1.98.2)
- **Next.js 15**: React framework
- **React 19**: UI library
- **tweetnacl**: Cryptographic library for signature verification

## Learn More

- [Para Documentation](https://docs.getpara.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
