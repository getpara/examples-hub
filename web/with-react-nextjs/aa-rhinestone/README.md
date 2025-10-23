# Global Wallet Demo - Para + Rhinestone

This demo showcases how users can deposit tokens on any supported chain and spend them on any other supported chain, all with a single account address. Users can authenticate with Para Wallet and leverage Rhinestone's global wallet functionality for seamless cross-chain transactions.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet**: Para Wallet SDK
- **Wallet Management**: Para React SDK with Wagmi integration
- **Cross-Chain**: Rhinestone SDK
- **UI Components**: shadcn/ui with Tailwind CSS
- **Supported Chains**: Ethereum, Arbitrum, Base, Polygon, Optimism

## 🚀 Quick Start

### Prerequisites

1. **Para API Key**: Get one from [Para Dashboard](https://getpara.com)
2. **Rhinestone API Key**: Contact Rhinestone team for access
3. **Node.js**: Version 18 or higher

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd para
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Get your Para API key from https://getpara.com
NEXT_PUBLIC_PARA_API_KEY=""

# Get your API key from Rhinestone for orchestrator
RHINESTONE_API_KEY=your_rhinestone_api_key_here
```

4. Run the development server:

```bash
pnpm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.


### Authentication Flow
- Para Wallet SDK provides seamless wallet connection with `usePara()` hook
- Uses `openParaModal()` to open the wallet connection modal
- Integrates with standard Wagmi hooks for wallet state management

### Wallet Detection
- Direct Wagmi `useAccount()` hook for wallet state
- Para provider wraps the application for wallet functionality

## 🎯 How It Works

### The Global Wallet Flow

1. **Authenticate**: Users connect via Para Wallet (supports multiple wallet types)
2. **Create Account**: Generate a Rhinestone account (works across all chains)
3. **User Deposits**: User sends tokens to the account on any chain
4. **Cross-Chain Spending**: Spend those tokens on any other chain

### Example Scenario

```typescript
// User deposits 10 USDC to global wallet address on Arbitrum
// Later, user wants to send 5 USDC to someone on Base

const transaction = await rhinestoneAccount.sendTransaction({
  sourceChains: [arbitrum], // Look for tokens on Arbitrum
  targetChain: base, // Execute transaction on Base
  calls: [
    /* USDC transfer on Base */
  ],
  tokenRequests: [{ address: usdcOnBase, amount: 5000000n }],
});

// Rhinestone automatically:
// 1. Uses USDC from Arbitrum
// 2. Bridges it to Base
// 3. Executes the transfer
// All in a single transaction!
```

### Resources

- [Para Documentation](https://docs.getpara.com)
- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [Wagmi Documentation](https://wagmi.sh)
- [shadcn/ui Documentation](https://ui.shadcn.com)
---
