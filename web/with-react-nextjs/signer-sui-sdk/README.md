# Signer Sui SDK

This example demonstrates how to use Para with the [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript) (`@mysten/sui`) in a Next.js app. It includes personal message signing and verification, Sui Testnet balance reads, faucet funding, SUI transfers, and a native **2-of-2 multisig** built from a Para wallet plus a co-signer.

## Setup

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Install and run the production build:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, and wallet visibility in the Para Developer Portal for the API key. The `ParaProvider` in this example only handles API key/environment setup and runtime modal behavior. Sui Testnet RPC, faucet, and explorer URLs are fixed in `src/config/constants.ts` for this demo.

## Core Integration

The copyable Para signer setup lives in `src/hooks/useParaSigner.ts`:

```tsx
import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSuiSigner } from "@getpara/react-sdk-lite/chains/sui";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { SUI_NETWORK, SUI_RPC_URL } from "@/config/constants";

const client = new SuiGrpcClient({ network: SUI_NETWORK, baseUrl: SUI_RPC_URL });

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { suiSigner, isLoading } = useParaSuiSigner();
  const isReady = Boolean(suiSigner && isConnected && !isLoading);
  return { signer: suiSigner, client, isReady, address: suiSigner?.address ?? null };
}
```

`useParaSuiSigner` returns a `ParaSuiSigner` (a `@mysten/sui` `Signer`) backed by the wallet's Ed25519 key — Para's MPC handles the raw signing while `@mysten/sui` handles intent wrapping, hashing, and signature serialization.

> **Sui reuses the same Ed25519 key material as a Para Solana wallet**, so a `SUI`, `SOLANA`, or `STELLAR` wallet id all resolve to the same underlying key.

## Hooks Showcased

- **`useParaSuiSigner`** — the embedded Sui signer (`src/hooks/useParaSigner.ts`)
- **`useParaSuiSignPersonalMessage`** — message signing (`src/hooks/useMessageSigning.ts`)
- **`useParaSuiSignTransaction`** — transaction signing (`src/hooks/useSuiTransfer.ts`)
- **`useParaSuiMultiSigSigner`** — native multisig (`src/hooks/useSuiMultiSig.ts`)

## Demos

- **Sign Message** (`/sign-message`) — sign a personal message and verify it against the wallet's public key.
- **SUI Transfer** (`/sign-transaction`) — fund from the faucet, build a transfer, sign it, and execute it over gRPC. Building resolves gas coins, so the wallet must hold some Testnet SUI.
- **Native Multisig** (`/multisig`) — derive a 2-of-2 multisig from the Para wallet + an ephemeral co-signer, produce each member's partial signature, then `combine` them into one multisig signature and verify it.

## Note on transport

`@mysten/sui` has deprecated its JSON-RPC client, and the public JSON-RPC Testnet fullnode is being retired. This example uses the non-deprecated **`SuiGrpcClient`** against the Testnet fullnode (which speaks gRPC-web). Point `SUI_RPC_URL` at another node/network via `src/config/constants.ts` if needed.
