# Para Modal EVM Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-evm.vercel.app)

A minimal Next.js example showing how to open Para Modal for EVM wallet connection and sign a message with Wagmi.

## What This Example Shows

- Configuring `ParaProvider` with the EVM connector runtime
- Opening Para Modal with `useModal`
- Reading Para connection and wallet state with `useAccount` and `useWallet`
- Signing an EVM message with Wagmi's `useSignMessage`
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
- Allowed EVM external wallets
- WalletConnect project ID, if your enabled EVM wallets require WalletConnect

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
src/app/page.tsx                          # Server page metadata and entry
src/components/ParaProvider.tsx           # ParaProvider with EVM connector config
src/components/ParaModalEvmExample.tsx    # Client orchestration
src/hooks/useParaModalEvmWallet.ts        # Para modal, account, and wallet state
src/hooks/useSignHelloWorld.ts            # Wagmi EVM message signing
src/components/ui/*                       # Replaceable example UI
```

## EVM Configuration

The `externalWalletConfig` block passes the Wagmi connector chain configuration that the runtime needs:

```tsx
externalWalletConfig={{
  evmConnector: {
    config: {
      chains: [sepolia],
    },
  },
}}
```

Wallet availability, app identity, auth methods, WalletConnect project ID, and modal presentation are controlled by the Para Developer Portal project for the API key.

## Dependency Notes

This example imports from the catch-all `@getpara/react-sdk` package. Until the SDK package export graph is narrowed, production builds must include several modules that are build-reachable through SDK barrel exports even though this page only renders an EVM modal flow:

- `@metamask/delegation-toolkit`
- `ethers`
- `@stellar/stellar-sdk`
- `@wagmi/core`

These dependencies can be revisited after the SDK package dependency and export-boundary cleanup work is complete.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
