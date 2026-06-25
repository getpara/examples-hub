# React + Next.js Examples

Comprehensive examples using `@getpara/react-sdk` with Next.js App Router.

## Folder Structure

### Para Modal

Pre-built authentication modal with different chain configurations.

| Example                 | Description                     | Live Demo                                                     |
| ----------------------- | ------------------------------- | ------------------------------------------------------------- |
| `para-modal`            | Basic integration, all features | [View](https://para-example-para-modal.vercel.app)            |
| `para-modal-evm`        | EVM chains only                 | [View](https://para-example-para-modal-evm.vercel.app)        |
| `para-modal-solana`     | Solana only                     | [View](https://para-example-para-modal-solana.vercel.app)     |
| `para-modal-cosmos`     | Cosmos chains only              | [View](https://para-example-para-modal-cosmos.vercel.app)     |
| `para-modal-multichain` | All chains enabled              | [View](https://para-example-para-modal-multichain.vercel.app) |
| `para-pregen-claim`     | Claim pre-generated wallets     | [View](https://para-example-para-pregen-claim.vercel.app)     |

### Custom Authentication UI

Build your own authentication interface using Para's auth methods.

| Example                | Description                           | Live Demo                                                    |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `custom-email-auth`    | Email OTP authentication              | [View](https://para-example-custom-email-auth.vercel.app)    |
| `custom-phone-auth`    | Phone/SMS authentication              | [View](https://para-example-custom-phone-auth.vercel.app)    |
| `custom-oauth-auth`    | OAuth providers (Google, Apple, etc.) | [View](https://para-example-custom-oauth-auth.vercel.app)    |
| `custom-combined-auth` | Multiple auth methods in one UI       | [View](https://para-example-custom-combined-auth.vercel.app) |
| `custom-oidc-auth`     | Custom OIDC via web-sdk (no provider) | [View](https://para-example-custom-oidc-auth.vercel.app)     |

### Blockchain Signers

Sign transactions with different libraries.

| Example                    | Library         | Chain   | Live Demo                                                        |
| -------------------------- | --------------- | ------- | ---------------------------------------------------------------- |
| `signer-ethers-v5`         | Ethers.js v5    | EVM     | [View](https://para-example-signer-ethers-v5.vercel.app)         |
| `signer-ethers-v6`         | Ethers.js v6    | EVM     | [View](https://para-example-signer-ethers-v6.vercel.app)         |
| `signer-viem-v2`           | Viem v2         | EVM     | [View](https://para-example-signer-viem-v2.vercel.app)           |
| `signer-cosmjs`            | CosmJS          | Cosmos  | [View](https://para-example-signer-cosmjs.vercel.app)            |
| `signer-solana-web3`       | @solana/web3.js | Solana  | [View](https://para-example-signer-solana-web3.vercel.app)       |
| `signer-solana-signers-v2` | @solana/signers | Solana  | [View](https://para-example-signer-solana-signers-v2.vercel.app) |
| `signer-solana-anchor`     | Anchor          | Solana  | [View](https://para-example-signer-solana-anchor.vercel.app)     |
| `signer-stellar-sdk`       | Stellar SDK     | Stellar | [View](https://para-example-signer-stellar-sdk.vercel.app)       |

### Wallet Connectors

Integrate Para as a wallet option in existing wallet connection UIs.

| Example                  | Library      | Description              | Live Demo                                                      |
| ------------------------ | ------------ | ------------------------ | -------------------------------------------------------------- |
| `connector-wagmi`        | Wagmi        | Para as Wagmi connector  | [View](https://para-example-connector-wagmi.vercel.app)        |
| `connector-rainbowkit`   | RainbowKit   | Para in RainbowKit modal | [View](https://para-example-connector-rainbowkit.vercel.app)   |
| `connector-reown-appkit` | Reown AppKit | Para in AppKit modal     | [View](https://para-example-connector-reown-appkit.vercel.app) |
| `connector-graz`         | Graz         | Para for Cosmos via Graz | [View](https://para-example-connector-graz.vercel.app)         |

### Account Abstraction

Gasless and sponsored transactions using smart accounts.

| Example                  | Provider   | Standard | Live Demo                                                                 |
| ------------------------ | ---------- | -------- | ------------------------------------------------------------------------- |
| `aa-alchemy-4337`        | Alchemy    | ERC-4337 | [View](https://para-example-aa-alchemy-4337.vercel.app)                   |
| `aa-alchemy-7702`        | Alchemy    | EIP-7702 | [View](https://para-example-aa-alchemy-7702.vercel.app)                   |
| `aa-zerodev-4337`        | ZeroDev    | ERC-4337 | [View](https://para-example-aa-zerodev-4337.vercel.app)                   |
| `aa-zerodev-7702`        | ZeroDev    | EIP-7702 | [View](https://para-example-aa-zerodev-7702.vercel.app)                   |
| `aa-gelato-4337`         | Gelato     | ERC-4337 | [View](https://para-example-aa-gelato-4337.vercel.app)                    |
| `aa-gelato-7702`         | Gelato     | EIP-7702 | [View](https://para-example-aa-gelato-7702.vercel.app)                    |
| `aa-porto-7702`          | Porto      | EIP-7702 | [View](https://para-example-aa-porto-7702.vercel.app)                     |
| `aa-rhinestone-4337`     | Rhinestone | ERC-4337 | [View](https://para-example-aa-rhinestone-4337.vercel.app)                |
| `aa-safe-4337`           | Safe       | ERC-4337 | [View](https://para-example-aa-safe-4337.vercel.app)                      |
| `aa-safe-4337-recovery`  | Safe       | ERC-4337 | [View](https://para-example-aa-safe-4337-recovery.vercel.app)             |
| `aa-safe-4337-recovery-custom-auth` | Safe | ERC-4337 | [View](https://para-example-aa-safe-4337-recovery-custom-auth.vercel.app) |
| `aa-thirdweb-4337`       | Thirdweb   | ERC-4337 | [View](https://para-example-aa-thirdweb-4337.vercel.app)                  |

## Quick Start

```bash
cd para-modal
yarn install
cp .env.example .env
# Add NEXT_PUBLIC_PARA_API_KEY to .env
yarn dev
```

Each example has its own README with specific configuration options.
