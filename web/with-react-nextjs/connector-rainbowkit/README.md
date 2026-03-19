# Para + RainbowKit Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-rainbowkit.vercel.app)

A minimal Next.js example demonstrating Para integration with RainbowKit for wallet connection and message signing.

## What This Example Shows

- Setting up wagmi + RainbowKit providers with Para wallet connector
- Using RainbowKit's `ConnectButton` for authentication
- Checking connection state with wagmi's `useAccount`
- Signing messages with wagmi's `useSignMessage`

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
│   ├── layout.tsx              # Root layout with Providers + Header
│   └── page.tsx                # Main page with auth flow
├── client/
│   └── wagmi.ts                # wagmi + Para connector config
├── components/
│   ├── Providers.tsx           # wagmi + RainbowKit providers
│   ├── layout/Header.tsx       # Header with ConnectButton
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
└── hooks/
    └── useSignHelloWorld.ts    # Custom hook for signing
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [RainbowKit Documentation](https://rainbowkit.com/docs)
- [wagmi Documentation](https://wagmi.sh)
