# Porto EIP-7702 Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-porto-7702.vercel.app)

A minimal Next.js app that connects with the Para Modal and upgrades the connected EOA in place to a Porto account with EIP-7702 on Base Sepolia. The address stays the same. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

The Porto relay (`https://rpc.porto.sh`) and the Base Sepolia chain are set in `src/lib/porto.ts` and `src/lib/chain.ts`. Porto needs no API key.

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
| `src/hooks/useParaViemSigner.ts` | Reads the Para wallet address from `useParaViemAccount` |
| `src/hooks/usePortoKeys.ts` | Reads the keys Porto has authorized for the address with `RelayActions.getKeys`, and reads them again after the upgrade. Any key means the account is upgraded |
| `src/hooks/usePortoUpgrade.ts` | Upgrades the EOA with `usePortoSmartAccount` once the user asks for it |
| `src/hooks/useAccountBalance.ts` | Reads the Para wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { address: signerAddress, isLoading } = useParaViemSigner();
const { upgrade, isUpgraded, errorMessage, isPending } = usePortoUpgrade(isConnected ? signerAddress : null);
const { keys, isChecking } = usePortoKeys(isConnected ? signerAddress : null, isUpgraded);
```

`usePortoUpgrade` enables `usePortoSmartAccount({ chain })` only for the address whose upgrade button the user clicked, so signing in with another account does not upgrade it. The hook authorizes the Para wallet's own secp256k1 key as a Porto admin key, the Para wallet signs the EIP-7702 authorization and upgrade digests, and Porto's relay submits the upgrade. If the account already delegates to Porto, the hook skips the upgrade and returns the existing account. Porto's relay sponsors gas on testnets. `usePortoKeys` then reads the authorized keys again, and the page counts admin and session keys from them.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK and Porto usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── Porto7702Example.tsx     # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Porto relay and chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `Porto7702Example`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para Porto walkthrough](https://docs.getpara.com/v3/walkthroughs/porto)
- [Porto documentation](https://porto.sh/sdk)
- [EIP-7702 specification](https://eips.ethereum.org/EIPS/eip-7702)
