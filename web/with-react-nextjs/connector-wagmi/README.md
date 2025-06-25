# Para + Wagmi Connector Example

This example demonstrates how to use Para as a wallet connector with Wagmi in a Next.js application, allowing users to connect with Para alongside other wallet options like MetaMask and WalletConnect.

## What This Example Shows

- **Custom wallet modal** with Para as a connector option
- **Wagmi hooks** for all blockchain interactions
- **ETH transfers** on Sepolia testnet using wagmi's transaction hooks
- **Balance management** with real-time updates
- **Multiple wallet options** in a unified interface

## Prerequisites

- Node.js 18+ and npm/yarn
- Para API Key from the [Para developer portal](https://developer.getpara.com)
- WalletConnect Project ID (optional, for WalletConnect support)

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   ```

3. Run the development server:

   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Connect Wallet**: Click "Connect Wallet" to open the custom modal
2. **Choose Connector**: Select Para for social login or other wallet options
3. **Send Transactions**: Enter recipient address and ETH amount
4. **View Balance**: Real-time balance updates using wagmi's useBalance hook
5. **Disconnect**: Click the connected address to open settings and disconnect

## Key Features

- Custom modal implementation (not using Para's built-in modal)
- Para works as a standard wagmi connector
- All blockchain operations use wagmi hooks:
  - `useAccount` for connection status
  - `useConnect` / `useDisconnect` for wallet management
  - `useSendTransaction` for sending ETH
  - `useBalance` for fetching balances

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run linter
- `yarn typecheck` - Check TypeScript types

## Learn More

- [Para SDK Documentation](https://docs.usepara.com)
- [Wagmi Documentation](https://wagmi.sh)
