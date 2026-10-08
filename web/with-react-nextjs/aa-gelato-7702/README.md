# Gelato EIP-7702 Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-gelato-7702.vercel.app)

A minimal Next.js app that connects with the Para Modal, upgrades the Para wallet with a Gelato EIP-7702 account, and sends a zero-value, gas-sponsored transaction on Sepolia. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Get the Gelato API key from the [Gelato Dashboard](https://app.gelato.network). It stays an environment variable because it configures Gelato gas sponsorship, not Para.

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
| `src/hooks/useSmartAccount.ts` | Creates the Gelato EIP-7702 account for the connected wallet with `useGelatoSmartAccount` |
| `src/hooks/useSponsoredTransaction.ts` | Sends a zero-value transaction from the account with `smartAccount.sendTransaction` |
| `src/hooks/useAccountBalance.ts` | Reads the Para wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { smartAccount, address: accountAddress, isLoading, errorMessage } = useSmartAccount({ enabled: isConnected });
const { send, targetAddress, transactionHash, isPending } = useSponsoredTransaction(smartAccount);
```

`useSmartAccount` passes the Gelato API key and the Sepolia chain to `useGelatoSmartAccount`. Gelato only supports EIP-7702, so the hook takes no mode option. The Para wallet delegates to the Gelato account contract, so the account address stays the same as the Para wallet address, and the first transaction also signs the EIP-7702 authorization. `useSponsoredTransaction` calls `smartAccount.sendTransaction({ to })` with the burn address `0x000000000000000000000000000000000000dEaD`. Gelato submits it as a UserOperation, sponsors the gas, and the hook returns the receipt transaction hash.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── Gelato7702Example.tsx    # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Gelato and chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `Gelato7702Example`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para account abstraction guide](https://docs.getpara.com/v3/react/guides/web3-operations/evm/account-abstraction)
- [useGelatoSmartAccount reference](https://docs.getpara.com/v3/references/hooks/smart-accounts/gelato/use-gelato-smart-account)
- [Gelato documentation](https://docs.gelato.network)
- [EIP-7702 specification](https://eips.ethereum.org/EIPS/eip-7702)
