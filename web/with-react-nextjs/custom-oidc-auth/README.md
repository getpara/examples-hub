# Custom OIDC Auth

A Next.js app that signs in through your own OIDC identity provider with `useAuthenticateWithOAuth` instead of the Para Modal, handles login two-factor in the same panel, then funds the wallet from the Para faucet and sends Sepolia ETH with an Ethers signer. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. `NEXT_PUBLIC_SEPOLIA_RPC_URL` is the Ethers JSON-RPC provider used for the balance, the faucet confirmation, and broadcasting the send; it defaults to the public Sepolia RPC above.

Add your OIDC provider as a Custom OIDC login method for the API key from the [Para Developer Portal](https://developer.getpara.com) or the Para CLI; the Docs link in the footer walks through it. Depending on the API key's security settings, a new user also creates a passkey in a pop-up. Login two-factor is enabled for the API key by Para, and the custom limit is a Para permissions policy on the API key. Without them, sign in goes straight to the wallet and every send is signed.

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
| `src/hooks/useOidcAuth.ts` | Signs in through `useAuthenticateWithOAuth` with `authenticateWithOAuthAsync({ method: "CUSTOM_OIDC" })`, opens the passkey pop-up, and tracks the auth phase with `onStatePhaseChange` |
| `src/hooks/useMfaChallenge.ts` | Detects the `awaiting_2fa_enrollment` and `awaiting_2fa` phases, enrolls with `useEnrollMfa`, and checks codes with `useVerifyMfa` |
| `src/hooks/useParaSession.ts` | Reads the connected wallet with `useAccount` and `useWallet`, and logs out with `useLogout` |
| `src/hooks/useFaucet.ts` | Requests Sepolia ETH with `useRequestFaucet` and waits for the faucet transaction to confirm |
| `src/hooks/useSendTransaction.ts` | Signs a 0.001 ETH send back to the faucet with the `useParaEthersSigner` signer, broadcasts it through the Ethers provider, and reports a `POLICY_DENIED` rejection |
| `src/hooks/useEthersProvider.ts` | Creates the Ethers `JsonRpcProvider` for Sepolia |
| `src/hooks/useAccountBalance.ts` | Reads the ETH balance through the Ethers provider |
| `src/hooks/useE2ECleanup.ts` | Test-only cleanup for the E2E suite, active in development only |

```tsx
const { signIn, authPhase, isPending, error } = useOidcAuth();
const { mode, enrollment, verify, attemptsRemaining } = useMfaChallenge();
const { send, txHash, isDenied } = useSendTransaction(FAUCET_RETURN_ADDRESS);
```

When the API key requires login two-factor, the SDK pauses the sign in. A new user scans the QR code from `enrollMfa`, saves the backup codes, and enters the first code; a returning user enters a code from the authenticator app or a backup code. After a correct code the SDK finishes the sign in on its own. When a transaction limit on the API key denies the send, the signer throws an error with code `POLICY_DENIED` and the app shows it as a denied send that was not signed.

## Project layout

```text
src/
├── app/                                  # Next.js layout and page
├── hooks/                                # Para SDK and Ethers usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx                  # Para setup
│   ├── CustomOidcAuthExample.tsx         # Joins the auth and session hooks with the header, menu, and sign in gate
│   ├── sign-in/OidcSignInContainer.tsx   # Joins the sign in and two-factor state with the sign in panel
│   ├── wallet/WalletActionsContainer.tsx # Joins the balance, faucet, and send hooks with the workbench
│   ├── layout/                           # App shell, header, footer, workbench
│   └── ui/                               # Presentational components, props only
├── lib/                                  # Chain and transfer config, copy, and UI helpers
└── styles/globals.css                    # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from the containers, so you can swap them for your own design system without touching the hooks.
