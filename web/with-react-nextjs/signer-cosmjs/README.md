# Para SDK CosmJS Signer Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-cosmjs.vercel.app)

This Next.js application demonstrates how to integrate the Para SDK with CosmJS for Cosmos blockchain interactions. The example showcases various blockchain operations including ATOM transfers, IBC transfers, staking, governance, CosmWasm smart contract interactions, and message signing using Para's wallet infrastructure for the Cosmos ecosystem.

## Setup/Installation

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

These are the only environment variables read by the app. `NEXT_PUBLIC_PARA_API_KEY` selects the Developer Portal project, and `NEXT_PUBLIC_PARA_ENVIRONMENT` selects the Para environment. It defaults to `BETA` when omitted and can be set to `SANDBOX` or `PROD` when using keys from those environments.

### Package Manager Instructions

Using yarn:

```bash
yarn install
yarn dev
```

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key used by this example. The `ParaProvider` keeps only API key/environment, Cosmos signer connector wiring, and runtime modal behavior. There are no `configOverrides` in this example, so Developer Portal settings are not overridden by code.

The Cosmos chain and RPC endpoints used by the demo transactions live in `src/config/chains.ts` and `src/config/constants.ts`. The Graz connector setup in `src/components/ParaProvider.tsx` is provider wiring for Cosmos wallet support, not persistent partner configuration.

## Key Dependencies

- **@getpara/react-sdk** (3.0.0-alpha.1) - Para React SDK for wallet connections
- **@getpara/react-sdk** (3.0.0-alpha.1) - Para provider, account, and modal hooks
- **@cosmjs/stargate** (0.37.0) - Cosmos SDK Stargate client
- **@cosmjs/cosmwasm-stargate** (0.37.0) - CosmWasm support for Stargate
- **@cosmjs/proto-signing** (0.37.0) - Protobuf message signing
- **@cosmjs/amino** (0.37.0) - Amino encoding for Cosmos
- **graz** (0.4.2) - Cosmos wallet connector support
- **@tanstack/react-query** (5.90.12) - Data fetching and state management
- **next** (15.1.12) - React framework

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK provider setup and Cosmos connector wiring
- `src/hooks/useParaSigner.ts` - Custom hook for Para signer integration with CosmJS
- `src/hooks/useParaCosmWasmSigner.ts` - Custom hook for Para signer integration with CosmWasm
- `src/hooks/useCosmosQueryClient.ts` - Cosmos query client setup hook
- `src/config/constants.ts` - Cosmos constants used by the demo flows
- `src/config/chains.ts` - Cosmos chain configurations
- `src/app/*/page.tsx` - Example pages demonstrating various Cosmos operations

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [CosmJS Documentation](https://github.com/cosmos/cosmjs) - CosmJS library documentation
- [Cosmos SDK Documentation](https://docs.cosmos.network) - Cosmos SDK documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
