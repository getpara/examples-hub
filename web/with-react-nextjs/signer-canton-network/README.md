# Signer Canton Network

A Next.js example showing how to onboard a Canton Network **external party** signed by a Para-managed embedded Ed25519 key, using the React SDK and the Para Modal.

This is the React/web port of a server-side Canton + Para integration: connect through `ParaModal`, get a Para-managed Ed25519 key (provisioned as the `SOLANA` wallet type — Canton requires the same Ed25519 curve Solana uses), then run Canton's `generateExternalParty` → sign with Para → `allocateExternalParty` flow to produce a `partyId` on the Canton ledger.

## What this example shows

- Setting up `ParaProvider` so the embedded Ed25519 key is available for Canton signing (`src/components/ParaProvider.tsx`).
- Opening the Para modal via `useModal` and reading the embedded wallet via `useWallet` (`src/app/page.tsx`).
- Signing a Canton-supplied `multiHash` with Para via `useSignMessage().signMessageAsync({ walletId, messageBase64 })` (`src/hooks/useCantonOnboarding.ts`).
- Using Canton's generic interactive-submission API (`prepareSubmission` / `executeSubmission`) for post-onboarding ledger writes. Three flavors are demonstrated, all behind the same Para signing path: installing a `TransferPreapproval` so others can send to the party (`src/app/api/canton/preapproval/`), funding the party with test Amulet via the AmuletRules DevNet **Tap** choice (`src/app/api/canton/tap/`), and sending Amulet via token-standard `createTransfer` (`src/app/api/canton/transfer/`).
- Reading on-ledger state (Amulet balance) via `sdk.tokenStandard.listHoldingUtxos` (`src/app/api/canton/balance/`).
- Keeping the Canton `WalletSDKImpl` plus validator credentials on the server in Next.js API routes (everything under `src/app/api/canton/` plus `src/lib/canton.ts`) so they never reach the browser.

## How the onboarding flow works

1. **Connect.** User clicks "Connect with Para" — ParaModal handles auth and provisions an embedded Ed25519 key.
2. **Generate.** The client POSTs the wallet's address (base58-encoded Ed25519 public key) to `/api/canton/generate`. The server decodes it to the raw 32-byte Ed25519 public key, re-encodes as base64 (the form Canton wants), and calls `sdk.userLedger.generateExternalParty(publicKeyBase64, partyHint)`. Canton returns a `multiHash` to be signed.
3. **Sign.** The client signs the `multiHash` bytes with the Para-managed Ed25519 key. Result: a base64 Ed25519 signature.
4. **Allocate.** The client POSTs `{ signatureBase64, generatedParty }` to `/api/canton/allocate`. The server calls `sdk.userLedger.allocateExternalParty(signatureBase64, generatedParty)` and returns the resulting `partyId`.
5. **Done.** The UI displays the `partyId` — your Para wallet is now an external party on Canton.

## Post-onboarding: the same pattern, every time

After allocation, every ledger write from the external party follows a `prepare → Para-sign → execute` loop with the exact same Para call. The example demonstrates this with a one-click **Install TransferPreapproval** action:

1. **Prepare.** Client POSTs `{ partyId }` to `/api/canton/preapproval/prepare`. The server looks up the validator's provider party + DSO, builds a `TransferPreapprovalProposal` command via `sdk.userLedger.createTransferPreapprovalCommand(...)`, and returns `{ preparedTransactionHash, prepared, commandId }` from `prepareSubmission`.
2. **Sign.** Client signs `preparedTransactionHash` with Para — same `signMessageAsync({ walletId, messageBase64 })` call as onboarding.
3. **Execute.** Client POSTs the prepared transaction + signature + Ed25519 public key to `/api/canton/preapproval/execute`. The server calls `sdk.userLedger.executeSubmission(...)` and returns the resulting `updateId`.

This is the template for any future ledger interaction (token transfers, contract exercises, etc.): swap the prepared command, keep the signing path identical.

## Tap, Send, and Balance: the same loop with different commands

After allocation the demo exposes three more cards. Each is a textbook case of "swap the prepared command, keep the signing path identical":

**Fund this party (DevNet tap)** — `src/app/api/canton/tap/`
1. **Prepare.** Client POSTs `{ partyId, amount }` to `/api/canton/tap/prepare`. The server calls `sdk.tokenStandard.createTap(receiver, amount, { instrumentId: "Amulet" })` (which exercises the AmuletRules DevNet `Tap` choice), then `prepareSubmission` with the command + disclosed contracts.
2. **Sign.** Client recomputes the hash with `hashPreparedTransaction` (Web Crypto) and signs with Para.
3. **Execute.** Client POSTs to `/api/canton/tap/execute`. The server calls `sdk.userLedger.executeSubmission(...)` and returns the `updateId`. The party now holds spendable Amulet — DevNet/LocalNet only.

