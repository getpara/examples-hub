# Para Modal Cosmos Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-cosmos.vercel.app)

A minimal Next.js app that connects with the Para Modal, including Cosmos external wallets through Graz, shows the connected account, and signs `Hello World!` as an ADR-036 message. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, the allowed Cosmos external wallets, and a WalletConnect project ID if those wallets need one. The local `ParaProvider` passes the API key, the environment, the Cosmos chains, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

`yarn install` runs `graz --generate` to create the Graz chain files that `ParaProvider` imports from `graz/chains`.

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client, and sets the Cosmos connector chains |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` as an ADR-036 message with `useParaCosmjsAminoSigner`, and reports whether the selected wallet is external with `useWallet` and `useAccount` |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { sign, message, isExternal, isPending, errorMessage, signature } = useSignHelloWorld();
```

`ParaProvider` passes the Graz chain list to the Cosmos connector:

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

`useSignHelloWorld` gets the Amino signer from `useParaCosmjsAminoSigner`, which returns the Para signer for Para wallets and the Graz signer for external Cosmos wallets. It builds an ADR-036 `sign/MsgSignData` document with an empty chain ID using CosmJS `makeSignDoc`, calls `signAmino(address, signDoc)`, and returns the signature once the user approves the request. `isExternal` tells the page whether to ask for approval in the Para window or in the user's wallet. The account strip has no balance cell because `useWalletBalance` does not return balances for Cosmos wallets.

## Project layout

```text
src/
├── app/                            # Next.js layout and page
├── hooks/                          # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx            # Para setup
│   ├── ParaModalCosmosExample.tsx  # Joins the hooks with the UI
│   ├── layout/                     # App shell, header, footer, workbench
│   └── ui/                         # Presentational components, props only
├── lib/                            # Chain config, formatting, and UI helpers
└── styles/globals.css              # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ParaModalCosmosExample`, so you can swap them for your own design system without touching the hooks.
