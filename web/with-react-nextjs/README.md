# React + Next.js Examples

Comprehensive examples using `@getpara/react-sdk` with Next.js App Router.

## Folder Structure

### Para Modal
Pre-built authentication modal with different chain configurations.

| Example | Description |
|---------|-------------|
| `para-modal` | Basic integration, all features |
| `para-modal-evm` | EVM chains only |
| `para-modal-solana` | Solana only |
| `para-modal-cosmos` | Cosmos chains only |
| `para-modal-multichain` | All chains enabled |
| `para-pregen-claim` | Claim pre-generated wallets |

### Custom Authentication UI
Build your own authentication interface using Para's auth methods.

| Example | Description |
|---------|-------------|
| `custom-email-auth` | Email OTP authentication |
| `custom-phone-auth` | Phone/SMS authentication |
| `custom-oauth-auth` | OAuth providers (Google, Apple, etc.) |
| `custom-combined-auth` | Multiple auth methods in one UI |

### Blockchain Signers
Sign transactions with different libraries.

| Example | Library | Chain |
|---------|---------|-------|
| `signer-ethers-v5` | Ethers.js v5 | EVM |
| `signer-ethers-v6` | Ethers.js v6 | EVM |
| `signer-viem-v2` | Viem v2 | EVM |
| `signer-cosmjs` | CosmJS | Cosmos |
| `signer-solana-web3` | @solana/web3.js | Solana |
| `signer-solana-signers-v2` | @solana/signers | Solana |
| `signer-solana-anchor` | Anchor | Solana |

### Wallet Connectors
Integrate Para as a wallet option in existing wallet connection UIs.

| Example | Library | Description |
|---------|---------|-------------|
| `connector-wagmi` | Wagmi | Para as Wagmi connector |
| `connector-rainbowkit` | RainbowKit | Para in RainbowKit modal |
| `connector-reown-appkit` | Reown AppKit | Para in AppKit modal |
| `connector-graz` | Graz | Para for Cosmos via Graz |

### Account Abstraction
Gasless and sponsored transactions using smart accounts.

| Example | Provider | Standard |
|---------|----------|----------|
| `aa-alchemy-4337` | Alchemy | ERC-4337 |
| `aa-alchemy-7702` | Alchemy | EIP-7702 |
| `aa-zerodev-4337` | ZeroDev | ERC-4337 |
| `aa-zerodev-7702` | ZeroDev | EIP-7702 |
| `aa-gelato-4337` | Gelato | ERC-4337 |
| `aa-gelato-7702` | Gelato | EIP-7702 |
| `aa-porto-7702` | Porto | EIP-7702 |
| `aa-rhinestone-4337` | Rhinestone | ERC-4337 |
| `aa-thirdweb-4337` | Thirdweb | ERC-4337 |

## Quick Start

```bash
cd para-modal
yarn install
cp .env.example .env
# Add NEXT_PUBLIC_PARA_API_KEY to .env
yarn dev
```

Each example has its own README with specific configuration options.
