# Para Modal + Multichain + Vite Example

A minimal React + Vite example demonstrating Para Modal integration with multichain wallets (EVM, Cosmos, Solana) for wallet connection and message signing.

## What This Example Shows

- Setting up `ParaProvider` with Vite and node polyfills
- Configuring multichain wallet support (EVM, Cosmos, Solana)
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving wallet address with `useWallet`
- Signing messages with `useSignMessage`
- Custom hooks pattern with `useSignHelloWorld`

## Setup

1. Create a `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point with providers
├── components/
│   ├── ParaProvider.tsx       # Para SDK + Query provider with multichain config
│   ├── layout/Header.tsx      # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx    # Connect wallet card
│       ├── WalletInfo.tsx     # Connected wallet display
│       └── SignMessage.tsx    # Sign message UI
├── hooks/
│   └── useSignHelloWorld.ts   # Custom hook for signing
├── lib/
│   └── e2e-helpers.ts         # E2E testing utilities
└── styles/
    └── globals.css            # Tailwind styles
```

## Developer Portal Configuration

This example expects persistent app settings to be configured on the API key in the [Para Developer Portal](https://developer.getpara.com). Set the app name, branding, logo, theme, OAuth providers, email and phone login availability, 2FA policy, modal auth layout, external wallet list, and WalletConnect project ID there.

The provider keeps only runtime modal behavior in `paraModalConfig`: `onRampTestMode` and `recoverySecretStepEnabled`. It does not pass `config` or `configOverrides`, so Developer Portal settings remain the source of truth.

## Multichain Connector Configuration

This example wires the EVM, Cosmos, and Solana connector providers so Portal-enabled external wallets can connect across multiple chains:

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

## Vite Configuration

This example uses `vite-plugin-node-polyfills` to polyfill Node.js built-ins required by blockchain libraries:

```typescript
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), nodePolyfills(), tailwindcss()],
});
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Vite Documentation](https://vitejs.dev)