**Send Amulet** — `src/app/api/canton/transfer/`
1. **Prepare.** Client POSTs `{ partyId, receiverPartyId, amount, memo? }`. The server calls `sdk.tokenStandard.createTransfer(sender, receiver, amount, { instrumentId: "Amulet" })`, then `prepareSubmission`.
2. **Sign.** Client recomputes the hash and signs with Para.
3. **Execute.** Client POSTs to `/api/canton/transfer/execute`. The server calls `executeSubmission` and returns an `updateId`.

If the recipient has a `TransferPreapproval`, the transfer auto-completes; otherwise it creates a pending `TransferInstruction` the recipient must accept. The card defaults Recipient to the user's own `partyId` (a self-send) so the demo works end-to-end on first click — overwrite it to send to another party.

**Amulet balance** — `src/app/api/canton/balance/`
The wallet info card has a "Fetch balance" button that POSTs `{ partyId }` to `/api/canton/balance`. The server calls `sdk.tokenStandard.listHoldingUtxos(false)` and sums the `interfaceViewValue.amount` across the Amulet holdings. No Para signing required — pure read of on-ledger state through the validator's scan-proxy.

> **Note on LocalNet fees:** the AmuletRules `transferConfig` on Splice LocalNet has `transferFee.initialRate = 0.0` and `createFee.fee = 0.0`, so transfers don't visibly debit the sender. The economic mechanics work the same on DevNet/MainNet; the demo's accounting is honest, the LocalNet config is just zero. For a self-send, total balance is unchanged regardless because sender and receiver are the same party.

## Setup

### 1. Configure your API key in the Para developer portal

