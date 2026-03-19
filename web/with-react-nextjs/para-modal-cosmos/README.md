# Para Modal + Cosmos Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-cosmos.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with Cosmos wallets (Keplr/Leap) for wallet connection and ADR-036 message signing.

## What This Example Shows

- Setting up `ParaProvider` with Cosmos wallet configuration
- Configuring external wallets (Keplr, Leap) via `externalWalletConfig`
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving Cosmos wallet address with `useCosmjsAminoSigner`
- Signing arbitrary messages using ADR-036 standard with Amino encoding

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ParaProvider
│   └── page.tsx                # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx        # Para SDK provider with Cosmos config
│   ├── layout/Header.tsx       # Header with Cosmos address display
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected Cosmos wallet display
│       └── SignMessage.tsx     # ADR-036 sign message UI
├── hooks/
│   └── useSignHelloWorld.ts    # ADR-036 signing with useCosmjsAminoSigner
└── lib/
    └── e2e-helpers.ts          # E2E testing utilities
```

## Cosmos Configuration

This example configures Para to work with Cosmos wallets:

```typescript
externalWalletConfig={{
  wallets: ["KEPLR", "LEAP"],
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
    },
  },
}}
```

## ADR-036 Message Signing

This example uses the Cosmos ADR-036 standard for arbitrary message signing:

```typescript
import { useCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { makeSignDoc } from "@cosmjs/amino";

const { aminoSigner } = useCosmjsAminoSigner();

// Create ADR-036 sign doc
const signDoc = makeSignDoc(
  [{ type: "sign/MsgSignData", value: { signer: address, data: btoa(message) } }],
  { amount: [], gas: "0" },
  "cosmoshub-4",
  "",
  0,
  0
);

const { signature } = await aminoSigner.signAmino(address, signDoc);
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Cosmos ADR-036](https://docs.cosmos.network/main/architecture/adr-036-arbitrary-signature)
- [Next.js Documentation](https://nextjs.org/docs)
