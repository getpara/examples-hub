# Para SDK CosmJS Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-cosmjs.vercel.app)

This Next.js app shows how to use Para as the signer for CosmJS flows. It includes demos for message signing, ATOM transfers, IBC transfers, staking, governance voting, and CosmWasm contract queries/execution.

## Setup

Create a `.env` file in this example directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` when omitted. Use a key from the same Para environment you configure in the Developer Portal.

Install, build, and run the production server:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

For local iteration, use:

```bash
yarn dev
```

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key used by this example.

The app reads only `NEXT_PUBLIC_PARA_API_KEY` and `NEXT_PUBLIC_PARA_ENVIRONMENT`. Cosmos chain metadata and RPC endpoints live in `src/config/chains.ts` and `src/config/constants.ts`. The Graz connector configuration in `src/components/ParaProvider.tsx` wires Cosmos external wallet support at runtime.

## Core Integration

The reusable Para and CosmJS logic lives in hooks. UI components are prop-driven so you can copy the signer hooks without copying the example UI.

```tsx
import { useEffect, useState } from "react";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { useAccount } from "@getpara/react-sdk-lite";
import { useParaCosmjsProtoSigner } from "@getpara/react-sdk-lite/chains/cosmos";

export function useParaSigner() {
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const { isConnected } = useAccount();
  const { protoSigner, isLoading } = useParaCosmjsProtoSigner();

  useEffect(() => {
    if (!isConnected || !protoSigner) {
      setSigningClient(null);
      return;
    }

    SigningStargateClient.connectWithSigner("https://rpc.provider-sentry-01.ics-testnet.polypore.xyz", protoSigner, {
      gasPrice: GasPrice.fromString("0.025uatom"),
    }).then(setSigningClient);
  }, [isConnected, protoSigner]);

  return {
    signingClient,
    address: isConnected && protoSigner ? protoSigner.address : null,
    isLoading,
  };
}
```

See `src/hooks/useParaSigner.ts` for Stargate transactions and `src/hooks/useParaCosmWasmSigner.ts` for CosmWasm clients.

## Key Dependencies

- `@getpara/react-sdk-lite@3.0.0` for Para provider, modal, account hooks, and Cosmos signer hooks.
- `@getpara/cosmos-wallet-connectors@3.0.0` and `graz@0.4.2` for Cosmos external wallet support.
- `@cosmjs/stargate@0.39.0`, `@cosmjs/cosmwasm@0.39.0`, and related `@cosmjs/*` packages for Cosmos clients and transaction helpers.
- `next@16.2.7`, `react@19.2.7`, and `react-dom@19.2.7`.

Some Para package `latest` tags still point at the v2 line, so this example intentionally pins Para SDK packages to `3.0.0`.

## Key Files

- `src/components/ParaProvider.tsx` configures the Para SDK and Cosmos connector.
- `src/hooks/useCosmosWalletConnection.ts` centralizes modal, account, and Cosmos address state.
- `src/hooks/useParaSigner.ts` creates a `SigningStargateClient` from the Para Cosmos signer.
- `src/hooks/useParaCosmWasmSigner.ts` creates a `SigningCosmWasmClient` from the Para Cosmos signer.
- `src/components/demos/*` contains the example UI for each flow.
- `src/app/*/page.tsx` contains server route metadata and delegates to client demo components.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [CosmJS Documentation](https://github.com/cosmos/cosmjs)
- [Cosmos SDK Documentation](https://docs.cosmos.network)
- [Next.js Documentation](https://nextjs.org/docs)
