# Para + Reown AppKit Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-reown-appkit.vercel.app)

A Next.js example demonstrating Para integration with Reown AppKit for wallet connection.

## What This Example Shows

- Setting up Reown AppKit with Para as a custom wallet connector
- Using AppKit's `useAppKit` and `useAppKitAccount` hooks
- Displaying connected wallet information
- Opening the AppKit modal for wallet management

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with AppKitProvider
│   └── page.tsx                # Main page with wallet display
├── components/
│   ├── layout/
│   │   ├── AppWrapper.tsx      # App wrapper component
│   │   └── Header.tsx          # Header with connect button
│   └── ui/
│       ├── ConnectWalletCard.tsx
│       └── WalletDisplay.tsx   # Connected wallet display
├── config/
│   └── appkit.ts               # AppKit configuration
├── context/
│   └── AppKitProvider.tsx      # Reown AppKit provider
└── lib/
    └── para/client.ts          # Para client initialization
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Reown AppKit Documentation](https://docs.reown.com/appkit/overview)
- [wagmi Documentation](https://wagmi.sh)
