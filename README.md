# Para Examples Hub

A collection of example applications demonstrating how to integrate `@getpara/*` SDKs across platforms and frameworks.

> **Note:** All examples use the **2.0.0-alpha** version of `@getpara/*` SDKs.

## Folder Index

```
examples-hub/
├── web/                          # Web application examples
│   ├── with-react-nextjs/        # React + Next.js (comprehensive examples)
│   │   ├── para-modal            # Basic Para Modal integration
│   │   ├── para-modal-evm        # EVM-focused modal
│   │   ├── para-modal-solana     # Solana-focused modal
│   │   ├── para-modal-cosmos     # Cosmos-focused modal
│   │   ├── para-modal-multichain # Multi-chain modal
│   │   ├── para-pregen-claim     # Pre-generated wallet claiming
│   │   ├── custom-email-auth     # Custom email authentication UI
│   │   ├── custom-phone-auth     # Custom phone authentication UI
│   │   ├── custom-oauth-auth     # Custom OAuth authentication UI
│   │   ├── custom-combined-auth  # Combined auth methods
│   │   ├── signer-ethers-v5      # Ethers.js v5 signing
│   │   ├── signer-ethers-v6      # Ethers.js v6 signing
│   │   ├── signer-viem-v2        # Viem v2 signing
│   │   ├── signer-cosmjs         # CosmJS signing
│   │   ├── signer-solana-web3    # Solana Web3.js signing
│   │   ├── signer-solana-signers-v2  # Solana Signers v2
│   │   ├── signer-solana-anchor  # Solana Anchor framework
│   │   ├── connector-wagmi       # Wagmi connector
│   │   ├── connector-rainbowkit  # RainbowKit connector
│   │   ├── connector-reown-appkit # Reown AppKit connector
│   │   ├── connector-graz        # Graz (Cosmos) connector
│   │   ├── aa-alchemy-4337       # Alchemy Account Abstraction (ERC-4337)
│   │   ├── aa-alchemy-7702       # Alchemy Account Abstraction (EIP-7702)
│   │   ├── aa-zerodev-4337       # ZeroDev (ERC-4337)
│   │   ├── aa-zerodev-7702       # ZeroDev (EIP-7702)
│   │   ├── aa-gelato-4337        # Gelato (ERC-4337)
│   │   ├── aa-gelato-7702        # Gelato (EIP-7702)
│   │   ├── aa-porto-7702         # Porto (EIP-7702)
│   │   ├── aa-rhinestone-4337    # Rhinestone (ERC-4337)
│   │   └── aa-thirdweb-4337      # Thirdweb (ERC-4337)
│   ├── with-react-vite/          # React + Vite (Para Modal)
│   ├── with-react-tanstack-start/ # React + TanStack Start
│   ├── with-svelte-vite/         # Svelte + Vite (custom UI)
│   ├── with-vue-vite/            # Vue + Vite (custom UI)
│   ├── with-chrome-extension/    # Chrome browser extension
│   └── with-pwa/                 # Progressive Web App
│
├── mobile/                       # Mobile application examples
│   ├── with-expo-one-click-login/ # Expo with one-click login
│   ├── with-react-native/        # React Native
│   ├── with-flutter/             # Flutter
│   └── with-swift/               # Native Swift (iOS)
│
├── server/                       # Server-side examples
│   ├── rest-with-node/           # REST API with Node.js
│   ├── with-node/                # Node.js
│   ├── with-bun/                 # Bun runtime
│   └── with-deno/                # Deno runtime
│
├── defi-integrations/            # DeFi protocol integrations
│   ├── with-jupiter-dex-api/     # Jupiter DEX (Solana swaps)
│   ├── with-squid-router-api/    # Squid Router (cross-chain swaps)
│   └── with-relay-bridge-api/    # Relay Bridge (bridging)
│
└── advanced-patterns/            # Advanced architectural patterns
    ├── client-auth-server-sign/  # Client auth + server-side signing
    └── with-bulk-pregen/         # Bulk wallet pre-generation
```

## Getting Started

1. Navigate to an example:
   ```bash
   cd web/with-react-nextjs/para-modal
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Run the example (check individual README for specific commands):
   ```bash
   yarn dev
   ```

## Resources

- **Docs:** [docs.getpara.com](https://docs.getpara.com)
- **API Keys:** [developer.getpara.com](https://developer.getpara.com)
- **Support:** [support@getpara.com](mailto:support@getpara.com)
