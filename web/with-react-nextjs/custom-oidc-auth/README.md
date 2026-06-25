# Custom OIDC Auth

A Next.js example that runs Para **Custom OIDC** authentication through `@getpara/react-sdk`,
then exercises the resulting MPC wallet: request testnet funds from the faucet and send an EVM
transaction signed with ethers — all on Sepolia, with links to view each transaction on Etherscan.

## What This Example Shows

- Wrapping the app in the Para React provider (`ParaProvider` + React Query)
- Signing in with `useAuthenticateWithOAuth` using `method: "CUSTOM_OIDC"`
- Opening the passkey popup the SDK surfaces via `onStatePhaseChange`
- Reading the connected wallet with `useAccount` / `useWallet`
- Funding the wallet with `useRequestFaucet` (`ETHEREUM_SEPOLIA`)
- Sending a transaction with an ethers signer from `useParaEthersSigner`
- Linking the faucet and transaction hashes to Sepolia Etherscan

## Flow

1. **Sign in with OIDC** — custom OIDC handshake, plus passkey creation for new users.
2. **Request faucet** — funds the Para wallet with Sepolia testnet ETH.
3. **Send transaction** — self-transfers 0.0001 ETH, signed by the Para wallet through ethers.
4. **View on Etherscan** — each step links to its transaction on Sepolia.

> The send-transaction step needs gas, so request faucet funds first. An unfunded wallet shows a
> clear "request faucet funds first" message instead of an opaque RPC error.

## Setup

1. Create `.env` from `.env.example`:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
# Optional: private Sepolia RPC; defaults to a public node when unset.
# NEXT_PUBLIC_SEPOLIA_RPC_URL=
```

2. Install and run:

```bash
yarn install
yarn dev
```

3. Open `http://localhost:3000`.

## Developer Portal Configuration

Custom OIDC is **not** self-serve in the [Para Developer Portal](https://developer.getpara.com) —
Para must enable `CUSTOM_OIDC` on your partner and configure your OIDC provider. The partner also
needs a non-enclave auth method (e.g. passkey), which is why a new user is prompted to create a
passkey. Point `NEXT_PUBLIC_PARA_ENVIRONMENT` at the environment where that partner is configured.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── styles/globals.css
├── lib/
│   ├── para.ts            # API key, environment, Sepolia chain/RPC/explorer constants
│   └── e2e-helpers.ts
├── hooks/
│   ├── useOidcAuth.ts     # Custom OIDC sign-in via useAuthenticateWithOAuth + passkey popup
│   ├── useParaSession.ts  # Connected wallet + logout (useAccount/useWallet/useLogout)
│   ├── useFaucet.ts        # useRequestFaucet wrapper (ETHEREUM_SEPOLIA)
│   ├── useEthersProvider.ts
│   └── useSendTransaction.ts # useParaEthersSigner + ethers self-transfer
└── components/
    ├── ParaProvider.tsx
    ├── CustomOidcAuthExample.tsx
    ├── layout/Header.tsx
    └── ui/
        ├── OidcSignInCard.tsx
        ├── WalletInfo.tsx
        ├── RequestFaucet.tsx
        ├── SendTransaction.tsx
        └── TxResult.tsx   # Hash + Sepolia Etherscan link, shared by both actions
```

`src/hooks/*` holds the copyable Para logic; `src/components/ui/*` is prop-driven presentation
with no Para imports.

## Key Integration Pattern

```tsx
// Provider (src/components/ParaProvider.tsx)
<QueryClientProvider client={queryClient}>
  <ParaProvider paraClientConfig={{ apiKey, env }}>{children}</ParaProvider>
</QueryClientProvider>;

// Sign in (src/hooks/useOidcAuth.ts)
const { authenticateWithOAuthAsync } = useAuthenticateWithOAuth();
await authenticateWithOAuthAsync({ method: "CUSTOM_OIDC", useShortUrls: true /* + popup callbacks */ });

// Faucet (src/hooks/useFaucet.ts)
const { requestFaucetAsync } = useRequestFaucet();
const { transactionHash } = await requestFaucetAsync({ chain: "ETHEREUM_SEPOLIA" });

// Send transaction (src/hooks/useSendTransaction.ts)
const { ethersSigner } = useParaEthersSigner({ provider });
const txResponse = await ethersSigner.sendTransaction({ to: wallet.address, value, /* ...gas */ });
```

## Related Examples

- `custom-oauth-auth` — social login surface built on the same React SDK hooks.
- `signer-ethers-v6` — a deeper tour of ethers signing flows with Para.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Execute transactions (EVM)](https://docs.getpara.com/v3/react/guides/web3-operations/evm/execute-transactions)
