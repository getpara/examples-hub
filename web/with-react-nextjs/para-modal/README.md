# Para Modal Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal.vercel.app)

A minimal Next.js example showing Para Modal connection state and message signing. Para SDK logic lives in hooks and the UI components receive plain props, so the modal integration can be copied without adopting this example's presentation components.

## Features

- Para Modal connection button
- Connected wallet address display
- EVM message signing with `Hello World!`
- Portal-driven persistent app, auth, branding, and wallet configuration
- On-brand Para token, card, and header styling
- Clean separation between SDK hooks and presentation components

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` only passes the API key, environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

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
│   ├── layout.tsx              # Root layout, metadata, ParaProvider, SDK styles
│   └── page.tsx                # Server entry that renders the client example
├── components/
│   ├── ParaModalExample.tsx    # Client orchestration
│   ├── ParaProvider.tsx        # Para SDK provider setup
│   ├── layout/Header.tsx       # Prop-only header
│   └── ui/
│       ├── ConnectCard.tsx     # Prop-only connect card
│       ├── WalletInfo.tsx      # Prop-only wallet display
│       └── SignMessage.tsx     # Prop-only message signing UI
├── hooks/
│   ├── useParaModalWallet.ts   # Copyable modal connection state
│   └── useSignHelloWorld.ts    # Copyable message signing logic
└── styles/globals.css          # Para example tokens and UI primitives
```

## Hook Contracts

`useParaModalWallet` owns the Para Modal connection hooks:

```tsx
const {
  address,
  isConnected,
  openModal,
} = useParaModalWallet();
```

`useSignHelloWorld` owns the Para signing hook:

```tsx
const {
  errorMessage,
  isPending,
  message,
  sign,
  signature,
} = useSignHelloWorld();
```

Presentation components do not import Para, Wagmi, or Viem. They receive state and callbacks from `ParaModalExample`.

## Notes

The example includes direct dependencies that are currently reached by the catch-all Para React SDK build graph, including `@metamask/delegation-toolkit`, `ethers`, `@stellar/stellar-sdk`, and `@wagmi/core`. These keep the production build self-contained until the SDK export boundary can be narrowed.
