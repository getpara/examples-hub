# Para Modal Solana Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-solana.vercel.app)

A minimal Next.js example showing how to open Para Modal for Solana wallet connection and sign a message.

## What This Example Shows

- Configuring `ParaProvider` with the Solana connector runtime
- Opening Para Modal with `useModal`
- Reading Para connection and wallet state with `useAccount` and `useWallet`
- Signing a Solana message with `useParaSolanaSigner` or the Solana wallet adapter
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
- Allowed Solana external wallets
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
src/components/ParaProvider.tsx               # ParaProvider with Solana connector config
src/components/ParaModalSolanaExample.tsx     # Client orchestration
src/hooks/useParaModalSolanaWallet.ts         # Para modal, account, and wallet state
src/hooks/useSignHelloWorld.ts                # Solana message signing
src/components/ui/*                           # Replaceable example UI
```

## Solana Configuration

The Solana connector needs runtime endpoint and network setup in code:

```tsx
externalWalletConfig={{
  wallets: ["GLOW", "PHANTOM", "BACKPACK", "SOLFLARE"],
  includeWalletVerification: true,
  solanaConnector: {
    config: {
      endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
      chain: WalletAdapterNetwork.Devnet,
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

The app imports `@solana/rpc` directly for the Para Solana signer RPC object, so it is declared directly.

These dependencies can be revisited after the SDK package dependency and export-boundary cleanup work is complete.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com)
- [Next.js Documentation](https://nextjs.org/docs)
