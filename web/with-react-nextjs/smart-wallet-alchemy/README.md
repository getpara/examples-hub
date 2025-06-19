# Smart Wallet Demo with Para and Alchemy

This is a Next.js application that demonstrates smart wallet (Account Abstraction) functionality using Para SDK and
Alchemy's Account Kit. Users can create and manage ERC-4337 smart wallets, send and receive ETH, and enjoy gasless
transactions through Alchemy's gas sponsorship.

## Features

- 🔐 Connect with external wallets (MetaMask, Coinbase, Rainbow, etc.) or email/phone
- 🏦 Create up to 3 smart wallets per EOA (Externally Owned Account)
- 💸 Send and receive ETH with gasless transactions
- 📊 Real-time balance tracking with USD conversion
- 🎨 QR code generation for receiving assets
- 🛡️ Secure authentication with route protection

## Setup

### Prerequisites

- Node.js 18+ and Yarn
- Para API key from [Para Dashboard](https://developer.getpara.com)
- Alchemy API key and Gas Policy ID from [Alchemy Dashboard](https://dashboard.alchemy.com)
- WalletConnect Project ID (optional, for WalletConnect support)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Para Configuration
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=DEV # or PROD

# Alchemy Configuration
NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID=your_gas_policy_id

# Optional: WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Installation

```bash
# Install dependencies
yarn install

# Run the development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## How It Works

1. **Connect Wallet**: Users connect their EOA wallet using Para's modal (supports multiple wallet providers)
2. **Create Smart Wallet**: Once connected, users can create smart wallets that are controlled by their EOA
3. **Manage Assets**: View balances, send ETH to other addresses, and receive assets via QR code
4. **Gasless Transactions**: All smart wallet transactions are sponsored by Alchemy's gas manager

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Para SDK** - Wallet connection and management
- **Alchemy Account Kit** - Smart wallet infrastructure (ERC-4337)
- **Viem** - Ethereum interactions
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
