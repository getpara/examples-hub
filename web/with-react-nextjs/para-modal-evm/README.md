# Para Modal + EVM Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-evm.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with EVM wallets (MetaMask) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with EVM connector runtime configuration
- Configuring allowed external wallets in the Para Developer Portal
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Signing messages with `useSignMessage`

## Setup

1. Create a `.env` file with your Para API key and environment:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

2. In the Para Developer Portal, configure the project used by that API key:

- App name and display identity
- Branding, logo, and modal presentation
- Allowed auth methods and login options
- Allowed EVM external wallets
- WalletConnect project ID, if your enabled EVM wallets require WalletConnect

3. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ParaProvider
│   └── page.tsx                # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx        # Para SDK provider with EVM config
│   ├── layout/Header.tsx       # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
├── hooks/
│   └── useSignHelloWorld.ts    # Custom hook for signing
```

## EVM Configuration

This example keeps only EVM connector runtime setup in code. The `externalWalletConfig` block passes the Wagmi connector chain configuration that the runtime needs; it is not used for project-owned wallet settings. Wallet availability, app identity, auth methods, WalletConnect project ID, and modal presentation should be configured in the Para Developer Portal for the API key:

```typescript
externalWalletConfig={{
  evmConnector: {
    config: {
      chains: [sepolia],
    },
  },
}}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
