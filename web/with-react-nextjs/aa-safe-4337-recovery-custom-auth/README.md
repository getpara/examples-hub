# Safe 4337 Recovery Custom Auth Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-safe-4337-recovery-custom-auth.vercel.app)

A Next.js app that signs in with its own email and passkey UI on a `ParaWeb` client, without the React provider or the Para Modal, then uses the Para wallet as the recovery guardian for a Safe ERC-4337 account on Sepolia. A local key stands in for the app passkey as the Safe owner. The app walks through six steps that unlock in order: create the Safe, add Para as guardian, fund the guardian with the Para faucet, use the Safe with its owner, prove Para cannot spend, and recover the Safe to a new owner.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

`NEXT_PUBLIC_SEPOLIA_RPC_URL` is optional and defaults to `https://ethereum-sepolia-rpc.publicnode.com`. Get a Para API key from the [Para Developer Portal](https://developer.getpara.com) and a Pimlico API key from the [Pimlico Dashboard](https://dashboard.pimlico.io). Pimlico bundles and sponsors the Safe user operations.

Enable passkey authentication and EVM wallets for the API key in the Developer Portal. The app owns the sign-in form, and Para-hosted pages handle email verification and the passkey ceremony.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Para usage

| File | What it does |
| --- | --- |
| `src/lib/para.ts` | Creates the `ParaWeb` client once, as a module singleton, from the API key and environment. It is the only Para import in `src/lib` |
| `src/hooks/useParaClient.ts` | Runs `init()` and `setup()` on the client from `src/lib/para.ts` |
| `src/hooks/useParaSession.ts` | Reads the session with `isFullyLoggedIn()` and the EVM wallet with `getWalletsByType("EVM")`, refreshes on `onStatePhaseChange`, and signs out with `logout()` |
| `src/hooks/useEmailPasskeyAuth.ts` | Signs in with `signUpOrLogIn({ auth: { email } })`, takes a verification code with `verifyNewAccount`, returns the verification URL for the sign-in iframe and clears it when the Para portal (`getPortalBaseURL`) posts `CLOSE_WINDOW`, opens the passkey URL in a pop-up, and waits with `waitForLogin` and `waitForWalletCreation` |
| `src/hooks/useGuardianAccount.ts` | Turns the Para wallet into a viem `LocalAccount` with `createParaViemAccount` |
| `src/hooks/useGuardianFaucet.ts` | Requests Sepolia ETH for the Para wallet with `requestFaucet` |
| `src/hooks/useSafeRecovery.ts` | Runs the six steps with the Safe client and the Para guardian account |

```tsx
const client = useParaClient();
const session = useParaSession(client.para, client.isReady);
const auth = useEmailPasskeyAuth({ para: client.para, isReady: client.isReady, onAuthenticated: session.refresh });
const guardian = useGuardianAccount(client.para, session.address);
const faucet = useGuardianFaucet(client.para, session.walletId);
const recovery = useSafeRecovery({ guardianAccount: guardian.account, requestFaucet: faucet.requestFunds });
```

`useSafeRecovery` keeps the Safe client in memory and calls the contract helpers in `src/lib`: `safe4337Client.ts` builds the Safe account with `permissionless` and Pimlico, and `socialRecoveryActions.ts` reads the recovery module and sends the guardian transactions with the Para `LocalAccount`.

## How recovery works

The Safe owner signs normal user operations. Para is registered only as a guardian on the Safe SocialRecoveryModule, not as an owner. Step 5 has Para sign a Safe transaction and simulates it; the Safe rejects it during owner validation, which shows the guardian cannot spend.

In step 6 the Para guardian calls `confirmRecovery` to start recovery to a new owner. The current owner can veto with `cancelRecovery` until recovery is finalized; after a veto the Safe keeps its owner and you can create a new Safe to start over. Once the grace period ends, `finalizeRecovery` rotates the owner and the new owner sends its first transaction. The guardian sends these calls itself, so step 3 funds it with the Para faucet first.

Every guardian signature needs the user to authenticate with Para, and Para co-signs it. The app cannot produce that signature on its own, and Para cannot sign without the user. Safe modules bypass owner signatures once enabled, so keep the enabled module list small and audited. This example uses one guardian with a threshold of 1 to keep the mechanics clear; the module also supports several guardians, higher thresholds, and other delays.

For the same flow with the Para Modal, see `aa-safe-4337-recovery`. For the standard flow where the Para wallet owns the Safe, see `aa-safe-4337`.

## Project layout

```text
src/
├── app/                                   # Next.js layout and page
├── hooks/                                 # Para SDK usage and the Safe recovery flow
├── components/
│   ├── SafeRecoveryCustomAuthExample.tsx  # Joins the hooks with the UI
│   ├── sign-in/EmailSignInContainer.tsx   # Joins the sign in hook with the sign in panel
│   ├── layout/                            # App shell, header, footer, step workbench
│   └── ui/                                # Presentational components, props only
├── lib/                                   # Para client, chain and Safe config, contract helpers, step state, formatting
└── styles/globals.css                     # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the two containers, so you can swap them for your own design system without touching the hooks.
