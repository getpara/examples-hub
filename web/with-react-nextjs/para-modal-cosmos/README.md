# Para Modal + Cosmos Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-cosmos.vercel.app)

A minimal Next.js example showing Para Modal with Cosmos wallets and ADR-036 message signing. Para SDK and Graz logic lives in hooks and provider setup, while the UI components receive plain props.

## Features

- Para Modal connection flow
- Cosmos external wallet connector configuration
- Cosmos wallet address display
- ADR-036 arbitrary message signing with Amino encoding
- Portal-driven persistent app, auth, branding, and wallet configuration
- Clean separation between SDK hooks and presentation components

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, allowed external wallets, OAuth providers, email and phone login options, and WalletConnect settings when applicable. This example keeps the Cosmos connector chain wiring in code because the connector needs runtime chain setup.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Key Files

```text
src/
├── app/
│   ├── layout.tsx                    # Root layout, metadata, ParaProvider, SDK styles
│   └── page.tsx                      # Server entry that renders the client example
├── components/
│   ├── ParaModalCosmosExample.tsx    # Client orchestration
│   ├── ParaProvider.tsx              # Para SDK provider with Cosmos connector config
│   ├── layout/Header.tsx             # Prop-only header
│   └── ui/
│       ├── ConnectCard.tsx           # Prop-only connect card
│       ├── WalletInfo.tsx            # Prop-only Cosmos wallet display
│       └── SignMessage.tsx           # Prop-only ADR-036 signing UI
├── hooks/
│   ├── useParaModalCosmosWallet.ts   # Copyable modal connection state
│   └── useSignHelloWorld.ts          # Copyable ADR-036 signing logic
└── styles/globals.css                # Para example tokens and UI primitives
```

## Cosmos Configuration

`ParaProvider` passes the Cosmos connector runtime configuration:

```tsx
externalWalletConfig={{
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
      multiChain: false,
      onSwitchChain: () => {},
    },
  },
}}
```

## Hook Contracts

`useParaModalCosmosWallet` owns the Para Modal connection hooks:

```tsx
const {
  address,
  isConnected,
  openModal,
} = useParaModalCosmosWallet();
```

`useSignHelloWorld` owns ADR-036 signing:

```tsx
const {
  errorMessage,
  isPending,
  message,
  sign,
  signature,
} = useSignHelloWorld();
```

The signing hook uses `useParaCosmjsAminoSigner` for embedded wallets and `useOfflineSigners` from Graz for external Cosmos wallets.

## Notes

The example includes direct dependencies that are currently reached by the catch-all Para React SDK build graph, including `@metamask/delegation-toolkit`, `ethers`, `@stellar/stellar-sdk`, and `@wagmi/core`. It also keeps `arg` and `starknet` direct because `graz --generate` reaches them through the Graz CLI and Keplr dependency tree during postinstall.
