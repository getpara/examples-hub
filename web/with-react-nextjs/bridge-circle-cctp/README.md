# Circle CCTP Bridge Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-bridge-circle-cctp.vercel.app)

A minimal Next.js app that connects with the Para Modal and bridges USDC from Base mainnet to Arc mainnet with Circle CCTP through Bridge Kit. CCTP burns USDC on Base, waits for Circle's attestation, and mints the same amount on Arc. The Para wallet signs the approval and burn on Base and the mint on Arc. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

> This example runs on mainnet and moves real USDC. The wallet needs USDC and a little ETH on Base for the approval and burn.

## Route and packages

| Part | Details |
| --- | --- |
| Route | Base mainnet (CCTP domain 6) to Arc mainnet (CCTP domain 26), fast transfer |
| `@circle-fin/bridge-kit` | Quotes the transfer, runs approve, burn, attestation and mint, and retries a failed step |
| `@circle-fin/adapter-viem-v2` | Lets Bridge Kit sign with the viem account from `useParaViemAccount` |

Arc uses USDC as its gas token, so the mint needs about 0.01 USDC on Arc. When the wallet holds at least 0.01 USDC on Arc, the Para wallet signs the mint; otherwise Circle's forwarder mints that transfer for a small fee, and the minted USDC pays the gas for the Para wallet to sign the mint on later transfers.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=PROD
NEXT_PUBLIC_BASE_RPC_URL=
NEXT_PUBLIC_ARC_RPC_URL=
```

Use a production API key from the [Para Developer Portal](https://developer.getpara.com). The local `ParaProvider` turns off on-ramp test mode, so the modal's on-ramp can fund the wallet with real USDC. The RPC URLs are optional. Base defaults to `https://mainnet.base.org` and Arc defaults to `https://rpc.mainnet.arc.io`.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useParaBridgeAdapter.ts` | Turns the Para viem account from `useParaViemAccount` into a Bridge Kit adapter |

## Circle usage

| File | What it does |
| --- | --- |
| `src/lib/bridgeAdapter.ts` | Builds the viem adapter with one wallet client per chain, so Bridge Kit never asks the RPC to switch chains |
| `src/lib/bridgeKit.ts` | Picks who signs the mint, then calls `kit.estimate`, `kit.bridge`, and `kit.retry` with progress events |
| `src/lib/transferStatus.ts` | Reads a burn from Circle's attestation API and checks `usedNonces` on Arc to confirm the mint |

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage, balances, quote, transfer, and status hooks
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── BridgeExample.tsx        # Sign-in screen, loads the workspace in the browser only
│   ├── BridgeWorkspace.tsx      # Joins the hooks with the UI once signed in
│   ├── *Container.tsx           # Bridge form, transfer progress, and transfer lookup
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain and token config, Bridge Kit and Circle API calls, display helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para or Circle. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para Circle CCTP guide](https://docs.getpara.com/v3/walkthroughs/circle-cctp)
- [Circle Bridge Kit documentation](https://docs.arc.io/app-kit/bridge)
- [CCTP supported blockchains](https://developers.circle.com/cctp/cctp-supported-blockchains)
