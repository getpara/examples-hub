# Para Modal + Multichain Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-multichain.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with multichain wallets (EVM, Cosmos, Solana) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with multichain connector runtime configuration
- Configuring allowed external wallets in the Para Developer Portal
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Per-chain signing with wagmi, Cosmos amino signer, and Solana signer

## Setup

1. Create or update a Para Developer Portal project for this API key. Configure the app name, auth methods, modal presentation, allowed external wallets, and WalletConnect project ID in Developer Portal.

2. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

These are the only environment variables read by the app. `NEXT_PUBLIC_PARA_API_KEY` selects the Developer Portal project and `NEXT_PUBLIC_PARA_ENVIRONMENT` selects the Para environment.

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
│   ├── ParaProvider.tsx        # Para SDK provider with multichain config
│   ├── layout/Header.tsx       # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
├── hooks/
│   └── useMultichainSign.ts    # Custom hook for signing
```

## Multichain Configuration

This example keeps chain and network wiring in code because the EVM, Cosmos, and Solana provider libraries need runtime connector setup. It expects wallet availability, WalletConnect settings, app identity, auth methods, and modal presentation to be configured in the Para Developer Portal for the API key.

No `config` or `configOverrides` are set in this example. Persistent configuration stays in Developer Portal.

```typescript
externalWalletConfig={{
  evmConnector: {
    config: { chains: [mainnet, polygon, sepolia, celo] },
  },
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
    },
  },
  solanaConnector: {
    config: {
      endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
      chain: WalletAdapterNetwork.Devnet,
    },
  },
}}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
