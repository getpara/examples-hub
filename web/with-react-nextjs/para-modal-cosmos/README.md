# Para Modal + Cosmos Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-modal-cosmos.vercel.app)

A minimal Next.js example demonstrating Para Modal integration with Cosmos wallets (Keplr/Leap) for wallet connection and ADR-036 message signing.

## What This Example Shows

- Setting up `ParaProvider` with Cosmos connector runtime configuration
- Configuring allowed external wallets in the Para Developer Portal
- Opening the Para modal via the `useModal` hook
- Checking authentication state with `useAccount`
- Retrieving Cosmos wallet address with `useParaCosmjsAminoSigner`
- Signing arbitrary messages using ADR-036 standard with Amino encoding

## Setup

1. Create a `.env` file with the API key and environment for the Para project you configured in the Developer Portal:

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
│   └── useSignHelloWorld.ts    # ADR-036 signing with useParaCosmjsAminoSigner
```

## Cosmos Configuration

This example keeps Cosmos chain wiring in code because the Cosmos connector needs runtime chain and selected-chain setup. The remaining app, auth, branding, and external wallet settings should be configured in the Para Developer Portal for the API key, including app display identity, allowed external wallets, OAuth providers, email or phone login toggles, theme, and WalletConnect settings when applicable.

The `ParaProvider` omits deprecated provider config so Portal-owned settings stay out of code. The `paraModalConfig` fields are runtime modal behavior for this demo, not persistent project configuration.

```typescript
externalWalletConfig={{
  cosmosConnector: {
    config: {
      chains: [cosmoshub, osmosis, noble],
      selectedChainId: cosmoshub.chainId,
      multiChain: false,
      onSwitchChain: () => {},
    },
  },
}}
```

## ADR-036 Message Signing

This example uses the Cosmos ADR-036 standard for arbitrary message signing:

```typescript
import { useParaCosmjsAminoSigner } from '@getpara/react-sdk/cosmos';
import { makeSignDoc } from '@cosmjs/amino';

const { aminoSigner } = useParaCosmjsAminoSigner();

// Create ADR-036 sign doc
const signDoc = makeSignDoc(
  [{ type: 'sign/MsgSignData', value: { signer: address, data: btoa(message) } }],
  { amount: [], gas: '0' },
  'cosmoshub-4',
  '',
  0,
  0,
);

const { signature } = await aminoSigner.signAmino(address, signDoc);
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Cosmos ADR-036](https://docs.cosmos.network/main/architecture/adr-036-arbitrary-signature)
- [Next.js Documentation](https://nextjs.org/docs)
