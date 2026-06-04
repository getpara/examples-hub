# Para + Wagmi Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-wagmi.vercel.app)

A Next.js example demonstrating Para integration with Wagmi for wallet connection and ETH transfers.

## What This Example Shows

- Setting up wagmi providers with Para as a wallet connector
- Custom wallet connection modal with Para and other wallet options
- Checking connection state with wagmi's `useAccount`
- Sending ETH transactions with wagmi's `useSendTransaction`

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Developer Portal Configuration

This example expects Para app identity, authentication methods, theme, and wallet visibility to be configured in the Para Developer Portal for the API key. The Para wagmi connector still requires an `appName` option to initialize the connector modal; keep it aligned with the Developer Portal display identity. `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is kept because the standalone wagmi `walletConnect` connector requires it; it is not used as Para Portal-owned external wallet config. `NEXT_PUBLIC_SEPOLIA_RPC_URL` is kept for wagmi Sepolia network transport.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Main page with transfer flow
├── components/
│   ├── ConnectWalletModal.tsx  # Custom wallet connection modal
│   ├── layout/
│   │   ├── AppWrapper.tsx      # Modal context wrapper
│   │   └── Header.tsx          # Header with connect button
│   └── ui/
│       ├── BalanceCard.tsx     # Wallet balance display
│       ├── ConnectWalletCard.tsx
│       ├── TransferForm.tsx    # ETH transfer form
│       └── TransactionHash.tsx # Transaction result display
├── config/
│   ├── constants.ts            # Environment config
│   └── wagmi.ts                # wagmi + Para connector config
├── context/
│   ├── ModalContext.tsx        # Modal state management
│   ├── QueryProvider.tsx       # React Query provider
│   └── WagmiProvider.tsx       # wagmi provider setup
└── lib/
    └── para/client.ts          # Para client initialization
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [wagmi Documentation](https://wagmi.sh)
