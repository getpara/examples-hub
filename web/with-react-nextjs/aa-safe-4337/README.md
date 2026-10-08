# Safe Smart Account Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-safe-4337.vercel.app)

A minimal Next.js app that connects with the Para Modal, creates a Safe ERC-4337 smart account owned by the Para wallet, and sends a zero-value, gas-sponsored transaction on Sepolia through Pimlico. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

Optionally override the public Sepolia RPC URL that the Safe account client uses:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Get the Pimlico API key from the [Pimlico Dashboard](https://dashboard.pimlico.io). It stays an environment variable because it configures the bundler and gas sponsorship for the Safe account, not Para.

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
| `src/hooks/useSmartAccount.ts` | Creates the Safe smart account for the connected wallet with `useSafeSmartAccount` |
| `src/hooks/useSponsoredTransaction.ts` | Sends a zero-value transaction from the smart account with `smartAccount.sendTransaction` |
| `src/hooks/useAccountBalance.ts` | Reads the Para wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { smartAccount, address: smartAccountAddress, isLoading, errorMessage } = useSmartAccount({ enabled: isConnected });
const { send, targetAddress, transactionHash, isPending } = useSponsoredTransaction(smartAccount);
```

`useSmartAccount` passes the Pimlico API key, the Sepolia chain, and the RPC URL to `useSafeSmartAccount`, which creates a Safe 1.4.1 account with the Para wallet as owner. It stays disabled and reports an error until `NEXT_PUBLIC_PIMLICO_API_KEY` is set. `useSponsoredTransaction` calls `smartAccount.sendTransaction({ to })` with the burn address `0x000000000000000000000000000000000000dEaD`. Pimlico submits it as a UserOperation, sponsors the gas, and the hook returns the receipt transaction hash.

For a Safe recovery flow where Para is a guardian instead of the Safe owner, see `aa-safe-4337-recovery`.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── Safe4337Example.tsx      # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Pimlico and chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `Safe4337Example`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para account abstraction guide](https://docs.getpara.com/v3/react/guides/web3-operations/evm/account-abstraction)
- [useSafeSmartAccount reference](https://docs.getpara.com/v3/references/hooks/smart-accounts/safe/use-safe-smart-account)
- [Safe ERC-4337 documentation](https://docs.safe.global/advanced/erc-4337/4337-safe)
- [Pimlico documentation](https://docs.pimlico.io)
- [ERC-4337 specification](https://eips.ethereum.org/EIPS/eip-4337)
