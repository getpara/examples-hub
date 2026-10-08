# Thirdweb Smart Account Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-thirdweb-4337.vercel.app)

A minimal Next.js app that connects with the Para Modal, creates a Thirdweb ERC-4337 smart wallet owned by the Para wallet, and sends a zero-value, gas-sponsored transaction on Sepolia. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Get the Thirdweb client ID from the [Thirdweb Dashboard](https://thirdweb.com/dashboard). It stays an environment variable because it configures the Thirdweb smart wallet and gas sponsorship, not Para.

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
| `src/hooks/useSmartAccount.ts` | Creates the Thirdweb smart account for the connected wallet with `useThirdwebSmartAccount` |
| `src/hooks/useSponsoredTransaction.ts` | Sends a zero-value transaction from the smart account with `smartAccount.sendTransaction` |
| `src/hooks/useAccountBalance.ts` | Reads the Para wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { smartAccount, address: smartAccountAddress, isLoading, errorMessage } = useSmartAccount({ enabled: isConnected });
const { send, targetAddress, transactionHash, isPending } = useSponsoredTransaction(smartAccount);
```

`useSmartAccount` passes the Thirdweb client ID, the Sepolia chain, and `sponsorGas: true` to `useThirdwebSmartAccount`, which connects an ERC-4337 Thirdweb smart wallet with the Para wallet as its signer. `useSponsoredTransaction` calls `smartAccount.sendTransaction({ to })` with the burn address `0x000000000000000000000000000000000000dEaD`. Thirdweb submits it as a UserOperation, its paymaster covers the gas, and the hook returns the receipt transaction hash.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── ThirdwebExample.tsx      # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Thirdweb and chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ThirdwebExample`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para and Thirdweb guide](https://docs.getpara.com/v3/walkthroughs/Thirdweb)
- [Thirdweb smart wallet documentation](https://portal.thirdweb.com/wallets/smart-wallet)
- [ERC-4337 specification](https://eips.ethereum.org/EIPS/eip-4337)
