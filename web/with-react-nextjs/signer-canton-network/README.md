# Signer Canton Network Example

A Next.js app that onboards a Para wallet as a Canton Network external party with React SDK Lite and the Para Modal. Canton external parties sign with Ed25519, the same curve Solana uses, so the app selects the Para `SOLANA` wallet and signs Canton hashes with it. After onboarding, the app installs a transfer preapproval, funds the party from the DevNet tap, and sends Amulet. The party ID replaces the wallet address in the header and account strip once it exists.

## Setup

Configure the API key in the [Para Developer Portal](https://developer.getpara.com):

| Setting | Where | Value |
| --- | --- | --- |
| Supported wallet types | Setup, Networks | Add Solana, so Para creates the Ed25519 key Canton needs |
| Buy Crypto, Withdraw, Receive, Send | On/Off Ramps | Disable; the modal wallet actions do not apply to Canton parties |
| Hide wallets | Modal UX settings | Enable, so the `SOLANA` wallet type stays out of the Canton UI |

The ramp toggles can also be set from the CLI:

```bash
para keys config ramps <key-id> --no-buy-enabled --no-withdraw-enabled --no-receive-enabled --no-send-enabled
```

The app display name, branding, theme, and login options also live in the Developer Portal. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Copy `.env.example` to `.env` and set `NEXT_PUBLIC_PARA_API_KEY`. The Canton variables default to a local [Splice LocalNet](https://docs.dev.sync.global/app_dev/testing/localnet.html) app-user node; point them at your own validator for a hosted deployment. They are server-only, so never prefix them with `NEXT_PUBLIC_`.

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
| `src/hooks/useCantonWallet.ts` | Opens the modal with `useModal`, reads the account with `useAccount` and `useWallet`, and selects the `SOLANA` wallet with `useWalletState` |
| `src/hooks/useCantonParty.ts` | Onboards the external party and signs the Canton `multiHash` with `useSignMessage` |
| `src/hooks/useCantonSubmission.ts` | Runs one ledger write: prepare, verify the hash, sign with `useSignMessage`, execute. It sends the public key with `base58ToBase64` |

```tsx
const wallet = useCantonWallet();
const party = useCantonParty({ address: wallet.address, walletId: wallet.walletId });
const transfer = useCantonSubmission({ command: "transfer", partyId: party.partyId, address: wallet.address, walletId: wallet.walletId });
```

Every Para call is `signMessageAsync({ walletId, messageBase64 })`. Canton hashes are already base64, so the app passes them as `messageBase64` unchanged and sends the base64 signature back to Canton.

## How it works

Onboarding:

1. The browser posts the wallet address (the base58 Ed25519 public key) to `/api/canton/generate`. The server calls `generateExternalParty` and returns the party topology and its `multiHash`.
2. Para signs the `multiHash`.
3. The browser posts the signature to `/api/canton/allocate`. The server calls `allocateExternalParty` and returns the `partyId`. The app saves it in `localStorage` for this wallet, so a reload skips onboarding. Once a party exists, every later step is open in any order.

Every ledger write after that uses the same loop with a different command:

1. The browser posts to `/api/canton/<command>/prepare`. The server builds the command and calls `prepareSubmission`.
2. The browser recomputes the hash of the prepared transaction with `hashPreparedTransaction` from `@canton-network/core-tx-visualizer`. If it does not match the hash the server returned, the app shows an error and never asks Para to sign.
3. Para signs the prepared hash.
4. The browser posts the signature and public key to `/api/canton/<command>/execute`. The server calls `executeSubmission` and returns the `updateId`.

| Step | Command | Canton call |
| --- | --- | --- |
| Install preapproval | `preapproval` | `createTransferPreapprovalCommand`, so other parties can send Amulet to this party |
| Fund party | `tap` | `tokenStandard.createTap`, the AmuletRules DevNet tap (DevNet and LocalNet only) |
| Send Amulet | `transfer` | `tokenStandard.createTransfer`. The recipient defaults to your own party, so a self-send works on the first try |

The Amulet balance in the account strip is a read of `/api/canton/balance`, which sums the party's Amulet holdings from `listHoldingUtxos`. It does not use Para. Press refresh to fetch it.

## Server code

The Canton wallet SDK and the validator credentials stay on the server. `src/lib/server/canton.ts` creates the SDK once per server process with the LocalNet shared-secret auth, and the route handlers in `src/app/api/canton` call it. For a hosted validator, swap the auth factory for what your validator expects and set `VALIDATOR_AUDIENCE` and `TRANSFER_FACTORY_REGISTRY_URL`.

The cached SDK serves one user at a time: `setPartyId` changes the shared ledger controllers, so concurrent requests for different parties can race. For multiple users, build controllers per request or serialize the submit calls.

`@canton-network/wallet-sdk` stays on the 0.x line because the 1.x SDK has a different setup API.

## Project layout

```text
src/
├── app/                         # Next.js layout, page, and Canton API routes
├── hooks/                       # Para SDK usage, one concern per hook, plus the Amulet balance read
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── CantonNetworkExample.tsx # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, step workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Network config, request helper, steps, forms, formatting
│   └── server/canton.ts         # Server-only Canton SDK setup
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `CantonNetworkExample`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Canton walkthrough in the Para docs](https://docs.getpara.com/v3/walkthroughs/canton-network)
- [Canton Wallet SDK integration guide](https://docs.digitalasset.com/integrate/devnet/index.html)
- [Splice LocalNet setup](https://docs.dev.sync.global/app_dev/testing/localnet.html)
