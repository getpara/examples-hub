# Para Modal Multichain Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-multichain.vercel.app)

A minimal Next.js example showing how to open Para Modal for EVM, Cosmos, and Solana wallet connection and sign a message on the connected chain.

## What This Example Shows

- Configuring `ParaProvider` with EVM, Cosmos, and Solana connector runtimes
- Opening Para Modal with `useModal`
- Reading Para connection and wallet state with `useAccount` and `useWallet`
- Signing messages with Wagmi, CosmJS amino signing, and the Para Solana signer
- Keeping SDK logic in hooks so the UI can be replaced by your app's components

## Setup

Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the project used by that API key in the Para Developer Portal:

- App name and display identity
- Branding, logo, and modal presentation
- Allowed auth methods and login options
- Allowed EVM, Cosmos, and Solana external wallets
- WalletConnect project ID, if your enabled wallets require WalletConnect

Install and run the production build locally:

```bash
yarn install
yarn build
yarn start
```

For development:

```bash
yarn dev
```

## Key Files

```text
src/app/page.tsx                              # Server page metadata and entry
src/components/ParaProvider.tsx               # ParaProvider with multichain config
src/components/ParaModalMultichainExample.tsx # Client orchestration
src/hooks/useParaModalMultichainWallet.ts     # Para modal, account, and wallet state
src/hooks/useMultichainSign.ts                # EVM, Cosmos, and Solana message signing
src/components/ui/*                           # Replaceable example UI
```

## Multichain Configuration

This example keeps connector runtime setup in code because the EVM, Cosmos, and Solana provider libraries need chain-specific wiring:

```tsx
externalWalletConfig={{
  evmConnector: {
    config: {
      chains: [mainnet, polygon, sepolia, celo],
    },
  },
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
      multiChain: false,
      onSwitchChain: () => {},
    },
  },
  solanaConnector: {
    config: {
      endpoint,
      chain: solanaNetwork,
    },
  },
}}
```

Wallet availability, app identity, auth methods, WalletConnect project ID, and modal presentation are controlled by the Para Developer Portal project for the API key.

## Dependency Notes

This example imports from the catch-all `@getpara/react-sdk` package. Until the SDK package export graph is narrowed, production builds must include several modules that are build-reachable through SDK barrel exports:

- `@metamask/delegation-toolkit`
- `ethers`
- `@stellar/stellar-sdk`
- `@wagmi/core`

The `graz --generate` postinstall command also requires `arg` and `starknet`, so they remain direct dependencies even though the app UI does not import them directly. The app does import `@solana/rpc` directly for the Para Solana signer RPC object, so it is declared directly as well.

These dependencies can be revisited after the SDK package dependency and export-boundary cleanup work is complete.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
