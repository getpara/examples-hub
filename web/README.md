# Web Examples

Browser-based web application examples using `@getpara/react-sdk` and `@getpara/web-sdk`.

## Folder Structure

```
web/
├── with-react-nextjs/           # React + Next.js (comprehensive)
│   │
│   │── Para Modal
│   ├── para-modal               # Basic Para Modal integration
│   ├── para-modal-evm           # EVM chains only
│   ├── para-modal-solana        # Solana only
│   ├── para-modal-cosmos        # Cosmos chains only
│   ├── para-modal-multichain    # All chains enabled
│   ├── para-pregen-claim        # Claim pre-generated wallets
│   │
│   │── Custom Authentication UI
│   ├── custom-email-auth        # Build your own email auth UI
│   ├── custom-phone-auth        # Build your own phone auth UI
│   ├── custom-oauth-auth        # Build your own OAuth UI
│   ├── custom-combined-auth     # Combine multiple auth methods
│   │
│   │── Blockchain Signers
│   ├── signer-ethers-v5         # Sign with Ethers.js v5
│   ├── signer-ethers-v6         # Sign with Ethers.js v6
│   ├── signer-viem-v2           # Sign with Viem v2
│   ├── signer-cosmjs            # Sign with CosmJS
│   ├── signer-solana-web3       # Sign with @solana/web3.js
│   ├── signer-solana-signers-v2 # Sign with @solana/signers
│   ├── signer-solana-anchor     # Sign with Anchor framework
│   │
│   │── Wallet Connectors
│   ├── connector-wagmi          # Wagmi integration
│   ├── connector-rainbowkit     # RainbowKit integration
│   ├── connector-reown-appkit   # Reown AppKit integration
│   ├── connector-graz           # Graz (Cosmos) integration
│   │
│   │── Account Abstraction
│   ├── aa-alchemy-4337          # Alchemy (ERC-4337)
│   ├── aa-alchemy-7702          # Alchemy (EIP-7702)
│   ├── aa-zerodev-4337          # ZeroDev (ERC-4337)
│   ├── aa-zerodev-7702          # ZeroDev (EIP-7702)
│   ├── aa-gelato-4337           # Gelato (ERC-4337)
│   ├── aa-gelato-7702           # Gelato (EIP-7702)
│   ├── aa-porto-7702            # Porto (EIP-7702)
│   ├── aa-rhinestone-4337       # Rhinestone (ERC-4337)
│   └── aa-thirdweb-4337         # Thirdweb (ERC-4337)
│
├── with-react-vite/             # React + Vite starter
├── with-react-tanstack-start/   # React + TanStack Start
├── with-svelte-vite/            # Svelte + Vite (custom UI)
├── with-vue-vite/               # Vue + Vite (custom UI)
├── with-chrome-extension/       # Chrome browser extension
└── with-pwa/                    # Progressive Web App
```

## Quick Start

Most examples use:
```bash
yarn install
yarn dev
```

Each example has its own README with specific setup instructions.

## Choosing an Example

| If you want to...                    | Start with                     |
|--------------------------------------|--------------------------------|
| Get started quickly                  | `with-react-nextjs/para-modal` |
| Use a specific chain                 | `para-modal-{evm,solana,cosmos}` |
| Build custom auth UI                 | `custom-*-auth` examples       |
| Integrate with existing wallet UI    | `connector-*` examples         |
| Add gasless/sponsored transactions   | `aa-*` examples                |
| Use non-React framework              | `with-svelte-vite` or `with-vue-vite` |
| Build a browser extension            | `with-chrome-extension`        |