Get an API key at [developer.getpara.com](https://developer.getpara.com), then set the following on it before running the example. New API keys default to EVM-only and have all on/off-ramp tiles enabled — both need adjusting for Canton.

| Setting | Where in the dev portal | Value | Why |
|---|---|---|---|
| Supported wallet types | API Key → **Setup → Networks** | Add **Solana** (Ed25519) | Canton external parties are signed with Ed25519. Para provisions Ed25519 keys under the `SOLANA` wallet type. Without this the modal won't create the key the canton flow needs. |
| Buy Crypto (Add Funds) | API Key → **On/Off Ramps → Buy Crypto & Withdraw** | Disable | Not functional for Canton — would confuse users. |
| Withdraw | API Key → **On/Off Ramps → Buy Crypto & Withdraw** | Disable | Not functional for Canton. |
| Receive | API Key → **On/Off Ramps → Receive** | Disable | Address + QR display is for EVM/Solana mainnets — Canton parties aren't reachable from those addresses. |
| Send | API Key → **On/Off Ramps → Send** | Disable | Sends in this demo go through the in-app **Send Amulet** card, not the Para modal. |

End state of the On/Off Ramps page: **Buy Crypto, Withdraw, Receive, and Send all toggled off** — none of the modal's wallet-action tiles surface for Canton users.

CLI equivalent (one command for the ramp toggles; wallet types are dev-portal-only today):

```bash
para keys config ramps <key-id> --no-buy-enabled --no-withdraw-enabled --no-receive-enabled --no-send-enabled
```

The example also sets `paraModalConfig.hideWallets: true` in `src/components/ParaProvider.tsx`. That's a client-side modal config (not a dev-portal setting): it strips the remaining "Solana Wallet" branding from the modal so the account view reads as "My Account". Para provisions Canton's Ed25519 key under the `SOLANA` wallet type internally — `hideWallets` keeps that implementation detail out of user-facing copy.

### 2. Configure the example

```bash
cp .env.example .env
```

Fill in `NEXT_PUBLIC_PARA_API_KEY` with the key from step 1. The Canton defaults in `.env.example` target a local [Splice LocalNet](https://docs.dev.sync.global/app_dev/testing/localnet.html) instance (app-user node); point them at your own validator for a hosted deployment.

### 3. Install and run

```bash
yarn install
yarn dev
```

Open http://localhost:3001 and walk through:

1. **Connect with Para** — finishes auth and provisions the embedded Ed25519 key.
2. **Onboard as Canton external party** — runs generate → Para-sign → allocate, returns a `partyId`.
3. **Install TransferPreapproval** — first post-onboarding ledger write; lets others auto-send Amulet to this party.
4. **Tap Amulet** (defaults to 100) — mints test Amulet to the party so it has something to spend. DevNet/LocalNet only.
5. **Fetch balance** on the wallet info card — confirms the holdings are visible.
6. **Send Amulet** (defaults to a self-send of 1) — proves the full prepare → Para-sign → execute path against `tokenStandard.createTransfer`. Refresh the balance to see the new state on-ledger.

Each step prompts Para once for a signature; the full demo runs in seconds. The `partyId` is cached to `localStorage` keyed by the Para wallet address, so a refresh skips straight to step 3.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                       # Root layout with ParaProvider
│   ├── page.tsx                         # Connect → Onboard → Preapproval → Tap → Send
│   └── api/canton/
│       ├── generate/route.ts            # POST → Canton generateExternalParty
│       ├── allocate/route.ts            # POST → Canton allocateExternalParty
│       ├── preapproval/
│       │   ├── prepare/route.ts         # POST → prepareSubmission (TransferPreapprovalProposal)
│       │   └── execute/route.ts         # POST → executeSubmission (Para-signed)
│       ├── tap/
│       │   ├── prepare/route.ts         # POST → prepareSubmission (AmuletRules DevNet Tap)
│       │   └── execute/route.ts         # POST → executeSubmission (Para-signed)
│       ├── transfer/
│       │   ├── prepare/route.ts         # POST → prepareSubmission (token-standard createTransfer)
│       │   └── execute/route.ts         # POST → executeSubmission (Para-signed)
│       └── balance/route.ts             # POST → tokenStandard.listHoldingUtxos (read-only)
├── components/
│   ├── ParaProvider.tsx                 # Para SDK + Ed25519 embedded wallets
│   ├── layout/Header.tsx
│   └── ui/
│       ├── ConnectCard.tsx
│       ├── WalletInfo.tsx               # Address + Amulet balance + refresh button
│       ├── CantonOnboardCard.tsx        # Onboarding UI
│       ├── CantonPreapprovalCard.tsx    # Post-onboarding signing demo
│       ├── CantonTapCard.tsx            # DevNet faucet UI
│       └── CantonSendCard.tsx           # Send Amulet UI (defaults to self-send)
├── hooks/
│   └── useCantonOnboarding.ts           # onboard, installPreapproval, tapAmulet, sendAmulet, fetchBalance
└── lib/
    └── canton.ts                        # Server-only Canton SDK setup (incl. transferFactoryRegistryUrl)
```

## Production notes

- `src/lib/canton.ts` uses `localNetAuthDefault` (shared-secret) for the localnet demo. For a hosted Canton deployment, swap the auth factory for whatever your validator expects (typically OAuth/JWT) and set `VALIDATOR_AUDIENCE` accordingly.
- The Canton SDK is initialized once per server process and cached in `getSdk()`. The token-standard registry URL is set after `sdk.connect()` from `localNetStaticConfig.LOCALNET_REGISTRY_API_URL` by default; override with `TRANSFER_FACTORY_REGISTRY_URL` (typically your validator's `/api/validator/v0/scan-proxy`) for hosted deployments.
- **Single-user demo caveat:** the cached SDK reuses `userLedger` and `tokenStandard` controllers across requests, and `sdk.setPartyId(partyId)` mutates them in place. Concurrent requests for different parties will race. For multi-user production serving, either build per-request controllers from the factories in `getSdk()` or wrap `setPartyId` + `prepareSubmission` + `executeSubmission` in a per-process mutex.
- All Canton credentials (`LEDGER_API_URL`, `VALIDATOR_API_URL`, `AUTH_UNSAFE_SECRET`, `TRANSFER_FACTORY_REGISTRY_URL`, ...) are server-only — never prefix them with `NEXT_PUBLIC_`.

## Learn more

- [Para Documentation](https://docs.getpara.com)
- [Canton Wallet SDK — Integration Guide](https://docs.digitalasset.com/integrate/devnet/index.html)
- [Canton Wallet SDK — Configuration Reference](https://docs.digitalasset.com/integrate/devnet/wallet-sdk-configuration/index.html)
- [Canton Network — External Parties](https://docs.daml.com/2.10.0/canton/usermanual/external_parties.html)
- [Splice LocalNet setup](https://docs.dev.sync.global/app_dev/testing/localnet.html) — docker-compose steps for a full local Canton Network stack
- [Next.js Documentation](https://nextjs.org/docs)
