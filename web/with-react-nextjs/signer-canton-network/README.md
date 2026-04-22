# Signer Canton Network

A Next.js example showing how to onboard a Para-managed Solana wallet as a Canton Network **external party** using the React SDK and the Para Modal.

This is the React/web port of a server-side Canton + Para integration: connect through `ParaModal`, get an embedded Solana (Ed25519) wallet, then run Canton's `generateExternalParty` → sign with Para → `allocateExternalParty` flow to produce a `partyId` on the Canton ledger.

## What this example shows

- Setting up `ParaProvider` with Solana as the selected embedded-wallet type (`src/components/ParaProvider.tsx`).
- Opening the Para modal via `useModal` and reading the embedded Solana wallet via `useWallet` (`src/app/page.tsx`).
- Signing a Canton-supplied `multiHash` with Para via `useSignMessage().signMessageAsync({ walletId, messageBase64 })` (`src/hooks/useCantonOnboarding.ts`).
- Keeping the Canton `WalletSDKImpl` plus validator credentials on the server in Next.js API routes (`src/app/api/canton/generate/route.ts`, `src/app/api/canton/allocate/route.ts`, `src/lib/canton.ts`) so they never reach the browser.

## How the onboarding flow works

1. **Connect.** User clicks "Connect with Para" — ParaModal handles auth and provisions an embedded Solana wallet.
2. **Generate.** The client POSTs the wallet's base58 Solana address to `/api/canton/generate`. The server decodes it to the raw 32-byte Ed25519 public key, re-encodes as base64 (the form Canton wants), and calls `sdk.userLedger.generateExternalParty(publicKeyBase64, partyHint)`. Canton returns a `multiHash` to be signed.
3. **Sign.** The client signs the `multiHash` bytes with the Para Solana signer. Result: a base64 Ed25519 signature.
4. **Allocate.** The client POSTs `{ signatureBase64, generatedParty }` to `/api/canton/allocate`. The server calls `sdk.userLedger.allocateExternalParty(signatureBase64, generatedParty)` and returns the resulting `partyId`.
5. **Done.** The UI displays the `partyId` — your Para wallet is now an external party on Canton.

## Setup

### 1. Configure the example

```bash
cp .env.example .env
```

Fill in `NEXT_PUBLIC_PARA_API_KEY` (get one at [developer.getpara.com](https://developer.getpara.com)). The Canton defaults in `.env.example` target a local [Splice LocalNet](https://docs.dev.sync.global/app_dev/testing/localnet.html) instance (app-user node); point them at your own validator for a hosted deployment.

### 2. Install and run

```bash
yarn install
yarn dev
```

Open http://localhost:3001, click **Connect with Para**, finish auth, then click **Onboard as Canton external party**.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                       # Root layout with ParaProvider
│   ├── page.tsx                         # Connect → Onboard flow
│   └── api/canton/
│       ├── generate/route.ts            # POST → Canton generateExternalParty
│       └── allocate/route.ts            # POST → Canton allocateExternalParty
├── components/
│   ├── ParaProvider.tsx                 # Para SDK + Solana external wallets
│   ├── layout/Header.tsx
│   └── ui/
│       ├── ConnectCard.tsx
│       ├── WalletInfo.tsx
│       └── CantonOnboardCard.tsx        # Onboarding UI
├── hooks/
│   └── useCantonOnboarding.ts           # generate → sign → allocate
└── lib/
    └── canton.ts                        # Server-only Canton SDK setup
```

## Production notes

- `src/lib/canton.ts` uses `localNetAuthDefault` (shared-secret) for the localnet demo. For a hosted Canton deployment, swap the auth factory for whatever your validator expects (typically OAuth/JWT) and set `VALIDATOR_AUDIENCE` accordingly.
- The Canton SDK is initialized once per server process and cached in `getSdk()`.
- All Canton credentials (`LEDGER_API_URL`, `VALIDATOR_API_URL`, `AUTH_UNSAFE_SECRET`, ...) are server-only — never prefix them with `NEXT_PUBLIC_`.

## Learn more

- [Para Documentation](https://docs.getpara.com)
- [Canton Wallet SDK — Integration Guide](https://docs.digitalasset.com/integrate/devnet/index.html)
- [Canton Wallet SDK — Configuration Reference](https://docs.digitalasset.com/integrate/devnet/wallet-sdk-configuration/index.html)
- [Canton Network — External Parties](https://docs.daml.com/2.10.0/canton/usermanual/external_parties.html)
- [Splice LocalNet setup](https://docs.dev.sync.global/app_dev/testing/localnet.html) — docker-compose steps for a full local Canton Network stack
- [Next.js Documentation](https://nextjs.org/docs)
