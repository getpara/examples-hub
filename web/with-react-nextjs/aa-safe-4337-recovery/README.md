# Safe 4337 Recovery Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-safe-4337-recovery.vercel.app)

A Next.js app that uses a Para wallet as the recovery guardian for a Safe ERC-4337 account on Sepolia. A local key stands in for the app passkey as the Safe owner. The app walks through six steps that unlock in order: create the Safe, add Para as guardian, fund the guardian with the Para faucet, use the Safe with its owner, prove Para cannot spend, and recover the Safe to a new owner.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

`NEXT_PUBLIC_SEPOLIA_RPC_URL` is optional and defaults to `https://ethereum-sepolia-rpc.publicnode.com`. Get a Para API key from the [Para Developer Portal](https://developer.getpara.com) and a Pimlico API key from the [Pimlico Dashboard](https://dashboard.pimlico.io). Pimlico bundles and sponsors the Safe user operations.

Configure the API key in the Developer Portal with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Para usage

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useGuardianAccount.ts` | Gets the Para wallet as a viem `LocalAccount` with `useParaViemAccount` |
| `src/hooks/useGuardianFaucet.ts` | Requests Sepolia ETH for the Para wallet with `useRequestFaucet` |
| `src/hooks/useSafeRecovery.ts` | Runs the six steps with the Safe client and the Para guardian account |

```tsx
const guardian = useGuardianAccount();
const faucet = useGuardianFaucet();
const recovery = useSafeRecovery({ guardianAccount: guardian.account, requestFaucet: faucet.requestFunds });
```

`useSafeRecovery` keeps the Safe client in memory and calls the contract helpers in `src/lib`: `safe4337Client.ts` builds the Safe account with `permissionless` and Pimlico, and `socialRecoveryActions.ts` reads the recovery module and sends the guardian transactions with the Para `LocalAccount`.

## How recovery works

The Safe owner signs normal user operations. Para is registered only as a guardian on the Safe SocialRecoveryModule, not as an owner. Step 5 has Para sign a Safe transaction and simulates it; the Safe rejects it during owner validation, which shows the guardian cannot spend.

In step 6 the Para guardian calls `confirmRecovery` to start recovery to a new owner. The current owner can veto with `cancelRecovery` until recovery is finalized; after a veto the Safe keeps its owner and you can create a new Safe to start over. Once the grace period ends, `finalizeRecovery` rotates the owner and the new owner sends its first transaction. The guardian sends these calls itself, so step 3 funds it with the Para faucet first.

Every guardian signature needs the user to authenticate with Para, and Para co-signs it. The app cannot produce that signature on its own, and Para cannot sign without the user. Safe modules bypass owner signatures once enabled, so keep the enabled module list small and audited. This example uses one guardian with a threshold of 1 to keep the mechanics clear; the module also supports several guardians, higher thresholds, and other delays.

For the standard flow where the Para wallet owns the Safe, see `aa-safe-4337`.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Para SDK usage and the Safe recovery flow
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── SafeRecoveryExample.tsx  # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, step workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain and Safe config, contract helpers, step state, formatting
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `SafeRecoveryExample`, so you can swap them for your own design system without touching the hooks.
