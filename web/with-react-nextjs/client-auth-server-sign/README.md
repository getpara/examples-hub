# Para Client Auth + Server Sign (Ethers.js) Example

This example demonstrates how to use Para Embedded Wallets with client-side authentication and server-side transaction
signing in a Next.js application.

## What This Example Shows

- **Client-side authentication** using Para Modal
- **Server-side transaction signing** using exported sessions
- **Para SDK Alpha version** with the new `ParaProvider` configuration
- **Custom hooks** for balance management and ethers provider
- **ETH transfers** on Sepolia testnet with real-time balance updates

## Prerequisites

- Node.js 18+ and npm/yarn
- Para API Key from the [Para developer portal](https://developer.getpara.com)

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
   NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   ```

3. Run the development server:

   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Connect Wallet**: User authenticates via Para Modal on the client
2. **Enter Transaction Details**: Specify recipient address and ETH amount
3. **Export Session**: Client exports the Para session
4. **Server Signs**: API route imports the session and signs the transaction
5. **Broadcast**: Signed transaction is sent to the blockchain
6. **View Result**: Transaction hash is displayed with link to Etherscan

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run linter
- `yarn typecheck` - Check TypeScript types

## Learn More

- [Para SDK Documentation](https://docs.usepara.com)
