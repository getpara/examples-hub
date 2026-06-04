# Para Modal Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal.vercel.app)

A minimal Next.js example demonstrating Para Modal integration for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` as a client component
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Signing messages with `useSignMessage`

## Setup

1. Create a `.env` file with the public API key and environment for your Para Developer Portal app:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Developer Portal Configuration

This example expects persistent app settings to be configured on the API key in the Para Developer Portal. Configure the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility in the Portal.

The local `ParaProvider` only passes the API key, environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility. This example does not use `configOverrides`, so Portal settings are the source of truth for persistent app, auth, branding, and wallet configuration.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ParaProvider
│   └── page.tsx                # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx        # Para SDK provider setup
│   ├── layout/Header.tsx       # Header with connect button
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
- [Next.js Documentation](https://nextjs.org/docs)
